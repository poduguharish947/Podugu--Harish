const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let currentTab = 'mycourses';
let teacherCourses = [];
let currentSubmissionToGrade = null;
let currentAssignmentToSubmit = null;

window.onload = function() {
  const userData = sessionStorage.getItem('user');
  if (!userData) {
    window.location.href = 'Project.html';
    return;
  }

  currentUser = JSON.parse(userData);
  initializeDashboard();
};

function initializeDashboard() {
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = currentUser.role;
  document.getElementById('welcomeName').textContent = currentUser.name;
  
  if (currentUser.role === 'Teacher') {
    document.getElementById('welcomeMessage').textContent = 'Manage your courses, assignments, and grade student work.';
    document.getElementById('teacherView').style.display = 'block';
    loadTeacherCourses();
  } else {
    document.getElementById('welcomeMessage').textContent = 'Browse courses, complete assignments, and track your grades.';
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
document.getElementById('createCourseForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('courseTitle').value;
  const description = document.getElementById('courseDescription').value;
  const duration = document.getElementById('courseDuration').value;

  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, description, duration,
        teacherId: currentUser.id,
        teacherName: currentUser.name
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage(data.message, 'success');
      document.getElementById('createCourseForm').reset();
      loadTeacherCourses();
      switchTab('mycourses');
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error creating course. Make sure backend is running!', 'error');
  }
});

// Load Teacher's Courses
async function loadTeacherCourses() {
  try {
    const response = await fetch(`${API_URL}/courses/teacher/${currentUser.id}`);
    const data = await response.json();
    teacherCourses = data.courses || [];

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
            <span class="badge badge-primary">⏱️ ${course.duration}</span>
            <span class="badge badge-success">👥 ${course.enrolledStudents.length} students</span>
          </div>
          <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="viewEnrolledStudents('${course._id}', '${course.title}')">View Students</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCourse('${course._id}')">Delete</button>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No courses yet</h3><p>Create your first course to get started!</p></div>';
    }
  } catch (error) {
    console.error('Load Teacher Courses Error:', error);
    showMessage('Error loading courses', 'error');
  }
}

// View Enrolled Students
async function viewEnrolledStudents(courseId, courseName) {
  try {
    const response = await fetch(`${API_URL}/courses/${courseId}/students`);
    const data = await response.json();

    const modal = document.getElementById('enrolledStudentsModal');
    const list = document.getElementById('enrolledStudentsList');

    if (data.students && data.students.length > 0) {
      list.innerHTML = `
        <h4 style="margin-bottom: 15px;">${courseName}</h4>
        <div class="table-container">
          <table>
            <thead><tr><th>Student Name</th><th>Enrolled Date</th></tr></thead>
            <tbody>
              ${data.students.map(s => `
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
      list.innerHTML = '<p>No students enrolled yet.</p>';
    }

    modal.classList.add('active');
  } catch (error) {
    showMessage('Error loading students', 'error');
  }
}

// Delete Course
async function deleteCourse(courseId) {
  if (!confirm('Are you sure? All assignments and submissions will be deleted.')) return;

  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: currentUser.id })
    });

    const data = await response.json();
    if (data.success) {
      showMessage(data.message, 'success');
      loadTeacherCourses();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error deleting course', 'error');
  }
}

// Load Available Courses (Student)
async function loadAvailableCourses() {
  try {
    const response = await fetch(`${API_URL}/courses`);
    const data = await response.json();

    const container = document.getElementById('availableCourses');
    
    if (data.courses && data.courses.length > 0) {
      container.innerHTML = data.courses.map(course => {
        const isEnrolled = course.enrolledStudents.some(e => e.studentId === currentUser.id);
        
        return `
          <div class="card">
            <h4>${course.title}</h4>
            <p>${course.description}</p>
            <p style="color: #999; font-size: 12px; font-style: italic;">👨‍🏫 By ${course.teacherName}</p>
            <p style="color: #667eea; font-size: 12px; font-weight: 600;">👥 ${course.enrolledStudents.length} students enrolled</p>
            <div class="card-meta">
              <span class="badge badge-primary">⏱️ ${course.duration}</span>
              ${isEnrolled 
                ? '<span class="badge badge-success">✓ Enrolled</span>'
                : `<button class="btn btn-success btn-sm" onclick="enrollCourse('${course._id}')">Enroll Now</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No courses available</h3><p>Check back later!</p></div>';
    }
  } catch (error) {
    console.error('Load Available Courses Error:', error);
    showMessage('Error loading courses', 'error');
  }
}

// Enroll in Course (Student)
async function enrollCourse(courseId) {
  try {
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: currentUser.id, studentName: currentUser.name })
    });

    const data = await response.json();
    if (data.success) {
      showMessage(data.message, 'success');
      loadAvailableCourses();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error enrolling in course', 'error');
  }
}

