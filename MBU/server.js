const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/userdb';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentName: String,
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

// Submission Schema
const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  assignmentTitle: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

// Discussion Forum Schema
const discussionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  replies: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userRole: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Discussion = mongoose.model('Discussion', discussionSchema);

// Course Material Schema
const materialSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Material = mongoose.model('Material', materialSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['assignment', 'grade', 'material', 'discussion', 'enrollment', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Helper function to create notifications
async function createNotification(userId, type, title, message, link = null, relatedId = null) {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link,
      relatedId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create Notification Error:', error);
  }
}

// Routes

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'User Registration API is running!' });
});

// Register User
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! You can now login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Welcome ${user.name} (${user.role})!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Get all users (for testing purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching users' 
    });
  }
});

// Delete user (for testing purposes)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting user' 
    });
  }
});

// =============== COURSE MANAGEMENT ROUTES ===============

// Create Course (Teacher only)
app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, duration, teacherId, teacherName } = req.body;

    // Validation
    if (!title || !description || !duration || !teacherId || !teacherName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Verify teacher exists and has teacher role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only teachers can create courses' 
      });
    }

    // Create new course
    const course = new Course({
      title,
      description,
      duration,
      teacherId,
      teacherName
    });

    await course.save();

    res.status(201).json({ 
      success: true, 
      message: 'Course created successfully!',
      course
    });
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating course' 
    });
  }
});

// Get All Courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: courses.length,
      courses 
    });
  } catch (error) {
    console.error('Fetch Courses Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching courses' 
    });
  }
});

// Get Courses by Teacher ID
app.get('/api/courses/teacher/:teacherId', async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: courses.length,
      courses 
    });
  } catch (error) {
    console.error('Fetch Teacher Courses Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching teacher courses' 
    });
  }
});

// Get Single Course
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    res.status(200).json({ 
      success: true, 
      course 
    });
  } catch (error) {
    console.error('Fetch Course Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching course' 
    });
  }
});

// Update Course (Teacher only)
app.put('/api/courses/:id', async (req, res) => {
  try {
    const { title, description, duration, teacherId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Verify the teacher owns this course
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own courses' 
      });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.duration = duration || course.duration;

    await course.save();

    res.status(200).json({ 
      success: true, 
      message: 'Course updated successfully!',
      course 
    });
  } catch (error) {
    console.error('Update Course Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating course' 
    });
  }
});

// Delete Course (Teacher only)
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { teacherId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Verify the teacher owns this course
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own courses' 
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Course deleted successfully!' 
    });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting course' 
    });
  }
});

// Enroll Student in Course
app.post('/api/courses/:id/enroll', async (req, res) => {
  try {
    const { studentId, studentName } = req.body;

    // Validation
    if (!studentId || !studentName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student information required' 
      });
    }

    // Verify student exists and has student role
    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only students can enroll in courses' 
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.studentId.toString() === studentId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already enrolled in this course' 
      });
    }

    // Enroll student
    course.enrolledStudents.push({
      studentId,
      studentName
    });

    await course.save();

    res.status(200).json({ 
      success: true, 
      message: 'Successfully enrolled in course!',
      course 
    });
  } catch (error) {
    console.error('Enroll Course Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error enrolling in course' 
    });
  }
});

// Get Enrolled Courses for Student
app.get('/api/courses/student/:studentId/enrolled', async (req, res) => {
  try {
    const courses = await Course.find({
      'enrolledStudents.studentId': req.params.studentId
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: courses.length,
      courses 
    });
  } catch (error) {
    console.error('Fetch Enrolled Courses Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching enrolled courses' 
    });
  }
});

// Get Enrolled Students for a Course (Teacher)
app.get('/api/courses/:id/students', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: course.enrolledStudents.length,
      students: course.enrolledStudents,
      courseName: course.title
    });
  } catch (error) {
    console.error('Fetch Enrolled Students Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching enrolled students' 
    });
  }
});

// =============== ASSIGNMENT MANAGEMENT ROUTES ===============

