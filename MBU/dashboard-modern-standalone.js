// Standalone Mode - Works with localStorage
let currentUser = null;
let currentTab = 'mycourses';
let teacherCourses = [];
let currentSubmissionToGrade = null;
let currentAssignmentToSubmit = null;

// Initialize localStorage structure
function initializeLocalStorage() {
  if (!localStorage.getItem('courses')) {
    localStorage.setItem('courses', JSON.stringify([]));
  }
  if (!localStorage.getItem('enrollments')) {
    localStorage.setItem('enrollments', JSON.stringify([]));
  }
  if (!localStorage.getItem('assignments')) {
    localStorage.setItem('assignments', JSON.stringify([]));
  }
  if (!localStorage.getItem('submissions')) {
    localStorage.setItem('submissions', JSON.stringify([]));
  }
  if (!localStorage.getItem('grades')) {
    localStorage.setItem('grades', JSON.stringify([]));
  }
  if (!localStorage.getItem('videos')) {
    localStorage.setItem('videos', JSON.stringify([]));
  }
  if (!localStorage.getItem('loginStreaks')) {
    localStorage.setItem('loginStreaks', JSON.stringify([]));
  }
  if (!localStorage.getItem('studentRewards')) {
    localStorage.setItem('studentRewards', JSON.stringify([]));
  }
  if (!localStorage.getItem('courseCompletions')) {
    localStorage.setItem('courseCompletions', JSON.stringify([]));
  }
}

window.onload = function() {
  const userData = sessionStorage.getItem('user');
  if (!userData) {
    window.location.href = 'Project-Modern-Standalone.html';
    return;
  }

  currentUser = JSON.parse(userData);
  initializeLocalStorage();
  
  // Track student login for streaks
  if (currentUser.role === 'Student') {
    updateLoginStreak();
  }
  
  initializeDashboard();
};

function initializeDashboard() {
  // Set user avatar initial
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) {
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
  }
  
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = currentUser.role;
  document.getElementById('welcomeName').textContent = currentUser.name;
  
  if (currentUser.role === 'Teacher') {
    document.getElementById('welcomeMessage').textContent = 'Manage your courses, assignments, and grade student work.';
    document.getElementById('teacherView').style.display = 'block';
    loadTeacherCourses();
  } else {
    // Show student streak info in welcome message
    const streaks = JSON.parse(localStorage.getItem('loginStreaks')) || [];
    const userStreak = streaks.find(s => s.userId === currentUser.id);
    
    if (userStreak && userStreak.currentStreak > 1) {
      document.getElementById('welcomeMessage').innerHTML = `
        Browse courses, complete assignments, and track your grades.<br>
        <span style="display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 8px; color: #000; font-weight: 700;">
          🔥 ${userStreak.currentStreak} Day Streak! Keep learning!
        </span>
      `;
    } else {
      document.getElementById('welcomeMessage').textContent = 'Browse courses, complete assignments, and track your grades.';
    }
    
    document.getElementById('studentView').style.display = 'block';
    loadAvailableCourses();
    currentTab = 'available';
  }

  document.getElementById('loadingState').style.display = 'none';
}

// Tab Management
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.content-section');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  sections.forEach(section => section.classList.remove('active'));
  
  currentTab = tabName;
  
  if (currentUser.role === 'Teacher') {
    const tabMap = { 'mycourses': 0, 'create': 1, 'assignments': 2, 'submissions': 3, 'analytics': 4 };
    tabs[tabMap[tabName]].classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'mycourses') loadTeacherCourses();
    else if (tabName === 'assignments') loadTeacherAssignments();
    else if (tabName === 'submissions') loadTeacherSubmissions();
    else if (tabName === 'analytics') loadTeacherAnalytics();
  } else {
    const tabMap = { 'available': 0, 'enrolled': 1, 'myassignments': 2, 'grades': 3 };
    tabs[tabMap[tabName]].classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    if (tabName === 'available') loadAvailableCourses();
    else if (tabName === 'enrolled') loadEnrolledCourses();
    else if (tabName === 'myassignments') loadStudentAssignments();
    else if (tabName === 'grades') loadStudentGrades();
  }
}

// =============== COURSE MANAGEMENT ===============

// Create Course (Teacher)
document.getElementById('createCourseForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = document.getElementById('courseTitle').value;
  const description = document.getElementById('courseDescription').value;
  const duration = document.getElementById('courseDuration').value;

  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  
  const newCourse = {
    _id: Date.now().toString(),
    title,
    description,
    duration,
    teacherId: currentUser.id,
    teacherName: currentUser.name,
    enrolledStudents: [],
    createdAt: new Date().toISOString()
  };

  courses.push(newCourse);
  localStorage.setItem('courses', JSON.stringify(courses));

  showMessage('✅ Course created successfully!', 'success');
  document.getElementById('courseTitle').value = '';
  document.getElementById('courseDescription').value = '';
  document.getElementById('courseDuration').value = '';
  
  loadTeacherCourses();
  switchTab('mycourses');
});

// Load Teacher's Courses
function loadTeacherCourses() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  teacherCourses = courses.filter(c => c.teacherId === currentUser.id);

  const container = document.getElementById('teacherCourses');
  
  // Update assignment course dropdown
  const dropdown = document.getElementById('assignmentCourse');
  if (dropdown) {
    dropdown.innerHTML = '<option value="">Choose a course...</option>' +
      teacherCourses.map(c => `<option value="${c._id}">${c.title}</option>`).join('');
  }
  
  if (teacherCourses.length > 0) {
    container.innerHTML = teacherCourses.map(course => `
      <div class="card">
        <h4>${course.title}</h4>
        <p>${course.description}</p>
        <div class="card-meta">
          <span class="badge badge-primary"><i class="fas fa-clock"></i> ${course.duration}</span>
          <span class="badge badge-success"><i class="fas fa-users"></i> ${course.enrolledStudents.length} students</span>
        </div>
        <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="viewEnrolledStudents('${course._id}', '${course.title.replace(/'/g, "\\'")}')">
            <i class="fas fa-eye"></i> View Students
          </button>
          <button class="btn btn-success" onclick="addVideoModal('${course._id}', '${course.title.replace(/'/g, "\\'")}')">
            <i class="fas fa-video"></i> Add Videos
          </button>
          <button class="btn btn-danger" onclick="deleteCourse('${course._id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-open"></i>
        <h3>No courses yet</h3>
        <p>Create your first course to get started!</p>
      </div>
    `;
  }
}