// Load Enrolled Courses (Student)
async function loadEnrolledCourses() {
  try {
    const response = await fetch(`${API_URL}/courses/student/${currentUser.id}/enrolled`);
    const data = await response.json();

    const container = document.getElementById('enrolledCourses');
    
    if (data.courses && data.courses.length > 0) {
      container.innerHTML = data.courses.map(course => `
        <div class="card">
          <h4>${course.title}</h4>
          <p>${course.description}</p>
          <p style="color: #999; font-size: 12px; font-style: italic;">👨‍🏫 By ${course.teacherName}</p>
          <div class="card-meta">
            <span class="badge badge-primary">⏱️ ${course.duration}</span>
            <span class="badge badge-success">✓ Enrolled</span>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No enrolled courses</h3><p>Browse and enroll in courses!</p></div>';
    }
  } catch (error) {
    console.error('Load Enrolled Courses Error:', error);
    showMessage('Error loading enrolled courses', 'error');
  }
}

// =============== ASSIGNMENT MANAGEMENT ===============

// Create Assignment (Teacher)
document.getElementById('createAssignmentForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const courseSelect = document.getElementById('assignmentCourse');
  const courseId = courseSelect.value;
  const courseName = courseSelect.options[courseSelect.selectedIndex].text;
  const title = document.getElementById('assignmentTitle').value;
  const description = document.getElementById('assignmentDescription').value;
  const dueDate = document.getElementById('assignmentDueDate').value;
  const maxPoints = document.getElementById('assignmentMaxPoints').value;

  try {
    const response = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, description, courseId, courseName,
        teacherId: currentUser.id, dueDate, maxPoints
      })
    });

    const data = await response.json();
    if (data.success) {
      showMessage(data.message, 'success');
      document.getElementById('createAssignmentForm').reset();
      loadTeacherAssignments();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error creating assignment. Make sure backend is running!', 'error');
  }
});

// Load Teacher Assignments
async function loadTeacherAssignments() {
  try {
    const response = await fetch(`${API_URL}/assignments/teacher/${currentUser.id}`);
    const data = await response.json();

    const container = document.getElementById('teacherAssignments');
    
    if (data.assignments && data.assignments.length > 0) {
      container.innerHTML = data.assignments.map(assignment => `
        <div class="card">
          <h4>${assignment.title}</h4>
          <p><strong>Course:</strong> ${assignment.courseName}</p>
          <p>${assignment.description}</p>
          <div class="card-meta">
            <span class="badge badge-warning">📅 Due: ${new Date(assignment.dueDate).toLocaleDateString()}</span>
            <span class="badge badge-info">🎯 ${assignment.maxPoints} points</span>
          </div>
          <div style="margin-top: 15px;">
            <button class="btn btn-danger btn-sm" onclick="deleteAssignment('${assignment._id}')">Delete</button>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No assignments yet</h3><p>Create your first assignment!</p></div>';
    }
  } catch (error) {
    console.error('Load Teacher Assignments Error:', error);
    showMessage('Error loading assignments', 'error');
  }
}

// Delete Assignment
async function deleteAssignment(assignmentId) {
  if (!confirm('Are you sure? All student submissions will be deleted.')) return;

  try {
    const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: currentUser.id })
    });

    const data = await response.json();
    if (data.success) {
      showMessage(data.message, 'success');
      loadTeacherAssignments();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error deleting assignment', 'error');
  }
}

