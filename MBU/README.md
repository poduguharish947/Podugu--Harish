# User Registration Backend API

A comprehensive RESTful API for a complete Learning Management System (LMS) built with Node.js, Express, and MongoDB.

## 🎯 All Features Implemented

### User Management
- ✅ User Registration & Login
- ✅ Password hashing with bcrypt
- ✅ Role-based access (Student/Teacher)

### Course Management (User Story 2)
- ✅ Create, Read, Update, Delete courses
- ✅ Course enrollment system
- ✅ Enrolled students tracking

### Silver Level - Course Enrollment (User Story 3)
- ✅ Student enrollment in courses
- ✅ View enrolled courses list
- ✅ View enrolled students per course

### Gold Level - Assignment System (User Story 4)
- ✅ Create assignments with due dates
- ✅ Submit assignments (text + file URL)
- ✅ View all submissions
- ✅ Prevent duplicate submissions

### Platinum Level - Grading System (User Story 5)
- ✅ Grade assignments with feedback
- ✅ View grades per assignment
- ✅ Calculate overall grades per course
- ✅ Performance analytics

### Advanced Features (User Story 6) ⭐ NEW
- ✅ **Discussion Forum** - Course-based discussions with replies
- ✅ **Course Materials** - Upload and manage course files
- ✅ **Notifications** - Automated notifications for all events

## Prerequisites

Before running this project, make sure you have:

1. **Node.js** installed (v14 or higher)
2. **MongoDB** installed and running locally

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### User Endpoints

#### Health Check
- **GET** `/`
- Returns API status

#### Register User
- **POST** `/api/register`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Student"
}
```

#### Login User
- **POST** `/api/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get All Users
- **GET** `/api/users`
- Returns list of all users (passwords excluded)

#### Delete User
- **DELETE** `/api/users/:id`
- Deletes a user by ID

---

### Course Endpoints

#### Create Course (Teacher only)
- **POST** `/api/courses`
- Body:
```json
{
  "title": "Web Development 101",
  "description": "Learn HTML, CSS, JavaScript",
  "duration": "8 weeks",
  "teacherId": "teacher_id",
  "teacherName": "Dr. Smith"
}
```

#### Get All Courses
- **GET** `/api/courses`

#### Get Single Course
- **GET** `/api/courses/:id`

#### Get Teacher's Courses
- **GET** `/api/courses/teacher/:teacherId`

#### Update Course (Teacher only)
- **PUT** `/api/courses/:id`

#### Delete Course (Teacher only)
- **DELETE** `/api/courses/:id`

#### Enroll Student in Course
- **POST** `/api/courses/:id/enroll`
- Body:
```json
{
  "studentId": "student_id",
  "studentName": "John Doe"
}
```

#### Get Student's Enrolled Courses
- **GET** `/api/courses/student/:studentId/enrolled`

#### Get Enrolled Students (Teacher)
- **GET** `/api/courses/:id/students`

---

### Assignment Endpoints

#### Create Assignment (Teacher only)
- **POST** `/api/assignments`
- Body:
```json
{
  "title": "Build a Website",
  "description": "Create a personal portfolio",
  "courseId": "course_id",
  "courseName": "Web Development 101",
  "teacherId": "teacher_id",
  "dueDate": "2024-12-31",
  "maxPoints": 100
}
```

#### Get Course Assignments
- **GET** `/api/courses/:courseId/assignments`

#### Get Teacher's Assignments
- **GET** `/api/assignments/teacher/:teacherId`

#### Delete Assignment (Teacher only)
- **DELETE** `/api/assignments/:id`

---

### Submission Endpoints

#### Submit Assignment (Student only)
- **POST** `/api/submissions`
- Body:
```json
{
  "assignmentId": "assignment_id",
  "assignmentTitle": "Build a Website",
  "studentId": "student_id",
  "studentName": "John Doe",
  "courseId": "course_id",
  "courseName": "Web Development 101",
  "content": "I created a portfolio website...",
  "fileUrl": "https://github.com/user/repo"
}
```

