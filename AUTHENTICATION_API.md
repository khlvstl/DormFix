# DormFix Authentication API Documentation

## Overview
This documentation covers the user registration and login endpoints for the DormFix system.

## Base URL
```
http://localhost:8080/api/users
```

---

## 1. User Registration

### Endpoint
```
POST /api/users/register
```

### Description
Allows new users to create an account with the required information.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "resident"
}
```

### Request Parameters
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| firstName | String | Yes | 2-50 characters |
| lastName | String | Yes | 2-50 characters |
| email | String | Yes | Valid email format, must be unique |
| password | String | Yes | At least 6 characters |
| role | String | Yes | e.g., "resident", "staff", "admin" |

### Success Response (201 Created)
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "resident",
  "message": "User registered successfully",
  "success": true
}
```

### Error Response Examples

**Duplicate Email (400 Bad Request)**
```json
{
  "message": "Email already registered: john.doe@example.com",
  "success": false
}
```

**Validation Error (400 Bad Request)**
```json
{
  "message": "First name must be between 2 and 50 characters",
  "success": false
}
```

**Server Error (500 Internal Server Error)**
```json
{
  "message": "Registration failed: [error details]",
  "success": false
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "role": "resident"
  }'
```

---

## 2. User Login

### Endpoint
```
POST /api/users/login
```

### Description
Allows registered users to log in using their email and password.

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Request Parameters
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| email | String | Yes | Valid email format |
| password | String | Yes | User's password |

### Success Response (200 OK)
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "resident",
  "message": "Login successful",
  "success": true
}
```

### Error Response Examples

**Invalid Credentials (401 Unauthorized)**
```json
{
  "message": "Invalid email or password",
  "success": false
}
```

**User Not Found (401 Unauthorized)**
```json
{
  "message": "Invalid email or password",
  "success": false
}
```

**Server Error (500 Internal Server Error)**
```json
{
  "message": "Login failed: [error details]",
  "success": false
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

---

## Security Features

### Password Security
- All passwords are **hashed using BCrypt** before being stored in the database
- Passwords are never returned in API responses
- Password comparison is done using BCrypt's secure matching algorithm

### Email Validation
- Email uniqueness is enforced at the database level
- Duplicate email registrations are rejected with a clear error message
- Email format is validated using Jakarta validation annotations

### Input Validation
- All required fields must be provided
- Field length constraints are enforced
- Invalid data is rejected before database operations

---

## Implementation Details

### Dependencies
- **Spring Security**: For password encoding (BCryptPasswordEncoder)
- **Spring Data JPA**: For database operations
- **Jakarta Validation**: For input validation

### Key Classes
- `RegistrationRequest`: DTO for registration requests
- `LoginRequest`: DTO for login requests
- `AuthResponse`: DTO for authentication responses
- `UserService`: Service layer handling business logic
- `UserController`: REST controller for handling requests

### Database
- PostgreSQL is used for data storage
- User table includes fields: id, firstName, lastName, email, password (hashed), role, createdAt, updatedAt
- Passwords are stored as hashed strings using BCrypt

---

## Testing Guide

### Test 1: Successful Registration
1. Make a POST request to `/api/users/register`
2. Include valid user data with a unique email
3. Verify response status is 201 Created
4. Check that user details are returned (password not shown)

### Test 2: Duplicate Email Registration
1. Register a user with email "test@example.com"
2. Attempt to register another user with the same email
3. Verify response status is 400 Bad Request
4. Check error message about duplicate email

### Test 3: Successful Login
1. Register a user or use an existing account
2. Make a POST request to `/api/users/login` with correct credentials
3. Verify response status is 200 OK
4. Check that user details are returned (password not shown)

### Test 4: Failed Login - Wrong Password
1. Make a POST request to `/api/users/login` with correct email but wrong password
2. Verify response status is 401 Unauthorized
3. Check generic error message (doesn't reveal if email exists)

### Test 5: Failed Login - User Not Found
1. Make a POST request to `/api/users/login` with non-existent email
2. Verify response status is 401 Unauthorized
3. Check generic error message (doesn't reveal if email exists)

---

## Next Steps

After successful registration and login, users can access other endpoints:
- Get user profile
- Update user information
- Create maintenance requests
- View notifications
- Post comments

For API documentation on other endpoints, refer to the respective controller documentation.
