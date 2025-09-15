# API Documentation

## Authentication

### Endpoint

`POST /api/auth/login`

### Description

Authenticates a user and returns a JWT token and user details.

### Request Body

```json
{
  "username": "johndoe",
  "password": "yourpassword"
}
```

#### Field Requirements

  - `username` (string, required)
  - `password` (string, required)

### Responses

#### Success

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "success": true,
      "token": "<jwt_token>",
      "user": {
        "id": "<user_id>",
        "username": "johndoe",
        "role": "student",
        "profile": { /* profile object */ }
      }
    }
    ```

#### Invalid Credentials

  - **Status Code:** `400 Bad Request`
  - **Body:**
    ```json
    { "message": "Invalid credentials" }
    ```

#### Account Deactivated

  - **Status Code:** `400 Bad Request`
  - **Body:**
    ```json
    { "message": "Account is deactivated" }
    ```

#### Server Error

  - **Status Code:** `500 Internal Server Error`
  - **Body:**
    ```json
    { "message": "Server error" }
    ```

-----

### Endpoint

`GET /api/auth/me`

### Description

Returns the currently authenticated user's details.

### Headers

  - `Authorization: Bearer <jwt_token>`

### Responses

#### Success

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "user": {
        "id": "<user_id>",
        "username": "johndoe",
        "role": "student",
        "profile": { /* profile object */ }
      }
    }
    ```

#### Unauthorized

  - **Status Code:** `401 Unauthorized`
  - **Body:**
    ```json
    { "message": "Token is not valid" }
    ```

-----

## Admin

All admin endpoints require an admin user's JWT token in the `Authorization: Bearer <token>` header.

-----

### Endpoint

`GET /api/admin/stats`

### Description

Returns dashboard statistics for students, teachers, classes, subjects, and today's overall attendance percentage.

### Responses

#### Success

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "totalStudents": 100,
      "totalTeachers": 10,
      "totalClasses": 5,
      "totalSubjects": 8,
      "attendancePercentage": 92.5
    }
    ```

-----

### Endpoint

`POST /api/admin/register`

### Description

Registers a new user (student or teacher).

### Request Body

```json
{
  "username": "newstudent01",
  "password": "password123",
  "role": "student",
  "profileData": {
    "name": "Jane Doe",
    "rollNumber": "A102",
    "email": "jane.doe@example.com",
    "phone": "1234567890",
    "class": "<class_id>"
  }
}
```

### Responses

  - **Status Code:** `201 Created`
  - **Body:** `{ "message": "User created successfully", "user": "<user_id>" }`

-----

### Endpoint

`GET /api/admin/students`

### Description

Returns a list of all students.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** Array of student objects.

-----

### Endpoint

`PUT /api/admin/students/:studentId`

### Description

Updates a student's profile information.

### Path Parameters

  - `studentId` (string, required): The ID of the student to update.

### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "0987654321"
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Student updated successfully", "student": { ...updatedStudentObject } }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Student not found" }`

-----

### Endpoint

`DELETE /api/admin/students/:studentId`

### Description

Deletes a student and their associated login account.

### Path Parameters

  - `studentId` (string, required): The ID of the student to delete.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Student and associated user account deleted successfully" }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Student not found" }`

-----

### Endpoint

`GET /api/admin/teachers`

### Description

Returns a list of all teachers.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** Array of teacher objects.

-----

### Endpoint

`PUT /api/admin/teachers/:teacherId`

### Description

Updates a teacher's profile information.

### Path Parameters

  - `teacherId` (string, required): The ID of the teacher to update.

### Request Body

```json
{
  "name": "John Davis",
  "email": "john.davis@example.com"
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Teacher updated successfully", "teacher": { ...updatedTeacherObject } }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Teacher not found" }`

-----

### Endpoint

`DELETE /api/admin/teachers/:teacherId`

### Description

Deletes a teacher and their associated login account.

### Path Parameters

  - `teacherId` (string, required): The ID of the teacher to delete.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Teacher and associated user account deleted successfully" }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Teacher not found" }`

-----

### Endpoint

`GET /api/admin/classes`

### Description

Returns a list of all classes.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** Array of class objects.

-----

### Endpoint

`POST /api/admin/classes`

### Description

Creates a new class.

### Request Body

