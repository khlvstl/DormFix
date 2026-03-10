# DormFix Authentication - Quick Reference Guide

## 🚀 Quick Start

### Start the Application
```bash
cd c:\Users\Ross Mikhail\Desktop\dormfix
mvn spring-boot:run
```

Server runs on: `http://localhost:8080`

---

## 📝 Registration Endpoint

### Quick Test
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "resident"
  }'
```

### Required Fields
| Field | Min Length | Max Length | Format |
|-------|-----------|-----------|--------|
| firstName | 2 | 50 | Text |
| lastName | 2 | 50 | Text |
| email | N/A | N/A | user@domain.com |
| password | 6 | N/A | Text |
| role | N/A | N/A | Text (resident/staff/admin) |

### Response Status Codes
- `201` - Registration successful
- `400` - Validation error or duplicate email
- `500` - Server error

---

## 🔐 Login Endpoint

### Quick Test
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Response Status Codes
- `200` - Login successful
- `401` - Invalid credentials
- `500` - Server error

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Overview of implementation |
| `AUTHENTICATION_API.md` | Complete API reference |
| `TESTING_GUIDE.md` | Testing examples & guides |
| `QUICK_REFERENCE.md` | This file |

---

## 🔑 Key Classes

```
UserController
  └─ register()  [POST /api/users/register]
  └─ login()     [POST /api/users/login]

UserService
  └─ register(RegistrationRequest)
  └─ login(LoginRequest)

DTOs
  ├─ RegistrationRequest
  ├─ LoginRequest
  └─ AuthResponse

User Entity
  ├─ id
  ├─ firstName
  ├─ lastName
  ├─ email (unique)
  ├─ password (hashed)
  ├─ role
  ├─ createdAt
  └─ updatedAt
```

---

## ⚙️ Configuration

### Database
- Type: PostgreSQL
- Connection string in `application.properties`
- Auto-creates tables with `ddl-auto=update`

### Security
- Password encoding: BCrypt
- CSRF: Disabled for API
- CORS: Enabled for all origins

---

## 🧪 Testing Checklist

- [ ] Register new user
- [ ] Verify email unique constraint
- [ ] Login with correct credentials
- [ ] Attempt login with wrong password
- [ ] Attempt login with non-existent email
- [ ] Test validation (short password, invalid email)
- [ ] Verify password is hashed in database
- [ ] Test different user roles

---

## 🛠️ Build & Test

### Build
```bash
mvn clean compile
```

### Run Tests
```bash
mvn test
```

### Run Application
```bash
mvn spring-boot:run
```

---

## 📍 File Locations

### New Files
- `src/main/java/com/vestil/dormfix/dto/RegistrationRequest.java`
- `src/main/java/com/vestil/dormfix/dto/LoginRequest.java`
- `src/main/java/com/vestil/dormfix/dto/AuthResponse.java`

### Modified Files
- `src/main/java/com/vestil/dormfix/service/UserService.java`
- `src/main/java/com/vestil/dormfix/controller/UserController.java`
- `src/main/java/com/vestil/dormfix/config/SecurityConfig.java`
- `pom.xml`

---

## 🔍 Database Verification

### Check User Table
```sql
SELECT * FROM users;
```

### Verify Password Hashing
```sql
-- Password should start with $2a$ or $2b$ (BCrypt hash)
SELECT id, email, password FROM users WHERE id = 1;
```

---

## 🚨 Common Issues

### Issue: "Email already registered"
**Solution**: Use a different email address

### Issue: Login fails with correct password
**Solution**: Check for spaces in password, verify password was saved hashed

### Issue: 400 Bad Request on registration
**Solution**: Check all required fields. See validation requirements above.

### Issue: Database connection error
**Solution**: Verify PostgreSQL is running and credentials in application.properties are correct

### Issue: CORS errors from frontend
**Solution**: CORS is already enabled. Check browser console for specific error details.

---

## 📋 Example User Data

### Admin User
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@dormfix.com",
  "password": "AdminPassword123",
  "role": "admin"
}
```

### Staff User
```json
{
  "firstName": "Staff",
  "lastName": "Member",
  "email": "staff@dormfix.com",
  "password": "StaffPassword123",
  "role": "staff"
}
```

### Resident User
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@dormfix.com",
  "password": "ResidentPassword123",
  "role": "resident"
}
```

---

## 🔗 Related Endpoints (Existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users` | Get all users |
| GET | `/api/users/email/{email}` | Get user by email |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

---

## 💡 Pro Tips

1. **Test password hashing**: After registering, check the database. Password should be hashed, not plain text.

2. **Use consistent test data**: Save example emails/passwords for testing.

3. **Security**: Generic error messages on login prevent account enumeration.

4. **Frontend integration**: Store the returned user ID/email after successful login.

5. **Password requirements**: Enforce 6+ characters. Consider stronger requirements (uppercase, numbers, special chars).

6. **Next step**: Implement JWT tokens for session management.

---

## 📞 Quick Command Reference

```bash
# Compile
mvn clean compile

# Run
mvn spring-boot:run

# Test
mvn test

# Package
mvn package

# View logs
tail -f target/spring.log
```

---

## 🎯 Success Criteria

✅ Project compiles without errors
✅ Application starts on port 8080
✅ POST /api/users/register accepts requests
✅ POST /api/users/login accepts requests
✅ Passwords are hashed in database
✅ Duplicate emails are rejected
✅ Invalid credentials return 401
✅ Valid credentials return 200 with user data

---

**Last Updated**: March 10, 2026
**Version**: 1.0
**Status**: Production Ready
