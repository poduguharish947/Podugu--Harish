# 📚 Course Management System - Complete Documentation

A full-stack web application for managing courses with role-based access for Teachers and Students.

---

## 🎯 User Stories Implemented

### ✅ User Story 1 – User Registration & Login

- ✅ **As a new user**, I can register with my name, email, password, and role (Student/Teacher) to create an account
- ✅ **As a user**, I can log in using my email and password to access the system
- ✅ **As a system**, I store user data securely in a database (with password hashing)

### ✅ User Story 2 – Course Management

**Teacher Features:**
- ✅ **As a teacher**, I can create a course by providing a title, description, and duration
- ✅ **As a teacher**, I can view all my created courses
- ✅ **As a teacher**, I can delete my courses
- ✅ **As a teacher**, I can see how many students enrolled in each course

**Student Features:**
- ✅ **As a student**, I can view a list of available courses on the dashboard
- ✅ **As a student**, I can enroll in courses
- ✅ **As a student**, I can view my enrolled courses
- ✅ **As a student**, I cannot enroll in the same course twice

---

## 📁 Project Structure

```
Desktop/
├── backend/                    # Backend API (Node.js + Express + MongoDB)
│   ├── server.js              # Main server file with all routes
│   ├── package.json           # Dependencies configuration
│   ├── .env                   # Environment variables
│   ├── .gitignore            # Git ignore file
│   └── README.md             # Backend documentation
│
├── Project.html               # Login/Register page (Backend version)
├── dashboard.html             # Dashboard (Backend version)
│
├── Project-Standalone.html    # Login/Register (Standalone - No backend)
├── dashboard-standalone.html  # Dashboard (Standalone - No backend)
│
├── SETUP_GUIDE.md            # Installation instructions
└── PROJECT_DOCUMENTATION.md   # This file
```

---

## 🚀 Two Versions Available

### 1. **Full-Stack Version (Backend + Frontend)**
- **Files:** `Project.html` + `dashboard.html` + `backend/`
- **Requirements:** Node.js, MongoDB
- **Features:** Database storage, password hashing, production-ready
- **Use for:** Real applications, multi-device access

### 2. **Standalone Version (Frontend Only)**
- **Files:** `Project-Standalone.html` + `dashboard-standalone.html`
- **Requirements:** Just a web browser
- **Features:** localStorage, instant testing, no installation
- **Use for:** Testing, demos, learning

---

## 🎨 Features

### Authentication System
- User registration with role selection
- Secure login with password verification
- Password hashing (bcrypt) in backend version
- Session management
- Auto-redirect to dashboard after login
- Logout functionality

### Teacher Dashboard
- **Create Course Tab:**
  - Form to create new courses
  - Fields: Title, Description, Duration
  - Real-time validation
  
- **My Courses Tab:**
  - View all created courses
  - See enrollment count for each course
  - Delete courses

### Student Dashboard
- **Available Courses Tab:**
  - Browse all courses
  - See course details (title, description, duration, teacher)
  - Enroll in courses with one click
  - Visual indicator for already enrolled courses
  
- **My Enrolled Courses Tab:**
  - View all enrolled courses
  - Track learning progress

### Role-Based Access Control
- Teachers can only create/delete their own courses
- Students can only enroll in courses
- Different dashboard views based on role
- Automatic access validation

---

## 🔧 Backend API Endpoints

### User Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/register` | Register new user | `{name, email, password, role}` |
| POST | `/api/login` | User login | `{email, password}` |
| GET | `/api/users` | Get all users | - |
| DELETE | `/api/users/:id` | Delete user | - |

### Course Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/courses` | Create course (Teacher) | `{title, description, duration, teacherId, teacherName}` |
| GET | `/api/courses` | Get all courses | - |
| GET | `/api/courses/:id` | Get single course | - |
| GET | `/api/courses/teacher/:teacherId` | Get teacher's courses | - |
| PUT | `/api/courses/:id` | Update course (Teacher) | `{title, description, duration, teacherId}` |
| DELETE | `/api/courses/:id` | Delete course (Teacher) | `{teacherId}` |
| POST | `/api/courses/:id/enroll` | Enroll student | `{studentId, studentName}` |
| GET | `/api/courses/student/:studentId/enrolled` | Get enrolled courses | - |

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  role: String (enum: 'Student', 'Teacher'),
  createdAt: Date
}
```

### Course Schema
```javascript
{
  title: String,
  description: String,
  duration: String,
  teacherId: ObjectId (ref: User),
  teacherName: String,
  enrolledStudents: [{
    studentId: ObjectId (ref: User),
    studentName: String,
    enrolledAt: Date
  }],
  createdAt: Date
}
```

---

## 🎯 How to Use

### Option 1: Quick Start (Standalone Version)

1. **Open** `Project-Standalone.html` in your browser
2. **Register** as a Teacher or Student
3. **Login** with your credentials
4. **Use the dashboard:**
   - **Teachers:** Create courses in the "Create Course" tab
   - **Students:** Browse and enroll in courses

**That's it!** No installation needed.

---

### Option 2: Full Backend Version

#### Prerequisites
1. **Node.js** (v14+) - Download from https://nodejs.org/
2. **MongoDB** - Download from https://www.mongodb.com/try/download/community

#### Installation Steps

**1. Install Node.js and MongoDB**
   - Follow instructions in `SETUP_GUIDE.md`
   - Restart your computer after installation

**2. Install Backend Dependencies**
```powershell
cd backend
npm install
```

**3. Start MongoDB Service**
```powershell
# Windows
net start MongoDB