// Create Assignment (Teacher only)
app.post('/api/assignments', async (req, res) => {
  try {
    const { title, description, courseId, courseName, teacherId, dueDate, maxPoints } = req.body;

    // Validation
    if (!title || !description || !courseId || !courseName || !teacherId || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Verify teacher owns the course
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only create assignments for your own courses' 
      });
    }

    const assignment = new Assignment({
      title,
      description,
      courseId,
      courseName,
      teacherId,
      dueDate,
      maxPoints: maxPoints || 100
    });

    await assignment.save();

    // Notify all enrolled students
    for (const student of course.enrolledStudents) {
      await createNotification(
        student.studentId,
        'assignment',
        'New Assignment Posted',
        `New assignment "${title}" in ${courseName}. Due: ${new Date(dueDate).toLocaleDateString()}`,
        `/course/${courseId}/assignments`,
        assignment._id
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Assignment created successfully!',
      assignment
    });
  } catch (error) {
    console.error('Create Assignment Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating assignment' 
    });
  }
});

// Get All Assignments for a Course
app.get('/api/courses/:courseId/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      courseId: req.params.courseId 
    }).sort({ dueDate: 1 });

    res.status(200).json({ 
      success: true, 
      count: assignments.length,
      assignments 
    });
  } catch (error) {
    console.error('Fetch Assignments Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching assignments' 
    });
  }
});

// Get Assignments by Teacher
app.get('/api/assignments/teacher/:teacherId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      teacherId: req.params.teacherId 
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: assignments.length,
      assignments 
    });
  } catch (error) {
    console.error('Fetch Teacher Assignments Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching assignments' 
    });
  }
});

// Delete Assignment (Teacher only)
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const { teacherId } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    if (assignment.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own assignments' 
      });
    }

    // Also delete all submissions for this assignment
    await Submission.deleteMany({ assignmentId: req.params.id });
    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Assignment and all submissions deleted successfully!' 
    });
  } catch (error) {
    console.error('Delete Assignment Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting assignment' 
    });
  }
});

// =============== SUBMISSION MANAGEMENT ROUTES ===============

// Submit Assignment (Student only)
app.post('/api/submissions', async (req, res) => {
  try {
    const { assignmentId, assignmentTitle, studentId, studentName, courseId, courseName, content, fileUrl } = req.body;

    // Validation
    if (!assignmentId || !assignmentTitle || !studentId || !studentName || !courseId || !courseName || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Verify student is enrolled in the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.studentId.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false, 
        message: 'You must be enrolled in the course to submit assignments' 
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ 
      assignmentId, 
      studentId 
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted this assignment' 
      });
    }

    const submission = new Submission({
      assignmentId,
      assignmentTitle,
      studentId,
      studentName,
      courseId,
      courseName,
      content,
      fileUrl
    });

    await submission.save();

    // Notify the teacher
    await createNotification(
      course.teacherId,
      'assignment',
      'New Assignment Submission',
      `${studentName} submitted "${assignmentTitle}" in ${courseName}`,
      `/submissions`,
      submission._id
    );

    res.status(201).json({ 
      success: true, 
      message: 'Assignment submitted successfully!',
      submission
    });
  } catch (error) {
    console.error('Submit Assignment Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error submitting assignment' 
    });
  }
});

// Get Submissions for an Assignment (Teacher)
app.get('/api/assignments/:assignmentId/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      assignmentId: req.params.assignmentId 
    }).sort({ submittedAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: submissions.length,
      submissions 
    });
  } catch (error) {
    console.error('Fetch Submissions Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submissions' 
    });
  }
});

// Get Student's Submissions
app.get('/api/submissions/student/:studentId', async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      studentId: req.params.studentId 
    }).sort({ submittedAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: submissions.length,
      submissions 
    });
  } catch (error) {
    console.error('Fetch Student Submissions Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submissions' 
    });
  }
});

// Get Student's Submissions for a Specific Course
app.get('/api/submissions/student/:studentId/course/:courseId', async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      studentId: req.params.studentId,
      courseId: req.params.courseId
    }).sort({ submittedAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: submissions.length,
      submissions 
    });
  } catch (error) {
    console.error('Fetch Course Submissions Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submissions' 
    });
  }
});

// =============== GRADING ROUTES ===============

// Grade Submission (Teacher only)
app.put('/api/submissions/:id/grade', async (req, res) => {
  try {
    const { grade, feedback, teacherId } = req.body;

    // Validation
    if (grade === undefined || grade === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Grade is required' 
      });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Verify teacher owns the assignment's course
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment || assignment.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only grade submissions for your own courses' 
      });
    }

    // Validate grade is within range
    if (grade < 0 || grade > assignment.maxPoints) {
      return res.status(400).json({ 
        success: false, 
        message: `Grade must be between 0 and ${assignment.maxPoints}` 
      });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await submission.save();

    // Notify the student
    await createNotification(
      submission.studentId,
      'grade',
      'Assignment Graded',
      `Your assignment "${submission.assignmentTitle}" has been graded: ${grade}/${assignment.maxPoints}`,
      `/grades`,
      submission._id
    );

    res.status(200).json({ 
      success: true, 
      message: 'Submission graded successfully!',
      submission 
    });
  } catch (error) {
    console.error('Grade Submission Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error grading submission' 
    });
  }
});

