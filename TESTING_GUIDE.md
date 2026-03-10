# DormFix Authentication - Testing Examples

## Quick Start Testing

Use these examples to test the registration and login endpoints.

### 1. Register a New User

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "MyPassword123",
    "role": "resident"
  }'
```

**Using Postman:**
1. Create a new POST request
2. URL: `http://localhost:8080/api/users/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "MyPassword123",
  "role": "resident"
}
```

**Expected Response (201 Created):**
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

---

### 2. Login with Registered User

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "MyPassword123"
  }'
```

**Using Postman:**
1. Create a new POST request
2. URL: `http://localhost:8080/api/users/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "MyPassword123"
}
```

**Expected Response (200 OK):**
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

---

### 3. Test Error Cases

#### A. Test Duplicate Email Registration

```bash
# First registration
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "MyPassword123",
    "role": "resident"
  }'

# Second registration with same email (should fail)
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "AnotherPassword456",
    "role": "staff"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Email already registered: john.doe@example.com",
  "success": false
}
```

#### B. Test Invalid Email Format

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "invalid-email",
    "password": "MyPassword123",
    "role": "resident"
  }'
```

**Expected Response (400 Bad Request):**
Invalid email validation error

#### C. Test Password Too Short

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "short",
    "role": "resident"
  }'
```

**Expected Response (400 Bad Request):**
Password validation error

#### D. Test Login with Wrong Password

```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Invalid email or password",
  "success": false
}
```

#### E. Test Login with Non-existent Email

```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SomePassword123"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Invalid email or password",
  "success": false
}
```

---

### 4. Test Different User Roles

Register users with different roles:

**Register Admin:**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "role": "admin"
  }'
```

**Register Staff:**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Staff",
    "lastName": "Member",
    "email": "staff@example.com",
    "password": "StaffPass123",
    "role": "staff"
  }'
```

**Register Resident:**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "JanePass123",
    "role": "resident"
  }'
```

---

## Test Plan Summary

| Test Case | Method | Endpoint | Expected Status | Notes |
|-----------|--------|----------|-----------------|-------|
| Register valid user | POST | /register | 201 | Should return user details |
| Register duplicate email | POST | /register | 400 | Should reject duplicate |
| Register invalid email | POST | /register | 400 | Validation error |
| Register short password | POST | /register | 400 | Min 6 characters |
| Login with correct credentials | POST | /login | 200 | Should return user details |
| Login with wrong password | POST | /login | 401 | Generic error message |
| Login with non-existent email | POST | /login | 401 | Generic error message |
| Register with missing field | POST | /register | 400 | Validation error |
| Login with missing field | POST | /login | 400 | Validation error |

---

## Using Postman Collection

Import this JSON into Postman for easier testing:

```json
{
  "info": {
    "name": "DormFix Authentication",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"MyPassword123\",\n  \"role\": \"resident\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/users/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "users", "register"]
        }
      }
    },
    {
      "name": "Login User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"MyPassword123\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/users/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "users", "login"]
        }
      }
    }
  ]
}
```

---

## Tips for Testing

1. **Use unique emails** for each test to avoid duplicate email errors
2. **Keep passwords >= 6 characters** to meet validation requirements
3. **Valid email format** is required (e.g., test@example.com)
4. **Case-sensitive** for password validation
5. **Password hashing** means responses never show the actual password
6. **Generic error messages** for login prevent user enumeration attacks

---

## Troubleshooting

### Issue: "Email already exists" on first registration attempt
- **Solution**: Double-check the email is unique. Check database to see if user exists.

### Issue: Login fails with correct credentials
- **Solution**: Ensure password was entered correctly (case-sensitive). Password must not have leading/trailing spaces.

### Issue: 400 Bad Request on registration
- **Solution**: Check all required fields are present and meet validation requirements:
  - firstName: 2-50 characters
  - lastName: 2-50 characters
  - email: Valid format (user@example.com)
  - password: At least 6 characters
  - role: Not empty

### Issue: CORS errors when accessing from frontend
- **Solution**: CORS is already configured to allow all origins. Check browser console for specific errors.