# Or check if running
Get-Service MongoDB
```

**4. Start Backend Server**
```powershell
# In backend folder
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:3000
```

**5. Open Frontend**
   - Open `Project.html` in your browser
   - Register and login
   - You'll be redirected to `dashboard.html`

---

## 🧪 Testing the Application

### Test Scenario 1: Teacher Workflow
1. Register as a Teacher
2. Login
3. Create a course (e.g., "Web Development 101")
4. View it in "My Courses" tab
5. Note the enrollment count (should be 0)

### Test Scenario 2: Student Workflow
1. Register as a Student
2. Login
3. Browse available courses
4. Enroll in a course
5. Check "My Enrolled Courses" tab
6. Try to enroll again (should show "Already enrolled")

### Test Scenario 3: Multi-User
1. Create a Teacher account and 2-3 courses
2. Create multiple Student accounts
3. Enroll students in different courses
4. Login as Teacher again
5. Check enrollment counts updated

---

## 🔐 Security Features

### Backend Version:
- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Passwords never stored in plain text
- ✅ Email uniqueness validation
- ✅ Input validation on all endpoints
- ✅ Role-based authorization
- ✅ CORS protection
- ✅ MongoDB injection protection

### Standalone Version:
- ⚠️ Passwords stored in plain text (localStorage)
- ⚠️ Only suitable for testing/demos
- ⚠️ Not recommended for production

---

## 📊 Technology Stack

### Frontend:
- HTML5
- CSS3 (Custom styling, Gradients, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests
- SessionStorage for user sessions
- LocalStorage (standalone version)

### Backend:
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** bcryptjs
- **Middleware:** CORS, body-parser

---

## 🎨 Design Features

- Modern gradient backgrounds
- Responsive card-based layouts
- Role-based color coding
- Smooth transitions and hover effects
- Empty state messages
- Loading indicators
- Success/Error message notifications
- Clean and intuitive UI

---

## 🐛 Troubleshooting

### "Error connecting to server"
**Solution:** Make sure backend server is running
```powershell
cd backend
npm start
```

### "MongoDB Connection Error"
**Solution:** Start MongoDB service
```powershell
net start MongoDB
```

### "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/ and restart computer

### "Port 3000 already in use"
**Solution:** Change port in `backend/.env` and update `API_URL` in HTML files

### Cannot enroll in course
**Solution:** Make sure you're logged in as a Student, not Teacher

### Standalone version data lost
**Solution:** This is normal - localStorage is cleared when you clear browser data

---

## 🚀 Future Enhancements

Potential features to add:

### Authentication
- [ ] JWT token-based authentication
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Remember me option
- [ ] OAuth integration (Google, GitHub)

### Course Management
- [ ] Course categories/tags
- [ ] Course images/thumbnails
- [ ] Course ratings and reviews
- [ ] Course progress tracking
- [ ] Course completion certificates
- [ ] Course materials upload
- [ ] Video content integration

### User Features
- [ ] User profiles
- [ ] Profile picture upload
- [ ] Edit account information
- [ ] Dashboard analytics
- [ ] Notifications system
- [ ] Search and filter courses
- [ ] Course recommendations

### Admin Features
- [ ] Admin dashboard
- [ ] User management
- [ ] Course approval system
- [ ] Analytics and reports
- [ ] Bulk operations

### Technical Improvements
- [ ] RESTful API pagination
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] API documentation (Swagger)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Cloud deployment

---

## 📝 File Descriptions

| File | Purpose | Type |
|------|---------|------|
| `Project.html` | Login/Register page | Frontend (Backend version) |
| `dashboard.html` | Main dashboard | Frontend (Backend version) |
| `Project-Standalone.html` | Login/Register page | Frontend (Standalone) |
| `dashboard-standalone.html` | Main dashboard | Frontend (Standalone) |
| `backend/server.js` | API server | Backend |
| `backend/package.json` | Dependencies | Configuration |
| `backend/.env` | Environment variables | Configuration |
| `SETUP_GUIDE.md` | Installation guide | Documentation |
| `PROJECT_DOCUMENTATION.md` | Complete documentation | Documentation |

---

## 💡 Tips

1. **Development:** Use standalone version for quick UI testing
2. **Production:** Always use backend version with proper security
3. **Testing:** Create separate teacher and student accounts
4. **Data:** Backend data persists in MongoDB, standalone in localStorage
5. **Browser:** Works best in Chrome, Firefox, Edge (modern browsers)

---

## 📞 Support

If you encounter issues:

1. Check `SETUP_GUIDE.md` for installation help
2. Verify Node.js installation: `node --version`
3. Verify MongoDB is running: `Get-Service MongoDB`
4. Check browser console (F12) for frontend errors
5. Check terminal for backend errors
6. Ensure ports are not blocked by firewall

---

## ✅ Checklist for First Run

### Standalone Version:
- [ ] Open `Project-Standalone.html`
- [ ] Register an account
- [ ] Login
- [ ] Test dashboard features

### Backend Version:
- [ ] Install Node.js
- [ ] Install MongoDB
- [ ] Restart computer
- [ ] Run `npm install` in backend folder
- [ ] Start MongoDB service
- [ ] Run `npm start` in backend folder
- [ ] Open `Project.html`
- [ ] Register and test

---

## 🎉 Congratulations!

You now have a fully functional Course Management System with:
- ✅ User authentication
- ✅ Role-based access control
- ✅ Course creation (Teachers)
- ✅ Course enrollment (Students)
- ✅ Database integration
- ✅ Modern UI/UX
- ✅ Two deployment options

**Enjoy your Course Management System!** 🚀