// Load Student Assignments
async function loadStudentAssignments() {
  try {
    // Get enrolled courses
    const coursesResponse = await fetch(`${API_URL}/courses/student/${currentUser.id}/enrolled`);
    const coursesData = await coursesResponse.json();

    if (!coursesData.courses || coursesData.courses.length === 0) {
      document.getElementById('studentAssignments').innerHTML = 
        '<div class="empty-state"><h3>No assignments</h3><p>Enroll in courses to see assignments!</p></div>';
      return;
    }

    // Get assignments for all enrolled courses
    const allAssignments = [];
    for (const course of coursesData.courses) {
      const assignResponse = await fetch(`${API_URL}/courses/${course._id}/assignments`);
      const assignData = await assignResponse.json();
      if (assignData.assignments) {
        allAssignments.push(...assignData.assignments);
      }
    }

    // Get student's submissions
    const submissionsResponse = await fetch(`${API_URL}/submissions/student/${currentUser.id}`);
    const submissionsData = await submissionsResponse.json();
    const submittedAssignmentIds = new Set(submissionsData.submissions?.map(s => s.assignmentId) || []);

    const container = document.getElementById('studentAssignments');
    
    if (allAssignments.length > 0) {
      container.innerHTML = allAssignments.map(assignment => {
        const isSubmitted = submittedAssignmentIds.has(assignment._id);
        const isPastDue = new Date(assignment.dueDate) < new Date();

        return `
          <div class="card">
            <h4>${assignment.title}</h4>
            <p><strong>Course:</strong> ${assignment.courseName}</p>
            <p>${assignment.description}</p>
            <div class="card-meta">
              <span class="badge badge-warning">📅 Due: ${new Date(assignment.dueDate).toLocaleDateString()}</span>
              <span class="badge badge-info">🎯 ${assignment.maxPoints} points</span>
            </div>
            <div style="margin-top: 15px;">
              ${isSubmitted 
                ? '<span class="badge badge-success">✓ Submitted</span>'
                : isPastDue
                  ? '<span class="badge badge-danger">⚠️ Past Due</span>'
                  : `<button class="btn btn-primary btn-sm" onclick="openSubmitModal('${assignment._id}', '${assignment.title}', '${assignment.courseId}', '${assignment.courseName}')">Submit Assignment</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><h3>No assignments yet</h3><p>Your teachers will post assignments here!</p></div>';
    }
  } catch (error) {
    console.error('Load Student Assignments Error:', error);
    showMessage('Error loading assignments', 'error');
  }
}

// Open Submit Assignment Modal
function openSubmitModal(assignmentId, assignmentTitle, courseId, courseName) {
  currentAssignmentToSubmit = { assignmentId, assignmentTitle, courseId, courseName };
  
  const content = document.getElementById('submitAssignmentContent');
  content.innerHTML = `
    <h4>${assignmentTitle}</h4>
    <p><strong>Course:</strong> ${courseName}</p>
    <form id="submitAssignmentForm">
      <div class="form-group">
        <label>Your Submission *</label>
        <textarea id="submissionContent" required placeholder="Write your answer here..." style="min-height: 200px;"></textarea>
      </div>
      <div class="form-group">
        <label>File URL (Optional)</label>
        <input type="url" id="submissionFileUrl" placeholder="https://...">
      </div>
      <button type="submit" class="submit-btn">Submit Assignment</button>
    </form>
  `;

  document.getElementById('submitAssignmentModal').classList.add('active');

  // Add submit handler
  document.getElementById('submitAssignmentForm').addEventListener('submit', submitAssignment);
}

// Submit Assignment
async function submitAssignment(e) {
  e.preventDefault();
  
  const content = document.getElementById('submissionContent').value;
  const fileUrl = document.getElementById('submissionFileUrl').value;

  try {
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignmentId: currentAssignmentToSubmit.assignmentId,
        assignmentTitle: currentAssignmentToSubmit.assignmentTitle,
        studentId: currentUser.id,
        studentName: currentUser.name,
        courseId: currentAssignmentToSubmit.courseId,
        courseName: currentAssignmentToSubmit.courseName,
        content,
        fileUrl
      })
    });

    const data = await response.json();
    if (data.success) {
      showMessage(data.message, 'success');
      closeModal('submitAssignmentModal');
      loadStudentAssignments();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error submitting assignment', 'error');
  }
}

// =============== SUBMISSION & GRADING (TEACHER) ===============