// View Enrolled Students
function viewEnrolledStudents(courseId, courseName) {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const course = courses.find(c => c._id === courseId);

  const modal = document.getElementById('enrolledStudentsModal');
  const list = document.getElementById('enrolledStudentsList');

  if (course && course.enrolledStudents && course.enrolledStudents.length > 0) {
    list.innerHTML = `
      <h4 style="margin-bottom: 15px; color: var(--dark);">${courseName}</h4>
      <div class="table-container">
        <table>
          <thead><tr><th>Student Name</th><th>Enrolled Date</th></tr></thead>
          <tbody>
            ${course.enrolledStudents.map(s => `
              <tr>
                <td>${s.studentName}</td>
                <td>${new Date(s.enrolledAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    list.innerHTML = '<p style="text-align: center; color: var(--dark-light); padding: 2rem;">No students enrolled yet.</p>';
  }

  modal.classList.add('active');
}

// Delete Course
function deleteCourse(courseId) {
  if (!confirm('Are you sure? All assignments and submissions will be deleted.')) return;

  let courses = JSON.parse(localStorage.getItem('courses')) || [];
  courses = courses.filter(c => c._id !== courseId);
  localStorage.setItem('courses', JSON.stringify(courses));

  // Also delete related assignments and submissions
  let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  assignments = assignments.filter(a => a.courseId !== courseId);
  localStorage.setItem('assignments', JSON.stringify(assignments));

  showMessage('✅ Course deleted successfully!', 'success');
  loadTeacherCourses();
}

// Load Available Courses (Student)
function loadAvailableCourses() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  const myEnrollments = enrollments.filter(e => e.studentId === currentUser.id);

  const container = document.getElementById('availableCourses');
  
  console.log('Available Courses:', courses.length);
  console.log('My Enrollments:', myEnrollments.length);
  
  if (courses.length > 0) {
    container.innerHTML = courses.map(course => {
      const isEnrolled = myEnrollments.some(e => e.courseId === course._id);
      return `
        <div class="card">
          <h4>${course.title}</h4>
          <p>${course.description}</p>
          <div class="card-meta">
            <span class="badge badge-primary"><i class="fas fa-clock"></i> ${course.duration}</span>
            <span class="badge badge-info"><i class="fas fa-chalkboard-teacher"></i> ${course.teacherName}</span>
          </div>
          <div style="margin-top: 15px;">
            ${isEnrolled 
              ? '<span class="badge badge-success"><i class="fas fa-check"></i> Already Enrolled</span>' 
              : `<button class="btn btn-success" onclick="enrollCourse('${course._id}')"><i class="fas fa-user-plus"></i> Enroll Now</button>`
            }
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No courses available</h3>
        <p>Ask your teacher to create courses, or create one yourself if you're a teacher!</p>
      </div>
    `;
  }
}

// Enroll in Course
function enrollCourse(courseId) {
  let courses = JSON.parse(localStorage.getItem('courses')) || [];
  let enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  
  const courseIndex = courses.findIndex(c => c._id === courseId);
  if (courseIndex === -1) {
    showMessage('Course not found!', 'error');
    return;
  }

  const alreadyEnrolled = enrollments.some(e => e.courseId === courseId && e.studentId === currentUser.id);
  if (alreadyEnrolled) {
    showMessage('You are already enrolled in this course!', 'error');
    return;
  }

  const enrollment = {
    courseId: courseId,
    studentId: currentUser.id,
    studentName: currentUser.name,
    enrolledAt: new Date().toISOString()
  };

  enrollments.push(enrollment);
  localStorage.setItem('enrollments', JSON.stringify(enrollments));

  // Update course enrolled students
  if (!courses[courseIndex].enrolledStudents) {
    courses[courseIndex].enrolledStudents = [];
  }
  courses[courseIndex].enrolledStudents.push(enrollment);
  localStorage.setItem('courses', JSON.stringify(courses));

  showMessage('✅ Successfully enrolled in course!', 'success');
  
  // Refresh both tabs
  loadAvailableCourses();
  
  // Small delay to show success message
  setTimeout(() => {
    switchTab('enrolled');
  }, 1000);
}

// Load Enrolled Courses (Student)
function loadEnrolledCourses() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  const myEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const completions = JSON.parse(localStorage.getItem('courseCompletions')) || [];
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];

  const container = document.getElementById('enrolledCourses');
  
  if (myEnrollments.length > 0) {
    const enrolledCourses = myEnrollments.map(e => courses.find(c => c._id === e.courseId)).filter(c => c);
    
    container.innerHTML = enrolledCourses.map(course => {
      const completion = completions.find(c => c.courseId === course._id && c.studentId === currentUser.id);
      const isCompleted = completion && completion.status === 'approved';
      const isPending = completion && completion.status === 'pending';
      
      // Check progress
      const courseAssignments = assignments.filter(a => a.courseId === course._id);
      const mySubmissions = submissions.filter(s => 
        courseAssignments.some(a => a._id === s.assignmentId) && s.studentId === currentUser.id
      );
      const progress = courseAssignments.length > 0 
        ? Math.round((mySubmissions.length / courseAssignments.length) * 100) 
        : 0;
      
      return `
      <div class="card">
        <h4>${course.title}</h4>
        <p>${course.description}</p>
        
        ${isCompleted ? `
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 1rem; border-radius: 12px; margin: 1rem 0; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎓</div>
            <div style="color: white; font-weight: 700; font-size: 1.1rem;">Course Completed!</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem; margin-top: 0.5rem;">Certificate awarded on ${new Date(completion.completedAt).toLocaleDateString()}</div>
          </div>
        ` : isPending ? `
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 1rem; border-radius: 12px; margin: 1rem 0; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
            <div style="color: white; font-weight: 700;">Completion Pending Review</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 0.85rem; margin-top: 0.5rem;">Submitted on ${new Date(completion.submittedAt).toLocaleDateString()}</div>
          </div>
        ` : `
          <div style="margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.9rem; color: var(--dark); font-weight: 600;">Course Progress</span>
              <span style="font-size: 0.9rem; font-weight: 700; color: var(--primary);">${progress}%</span>
            </div>
            <div style="width: 100%; height: 10px; background: var(--light-gray); border-radius: 5px; overflow: hidden;">
              <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.3s;"></div>
            </div>
          </div>
        `}
        
        <div class="card-meta">
          <span class="badge badge-primary"><i class="fas fa-clock"></i> ${course.duration}</span>
          <span class="badge badge-info"><i class="fas fa-chalkboard-teacher"></i> ${course.teacherName}</span>
          ${isCompleted ? '<span class="badge badge-success"><i class="fas fa-certificate"></i> Certified</span>' : 
            isPending ? '<span class="badge badge-warning"><i class="fas fa-hourglass-half"></i> Under Review</span>' :
            '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Enrolled</span>'}
        </div>
        <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="viewCourseVideos('${course._id}', '${course.title.replace(/'/g, "\\'")}')">
            <i class="fas fa-play-circle"></i> Watch Videos
          </button>
          ${!isCompleted && !isPending && progress >= 70 ? `
            <button class="btn btn-success" onclick="submitCourseCompletion('${course._id}', '${course.title.replace(/'/g, "\\'")}')">
              <i class="fas fa-graduation-cap"></i> Complete Course
            </button>
          ` : ''}
          ${!isCompleted && !isPending && progress < 70 && courseAssignments.length > 0 ? `
            <span class="badge badge-warning">
              <i class="fas fa-info-circle"></i> Complete 70% to finish (Currently: ${progress}%)
            </span>
          ` : ''}
          ${isCompleted ? `
            <button class="btn btn-warning" onclick="viewCertificate('${course._id}', '${course.title.replace(/'/g, "\\'")}')">
              <i class="fas fa-award"></i> View Certificate
            </button>
          ` : ''}
        </div>
      </div>
    `;
    }).join('');
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-reader"></i>
        <h3>No enrolled courses</h3>
        <p>Browse available courses to start learning!</p>
      </div>
    `;
  }
}

// =============== ASSIGNMENT MANAGEMENT ===============

// Create Assignment (Teacher)
document.getElementById('createAssignmentForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const courseId = document.getElementById('assignmentCourse').value;
  const title = document.getElementById('assignmentTitle').value;
  const description = document.getElementById('assignmentDescription').value;
  const dueDate = document.getElementById('assignmentDueDate').value;
  const maxPoints = document.getElementById('assignmentMaxPoints').value;

  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const course = courses.find(c => c._id === courseId);
  
  if (!course) {
    showMessage('Please select a valid course', 'error');
    return;
  }

  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  
  const newAssignment = {
    _id: Date.now().toString(),
    courseId,
    courseName: course.title,
    title,
    description,
    dueDate: new Date(dueDate).toISOString(),
    maxPoints: parseInt(maxPoints),
    teacherId: currentUser.id,
    createdAt: new Date().toISOString()
  };

  assignments.push(newAssignment);
  localStorage.setItem('assignments', JSON.stringify(assignments));

  showMessage('✅ Assignment created successfully!', 'success');
  document.getElementById('createAssignmentForm').reset();
  
  loadTeacherAssignments();
});

// Load Teacher Assignments
function loadTeacherAssignments() {
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const myAssignments = assignments.filter(a => a.teacherId === currentUser.id);

  const container = document.getElementById('teacherAssignments');
  
  if (myAssignments.length > 0) {
    container.innerHTML = myAssignments.map(assignment => {
      const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
      const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment._id);
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = dueDate < new Date();
      
      return `
        <div class="card">
          <h4>${assignment.title}</h4>
          <p>${assignment.description}</p>
          <div class="card-meta">
            <span class="badge badge-primary"><i class="fas fa-book"></i> ${assignment.courseName}</span>
            <span class="badge ${isOverdue ? 'badge-danger' : 'badge-warning'}">
              <i class="fas fa-calendar"></i> Due: ${dueDate.toLocaleDateString()}
            </span>
            <span class="badge badge-info"><i class="fas fa-star"></i> ${assignment.maxPoints} pts</span>
            <span class="badge badge-success"><i class="fas fa-file-alt"></i> ${assignmentSubmissions.length} submissions</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tasks"></i>
        <h3>No assignments created</h3>
        <p>Create assignments for your courses!</p>
      </div>
    `;
  }
}

// Load Student Assignments
function loadStudentAssignments() {
  const enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
  const myEnrollments = enrollments.filter(e => e.studentId === currentUser.id);
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];

  const container = document.getElementById('studentAssignments');
  
  console.log('=== STUDENT ASSIGNMENTS DEBUG ===');
  console.log('Student Enrollments:', myEnrollments.length);
  console.log('Total Assignments in System:', assignments.length);
  console.log('Current User ID:', currentUser.id);
  console.log('My Enrollments:', myEnrollments);
  
  if (myEnrollments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No assignments</h3>
        <p style="margin-bottom: 1rem;">Enroll in courses to see assignments!</p>
        <p style="color: var(--warning); font-size: 0.9rem;">💡 Tip: Go to "Available Courses" tab and enroll in a course first!</p>
      </div>
    `;
    return;
  }

  const myAssignments = assignments.filter(a => 
    myEnrollments.some(e => e.courseId === a.courseId)
  );
  
  console.log('My Assignments:', myAssignments.length);
  console.log('Assignments for enrolled courses:', myAssignments);

  if (myAssignments.length > 0) {
    container.innerHTML = myAssignments.map(assignment => {
      const hasSubmitted = submissions.some(s => 
        s.assignmentId === assignment._id && s.studentId === currentUser.id
      );
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = dueDate < new Date();
      
      console.log(`Assignment "${assignment.title}" - Already Submitted:`, hasSubmitted);
      
      return `
        <div class="card">
          <h4>${assignment.title}</h4>
          <p>${assignment.description}</p>
          <div class="card-meta">
            <span class="badge badge-primary"><i class="fas fa-book"></i> ${assignment.courseName}</span>
            <span class="badge ${isOverdue ? 'badge-danger' : 'badge-warning'}">
              <i class="fas fa-calendar"></i> Due: ${dueDate.toLocaleDateString()}
            </span>
            <span class="badge badge-info"><i class="fas fa-star"></i> ${assignment.maxPoints} pts</span>
          </div>
          <div style="margin-top: 15px;">
            ${hasSubmitted 
              ? '<span class="badge badge-success"><i class="fas fa-check"></i> Already Submitted</span>' 
              : `<button class="btn btn-primary" onclick="openSubmitModal('${assignment._id}', '${assignment.title.replace(/'/g, "\\'")}')">
                  <i class="fas fa-upload"></i> Submit Assignment
                </button>`
            }
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>No assignments available</h3>
        <p style="margin-bottom: 1rem;">Your instructors haven't posted any assignments yet for your enrolled courses.</p>
        <div style="background: rgba(255, 215, 0, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--warning); margin-top: 1rem;">
          <p style="color: var(--dark); font-size: 0.9rem; margin: 0;">
            <strong>💡 What to do:</strong><br>
            1. Make sure your teacher created assignments for your courses<br>
            2. Ask your teacher to create assignments<br>
            3. Check back later!
          </p>
        </div>
      </div>
    `;
  }
}