// Get Student's Overall Performance in a Course
app.get('/api/students/:studentId/course/:courseId/performance', async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      studentId: req.params.studentId,
      courseId: req.params.courseId,
      status: 'graded'
    });

    if (submissions.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No graded submissions found',
        totalSubmissions: 0,
        gradedSubmissions: 0,
        averageGrade: 0,
        totalPoints: 0,
        maxPossiblePoints: 0
      });
    }

    // Get all assignments for the course to calculate max points
    const assignments = await Assignment.find({ courseId: req.params.courseId });
    const assignmentMap = {};
    assignments.forEach(a => {
      assignmentMap[a._id.toString()] = a.maxPoints;
    });

    let totalPoints = 0;
    let maxPossiblePoints = 0;

    submissions.forEach(sub => {
      totalPoints += sub.grade;
      maxPossiblePoints += assignmentMap[sub.assignmentId.toString()] || 100;
    });

    const averageGrade = maxPossiblePoints > 0 
      ? ((totalPoints / maxPossiblePoints) * 100).toFixed(2) 
      : 0;

    res.status(200).json({ 
      success: true,
      totalSubmissions: submissions.length,
      gradedSubmissions: submissions.length,
      averageGrade: parseFloat(averageGrade),
      totalPoints,
      maxPossiblePoints,
      submissions
    });
  } catch (error) {
    console.error('Fetch Performance Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching performance data' 
    });
  }
});

// Get All Students' Performance in a Course (Teacher)
app.get('/api/courses/:courseId/performance', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    const students = course.enrolledStudents;
    const performanceData = [];

    for (const student of students) {
      const submissions = await Submission.find({ 
        studentId: student.studentId,
        courseId: req.params.courseId,
        status: 'graded'
      });

      const assignments = await Assignment.find({ courseId: req.params.courseId });
      const assignmentMap = {};
      assignments.forEach(a => {
        assignmentMap[a._id.toString()] = a.maxPoints;
      });

      let totalPoints = 0;
      let maxPossiblePoints = 0;

      submissions.forEach(sub => {
        totalPoints += sub.grade;
        maxPossiblePoints += assignmentMap[sub.assignmentId.toString()] || 100;
      });

      const averageGrade = maxPossiblePoints > 0 
        ? ((totalPoints / maxPossiblePoints) * 100).toFixed(2) 
        : 0;

      performanceData.push({
        studentId: student.studentId,
        studentName: student.studentName,
        totalSubmissions: submissions.length,
        totalAssignments: assignments.length,
        averageGrade: parseFloat(averageGrade),
        totalPoints,
        maxPossiblePoints
      });
    }

    res.status(200).json({ 
      success: true,
      courseName: course.title,
      studentCount: students.length,
      performanceData
    });
  } catch (error) {
    console.error('Fetch Course Performance Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching course performance' 
    });
  }
});

// =============== DISCUSSION FORUM ROUTES ===============

// Create Discussion Post
app.post('/api/discussions', async (req, res) => {
  try {
    const { courseId, courseName, userId, userName, userRole, title, content } = req.body;

    if (!courseId || !courseName || !userId || !userName || !userRole || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Verify user is enrolled (if student) or owns course (if teacher)
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (userRole === 'Student') {
      const isEnrolled = course.enrolledStudents.some(e => e.studentId.toString() === userId);
      if (!isEnrolled) {
        return res.status(403).json({ 
          success: false, 
          message: 'You must be enrolled in the course to post' 
        });
      }
    } else if (userRole === 'Teacher') {
      if (course.teacherId.toString() !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only post in your own courses' 
        });
      }
    }

    const discussion = new Discussion({
      courseId, courseName, userId, userName, userRole, title, content
    });

    await discussion.save();

    // Notify all enrolled students
    for (const student of course.enrolledStudents) {
      if (student.studentId.toString() !== userId) {
        await createNotification(
          student.studentId,
          'discussion',
          'New Discussion Post',
          `${userName} posted "${title}" in ${courseName}`,
          `/course/${courseId}/discussions`,
          discussion._id
        );
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Discussion posted successfully!',
      discussion
    });
  } catch (error) {
    console.error('Create Discussion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating discussion' 
    });
  }
});

