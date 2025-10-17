# 🧪 Testing Script - Verify All Features

## Quick Verification Guide

Use this script to verify all 5 user stories are working correctly.

---

## ⚡ 10-Minute Complete Test

### Setup (1 minute)
```
□ Open Project.html (or Project-Standalone.html)
□ Have browser console open (F12) to check for errors
```

---

### Test 1: User Story 1 - Registration & Login (2 minutes)

**Register Teacher:**
```
□ Click on registration form
□ Name: Test Teacher
□ Email: teacher@test.com
□ Password: test123
□ Role: Teacher
□ Click "Register"
□ Verify: "Registration successful" message appears
```

**Login Teacher:**
```
□ Click "Already have an account? Login"
□ Email: teacher@test.com
□ Password: test123
□ Click "Login"
□ Verify: Redirected to dashboard
□ Verify: Shows "Test Teacher (Teacher)" in header
□ Verify: 5 tabs visible: My Courses, Create Course, Assignments, Submissions, Analytics
```

**✅ User Story 1 PASSED if all checkboxes are ticked**

---

### Test 2: User Story 2 - Course Management (2 minutes)

**Create First Course:**
```
□ Click "Create Course" tab
□ Title: Web Development
□ Description: Learn HTML, CSS, JavaScript
□ Duration: 8 weeks
□ Click "Create Course"
□ Verify: "Course created successfully" message
□ Verify: Automatically switches to "My Courses" tab
□ Verify: Course card appears with title "Web Development"
□ Verify: Shows "0 students" enrolled
```

**Create Second Course:**
```
□ Click "Create Course" tab
□ Title: Python Programming
□ Description: Learn Python basics
□ Duration: 6 weeks
□ Click "Create Course"
□ Verify: Course appears in "My Courses"
```

**✅ User Story 2 PASSED if both courses created successfully**

---

### Test 3: User Story 3 - Silver Level (Course Enrollment) (2 minutes)

**Register Student:**
```
□ Click "Logout"
□ Register new user:
   Name: Test Student
   Email: student@test.com
   Password: test123
   Role: Student
□ Login as student@test.com
□ Verify: Shows "Test Student (Student)" in header
□ Verify: 4 tabs visible: Available Courses, My Courses, My Assignments, My Grades
```

**Enroll in Courses:**
```
□ In "Available Courses" tab
□ Verify: Both courses visible (Web Development, Python Programming)
□ Click "Enroll Now" on "Web Development"
□ Verify: "Successfully enrolled" message
□ Verify: Button changes to "✓ Enrolled" badge
□ Click "Enroll Now" on "Python Programming"
□ Verify: Successfully enrolled
```

**View Enrolled Courses:**
```
□ Click "My Courses" tab
□ Verify: Both courses appear
□ Verify: Shows "✓ Enrolled" badge on each
```

**Teacher Views Students:**
```
□ Logout
□ Login as teacher@test.com
□ Click "My Courses" tab
□ Verify: "Web Development" shows "1 students"
□ Click "View Students" button
□ Verify: Modal opens
□ Verify: Shows "Test Student" in table
□ Verify: Shows enrollment date
□ Close modal
```

**✅ User Story 3 (Silver) PASSED if enrollment tracking works**

---

### Test 4: User Story 4 - Gold Level (Assignment Submission) (2 minutes)

**Create Assignments:**
```
□ Still logged in as teacher
□ Click "Assignments" tab
□ Select Course: "Web Development"
□ Title: Build a Website
□ Description: Create a personal portfolio
□ Due Date: [Select any future date]
□ Max Points: 100
□ Click "Create Assignment"
□ Verify: Assignment appears below form
```

**Create Second Assignment:**
```
□ Select Course: "Python Programming"
□ Title: Python Calculator
□ Description: Build a calculator
□ Due Date: [Select future date]
□ Max Points: 50
□ Click "Create Assignment"
□ Verify: Both assignments visible
```

**Student Submits Assignment:**
```
□ Logout
□ Login as student@test.com
□ Click "My Assignments" tab
□ Verify: Both assignments visible
□ Click "Submit Assignment" on "Build a Website"
□ Verify: Modal opens with submission form
□ Content: "I created a responsive portfolio website using HTML5, CSS3, and JavaScript."
□ File URL: https://github.com/test/portfolio
□ Click "Submit Assignment"
□ Verify: "Assignment submitted successfully" message
□ Verify: Button changes to "✓ Submitted" badge
```

**Submit Second Assignment:**
```
□ Click "Submit Assignment" on "Python Calculator"
□ Content: "I built a calculator with basic operations."
□ Click "Submit Assignment"
□ Verify: Successfully submitted
```

**Teacher Views Submissions:**
```
□ Logout
□ Login as teacher@test.com
□ Click "Submissions" tab
□ Verify: See "Build a Website" section
□ Verify: Table shows "Test Student" submission
□ Verify: Status shows "submitted" badge
□ Verify: See "Python Calculator" section
□ Verify: Both submissions visible
```

**✅ User Story 4 (Gold) PASSED if submissions work end-to-end**

---

### Test 5: User Story 5 - Platinum Level (Grading System) (2 minutes)