// Open Submit Assignment Modal
function openSubmitModal(assignmentId, assignmentTitle) {
  currentAssignmentToSubmit = assignmentId;
  
  const modal = document.getElementById('submitAssignmentModal');
  const content = document.getElementById('submitAssignmentContent');
  
  content.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; color: var(--dark);">📝 ${assignmentTitle}</h4>
    
    <div class="feedback-box" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(78, 205, 196, 0.1)); margin-bottom: 1.5rem;">
      <p style="color: var(--dark); margin: 0;"><strong>📚 Submission Guidelines:</strong><br>
      You can submit your work in multiple formats:<br>
      • Type your answer directly<br>
      • Paste links to your work (Google Drive, GitHub, etc.)<br>
      • Upload files (PDFs, Word docs, images, code files, etc.)
      </p>
    </div>
    
    <form id="submitForm">
      <div class="form-group">
        <label class="form-label">Submission Text / Description</label>
        <textarea class="form-textarea" id="submissionText" rows="4" placeholder="Describe your work, paste links, or provide explanation..."></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Upload Files (Optional) - Multiple files supported</label>
        <div style="position: relative;">
          <input type="file" class="form-input" id="fileUpload" multiple accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar,.html,.css,.js,.py,.java,.cpp,.c,.json,.xml" style="padding: 0.5rem;">
        </div>
        <p style="font-size: 0.8rem; color: var(--dark-light); margin-top: 0.5rem;">
          📁 Accepted: PDF, Word, Images, Code files, ZIP, etc. (Max 10 files)
        </p>
      </div>
      
      <div id="filePreview" style="margin-top: 1rem;"></div>
      
      <div class="form-group">
        <label class="form-label">External Links (Optional)</label>
        <input type="url" class="form-input" id="externalLink" placeholder="https://github.com/yourproject or https://drive.google.com/...">
        <p style="font-size: 0.8rem; color: var(--dark-light); margin-top: 0.5rem;">
          🔗 Link to GitHub, Google Drive, CodePen, or other online resources
        </p>
      </div>
      
      <button type="submit" class="submit-btn">
        <i class="fas fa-paper-plane"></i> Submit Assignment
      </button>
    </form>
  `;
  
  modal.classList.add('active');
  
  // Add file preview functionality
  document.getElementById('fileUpload').addEventListener('change', handleFilePreview);
  document.getElementById('submitForm').addEventListener('submit', submitAssignment);
}

// Handle File Preview
function handleFilePreview(e) {
  const files = e.target.files;
  const previewContainer = document.getElementById('filePreview');
  
  if (files.length === 0) {
    previewContainer.innerHTML = '';
    return;
  }
  
  let previewHTML = '<div style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--primary);">';
  previewHTML += '<strong style="color: var(--dark); display: block; margin-bottom: 0.75rem;">📁 Selected Files (' + files.length + '):</strong>';
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
    const fileIcon = getFileIcon(file.name);
    
    previewHTML += `
      <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: white; border-radius: 8px; margin-bottom: 0.5rem;">
        <i class="fas fa-${fileIcon}" style="font-size: 1.5rem; color: var(--primary);"></i>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">${file.name}</div>
          <div style="font-size: 0.8rem; color: var(--dark-light);">${fileSize} KB</div>
        </div>
        <span class="badge badge-success"><i class="fas fa-check"></i> Ready</span>
      </div>
    `;
  }
  
  previewHTML += '</div>';
  previewContainer.innerHTML = previewHTML;
}

// Get File Icon based on extension
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    'pdf': 'file-pdf',
    'doc': 'file-word',
    'docx': 'file-word',
    'txt': 'file-alt',
    'jpg': 'file-image',
    'jpeg': 'file-image',
    'png': 'file-image',
    'gif': 'file-image',
    'zip': 'file-archive',
    'rar': 'file-archive',
    'html': 'file-code',
    'css': 'file-code',
    'js': 'file-code',
    'py': 'file-code',
    'java': 'file-code',
    'cpp': 'file-code',
    'c': 'file-code',
    'json': 'file-code',
    'xml': 'file-code'
  };
  
  return iconMap[ext] || 'file';
}

// Submit Assignment
function submitAssignment(e) {
  e.preventDefault();
  
  const submissionText = document.getElementById('submissionText').value;
  const externalLink = document.getElementById('externalLink').value;
  const fileInput = document.getElementById('fileUpload');
  const files = fileInput.files;
  
  // Validate that at least one form of submission is provided
  if (!submissionText && !externalLink && files.length === 0) {
    showMessage('❌ Please provide at least one form of submission: text, link, or file upload!', 'error');
    return;
  }
  
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const assignment = assignments.find(a => a._id === currentAssignmentToSubmit);
  
  if (!assignment) return;

  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  
  // Process uploaded files
  const uploadedFiles = [];
  
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString()
      });
    }
  }
  
  const newSubmission = {
    _id: Date.now().toString(),
    assignmentId: assignment._id,
    assignmentTitle: assignment.title,
    courseId: assignment.courseId,
    courseName: assignment.courseName,
    studentId: currentUser.id,
    studentName: currentUser.name,
    submissionText: submissionText || 'See attached files',
    externalLink: externalLink || null,
    uploadedFiles: uploadedFiles,
    submittedAt: new Date().toISOString(),
    graded: false
  };

  submissions.push(newSubmission);
  localStorage.setItem('submissions', JSON.stringify(submissions));

  showMessage('✅ Assignment submitted successfully with ' + uploadedFiles.length + ' file(s)!', 'success');
  closeModal('submitAssignmentModal');
  loadStudentAssignments();
}

// Load Teacher Submissions
function loadTeacherSubmissions() {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const myAssignments = assignments.filter(a => a.teacherId === currentUser.id);
  const mySubmissions = submissions.filter(s => 
    myAssignments.some(a => a._id === s.assignmentId)
  );

  const container = document.getElementById('submissionsList');
  
  if (mySubmissions.length > 0) {
    const ungraded = mySubmissions.filter(s => !s.graded);
    const graded = mySubmissions.filter(s => s.graded);
    
    container.innerHTML = `
      <h3 style="color: white; margin-bottom: 1rem;"><i class="fas fa-hourglass-half"></i> Pending Grading (${ungraded.length})</h3>
      ${ungraded.length > 0 ? `
        <div class="grid">
          ${ungraded.map(sub => `
            <div class="card">
              <h4>${sub.studentName}</h4>
              <p><strong>${sub.assignmentTitle}</strong></p>
              <p style="font-size: 0.9rem; color: var(--dark-light); margin-top: 0.5rem;">${sub.submissionText.substring(0, 100)}...</p>
              <div class="card-meta">
                <span class="badge badge-primary"><i class="fas fa-book"></i> ${sub.courseName}</span>
                <span class="badge badge-warning"><i class="fas fa-clock"></i> ${new Date(sub.submittedAt).toLocaleDateString()}</span>
              </div>
              <div style="margin-top: 15px;">
                <button class="btn btn-primary" onclick="openGradeModal('${sub._id}')"><i class="fas fa-edit"></i> Grade Submission</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="color: white; text-align: center; padding: 2rem;">No pending submissions!</p>'}
      
      <h3 style="color: white; margin: 2rem 0 1rem;"><i class="fas fa-check-circle"></i> Graded (${graded.length})</h3>
      ${graded.length > 0 ? `
        <div class="grid">
          ${graded.map(sub => `
            <div class="card">
              <h4>${sub.studentName}</h4>
              <p><strong>${sub.assignmentTitle}</strong></p>
              <div class="card-meta">
                <span class="badge badge-primary"><i class="fas fa-book"></i> ${sub.courseName}</span>
                <span class="badge badge-success"><i class="fas fa-star"></i> ${sub.pointsEarned} / ${sub.maxPoints} pts</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="color: white; text-align: center; padding: 2rem;">No graded submissions yet.</p>'}
    `;
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No submissions yet</h3>
        <p>Student submissions will appear here.</p>
      </div>
    `;
  }
}