// Get Discussions for a Course
app.get('/api/courses/:courseId/discussions', async (req, res) => {
  try {
    const discussions = await Discussion.find({ 
      courseId: req.params.courseId 
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: discussions.length,
      discussions 
    });
  } catch (error) {
    console.error('Fetch Discussions Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching discussions' 
    });
  }
});

// Reply to Discussion
app.post('/api/discussions/:id/reply', async (req, res) => {
  try {
    const { userId, userName, userRole, content } = req.body;

    if (!userId || !userName || !userRole || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    // Verify user has access to the course
    const course = await Course.findById(discussion.courseId);
    if (userRole === 'Student') {
      const isEnrolled = course.enrolledStudents.some(e => e.studentId.toString() === userId);
      if (!isEnrolled) {
        return res.status(403).json({ 
          success: false, 
          message: 'You must be enrolled to reply' 
        });
      }
    }

    discussion.replies.push({ userId, userName, userRole, content });
    await discussion.save();

    // Notify the original poster
    if (discussion.userId.toString() !== userId) {
      await createNotification(
        discussion.userId,
        'discussion',
        'New Reply to Your Post',
        `${userName} replied to "${discussion.title}"`,
        `/course/${discussion.courseId}/discussions`,
        discussion._id
      );
    }

    res.status(200).json({ 
      success: true, 
      message: 'Reply posted successfully!',
      discussion 
    });
  } catch (error) {
    console.error('Reply Discussion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error posting reply' 
    });
  }
});

// Delete Discussion (Owner or Teacher)
app.delete('/api/discussions/:id', async (req, res) => {
  try {
    const { userId } = req.body;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    // Check if user is the owner or the course teacher
    const course = await Course.findById(discussion.courseId);
    if (discussion.userId.toString() !== userId && course.teacherId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own posts or posts in your course' 
      });
    }

    await Discussion.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Discussion deleted successfully!' 
    });
  } catch (error) {
    console.error('Delete Discussion Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting discussion' 
    });
  }
});

// =============== COURSE MATERIALS ROUTES ===============

// Upload Course Material (Teacher only)
app.post('/api/materials', async (req, res) => {
  try {
    const { courseId, courseName, teacherId, teacherName, title, description, fileUrl, fileType, fileName, fileSize } = req.body;

    if (!courseId || !courseName || !teacherId || !teacherName || !title || !fileUrl || !fileType || !fileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Verify teacher owns the course
    const course = await Course.findById(courseId);
    if (!course || course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only upload materials to your own courses' 
      });
    }

    const material = new Material({
      courseId, courseName, teacherId, teacherName,
      title, description, fileUrl, fileType, fileName, fileSize
    });

    await material.save();

    // Notify all enrolled students
    for (const student of course.enrolledStudents) {
      await createNotification(
        student.studentId,
        'material',
        'New Course Material',
        `${teacherName} uploaded "${title}" in ${courseName}`,
        `/course/${courseId}/materials`,
        material._id
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Material uploaded successfully!',
      material
    });
  } catch (error) {
    console.error('Upload Material Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error uploading material' 
    });
  }
});

// Get Materials for a Course
app.get('/api/courses/:courseId/materials', async (req, res) => {
  try {
    const materials = await Material.find({ 
      courseId: req.params.courseId 
    }).sort({ uploadedAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: materials.length,
      materials 
    });
  } catch (error) {
    console.error('Fetch Materials Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching materials' 
    });
  }
});

// Delete Material (Teacher only)
app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { teacherId } = req.body;

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }

    if (material.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own materials' 
      });
    }

    await Material.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Material deleted successfully!' 
    });
  } catch (error) {
    console.error('Delete Material Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting material' 
    });
  }
});

// =============== NOTIFICATION ROUTES ===============

// Get User Notifications
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.params.userId 
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = await Notification.countDocuments({ 
      userId: req.params.userId,
      isRead: false
    });

    res.status(200).json({ 
      success: true, 
      count: notifications.length,
      unreadCount,
      notifications 
    });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching notifications' 
    });
  }
});

// Mark Notification as Read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating notification' 
    });
  }
});

// Mark All Notifications as Read
app.put('/api/notifications/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark All Read Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating notifications' 
    });
  }
});

// Delete Notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Notification deleted successfully!' 
    });
  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting notification' 
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