#### Get Assignment Submissions (Teacher)
- **GET** `/api/assignments/:assignmentId/submissions`

#### Get Student's Submissions
- **GET** `/api/submissions/student/:studentId`

#### Get Student's Course Submissions
- **GET** `/api/submissions/student/:studentId/course/:courseId`

---

### Grading Endpoints

#### Grade Submission (Teacher only)
- **PUT** `/api/submissions/:id/grade`
- Body:
```json
{
  "grade": 95,
  "feedback": "Excellent work!",
  "teacherId": "teacher_id"
}
```

#### Get Student Performance in Course
- **GET** `/api/students/:studentId/course/:courseId/performance`
- Returns:
```json
{
  "success": true,
  "totalSubmissions": 3,
  "gradedSubmissions": 3,
  "averageGrade": 92.5,
  "totalPoints": 278,
  "maxPossiblePoints": 300
}
```

#### Get Course Performance (Teacher)
- **GET** `/api/courses/:courseId/performance`
- Returns all students' performance in a course

---

### Discussion Forum Endpoints ⭐ NEW

#### Create Discussion Post
- **POST** `/api/discussions`
- Body:
```json
{
  "courseId": "course_id",
  "courseName": "Course Name",
  "userId": "user_id",
  "userName": "John Doe",
  "userRole": "Student",
  "title": "Question about Assignment",
  "content": "Can you clarify..."
}
```

#### Get Course Discussions
- **GET** `/api/courses/:courseId/discussions`

#### Reply to Discussion
- **POST** `/api/discussions/:id/reply`
- Body:
```json
{
  "userId": "user_id",
  "userName": "Teacher Name",
  "userRole": "Teacher",
  "content": "Here's the answer..."
}
```

#### Delete Discussion
- **DELETE** `/api/discussions/:id`

---

### Course Materials Endpoints ⭐ NEW

#### Upload Course Material (Teacher)
- **POST** `/api/materials`
- Body:
```json
{
  "courseId": "course_id",
  "courseName": "Course Name",
  "teacherId": "teacher_id",
  "teacherName": "Dr. Smith",
  "title": "Week 1 Lecture Slides",
  "description": "Introduction to...",
  "fileUrl": "https://example.com/file.pdf",
  "fileType": "PDF",
  "fileName": "lecture.pdf",
  "fileSize": "2.5 MB"
}
```

#### Get Course Materials
- **GET** `/api/courses/:courseId/materials`

#### Delete Material (Teacher)
- **DELETE** `/api/materials/:id`

---

### Notification Endpoints ⭐ NEW

#### Get User Notifications
- **GET** `/api/notifications/:userId`
- Returns:
```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "notifications": [
    {
      "type": "assignment",
      "title": "New Assignment Posted",
      "message": "New assignment...",
      "link": "/course/123/assignments",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Mark Notification as Read
- **PUT** `/api/notifications/:id/read`

#### Mark All Notifications as Read
- **PUT** `/api/notifications/:userId/read-all`

#### Delete Notification
- **DELETE** `/api/notifications/:id`

## Testing with cURL

### Register a user:
```bash
curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"role\":\"Student\"}"
```

### Login:
```bash
curl -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

## MongoDB Setup

Make sure MongoDB is running:

```bash
# Windows (if installed as a service)
net start MongoDB

# Or run mongod manually
mongod
```

## Environment Variables

Create a `.env` file (already included) with:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/userdb
```

## Project Structure

```
backend/
├── server.js        # Main server file
├── package.json     # Dependencies
├── .env            # Environment variables
└── README.md       # Documentation
```

## Security Features

- Password hashing using bcryptjs
- Input validation
- CORS protection
- Unique email constraint

## Next Steps

To connect the frontend with this backend:
1. Make sure the backend server is running
2. Update the frontend JavaScript to make API calls instead of using localStorage
3. Open the updated `Project.html` in your browser

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is installed and running
- Check the connection string in `.env` file

**Port Already in Use:**
- Change the PORT in `.env` file
- Or stop the process using port 3000

## License

ISC