// Open Grade Modal
function openGradeModal(submissionId) {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const submission = submissions.find(s => s._id === submissionId);
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const assignment = assignments.find(a => a._id === submission.assignmentId);
  
  if (!submission || !assignment) return;
  
  currentSubmissionToGrade = submissionId;
  
  const modal = document.getElementById('gradeSubmissionModal');
  const content = document.getElementById('gradeSubmissionContent');
  
  content.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${submission.studentName}</h4>
      <p><strong>Assignment:</strong> ${submission.assignmentTitle}</p>
      <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
    </div>
    
    <div class="feedback-box" style="margin-bottom: 1.5rem; background: rgba(99, 102, 241, 0.05);">
      <h5 style="color: var(--dark); margin-bottom: 0.75rem;"><i class="fas fa-file-alt"></i> Submission Text:</h5>
      <p style="color: var(--dark-light); line-height: 1.6; white-space: pre-wrap;">${submission.submissionText}</p>
    </div>
    
    ${submission.externalLink ? `
      <div class="feedback-box" style="margin-bottom: 1.5rem; background: rgba(78, 205, 196, 0.05);">
        <h5 style="color: var(--dark); margin-bottom: 0.75rem;"><i class="fas fa-link"></i> External Link:</h5>
        <a href="${submission.externalLink}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">
          <i class="fas fa-external-link-alt"></i> ${submission.externalLink}
        </a>
      </div>
    ` : ''}
    
    ${submission.uploadedFiles && submission.uploadedFiles.length > 0 ? `
      <div class="feedback-box" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 154, 86, 0.05));">
        <h5 style="color: var(--dark); margin-bottom: 0.75rem;"><i class="fas fa-folder-open"></i> Uploaded Files (${submission.uploadedFiles.length}):</h5>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${submission.uploadedFiles.map(file => {
            const fileSize = (file.size / 1024).toFixed(2);
            const fileIcon = getFileIcon(file.name);
            return `
              <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 8px; border: 1px solid var(--light-gray);">
                <i class="fas fa-${fileIcon}" style="font-size: 1.5rem; color: var(--primary);"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--dark); font-size: 0.9rem;">${file.name}</div>
                  <div style="font-size: 0.8rem; color: var(--dark-light);">${fileSize} KB • Uploaded: ${new Date(file.uploadedAt).toLocaleString()}</div>
                </div>
                <span class="badge badge-primary"><i class="fas fa-file"></i> ${file.type || 'File'}</span>
              </div>
            `;
          }).join('')}
        </div>
        <p style="margin-top: 1rem; padding: 0.75rem; background: rgba(255, 193, 7, 0.1); border-radius: 8px; font-size: 0.85rem; color: var(--dark);">
          <i class="fas fa-info-circle"></i> <strong>Note:</strong> In a real application, you would be able to download these files. This demo stores file metadata only.
        </p>
      </div>
    ` : ''}
    
    <form id="gradeForm">
      <div class="form-group">
        <label class="form-label">Points Earned (Max: ${assignment.maxPoints})</label>
        <input type="number" class="form-input" id="pointsEarned" required min="0" max="${assignment.maxPoints}">
      </div>
      <div class="form-group">
        <label class="form-label">Feedback</label>
        <textarea class="form-textarea" id="feedback" placeholder="Provide feedback to the student..."></textarea>
      </div>
      <button type="submit" class="submit-btn"><i class="fas fa-check"></i> Submit Grade</button>
    </form>
  `;
  
  modal.classList.add('active');
  
  document.getElementById('gradeForm').addEventListener('submit', submitGrade);
}

// Submit Grade
function submitGrade(e) {
  e.preventDefault();
  
  const pointsEarned = parseInt(document.getElementById('pointsEarned').value);
  const feedback = document.getElementById('feedback').value;
  
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const submission = submissions.find(s => s._id === currentSubmissionToGrade);
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const assignment = assignments.find(a => a._id === submission.assignmentId);
  
  if (!submission || !assignment) return;

  submission.graded = true;
  submission.pointsEarned = pointsEarned;
  submission.maxPoints = assignment.maxPoints;
  submission.feedback = feedback;
  submission.gradedAt = new Date().toISOString();

  localStorage.setItem('submissions', JSON.stringify(submissions));

  showMessage('✅ Grade submitted successfully!', 'success');
  closeModal('gradeSubmissionModal');
  loadTeacherSubmissions();
}

// Load Student Grades
function loadStudentGrades() {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const myGrades = submissions.filter(s => 
    s.studentId === currentUser.id && s.graded === true
  );

  const container = document.getElementById('studentGrades');
  
  console.log('All Submissions:', submissions.length);
  console.log('My Graded Submissions:', myGrades.length);
  console.log('Current User ID:', currentUser.id);
  
  if (myGrades.length > 0) {
    const totalEarned = myGrades.reduce((sum, s) => sum + (s.pointsEarned || 0), 0);
    const totalPossible = myGrades.reduce((sum, s) => sum + (s.maxPoints || 0), 0);
    const overallGrade = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(2) : 0;
    
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Overall Grade</h4>
          <div class="stat-value">${overallGrade}%</div>
        </div>
        <div class="stat-card">
          <h4>Total Points</h4>
          <div class="stat-value">${totalEarned} / ${totalPossible}</div>
        </div>
        <div class="stat-card">
          <h4>Assignments Graded</h4>
          <div class="stat-value">${myGrades.length}</div>
        </div>
      </div>
      
      <div class="table-container" style="margin-top: 2rem;">
        <table>
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Course</th>
              <th>Submitted</th>
              <th>Points</th>
              <th>Grade</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            ${myGrades.map(grade => {
              const percentage = ((grade.pointsEarned / grade.maxPoints) * 100).toFixed(1);
              const hasFiles = grade.uploadedFiles && grade.uploadedFiles.length > 0;
              return `
                <tr>
                  <td>
                    <strong>${grade.assignmentTitle}</strong>
                    ${hasFiles ? `<br><span class="badge badge-info" style="font-size: 0.75rem; margin-top: 0.25rem;"><i class="fas fa-paperclip"></i> ${grade.uploadedFiles.length} file(s)</span>` : ''}
                    ${grade.externalLink ? `<br><a href="${grade.externalLink}" target="_blank" style="font-size: 0.8rem; color: var(--primary);"><i class="fas fa-link"></i> Link</a>` : ''}
                  </td>
                  <td>${grade.courseName}</td>
                  <td style="font-size: 0.85rem;">${new Date(grade.submittedAt).toLocaleDateString()}</td>
                  <td><span style="font-weight: 600;">${grade.pointsEarned} / ${grade.maxPoints}</span></td>
                  <td><span class="grade-display">${percentage}%</span></td>
                  <td style="max-width: 300px;">${grade.feedback || 'No feedback provided'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-award"></i>
        <h3>No grades yet</h3>
        <p>Your grades will appear here once your teacher grades your submitted assignments.</p>
        <p style="margin-top: 1rem; color: var(--dark-light); font-size: 0.9rem;">💡 Tip: Submit assignments and wait for teacher to grade them!</p>
      </div>
    `;
  }
}

// Load Teacher Analytics
function loadTeacherAnalytics() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const streaks = JSON.parse(localStorage.getItem('loginStreaks')) || [];
  const rewards = JSON.parse(localStorage.getItem('studentRewards')) || [];
  
  const myCourses = courses.filter(c => c.teacherId === currentUser.id);
  const myAssignments = assignments.filter(a => a.teacherId === currentUser.id);
  const mySubmissions = submissions.filter(s => 
    myAssignments.some(a => a._id === s.assignmentId)
  );

  const totalStudents = myCourses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
  const gradedSubmissions = mySubmissions.filter(s => s.graded).length;
  const pendingSubmissions = mySubmissions.filter(s => !s.graded).length;

  const container = document.getElementById('analyticsContent');
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <h4>Total Courses</h4>
        <div class="stat-value">${myCourses.length}</div>
      </div>
      <div class="stat-card">
        <h4>Total Students</h4>
        <div class="stat-value">${totalStudents}</div>
      </div>
      <div class="stat-card">
        <h4>Total Assignments</h4>
        <div class="stat-value">${myAssignments.length}</div>
      </div>
      <div class="stat-card">
        <h4>Pending Reviews</h4>
        <div class="stat-value">${pendingSubmissions}</div>
      </div>
    </div>
    
    ${totalStudents > 0 ? `
      <!-- Student Performance Pie Chart -->
      <div class="form-card" style="margin-top: 2rem;">
        <h3 style="color: var(--dark); margin-bottom: 1.5rem;"><i class="fas fa-chart-pie"></i> Student Performance Overview</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
          <div style="position: relative; width: 250px; height: 250px; margin: 0 auto;">
            ${generatePerformancePieChart(mySubmissions)}
          </div>
          <div>
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div style="width: 20px; height: 20px; background: #10b981; border-radius: 4px;"></div>
                <span style="color: var(--dark); font-weight: 600;">Excellent (90-100%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 4px;"></div>
                <span style="color: var(--dark); font-weight: 600;">Good (80-89%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div style="width: 20px; height: 20px; background: #fbbf24; border-radius: 4px;"></div>
                <span style="color: var(--dark); font-weight: 600;">Average (70-79%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <div style="width: 20px; height: 20px; background: #f59e0b; border-radius: 4px;"></div>
                <span style="color: var(--dark); font-weight: 600;">Below Average (60-69%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 20px; height: 20px; background: #ef4444; border-radius: 4px;"></div>
                <span style="color: var(--dark); font-weight: 600;">Needs Improvement (<60%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Student Streaks Leaderboard -->
      <div class="form-card" style="margin-top: 2rem;">
        <h3 style="color: var(--dark); margin-bottom: 1.5rem;"><i class="fas fa-fire"></i> Student Learning Streaks</h3>
        ${generateStreakLeaderboard(myCourses, streaks)}
      </div>
      
      <!-- Student Rewards & Badges -->
      <div class="form-card" style="margin-top: 2rem;">
        <h3 style="color: var(--dark); margin-bottom: 1.5rem;"><i class="fas fa-trophy"></i> Student Achievements</h3>
        ${generateRewardsDisplay(myCourses, rewards)}
      </div>
      
      <!-- Detailed Student Reports -->
      <div class="form-card" style="margin-top: 2rem;">
        <h3 style="color: var(--dark); margin-bottom: 1.5rem;"><i class="fas fa-file-alt"></i> Detailed Reports</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="viewDetailedReports()"><i class="fas fa-chart-line"></i> View All Student Reports</button>
          <button class="btn btn-warning" onclick="viewCourseCompletions()"><i class="fas fa-graduation-cap"></i> View Completion Requests</button>
        </div>
      </div>
    ` : ''}
    
    ${myCourses.length > 0 ? `
      <h3 style="color: white; margin: 2rem 0 1rem;"><i class="fas fa-chart-bar"></i> Course Statistics</h3>
      <div class="grid">
        ${myCourses.map(course => {
          const courseAssignments = myAssignments.filter(a => a.courseId === course._id);
          const courseSubmissions = mySubmissions.filter(s => s.courseId === course._id);
          const gradedCount = courseSubmissions.filter(s => s.graded).length;
          
          return `
            <div class="card">
              <h4>${course.title}</h4>
              <div class="card-meta">
                <span class="badge badge-success"><i class="fas fa-users"></i> ${course.enrolledStudents.length} Students</span>
                <span class="badge badge-primary"><i class="fas fa-tasks"></i> ${courseAssignments.length} Assignments</span>
                <span class="badge badge-info"><i class="fas fa-file-alt"></i> ${courseSubmissions.length} Submissions</span>
                <span class="badge badge-warning"><i class="fas fa-check"></i> ${gradedCount} Graded</span>
              </div>
              <div style="margin-top: 15px;">
                <button class="btn btn-primary" onclick="viewCourseReport('${course._id}', '${course.title.replace(/'/g, "\\'")}')">
                  <i class="fas fa-chart-pie"></i> View Course Report
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '<p style="color: white; text-align: center; padding: 2rem;">No data available yet.</p>'}
  `;
}

// Modal Management
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Message Display
function showMessage(message, type) {
  const messageArea = document.getElementById('messageArea');
  messageArea.innerHTML = `
    <div class="message ${type}">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      ${message}
    </div>
  `;
  
  setTimeout(() => {
    messageArea.innerHTML = '';
  }, 5000);
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('user');
    window.location.href = 'Project-Modern-Standalone.html';
  }
}

// =============== STREAK & REWARDS SYSTEM ===============

// Update Login Streak
function updateLoginStreak() {
  const streaks = JSON.parse(localStorage.getItem('loginStreaks')) || [];
  const today = new Date().toDateString();
  
  let userStreak = streaks.find(s => s.userId === currentUser.id);
  
  if (!userStreak) {
    // First time login
    userStreak = {
      userId: currentUser.id,
      userName: currentUser.name,
      currentStreak: 1,
      longestStreak: 1,
      lastLogin: today,
      totalLogins: 1,
      loginDates: [today]
    };
    streaks.push(userStreak);
  } else {
    // Check if already logged in today
    if (userStreak.lastLogin === today) {
      return; // Already counted today
    }
    
    const lastLoginDate = new Date(userStreak.lastLogin);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastLoginDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      userStreak.currentStreak++;
      if (userStreak.currentStreak > userStreak.longestStreak) {
        userStreak.longestStreak = userStreak.currentStreak;
      }
    } else if (diffDays > 1) {
      // Streak broken
      userStreak.currentStreak = 1;
    }
    
    userStreak.lastLogin = today;
    userStreak.totalLogins++;
    userStreak.loginDates.push(today);
    
    // Check for rewards
    checkAndAwardStreak(userStreak.currentStreak);
  }
  
  localStorage.setItem('loginStreaks', JSON.stringify(streaks));
  
  // Show streak notification
  if (userStreak.currentStreak > 1) {
    showStreakNotification(userStreak.currentStreak);
  }
}

// Show Streak Notification
function showStreakNotification(streak) {
  const messageArea = document.getElementById('messageArea');
  messageArea.innerHTML = `
    <div class="message success" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; border: 2px solid #FFD700; font-weight: 700; box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);">
      <i class="fas fa-fire" style="color: #FF6B00; font-size: 1.5rem; animation: fireFlicker 0.5s infinite;"></i>
      <span style="font-size: 1.1rem;">🔥 ${streak} Day Streak! Keep it up! 🔥</span>
    </div>
  `;
  
  setTimeout(() => {
    messageArea.innerHTML = '';
  }, 5000);
}

// Check and Award Streak Rewards
function checkAndAwardStreak(streak) {
  const rewards = JSON.parse(localStorage.getItem('studentRewards')) || [];
  let userRewards = rewards.find(r => r.userId === currentUser.id);
  
  if (!userRewards) {
    userRewards = {
      userId: currentUser.id,
      userName: currentUser.name,
      badges: [],
      totalPoints: 0
    };
    rewards.push(userRewards);
  }
  
  // Award badges based on streaks
  const milestones = [
    { days: 3, badge: '3-Day Warrior', points: 10, icon: '🔥' },
    { days: 7, badge: 'Week Champion', points: 25, icon: '⭐' },
    { days: 14, badge: '2-Week Master', points: 50, icon: '🏆' },
    { days: 30, badge: 'Monthly Legend', points: 100, icon: '👑' },
    { days: 60, badge: 'Learning God', points: 200, icon: '💎' },
    { days: 100, badge: 'Century Champion', points: 500, icon: '🎖️' }
  ];
  
  milestones.forEach(milestone => {
    if (streak === milestone.days) {
      const alreadyHas = userRewards.badges.some(b => b.badge === milestone.badge);
      if (!alreadyHas) {
        userRewards.badges.push({
          badge: milestone.badge,
          icon: milestone.icon,
          points: milestone.points,
          earnedDate: new Date().toISOString(),
          streak: milestone.days
        });
        userRewards.totalPoints += milestone.points;
        
        // Show reward notification
        showRewardNotification(milestone);
      }
    }
  });
  
  localStorage.setItem('studentRewards', JSON.stringify(rewards));
}

// Show Reward Notification
function showRewardNotification(milestone) {
  const messageArea = document.getElementById('messageArea');
  setTimeout(() => {
    messageArea.innerHTML = `
      <div class="message success" style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; border: 2px solid #FFD700; font-weight: 700; box-shadow: 0 8px 25px rgba(147, 51, 234, 0.5); animation: bounceIn 0.5s;">
        <i class="fas fa-trophy" style="font-size: 1.5rem; color: #FFD700;"></i>
        <span style="font-size: 1.1rem;">🎉 New Badge Unlocked: ${milestone.icon} ${milestone.badge} (+${milestone.points} points)!</span>
      </div>
    `;
    
    setTimeout(() => {
      messageArea.innerHTML = '';
    }, 7000);
  }, 2000);
}

// Generate Performance Pie Chart (CSS-based)
function generatePerformancePieChart(submissions) {
  const graded = submissions.filter(s => s.graded);
  
  if (graded.length === 0) {
    return '<p style="text-align: center; color: var(--dark-light);">No graded submissions yet</p>';
  }
  
  let excellent = 0, good = 0, average = 0, belowAvg = 0, poor = 0;
  
  graded.forEach(sub => {
    const percentage = (sub.pointsEarned / sub.maxPoints) * 100;
    if (percentage >= 90) excellent++;
    else if (percentage >= 80) good++;
    else if (percentage >= 70) average++;
    else if (percentage >= 60) belowAvg++;
    else poor++;
  });
  
  const total = graded.length;
  const excellentPct = (excellent / total * 100);
  const goodPct = (good / total * 100);
  const avgPct = (average / total * 100);
  const belowPct = (belowAvg / total * 100);
  const poorPct = (poor / total * 100);
  
  return `
    <svg viewBox="0 0 200 200" style="transform: rotate(-90deg);">
      <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" stroke-width="60" 
        stroke-dasharray="${excellentPct * 5.03} 503" stroke-dashoffset="0"></circle>
      <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" stroke-width="60" 
        stroke-dasharray="${goodPct * 5.03} 503" stroke-dashoffset="${-excellentPct * 5.03}"></circle>
      <circle cx="100" cy="100" r="80" fill="none" stroke="#fbbf24" stroke-width="60" 
        stroke-dasharray="${avgPct * 5.03} 503" stroke-dashoffset="${-(excellentPct + goodPct) * 5.03}"></circle>
      <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" stroke-width="60" 
        stroke-dasharray="${belowPct * 5.03} 503" stroke-dashoffset="${-(excellentPct + goodPct + avgPct) * 5.03}"></circle>
      <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" stroke-width="60" 
        stroke-dasharray="${poorPct * 5.03} 503" stroke-dashoffset="${-(excellentPct + goodPct + avgPct + belowPct) * 5.03}"></circle>
    </svg>
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
      <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">${total}</div>
      <div style="font-size: 0.875rem; color: var(--dark-light);">Students</div>
    </div>
  `;
}

// Generate Streak Leaderboard
function generateStreakLeaderboard(myCourses, streaks) {
  const enrolledStudentIds = new Set();
  myCourses.forEach(course => {
    course.enrolledStudents.forEach(student => {
      enrolledStudentIds.add(student.studentId);
    });
  });
  
  const myStudentStreaks = streaks.filter(s => enrolledStudentIds.has(s.userId));
  
  if (myStudentStreaks.length === 0) {
    return '<p style="text-align: center; color: var(--dark-light);">No student streak data available</p>';
  }
  
  myStudentStreaks.sort((a, b) => b.currentStreak - a.currentStreak);
  
  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Current Streak</th>
            <th>Longest Streak</th>
            <th>Total Logins</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${myStudentStreaks.slice(0, 10).map((streak, index) => {
            const isOnFire = streak.currentStreak >= 7;
            const fireIcon = isOnFire ? '🔥' : '';
            return `
              <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${streak.userName}</td>
                <td><span style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">${fireIcon} ${streak.currentStreak} days</span></td>
                <td>${streak.longestStreak} days</td>
                <td>${streak.totalLogins}</td>
                <td>
                  ${isOnFire ? '<span class="badge badge-danger">🔥 On Fire!</span>' : '<span class="badge badge-success">Active</span>'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Generate Rewards Display
function generateRewardsDisplay(myCourses, rewards) {
  const enrolledStudentIds = new Set();
  myCourses.forEach(course => {
    course.enrolledStudents.forEach(student => {
      enrolledStudentIds.add(student.studentId);
    });
  });
  
  const myStudentRewards = rewards.filter(r => enrolledStudentIds.has(r.userId));
  
  if (myStudentRewards.length === 0) {
    return '<p style="text-align: center; color: var(--dark-light);">No student achievements yet</p>';
  }
  
  myStudentRewards.sort((a, b) => b.totalPoints - a.totalPoints);
  
  return `
    <div class="grid">
      ${myStudentRewards.slice(0, 6).map(reward => `
        <div class="card">
          <h4>${reward.userName}</h4>
          <div style="font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0.5rem 0;">
            ${reward.totalPoints} Points
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
            ${reward.badges.map(badge => `
              <span class="badge badge-warning" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: 700;">
                ${badge.icon} ${badge.badge}
              </span>
            `).join('')}
          </div>
          ${reward.badges.length === 0 ? '<p style="color: var(--dark-light); font-size: 0.9rem; margin-top: 0.5rem;">No badges yet</p>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// View Course Report
function viewCourseReport(courseId, courseName) {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const courseSubmissions = submissions.filter(s => s.courseId === courseId && s.graded);
  
  const modal = document.getElementById('enrolledStudentsModal');
  const list = document.getElementById('enrolledStudentsList');
  
  if (courseSubmissions.length === 0) {
    list.innerHTML = `
      <h4 style="margin-bottom: 1rem; color: var(--dark);">${courseName} - Performance Report</h4>
      <p style="text-align: center; color: var(--dark-light); padding: 2rem;">No graded submissions for this course yet.</p>
    `;
  } else {
    const studentPerformance = {};
    
    courseSubmissions.forEach(sub => {
      if (!studentPerformance[sub.studentId]) {
        studentPerformance[sub.studentId] = {
          name: sub.studentName,
          totalEarned: 0,
          totalPossible: 0,
          assignments: 0
        };
      }
      studentPerformance[sub.studentId].totalEarned += sub.pointsEarned;
      studentPerformance[sub.studentId].totalPossible += sub.maxPoints;
      studentPerformance[sub.studentId].assignments++;
    });
    
    const students = Object.values(studentPerformance);
    students.sort((a, b) => (b.totalEarned / b.totalPossible) - (a.totalEarned / a.totalPossible));
    
    list.innerHTML = `
      <h4 style="margin-bottom: 1.5rem; color: var(--dark);">📊 ${courseName} - Performance Report</h4>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Assignments Completed</th>
              <th>Points</th>
              <th>Grade</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, index) => {
              const percentage = ((student.totalEarned / student.totalPossible) * 100).toFixed(1);
              let performanceBadge = '';
              if (percentage >= 90) performanceBadge = '<span class="badge badge-success">Excellent</span>';
              else if (percentage >= 80) performanceBadge = '<span class="badge badge-primary">Good</span>';
              else if (percentage >= 70) performanceBadge = '<span class="badge badge-warning">Average</span>';
              else if (percentage >= 60) performanceBadge = '<span class="badge badge-warning">Below Average</span>';
              else performanceBadge = '<span class="badge badge-danger">Needs Improvement</span>';
              
              return `
                <tr>
                  <td><strong>${index + 1}</strong></td>
                  <td>${student.name}</td>
                  <td>${student.assignments}</td>
                  <td>${student.totalEarned} / ${student.totalPossible}</td>
                  <td><span class="grade-display">${percentage}%</span></td>
                  <td>${performanceBadge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  modal.classList.add('active');
}

// View Detailed Reports
function viewDetailedReports() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  const streaks = JSON.parse(localStorage.getItem('loginStreaks')) || [];
  const rewards = JSON.parse(localStorage.getItem('studentRewards')) || [];
  
  const myCourses = courses.filter(c => c.teacherId === currentUser.id);
  
  const enrolledStudentIds = new Set();
  const studentData = {};
  
  myCourses.forEach(course => {
    course.enrolledStudents.forEach(student => {
      enrolledStudentIds.add(student.studentId);
      if (!studentData[student.studentId]) {
        studentData[student.studentId] = {
          name: student.studentName,
          courses: [],
          totalEarned: 0,
          totalPossible: 0
        };
      }
      studentData[student.studentId].courses.push(course.title);
    });
  });
  
  submissions.filter(s => s.graded).forEach(sub => {
    if (studentData[sub.studentId]) {
      studentData[sub.studentId].totalEarned += sub.pointsEarned;
      studentData[sub.studentId].totalPossible += sub.maxPoints;
    }
  });
  
  const modal = document.getElementById('gradeSubmissionModal');
  const content = document.getElementById('gradeSubmissionContent');
  
  const students = Object.entries(studentData).map(([id, data]) => {
    const streak = streaks.find(s => s.userId === id) || { currentStreak: 0, longestStreak: 0 };
    const reward = rewards.find(r => r.userId === id) || { totalPoints: 0, badges: [] };
    const percentage = data.totalPossible > 0 ? ((data.totalEarned / data.totalPossible) * 100).toFixed(1) : 0;
    
    return { id, ...data, streak, reward, percentage };
  });
  
  students.sort((a, b) => b.percentage - a.percentage);
  
  content.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; color: var(--dark);">📊 Detailed Student Reports</h4>
    
    ${students.length > 0 ? `
      <div style="max-height: 70vh; overflow-y: auto;">
        ${students.map(student => `
          <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
            <h5 style="color: var(--primary); margin-bottom: 1rem; font-size: 1.2rem;">${student.name}</h5>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div>
                <div style="font-size: 0.8rem; color: var(--dark-light); margin-bottom: 0.25rem;">Overall Grade</div>
                <div class="grade-display" style="font-size: 1.5rem;">${student.percentage}%</div>
              </div>
              <div>
                <div style="font-size: 0.8rem; color: var(--dark-light); margin-bottom: 0.25rem;">Current Streak</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--danger);">🔥 ${student.streak.currentStreak} days</div>
              </div>
              <div>
                <div style="font-size: 0.8rem; color: var(--dark-light); margin-bottom: 0.25rem;">Total Points</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--warning);">⭐ ${student.reward.totalPoints}</div>
              </div>
              <div>
                <div style="font-size: 0.8rem; color: var(--dark-light); margin-bottom: 0.25rem;">Badges Earned</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--success);">🏆 ${student.reward.badges.length}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 0.75rem;">
              <strong style="color: var(--dark); font-size: 0.9rem;">Enrolled Courses:</strong>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                ${student.courses.map(course => `<span class="badge badge-primary">${course}</span>`).join('')}
              </div>
            </div>
            
            ${student.reward.badges.length > 0 ? `
              <div>
                <strong style="color: var(--dark); font-size: 0.9rem;">Achievements:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                  ${student.reward.badges.map(badge => `
                    <span class="badge badge-warning" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; font-weight: 700;">
                      ${badge.icon} ${badge.badge}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : '<p style="text-align: center; color: var(--dark-light); padding: 2rem;">No student data available</p>'}
  `;
  
  modal.classList.add('active');
}

// =============== COURSE COMPLETION SYSTEM ===============

// Submit Course Completion
function submitCourseCompletion(courseId, courseName) {
  const modal = document.getElementById('submitAssignmentModal');
  const content = document.getElementById('submitAssignmentContent');
  
  content.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; color: var(--dark);">🎓 Complete ${courseName}</h4>
    <form id="completionForm" onsubmit="processCourseCompletion(event, '${courseId}', '${courseName.replace(/'/g, "\\'")}')">
      <div class="feedback-box" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); margin-bottom: 1.5rem;">
        <p style="color: var(--dark); margin: 0;"><strong>🎉 Congratulations!</strong> You're about to complete this course. Please share your learning experience and achievements.</p>
      </div>
      
      <div class="form-group">
        <label class="form-label">What did you learn from this course? *</label>
        <textarea class="form-textarea" id="learnings" required rows="4" placeholder="Share key concepts, skills, and knowledge you gained..."></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Describe your final project or achievement *</label>
        <textarea class="form-textarea" id="achievement" required rows="4" placeholder="Describe what you built, created, or accomplished..."></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Portfolio/Project Link (Optional)</label>
        <input type="url" class="form-input" id="projectLink" placeholder="https://your-project-link.com">
      </div>
      
      <div class="form-group">
        <label class="form-label">Feedback for Instructor (Optional)</label>
        <textarea class="form-textarea" id="feedback" rows="3" placeholder="How was your learning experience? Any suggestions?"></textarea>
      </div>
      
      <button type="submit" class="submit-btn"><i class="fas fa-graduation-cap"></i> Submit for Completion</button>
    </form>
  `;
  
  modal.classList.add('active');
}

// Process Course Completion  
function processCourseCompletion(e, courseId, courseName) {
  e.preventDefault();
  
  const learnings = document.getElementById('learnings').value;
  const achievement = document.getElementById('achievement').value;
  const projectLink = document.getElementById('projectLink').value;
  const feedback = document.getElementById('feedback').value;
  
  const completions = JSON.parse(localStorage.getItem('courseCompletions')) || [];
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const course = courses.find(c => c._id === courseId);
  
  const completion = {
    _id: Date.now().toString(),
    courseId,
    courseName,
    studentId: currentUser.id,
    studentName: currentUser.name,
    teacherId: course.teacherId,
    teacherName: course.teacherName,
    learnings,
    achievement,
    projectLink,
    feedback,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  completions.push(completion);
  localStorage.setItem('courseCompletions', JSON.stringify(completions));
  
  // Award student with completion reward points
  const rewards = JSON.parse(localStorage.getItem('studentRewards')) || [];
  let userRewards = rewards.find(r => r.userId === currentUser.id);
  
  if (!userRewards) {
    userRewards = {
      userId: currentUser.id,
      userName: currentUser.name,
      badges: [],
      totalPoints: 0
    };
    rewards.push(userRewards);
  }
  
  // Add pending completion badge
  userRewards.badges.push({
    badge: 'Course Completion Pending',
    icon: '🎓',
    points: 0,
    earnedDate: new Date().toISOString(),
    courseId: courseId
  });
  
  localStorage.setItem('studentRewards', JSON.stringify(rewards));
  
  showMessage('✅ Course completion submitted! Waiting for teacher approval.', 'success');
  closeModal('submitAssignmentModal');
  loadEnrolledCourses();
}

// View Certificate
function viewCertificate(courseId, courseName) {
  const completions = JSON.parse(localStorage.getItem('courseCompletions')) || [];
  const completion = completions.find(c => c.courseId === courseId && c.studentId === currentUser.id && c.status === 'approved');
  
  if (!completion) return;
  
  const modal = document.getElementById('gradeSubmissionModal');
  const content = document.getElementById('gradeSubmissionContent');
  
  content.innerHTML = `
    <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 3rem 2rem; border-radius: 16px; border: 4px solid; border-image: linear-gradient(135deg, var(--primary), var(--secondary)) 1; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🎓</div>
      <h2 style="font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem; font-weight: 800;">Certificate of Completion</h2>
      <div style="width: 60px; height: 4px; background: linear-gradient(90deg, var(--primary), var(--secondary)); margin: 1rem auto;"></div>
      
      <p style="font-size: 1.1rem; color: var(--dark); margin: 2rem 0 1rem;">This is to certify that</p>
      <h3 style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0.5rem 0;">
        ${currentUser.name}
      </h3>
      <p style="font-size: 1.1rem; color: var(--dark); margin: 1rem 0;">has successfully completed the course</p>
      <h4 style="font-size: 1.8rem; color: var(--dark); font-weight: 700; margin: 1rem 0;">${courseName}</h4>
      
      <div style="display: flex; justify-content: space-around; margin: 2rem 0; padding: 1.5rem; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
        <div>
          <div style="font-size: 0.8rem; color: var(--dark-light); margin-bottom: 0.25rem;">Completion Date</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${new Date(completion.completedAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--dark-light); margin-bottom: 0.25rem;">Instructor</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${completion.teacherName}</div>
        </div>
      </div>
      
      <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid var(--light-gray);">
        <p style="font-size: 0.9rem; color: var(--dark-light);">Certificate ID: #${completion._id.substring(0, 8).toUpperCase()}</p>
      </div>
      
      <div style="margin-top: 2rem;">
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Certificate</button>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

// Teacher: View Course Completions
function viewCourseCompletions() {
  const courses = JSON.parse(localStorage.getItem('courses')) || [];
  const myCourses = courses.filter(c => c.teacherId === currentUser.id);
  const completions = JSON.parse(localStorage.getItem('courseCompletions')) || [];
  
  const myCompletions = completions.filter(c => 
    myCourses.some(course => course._id === c.courseId)
  );
  
  const pending = myCompletions.filter(c => c.status === 'pending');
  const approved = myCompletions.filter(c => c.status === 'approved');
  
  const modal = document.getElementById('gradeSubmissionModal');
  const content = document.getElementById('gradeSubmissionContent');
  
  content.innerHTML = `
    <h4 style="margin-bottom: 1.5rem; color: var(--dark);">🎓 Course Completion Requests</h4>
    
    <div class="stats-grid" style="margin-bottom: 2rem;">
      <div class="stat-card">
        <h4>Pending Reviews</h4>
        <div class="stat-value">${pending.length}</div>
      </div>
      <div class="stat-card">
        <h4>Approved</h4>
        <div class="stat-value">${approved.length}</div>
      </div>
    </div>
    
    ${pending.length > 0 ? `
      <h5 style="color: var(--dark); margin-bottom: 1rem;">⏳ Pending Approvals</h5>
      <div style="max-height: 50vh; overflow-y: auto; margin-bottom: 2rem;">
        ${pending.map(comp => `
          <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div>
                <h6 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 0.5rem;">${comp.studentName}</h6>
                <p style="color: var(--dark-light); font-size: 0.9rem; margin: 0;">${comp.courseName}</p>
              </div>
              <span class="badge badge-warning">Pending</span>
            </div>
            
            <div style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <strong style="color: var(--dark); font-size: 0.9rem;">What they learned:</strong>
              <p style="color: var(--dark-light); font-size: 0.9rem; margin: 0.5rem 0 0;">${comp.learnings}</p>
            </div>
            
            <div style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <strong style="color: var(--dark); font-size: 0.9rem;">Achievement:</strong>
              <p style="color: var(--dark-light); font-size: 0.9rem; margin: 0.5rem 0 0;">${comp.achievement}</p>
              ${comp.projectLink ? `<p style="margin-top: 0.5rem;"><a href="${comp.projectLink}" target="_blank" style="color: var(--primary); text-decoration: none;">🔗 View Project</a></p>` : ''}
            </div>
            
            ${comp.feedback ? `
              <div style="background: rgba(78, 205, 196, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong style="color: var(--dark); font-size: 0.9rem;">Feedback:</strong>
                <p style="color: var(--dark-light); font-size: 0.9rem; margin: 0.5rem 0 0;">${comp.feedback}</p>
              </div>
            ` : ''}
            
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="btn btn-success" onclick="approveCourseCompletion('${comp._id}')">
                <i class="fas fa-check"></i> Approve & Award Certificate
              </button>
              <button class="btn btn-danger" onclick="rejectCourseCompletion('${comp._id}')">
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p style="text-align: center; color: var(--dark-light); padding: 2rem;">No pending completion requests</p>'}
    
    ${approved.length > 0 ? `
      <h5 style="color: var(--dark); margin-bottom: 1rem;">✅ Approved Completions (${approved.length})</h5>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Completed Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${approved.map(comp => `
              <tr>
                <td>${comp.studentName}</td>
                <td>${comp.courseName}</td>
                <td>${new Date(comp.completedAt).toLocaleDateString()}</td>
                <td><span class="badge badge-success">🎓 Certified</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
  `;
  
  modal.classList.add('active');
}

// Approve Course Completion
function approveCourseCompletion(completionId) {
  const completions = JSON.parse(localStorage.getItem('courseCompletions')) || [];
  const completion = completions.find(c => c._id === completionId);
  
  if (!completion) return;
  
  completion.status = 'approved';
  completion.completedAt = new Date().toISOString();
  
  localStorage.setItem('courseCompletions', JSON.stringify(completions));
  
  // Award student with completion badge and bonus points
  const rewards = JSON.parse(localStorage.getItem('studentRewards')) || [];
  let userRewards = rewards.find(r => r.userId === completion.studentId);
  
  if (userRewards) {
    // Remove pending badge
    userRewards.badges = userRewards.badges.filter(b => b.courseId !== completion.courseId || b.badge !== 'Course Completion Pending');
    
    // Add certified badge
    userRewards.badges.push({
      badge: `${completion.courseName} - Certified`,
      icon: '🎓',
      points: 250,
      earnedDate: new Date().toISOString(),
      courseId: completion.courseId
    });
    
    userRewards.totalPoints += 250;
    localStorage.setItem('studentRewards', JSON.stringify(rewards));
  }
  
  showMessage(`✅ ${completion.studentName} has been awarded the certificate for ${completion.courseName}!`, 'success');
  viewCourseCompletions();
}

// Reject Course Completion
function rejectCourseCompletion(completionId) {
  if (!confirm('Are you sure you want to reject this completion request? The student will need to resubmit.')) return;
  
  let completions = JSON.parse(localStorage.getItem('courseCompletions')) || [];
  const completion = completions.find(c => c._id === completionId);
  
  if (!completion) return;
  
  // Remove from completions
  completions = completions.filter(c => c._id !== completionId);
  localStorage.setItem('courseCompletions', JSON.stringify(completions));
  
  // Remove pending badge from rewards
  const rewards = JSON.parse(localStorage.getItem('studentRewards')) || [];
  const userRewards = rewards.find(r => r.userId === completion.studentId);
  
  if (userRewards) {
    userRewards.badges = userRewards.badges.filter(b => b.courseId !== completion.courseId || b.badge !== 'Course Completion Pending');
    localStorage.setItem('studentRewards', JSON.stringify(rewards));
  }
  
  showMessage('Completion request rejected.', 'success');
  viewCourseCompletions();
}

// =============== VIDEO MANAGEMENT ===============

// Add Video Modal
function addVideoModal(courseId, courseName) {
  const modal = document.getElementById('enrolledStudentsModal');
  const list = document.getElementById('enrolledStudentsList');
  
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  const courseVideos = videos.filter(v => v.courseId === courseId);
  
  list.innerHTML = `
    <h4 style="margin-bottom: 1rem; color: var(--dark);">${courseName} - Educational Videos</h4>
    
    <div class="form-card" style="margin-bottom: 1.5rem;">
      <h5 style="color: var(--dark); margin-bottom: 1rem;"><i class="fas fa-plus-circle"></i> Add New Video</h5>
      <form id="addVideoForm" onsubmit="addVideo(event, '${courseId}', '${courseName.replace(/'/g, "\\'")}')">
        <div class="form-group">
          <label class="form-label">Video Title *</label>
          <input type="text" class="form-input" id="videoTitle" required placeholder="e.g., Introduction to JavaScript">
        </div>
        <div class="form-group">
          <label class="form-label">Video URL (YouTube, Vimeo, etc.) *</label>
          <input type="url" class="form-input" id="videoUrl" required placeholder="https://www.youtube.com/watch?v=...">
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="videoDescription" rows="3" placeholder="What will students learn from this video?"></textarea>
        </div>
        <button type="submit" class="submit-btn"><i class="fas fa-upload"></i> Add Video</button>
      </form>
    </div>
    
    ${courseVideos.length > 0 ? `
      <h5 style="color: var(--dark); margin-bottom: 1rem;"><i class="fas fa-list"></i> Existing Videos (${courseVideos.length})</h5>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${courseVideos.map(video => `
          <div class="card" style="padding: 1rem;">
            <h6 style="color: var(--primary); margin-bottom: 0.5rem;">
              <i class="fas fa-play-circle"></i> ${video.title}
            </h6>
            <p style="font-size: 0.85rem; color: var(--dark-light); margin-bottom: 0.5rem;">${video.description || 'No description'}</p>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <a href="${video.url}" target="_blank" class="btn btn-primary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                <i class="fas fa-external-link-alt"></i> Watch
              </a>
              <button class="btn btn-danger" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" onclick="deleteVideo('${video._id}', '${courseId}', '${courseName.replace(/'/g, "\\'")}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p style="text-align: center; color: var(--dark-light); padding: 1rem;">No videos added yet.</p>'}
  `;
  
  modal.classList.add('active');
}

// Add Video
function addVideo(e, courseId, courseName) {
  e.preventDefault();
  
  const title = document.getElementById('videoTitle').value;
  const url = document.getElementById('videoUrl').value;
  const description = document.getElementById('videoDescription').value;
  
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  
  const newVideo = {
    _id: Date.now().toString(),
    courseId,
    courseName,
    title,
    url,
    description,
    teacherId: currentUser.id,
    createdAt: new Date().toISOString()
  };
  
  videos.push(newVideo);
  localStorage.setItem('videos', JSON.stringify(videos));
  
  showMessage('✅ Video added successfully!', 'success');
  addVideoModal(courseId, courseName); // Refresh the modal
}

// Delete Video
function deleteVideo(videoId, courseId, courseName) {
  if (!confirm('Are you sure you want to delete this video?')) return;
  
  let videos = JSON.parse(localStorage.getItem('videos')) || [];
  videos = videos.filter(v => v._id !== videoId);
  localStorage.setItem('videos', JSON.stringify(videos));
  
  showMessage('✅ Video deleted successfully!', 'success');
  addVideoModal(courseId, courseName); // Refresh the modal
}

// View Course Videos (Student)
function viewCourseVideos(courseId, courseName) {
  const videos = JSON.parse(localStorage.getItem('videos')) || [];
  const courseVideos = videos.filter(v => v.courseId === courseId);
  
  const modal = document.getElementById('submitAssignmentModal');
  const content = document.getElementById('submitAssignmentContent');
  
  if (courseVideos.length > 0) {
    content.innerHTML = `
      <h4 style="margin-bottom: 1.5rem; color: var(--dark);">
        <i class="fas fa-graduation-cap"></i> ${courseName} - Educational Videos
      </h4>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${courseVideos.map((video, index) => `
          <div class="card" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(78, 205, 196, 0.05));">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem;">
                ${index + 1}
              </div>
              <h5 style="color: var(--dark); margin: 0; flex: 1;">${video.title}</h5>
            </div>
            ${video.description ? `
              <div class="feedback-box" style="margin-bottom: 1rem; background: rgba(255, 255, 255, 0.7);">
                <p style="margin: 0; color: var(--dark-light);">${video.description}</p>
              </div>
            ` : ''}
            <a href="${video.url}" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center;">
              <i class="fas fa-play-circle"></i> Watch Video
            </a>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-video-slash"></i>
        <h3>No Videos Available</h3>
        <p>Your instructor hasn't added any videos yet for this course.</p>
      </div>
    `;
  }
  
  modal.classList.add('active');
}