// Load Teacher Submissions
async function loadTeacherSubmissions() {
  try {
    const container = document.getElementById('submissionsList');
    
    // Get all teacher's courses
    const coursesResponse = await fetch(`${API_URL}/courses/teacher/${currentUser.id}`);
    const coursesData = await coursesResponse.json();

    if (!coursesData.courses || coursesData.courses.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No submissions</h3><p>Create courses and assignments first!</p></div>';
      return;
    }

    // Get all assignments for teacher's courses
    const assignmentsResponse = await fetch(`${API_URL}/assignments/teacher/${currentUser.id}`);
    const assignmentsData = await assignmentsResponse.json();

    if (!assignmentsData.assignments || assignmentsData.assignments.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No submissions</h3><p>Create assignments first!</p></div>';
      return;
    }

    // Get submissions for each assignment
    const submissionsByAssignment = [];
    for (const assignment of assignmentsData.assignments) {
      const subResponse = await fetch(`${API_URL}/assignments/${assignment._id}/submissions`);
      const subData = await subResponse.json();
      
      if (subData.submissions && subData.submissions.length > 0) {
        submissionsByAssignment.push({
          assignment,
          submissions: subData.submissions
        });
      }
    }

    if (submissionsByAssignment.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No submissions yet</h3><p>Students will submit assignments here!</p></div>';
      return;
    }

    container.innerHTML = submissionsByAssignment.map(({ assignment, submissions }) => `
      <div class="form-card">
        <h3>${assignment.title}</h3>
        <p><strong>Course:</strong> ${assignment.courseName}</p>
        <p style="color: #666; margin-bottom: 20px;">Total Submissions: ${submissions.length}</p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(sub => `
                <tr>
                  <td>${sub.studentName}</td>
                  <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                  <td><span class="badge badge-${sub.status === 'graded' ? 'success' : 'warning'}">${sub.status}</span></td>
                  <td>${sub.grade !== undefined ? `${sub.grade}/${assignment.maxPoints}` : '-'}</td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick='openGradeModal(${JSON.stringify(sub)}, ${assignment.maxPoints})'>
                      ${sub.status === 'graded' ? 'View/Edit' : 'Grade'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Load Teacher Submissions Error:', error);
    showMessage('Error loading submissions', 'error');
  }
}

// Open Grade Modal
function openGradeModal(submission, maxPoints) {
  currentSubmissionToGrade = submission;
  
  const content = document.getElementById('gradeSubmissionContent');
  content.innerHTML = `
    <h4>${submission.assignmentTitle}</h4>
    <p><strong>Student:</strong> ${submission.studentName}</p>
    <p><strong>Course:</strong> ${submission.courseName}</p>
    <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
    <hr style="margin: 15px 0;">
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h4 style="margin-bottom: 10px;">Submission:</h4>
      <p style="white-space: pre-wrap;">${submission.content}</p>
      ${submission.fileUrl ? `<p style="margin-top: 10px;"><strong>File:</strong> <a href="${submission.fileUrl}" target="_blank">View File</a></p>` : ''}
    </div>
    <form id="gradeForm">
      <div class="form-group">
        <label>Grade (out of ${maxPoints}) *</label>
        <input type="number" id="gradePoints" required min="0" max="${maxPoints}" value="${submission.grade || ''}" placeholder="Enter grade">
      </div>
      <div class="form-group">
        <label>Feedback</label>
        <textarea id="gradeFeedback" placeholder="Provide feedback to the student..." style="min-height: 100px;">${submission.feedback || ''}</textarea>
      </div>
      <button type="submit" class="submit-btn">Submit Grade</button>
    </form>
  `;

  document.getElementById('gradeSubmissionModal').classList.add('active');

  document.getElementById('gradeForm').addEventListener('submit', gradeSubmission);
}

// Grade Submission
async function gradeSubmission(e) {
  e.preventDefault();
  
  const grade = parseFloat(document.getElementById('gradePoints').value);
  const feedback = document.getElementById('gradeFeedback').value;

  try {
    const response = await fetch(`${API_URL}/submissions/${currentSubmissionToGrade._id}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, feedback, teacherId: currentUser.id })
    });

    const data = await response.json();
    if (data.success) {
      showMessage(data.message, 'success');
      closeModal('gradeSubmissionModal');
      loadTeacherSubmissions();
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    showMessage('Error grading submission', 'error');
  }
}

// =============== GRADES (STUDENT) ===============

// Load Student Grades
async function loadStudentGrades() {
  try {
    // Get enrolled courses
    const coursesResponse = await fetch(`${API_URL}/courses/student/${currentUser.id}/enrolled`);
    const coursesData = await coursesResponse.json();

    const container = document.getElementById('studentGrades');

    if (!coursesData.courses || coursesData.courses.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No grades yet</h3><p>Enroll in courses to see your grades!</p></div>';
      return;
    }

    const gradesHtml = [];

    for (const course of coursesData.courses) {
      // Get performance data for each course
      const perfResponse = await fetch(`${API_URL}/students/${currentUser.id}/course/${course._id}/performance`);
      const perfData = await perfResponse.json();

      // Get submissions for the course
      const subResponse = await fetch(`${API_URL}/submissions/student/${currentUser.id}/course/${course._id}`);
      const subData = await subResponse.json();

      gradesHtml.push(`
        <div class="form-card">
          <h3>${course.title}</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <h4>Total Submissions</h4>
              <div class="stat-value">${perfData.totalSubmissions || 0}</div>
            </div>
            <div class="stat-card">
              <h4>Graded</h4>
              <div class="stat-value">${perfData.gradedSubmissions || 0}</div>
            </div>
            <div class="stat-card">
              <h4>Overall Grade</h4>
              <div class="stat-value">${perfData.averageGrade || 0}%</div>
            </div>
            <div class="stat-card">
              <h4>Total Points</h4>
              <div class="stat-value">${perfData.totalPoints || 0}/${perfData.maxPossiblePoints || 0}</div>
            </div>
          </div>

          ${subData.submissions && subData.submissions.length > 0 ? `
            <h4 style="margin-top: 20px; margin-bottom: 15px;">Submissions</h4>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  ${subData.submissions.map(sub => `
                    <tr>
                      <td>${sub.assignmentTitle}</td>
                      <td>${new Date(sub.submittedAt).toLocaleDateString()}</td>
                      <td><span class="badge badge-${sub.status === 'graded' ? 'success' : 'warning'}">${sub.status}</span></td>
                      <td>${sub.grade !== undefined ? `<strong>${sub.grade}</strong> points` : '-'}</td>
                      <td>${sub.feedback || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p style="color: #999; margin-top: 20px;">No submissions yet.</p>'}
        </div>
      `);
    }

    container.innerHTML = gradesHtml.join('');

  } catch (error) {
    console.error('Load Student Grades Error:', error);
    showMessage('Error loading grades', 'error');
  }
}

// =============== ANALYTICS (TEACHER) ===============

async function loadTeacherAnalytics() {
  try {
    const container = document.getElementById('analyticsContent');

    // Get teacher's courses
    const coursesResponse = await fetch(`${API_URL}/courses/teacher/${currentUser.id}`);
    const coursesData = await coursesResponse.json();

    if (!coursesData.courses || coursesData.courses.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No analytics</h3><p>Create courses to see analytics!</p></div>';
      return;
    }

    const analyticsHtml = [];

    for (const course of coursesData.courses) {
      const perfResponse = await fetch(`${API_URL}/courses/${course._id}/performance`);
      const perfData = await perfResponse.json();

      analyticsHtml.push(`
        <div class="form-card">
          <h3>${course.title}</h3>
          <p style="color: #666; margin-bottom: 20px;">Total Students: ${perfData.studentCount || 0}</p>

          ${perfData.performanceData && perfData.performanceData.length > 0 ? `
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submissions</th>
                    <th>Total Assignments</th>
                    <th>Average Grade</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  ${perfData.performanceData.map(student => `
                    <tr>
                      <td>${student.studentName}</td>
                      <td>${student.totalSubmissions}</td>
                      <td>${student.totalAssignments}</td>
                      <td><strong>${student.averageGrade.toFixed(2)}%</strong></td>
                      <td>${student.totalPoints}/${student.maxPossiblePoints}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p style="color: #999; margin-top: 20px;">No student performance data yet.</p>'}
        </div>
      `);
    }

    container.innerHTML = analyticsHtml.join('');

  } catch (error) {
    console.error('Load Analytics Error:', error);
    showMessage('Error loading analytics', 'error');
  }
}

// =============== UTILITY FUNCTIONS ===============

function showMessage(message, type) {
  const messageArea = document.getElementById('messageArea');
  messageArea.innerHTML = `<div class="message ${type}">${message}</div>`;
  
  setTimeout(() => {
    messageArea.innerHTML = '';
  }, 5000);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function logout() {
  sessionStorage.removeItem('user');
  window.location.href = 'Project.html';
}