**Grade First Assignment:**
```
□ Still in "Submissions" tab as teacher
□ Click "Grade" button on "Build a Website" submission
□ Verify: Modal opens showing submission content
□ Verify: Can read student's submission
□ Grade: 95
□ Feedback: "Excellent work! Great design and functionality."
□ Click "Submit Grade"
□ Verify: "Submission graded successfully" message
□ Verify: Status changes to "graded" badge
□ Verify: Grade column shows "95/100"
```

**Grade Second Assignment:**
```
□ Click "Grade" on "Python Calculator" submission
□ Grade: 45
□ Feedback: "Good job! Consider adding more operations."
□ Click "Submit Grade"
□ Verify: Successfully graded
```

**View Analytics:**
```
□ Click "Analytics" tab
□ Verify: See "Web Development" course
□ Verify: Table shows "Test Student"
□ Verify: Shows correct statistics:
   - Submissions: 1
   - Average Grade: 95%
   - Points: 95/100
□ Verify: See "Python Programming" course
□ Verify: Shows correct statistics:
   - Submissions: 1
   - Average Grade: 90%
   - Points: 45/50
```

**Student Views Grades:**
```
□ Logout
□ Login as student@test.com
□ Click "My Grades" tab
□ Verify: See "Web Development" course card
□ Verify: Shows statistics:
   - Overall: 95%
   - Total Points: 95/100
   - Total Submissions: 1
□ Verify: Table shows assignment grade
□ Verify: Can read teacher feedback
□ Verify: See "Python Programming" course
□ Verify: Overall: 90%
```

**Test Overall Grade Calculation:**
```
□ Verify Web Development: 95/100 = 95% ✓
□ Verify Python Programming: 45/50 = 90% ✓
```

**✅ User Story 5 (Platinum) PASSED if grading and analytics work**

---

## 📊 Final Verification Checklist

### All 5 User Stories:
- [ ] ✅ User Story 1: Registration & Login
- [ ] ✅ User Story 2: Course Management
- [ ] ✅ User Story 3 (Silver): Course Enrollment
- [ ] ✅ User Story 4 (Gold): Assignment Submission
- [ ] ✅ User Story 5 (Platinum): Grading System

### Critical Features:
- [ ] Password security (hashed in backend version)
- [ ] Role-based access (Teacher vs Student views)
- [ ] Duplicate prevention (enrollment, submission)
- [ ] Grade calculation accuracy
- [ ] Analytics correctness
- [ ] Feedback delivery
- [ ] Status tracking

### UI/UX:
- [ ] No console errors
- [ ] All buttons work
- [ ] Modals open/close properly
- [ ] Messages display correctly
- [ ] Redirects work
- [ ] Tabs switch correctly
- [ ] Cards display properly
- [ ] Tables formatted correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Error connecting to server"
**Cause:** Backend not running (backend version only)  
**Solution:**
```powershell
cd backend
npm start
```

### Issue: Can't see courses after creation
**Cause:** Not switching tabs  
**Solution:** Click "My Courses" tab to refresh

### Issue: Can't submit assignment
**Causes:**
1. Not enrolled in course
2. Already submitted
3. Modal didn't open

**Solution:**
1. Enroll first, then try again
2. Check for "✓ Submitted" badge
3. Refresh page and try again

### Issue: Grade not showing
**Cause:** Assignment not graded yet  
**Solution:** Teacher must grade submission first

### Issue: Wrong percentage
**Cause:** Math error or missing submissions  
**Solution:** Verify: (Points Earned / Max Points) × 100

---

## ✅ Success Criteria

**All tests PASSED if:**

1. ✅ Can register both Teacher and Student
2. ✅ Can login and see appropriate dashboard
3. ✅ Teacher can create courses
4. ✅ Student can enroll in courses
5. ✅ Teacher can see enrolled students
6. ✅ Teacher can create assignments
7. ✅ Student can submit assignments
8. ✅ Teacher can view submissions
9. ✅ Teacher can grade with feedback
10. ✅ Student can view grades
11. ✅ Grade percentages calculate correctly
12. ✅ Analytics show accurate data

---

## 🎯 Advanced Testing (Optional)

### Test Edge Cases:

**Duplicate Enrollment:**
```
□ Student tries to enroll in same course twice
□ Verify: Shows "already enrolled" error
```

**Duplicate Submission:**
```
□ Student tries to submit same assignment twice
□ Verify: Shows "already submitted" error
```

**Invalid Grade:**
```
□ Teacher tries to grade with points > maxPoints
□ Verify: Shows validation error
```

**Unauthorized Access:**
```
□ Student tries to access teacher features
□ Verify: Not available in UI
```

**Multiple Students:**
```
□ Register 2-3 more students
□ Enroll in same course
□ Submit assignments
□ Grade all submissions
□ Verify analytics shows all students
```

---

## 📝 Test Results Template

```
Test Date: _______________
Tester: _______________
Version: Backend / Standalone (circle one)

User Story 1: PASS / FAIL
User Story 2: PASS / FAIL
User Story 3 (Silver): PASS / FAIL
User Story 4 (Gold): PASS / FAIL
User Story 5 (Platinum): PASS / FAIL

Overall Status: PASS / FAIL

Issues Found:
1. _________________________
2. _________________________
3. _________________________

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎉 Completion

**If all tests passed:** 
Your Course Management System is fully functional and ready for use! 🎊

**If any tests failed:**
1. Check the error messages
2. Review the troubleshooting section
3. Verify backend is running (if using backend version)
4. Check browser console for errors
5. Retry the failed test

---

**Happy Testing! 🚀**
