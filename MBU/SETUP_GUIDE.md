# Backend Setup Instructions

## ✅ Complete Backend Created Successfully!

Your backend has been created with the following structure:

```
backend/
├── server.js        # Main Express server with MongoDB
├── package.json     # Project dependencies
├── .env            # Environment variables
├── .gitignore      # Git ignore file
└── README.md       # API documentation
```

---

## 🚀 Quick Start Guide

### Step 1: Install Node.js

**You need to install Node.js first:**

1. Download Node.js from: https://nodejs.org/
2. Choose the **LTS version** (Long Term Support)
3. Run the installer and follow the setup wizard
4. Restart your computer after installation

**Verify installation:**
Open a new PowerShell window and run:
```powershell
node --version
npm --version
```

### Step 2: Install MongoDB

**Option A: MongoDB Community Server (Recommended)**
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. During installation, check "Install MongoDB as a Service"
4. After installation, MongoDB will start automatically

**Option B: MongoDB Atlas (Cloud - Free)**
If you prefer a cloud database:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update the `.env` file with your connection string

**Verify MongoDB is running:**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB
```

### Step 3: Install Backend Dependencies

Open PowerShell in the backend folder and run:

```powershell
cd C:\Users\Harish\OneDrive\Desktop\backend
npm install
```

This will install:
- express (Web framework)
- mongoose (MongoDB ODM)
- bcryptjs (Password hashing)
- cors (Cross-origin resource sharing)
- body-parser (Parse request bodies)
- nodemon (Auto-restart server - dev only)

### Step 4: Start the Backend Server

**Development mode (with auto-reload):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:3000
```

### Step 5: Test Your Backend

**Option 1: Using Browser**
Open: http://localhost:3000

**Option 2: Using PowerShell**
```powershell
# Test registration
Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name":"John Doe","email":"john@example.com","password":"password123","role":"Student"}'

# Test login
Invoke-RestMethod -Uri "http://localhost:3000/api/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"john@example.com","password":"password123"}'
```

### Step 6: Open Your Frontend

Open `Project.html` in your browser. Make sure the backend is running first!

---

## 📡 API Endpoints

### 1. Health Check
```
GET http://localhost:3000/
```

### 2. Register User
```
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Student"
}
```

### 3. Login User
```
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 4. Get All Users
```
GET http://localhost:3000/api/users
```

### 5. Delete User
```
DELETE http://localhost:3000/api/users/:id
```

---

## 🔧 Troubleshooting

### Issue: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "MongoDB Connection Error"
**Solutions:**
1. Make sure MongoDB service is running:
   ```powershell
   net start MongoDB
   ```
2. Or install MongoDB from https://www.mongodb.com/try/download/community

### Issue: "Port 3000 already in use"
**Solution:** Change port in `.env` file:
```
PORT=3001
```
Also update frontend API_URL in Project.html to match

### Issue: "CORS Error"
**Solution:** The backend already has CORS enabled. Make sure backend is running before opening frontend.

---

## 🎯 Features Implemented

✅ User Registration with validation
✅ User Login with authentication
✅ Password hashing (bcrypt - secure)
✅ MongoDB database integration
✅ Unique email constraint
✅ Role-based users (Student/Teacher)
✅ Error handling
✅ CORS enabled
✅ RESTful API design

---

## 📝 What Changed in Frontend?

The `Project.html` has been updated to:
- Connect to backend API instead of localStorage
- Make async HTTP requests (fetch API)
- Handle server responses
- Show connection errors if backend is down
- Store logged-in user in sessionStorage

---

## 🔐 Security Features

- Passwords are hashed using bcryptjs (10 salt rounds)
- Passwords are NEVER stored in plain text
- Email uniqueness enforced
- Input validation on server side
- CORS protection

---

## 🎉 Next Steps

1. **Install Node.js and MongoDB** (see Step 1 & 2 above)
2. **Run `npm install`** in the backend folder
3. **Start the server** with `npm start`
4. **Open Project.html** in your browser
5. **Register and login** to test!

---

## 📚 Optional Enhancements

Want to add more features? Consider:

- JWT authentication tokens
- Session management
- Email verification
- Password reset
- User profile management
- Admin dashboard
- Rate limiting
- Input sanitization
- API documentation (Swagger)
- Unit tests

---

## 💡 Tips

- Keep the backend server running while using the frontend
- Check the browser console (F12) for any errors
- Check the server terminal for backend logs
- Use MongoDB Compass to view your database visually

---

## 🆘 Need Help?

If you encounter any issues:
1. Make sure Node.js is installed: `node --version`
2. Make sure MongoDB is running: `Get-Service MongoDB`
3. Check server logs in the terminal
4. Check browser console for frontend errors

---

**Congratulations! Your backend is ready to go! 🎊**