```json
{
  "name": "Grade 10",
  "section": "A",
  "academicYear": "2025-2026"
}
```

### Responses

  - **Status Code:** `201 Created`
  - **Body:** The newly created class object.

-----

### Endpoint

`PUT /api/admin/classes/:classId`

### Description

Updates a class's information.

### Path Parameters

  - `classId` (string, required): The ID of the class to update.

### Request Body

```json
{
  "name": "Grade 10",
  "section": "B",
  "teacher": "<new_teacher_id>"
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Class updated successfully", "class": { ...updatedClassObject } }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Class not found" }`

-----

### Endpoint

`DELETE /api/admin/classes/:classId`

### Description

Deletes a class.

### Path Parameters

  - `classId` (string, required): The ID of the class to delete.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Class deleted successfully and students unassigned" }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Class not found" }`

-----

### Endpoint

`GET /api/admin/subjects`

### Description

Returns a list of all subjects.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** Array of subject objects.

-----

### Endpoint

`POST /api/admin/subjects`

### Description

Creates a new subject.

### Request Body

```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "description": "Core mathematics concepts."
}
```

### Responses

  - **Status Code:** `201 Created`
  - **Body:** The newly created subject object.

-----

### Endpoint

`PUT /api/admin/subjects/:subjectId`

### Description

Updates a subject's information.

### Path Parameters

  - `subjectId` (string, required): The ID of the subject to update.

### Request Body

```json
{
  "name": "Advanced Mathematics",
  "code": "MATH201"
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Subject updated successfully", "subject": { ...updatedSubjectObject } }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Subject not found" }`

-----

### Endpoint

`DELETE /api/admin/subjects/:subjectId`

### Description

Deletes a subject.

### Path Parameters

  - `subjectId` (string, required): The ID of the subject to delete.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Subject deleted successfully" }`
  - **Status Code:** `404 Not Found`
  - **Body:** `{ "message": "Subject not found" }`

-----

### Endpoint

`PUT /api/admin/assign-teacher`

### Description

Assigns a teacher to a class.

### Request Body

```json
{
  "teacherId": "<teacher_id>",
  "classId": "<class_id>"
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Teacher assigned successfully" }`

-----

### Endpoint

`PUT /api/admin/assign-subject-to-class`

### Description

Assigns a subject to a class.

### Request Body

```json
{
  "subjectId": "<subject_id>",
  "classId": "<class_id>"
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Subject assigned to class successfully" }`

-----


## Student

### Endpoint

`GET /api/student/profile`

### Description

Returns the authenticated student's profile.

---

### Endpoint

`GET /api/student/attendance`

### Description

Returns the authenticated student's attendance records.

---

### Endpoint

`GET /api/student/marks`

### Description

Returns the authenticated student's marks, grouped by subject.

---

### Endpoint

`GET /api/student/attendance/summary`

### Description

Returns a summary of the authenticated student's attendance by subject.

---

## Teacher

### Endpoint

`GET /api/teacher/classes`

### Description

Returns the classes assigned to the authenticated teacher.

---

### Endpoint

`GET /api/teacher/classes/:classId/students`

### Description

Returns the students in a specific class.

---

### Endpoint

`POST /api/teacher/attendance`

### Description

Submits attendance for a class and subject.

### Request Body

```json
{
  "classId": "<class_id>",
  "date": "2025-09-12",
  "attendanceData": [
    { "studentId": "<student_id>", "status": "Present" }
  ],
  "subjectId": "<subject_id>"
}
```

---

### Endpoint

`GET /api/teacher/attendance/:classId/:date`

### Description

Returns attendance for a class on a specific date.

---

### Endpoint

`PUT /api/teacher/marks`

### Description

Enters or updates marks for a student in a subject and exam type.

### Request Body

```json
{
  "studentId": "<student_id>",
  "subjectId": "<subject_id>",
  "examType": "Mid-Term",
  "score": 85,
  "totalMarks": 100
}
```

---

### Endpoint

`GET /api/teacher/marks/:classId/:subjectId`

### Description

Returns marks for all students in a class for a specific subject.

---

For all endpoints, authentication is required via the `Authorization: Bearer <token>` header unless otherwise specified. Error responses generally follow the format:

```json
{ "message": "Error message" }
```

