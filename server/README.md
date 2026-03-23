# API Documentation

This API operates using `HttpOnly` cookies. Secure tokens (`accessToken` and `refreshToken`) are attached automatically to Set-Cookie headers on login. You do not need to manually manage `Authorization: Bearer` headers in your HTTP client. Make sure to use `withCredentials: true` in your requests.

## Authentication

### Endpoint

`POST /api/auth/login`

### Description

Authenticates a user, storing short-lived Access Tokens and 7-day Refresh Tokens as HttpOnly browser cookies.

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
  - **Headers:** `Set-Cookie: accessToken=...; HttpOnly`, `Set-Cookie: refreshToken=...; HttpOnly`
  - **Body:**
    ```json
    {
      "success": true,
      "user": {
        "id": "<user_id>",
        "username": "johndoe",
        "role": "student",
        "profile": { /* profile object */ }
      }
    }
    ```

#### Invalid Credentials

  - **Status Code:** `401 Unauthorized`
  - **Body:**
    ```json
    { "message": "Invalid credentials" }
    ```

#### Server Error

  - **Status Code:** `500 Internal Server Error`
  - **Body:**
    ```json
    { "message": "Server error" }
    ```

-----

### Endpoint

`POST /api/auth/refresh`

### Description

Validates the `refreshToken` HttpOnly cookie and securely issues a fresh `accessToken`.

### Responses

#### Success

  - **Status Code:** `200 OK`
  - **Headers:** `Set-Cookie: accessToken=...; HttpOnly`, `Set-Cookie: refreshToken=...; HttpOnly`
  - **Body:**
    ```json
    { "success": true, "message": "Tokens refreshed" }
    ```

#### Unauthorized

  - **Status Code:** `401 Unauthorized`
  - **Body:**
    ```json
    { "message": "Invalid refresh token" }
    ```

-----

### Endpoint

`POST /api/auth/logout`

### Description

Clears both the `accessToken` and `refreshToken` HttpOnly cookies terminating the session.

### Responses

#### Success

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    { "success": true, "message": "Logged out successfully" }
    ```

-----

### Endpoint

`GET /api/auth/me`

### Description

Returns the currently authenticated user's details utilizing validated edge-cookies.

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

All admin endpoints require an active `accessToken` HttpOnly cookie assigned to an Admin role.

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

Returns a paginated list of all students.

### Query Parameters

  - `page` (integer, optional, default: 1): The page chunk to retrieve.
  - `limit` (integer, optional, default: 10): Items per page.

### Responses

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "data": [ /* array of student objects */ ],
      "total": 100,
      "page": 1,
      "totalPages": 10
    }
    ```

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

Returns a paginated list of all teachers.

### Query Parameters

  - `page` (integer, optional, default: 1): The page chunk to retrieve.
  - `limit` (integer, optional, default: 10): Items per page.

### Responses

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "data": [ /* array of teacher objects */ ],
      "total": 50,
      "page": 1,
      "totalPages": 5
    }
    ```

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

Returns a paginated list of all classes.

### Query Parameters

  - `page` (integer, optional, default: 1): The page chunk to retrieve.
  - `limit` (integer, optional, default: 10): Items per page.

### Responses

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "data": [ /* array of class objects */ ],
      "total": 30,
      "page": 1,
      "totalPages": 3
    }
    ```

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

Returns a paginated list of all subjects.

### Query Parameters

  - `page` (integer, optional, default: 1): The page chunk to retrieve.
  - `limit` (integer, optional, default: 10): Items per page.

### Responses

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "data": [ /* array of subject objects */ ],
      "total": 20,
      "page": 1,
      "totalPages": 2
    }
    ```

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

### Endpoint

`POST /api/admin/timetable`

### Description

Upserts a specific daily timetable mapping for a given class.

### Request Body

```json
{
  "classId": "<class_id>",
  "dayOfWeek": "Monday",
  "periods": [
    {
      "subjectId": "<subject_id>",
      "teacherId": "<teacher_id>",
      "startTime": "08:00 AM",
      "endTime": "09:00 AM"
    }
  ]
}
```

### Responses

  - **Status Code:** `200 OK`
  - **Body:** `{ "message": "Timetable saved successfully", "timetable": { ...timetableObject } }`

-----

### Endpoint

`GET /api/admin/timetable/:classId`

### Description

Fetches the complete weekly timetable specifically bounded by the queried class ID.

### Path Parameters

  - `classId` (string, required): The ID of the queried class.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** Array of daily configuration objects nested with periods.

-----

## Student

All student endpoints require an active `accessToken` HttpOnly cookie assigned to the Student role. They naturally restrict outputs implicitly bounding data tightly to the token's identity.

### Endpoint

`GET /api/student/profile`

### Description

Returns the authenticated student's profile natively validating the Edge JWT.

---

### Endpoint

`GET /api/student/attendance`

### Description

Returns the authenticated student's chronological arrays of isolated attendance metrics.

---

### Endpoint

`GET /api/student/marks`

### Description

Fetches the student's un-aggregated layout simply delivering test results bound linearly.

---

### Endpoint

`GET /api/student/attendance/summary`

### Description

Delivers generalized summation tracking of absences bounds (e.g. Total Present, Total Absent).

---

### Endpoint

`GET /api/student/attendance/calendar`

### Description

**(NEW)** Re-maps database arrays distinctly isolating into formatted outputs parsing cleanly into D3 / React Calendar Layout widgets.

### Responses

  - **Status Code:** `200 OK`
  - **Body:** Array of structures formatting `{ "date": "2025-09-12", "status": "Present" }`.

---

### Endpoint

`GET /api/student/report`

### Description

**(NEW)** Executes extensive aggregation arrays mapping Subject data with relational `Marks`. Integrates algorithms converting raw arrays automatically into string grades (`A+`...`F`) bridging standard overall statistics.

### Responses

  - **Status Code:** `200 OK`
  - **Body:**
    ```json
    {
      "studentDetails": { ... },
      "subjects": [ { "subject": "Math", "totalMax": 100, "totalObtained": 95, "percentage": "95.00", "grade": "A+" } ],
      "summary": { "totalScore": 95, "totalMaxMarks": 100, "percentage": "95.00", "grade": "A+" }
    }
    ```

---

### Endpoint

`GET /api/student/timetable`

### Description

**(NEW)** Implicitly deduces bounds through identifying profile tokens finding the weekly Class period configuration array completely removing user-input dependencies entirely.

---

## Teacher

### Endpoint

`GET /api/teacher/classes`

### Description

Returns the classes assigned specifically to the authenticated teacher.

---

### Endpoint

`GET /api/teacher/classes/:classId/students`

### Description

Delivers the distinct enrolled cluster spanning the parsed `classId`.

---

### Endpoint

`POST /api/teacher/attendance`

### Description

Submits standard presence bounds into the primary schema structures.

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

Retrieves explicitly inputted chronological records bounding matching inputs arrays previously inserted.

---

### Endpoint

`PUT /api/teacher/marks`

### Description

Enters or updates quantitative scores inside isolated relational document schemas matching specific students.

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

Extracts gradebooks configured across defined matrix hierarchies scaling effectively.

---

### Endpoint

`GET /api/teacher/timetable`

### Description

**(NEW)** Filters full timetable domains universally scanning arrays finding matches assigning periods mapped dynamically to specific teacher IDs cleanly.

---

For all endpoints, error responses consistently follow the uniform format:

```json
{ "message": "Error message explanation" }
```
