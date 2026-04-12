# DormFix Backend-Mobile Integration Guide

## Overview

The DormFix system is a complete client-server architecture with:
- **Backend**: Spring Boot 4.0.3 REST API with PostgreSQL
- **Mobile**: Android application (Kotlin, Retrofit)
- **Connection**: HTTP/HTTPS REST API

## Architecture Diagram

```
┌─────────────────────┐
│  Android Device     │
│  (Mobile App)       │
│                     │
│ ┌─────────────────┐ │     HTTP/HTTPS       ┌──────────────────────┐
│ │  MainActivity   │──────────RequestBody──→│  Spring Boot Server  │
│ │ [Activities]    │←─────ResponseBody──────│  (Port 8080)         │
│ │ [Repositories]  │                         │                      │
│ │ [Models]        │                         │ ┌────────────────┐   │
│ │ [Sessions]      │                         │ │ Controllers    │   │
│ └─────────────────┘                         │ │ Services       │   │
│                                             │ │ Repositories   │   │
│ Network Layer:                              │ └────────────────┘   │
│ - Retrofit + OKHttp                         │                      │
│ - JSON Serialization (Gson)                 │ Database:            │
│ - Auth Interceptor                          │ PostgreSQL           │
│ - Error Handling                            │ (on Supabase)        │
└─────────────────────┘                       └──────────────────────┘
```

## Data Flow Examples

### Example 1: User Registration

```
┌──────────────┐
│ RegisterActivity
│ - firstName  │
│ - lastName   │
│ - email      │
│ - password   │
│ - role       │
└──────┬───────┘
       │ authRepository.register(RegistrationRequest)
       ↓
┌──────────────┐
│ AuthRepository
└──────┬───────┘
       │ apiService.register(request)
       ↓
┌──────────────────────────────────┐
│ Retrofit ApiService              │
│ POST /api/users/register         │
│                                  │
│ Request Body (JSON):             │
│ {                                │
│   "firstName": "John",           │
│   "lastName": "Doe",             │
│   "email": "john@example.com",   │
│   "password": "password123",     │
│   "role": "resident"             │
│ }                                │
└──────┬───────────────────────────┘
       │ HTTP POST with headers
       ↓
┌──────────────────────────────────┐
│ Spring Boot Backend              │
│ UserController.register()        │
│                                  │
│ → Validate input                 │
│ → Check email uniqueness         │
│ → Hash password with BCrypt      │
│ → Save user to database          │
│                                  │
│ Response Body (JSON):            │
│ {                                │
│   "id": 1,                       │
│   "firstName": "John",           │
│   "lastName": "Doe",             │
│   "email": "john@example.com",   │
│   "role": "resident",            │
│   "message": "Success",          │
│   "success": true                │
│ }                                │
└──────┬───────────────────────────┘
       │ HTTP 201 Created
       ↓
┌─────────────────────┐
│ AuthResponse object │
│ ← Parsed by Gson    │
└─────────┬───────────┘
          │ Save session
          ↓
┌──────────────────────┐
│ SessionManager       │
│ saveSession(userId,  │
│   email, name,       │
│   role)              │
│                      │
│ Stores in            │
│ SharedPreferences    │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ DashboardActivity    │
│ (Successful Login)   │
└──────────────────────┘
```

### Example 2: User Login with Authentication

```
┌──────────────┐
│ LoginActivity
│ - email      │
│ - password   │
└──────┬───────┘
       │ authRepository.login(LoginRequest)
       ↓
┌──────────┐
│ Repository
└──────┬───┘
       │ apiService.login(request)
       ↓
┌──────────────────────────────────┐
│ OKHttpClient with Interceptors   │
│                                  │
│ AuthInterceptor checks:          │
│ - Is this /login? → Skip token   │
│ - Add headers:                   │
│   "Content-Type: application/json"
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ HTTP POST to backend             │
│ POST /api/users/login            │
│                                  │
│ {                                │
│   "email": "john@example.com",   │
│   "password": "password123"      │
│ }                                │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ Backend Processing               │
│ UserController.login()           │
│                                  │
│ → Find user by email             │
│ → Compare password with          │
│   BCrypt.matches()               │
│ → Generate response              │
│                                  │
│ Response (JSON):                 │
│ {                                │
│   "id": 1,                       │
│   "email": "john@example.com",   │
│   "firstName": "John",           │
│   "lastName": "Doe",             │
│   "role": "resident",            │
│   "message": "Login successful", │
│   "success": true                │
│ }                                │
└──────┬───────────────────────────┘
       │ HTTP 200 OK
       ↓
┌──────────────────────┐
│ Gson parse response  │
│ → AuthResponse       │
└─────────┬────────────┘
          │
          ↓
┌──────────────────────┐
│ SessionManager.      │
│ saveSession()        │
│                      │
│ Stores:              │
│ - user_id: 1         │
│ - email: ...         │
│ - name: "John Doe"   │
│ - role: "resident"   │
└──────────┬───────────┘
           │
           ↓
┌────────────────────────────┐
│ Navigate to Dashboard      │
│ session now active         │
└────────────────────────────┘
```

### Example 3: Authenticated Request (Get User's Maintenance Requests)

```
┌─────────────────────────┐
│ DashboardActivity       │
│ loadMaintenanceRequests()
└────────┬────────────────┘
         │ maintenanceRepository.
         │  getUserMaintenanceRequests(userId)
         ↓
┌───────────────────────────────┐
│ MaintenanceRequestRepository   │
│ apiService.getUserMaintenance
│    Requests(userId)           │
└────────┬──────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ AuthInterceptor (with token)         │
│                                      │
│ Checks:                              │
│ - Is this /register or /login?       │
│   NO → this is authenticated         │
│                                      │
│ Adds headers:                        │
│ "Authorization: Bearer {token}"      │
│ "Content-Type: application/json"     │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ HTTP GET Request                     │
│ GET /api/maintenance-requests/       │
│     user/1                           │
│                                      │
│ Headers:                             │
│ Authorization: Bearer <token>        │
│ Content-Type: application/json       │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Spring Boot Backend                  │
│                                      │
│ SecurityConfig checks:               │
│ ✓ Token is valid                     │
│ ✓ User has permission                │
│                                      │
│ MaintenanceRequestController:        │
│ getUserMaintenanceRequests(1)         │
│                                      │
│ → Query database:                    │
│   SELECT * FROM maintenance_requests │
│   WHERE user_id = 1                  │
│                                      │
│ Response (JSON Array):               │
│ [                                    │
│   {                                  │
│     "id": 1,                         │
│     "title": "Water leak",           │
│     "description": "...",            │
│     "status": "PENDING",             │
│     "priority": "HIGH"               │
│   },                                 │
│   {                                  │
│     "id": 2,                         │
│     "title": "Light not working",    │
│     "status": "IN_PROGRESS"          │
│   }                                  │
│ ]                                    │
└────────┬─────────────────────────────┘
         │ HTTP 200 OK
         ↓
┌──────────────────────────────────────┐
│ Retrofit Response                    │
│ Gson deserializes JSON to:           │
│ List<MaintenanceRequest>             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Back to Repository                   │
│ Success callback with list           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Coroutine in Activity                │
│ result.onSuccess { requests ->       │
│   updateUI(requests)                 │
│ }                                    │
│                                      │
│ Update RecyclerView/UI with data     │
└──────────────────────────────────────┘
```

## Request-Response Format

### Request Structure
```kotlin
// Example: Register request
data class RegistrationRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val role: String = "resident"
)

// Sent as JSON:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "resident"
}
```

### Response Structure
```kotlin
// Example: Auth response
data class AuthResponse(
    val id: Long? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val role: String? = null,
    val message: String,
    val success: Boolean
)

// Response JSON:
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "resident",
  "message": "Registration successful",
  "success": true
}
```

## API Endpoints Summary

### Authentication Endpoints
| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/users/register` | ❌ No | Register new user |
| POST | `/api/users/login` | ❌ No | Login existing user |
| POST | `/api/users/google-login` | ❌ No | Google OAuth login |

### User Endpoints
| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/users/{id}` | ✅ Yes | Get user profile |
| GET | `/api/users/email/{email}` | ✅ Yes | Get user by email |
| GET | `/api/users` | ✅ Yes | Get all users |
| PUT | `/api/users/{id}` | ✅ Yes | Update user |

### Maintenance Request Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/maintenance-requests` | Get all requests |
| GET | `/api/maintenance-requests/{id}` | Get specific request |
| POST | `/api/maintenance-requests` | Create new request |
| PUT | `/api/maintenance-requests/{id}` | Update request |
| DELETE | `/api/maintenance-requests/{id}` | Delete request |
| GET | `/api/maintenance-requests/user/{userId}` | Get user's requests |

### Comment Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/comments` | Get all comments |
| POST | `/api/comments` | Create comment |
| GET | `/api/comments/request/{requestId}` | Get comments for request |
| DELETE | `/api/comments/{id}` | Delete comment |

### Notification Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/{id}` | Get specific notification |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| DELETE | `/api/notifications/{id}` | Delete notification |

## Backend API URL Configuration

### Current Configuration
```
Base URL: http://10.0.2.2:8080/api/
(This is for Android emulator on local development machine)
```

### Configuration by Environment

**For Emulator (Local Development):**
```gradle
buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8080/api/\"")
```

**For Physical Device (Same Network):**
```gradle
// Replace 192.168.1.100 with your computer's IP
buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:8080/api/\"")
```

**For Production/Remote Server:**
```gradle
buildConfigField("String", "API_BASE_URL", "\"https://api.example.com/api/\"")
```

### How to Find Your Computer's IP

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your network adapter

**macOS/Linux:**
```bash
ifconfig
```
Look for "inet" address

## Session & Token Management

### Session Flow

```
1. Registration or Login
   ↓
2. Backend creates user/validates
   ↓
3. Backend returns AuthResponse
   ↓
4. Mobile stores in SessionManager:
   - userId
   - email
   - fullName
   - role
   - authToken (when implemented)
   ↓
5. SessionManager saves to SharedPreferences
   ↓
6. AuthInterceptor retrieves token from SessionManager
   ↓
7. Adds token to every subsequent request
   ↓
8. Backend validates token
   ↓
9. Returns authorized response OR 401 Unauthorized
```

### SharedPreferences Storage

```kotlin
// Session data stored in SharedPreferences
prefs.put("user_id", 1)
prefs.put("email", "john@example.com")
prefs.put("name", "John Doe")
prefs.put("role", "resident")
prefs.put("auth_token", "token_string")
prefs.put("is_logged_in", true)
```

## Error Handling

### Backend Errors

**400 Bad Request** - Validation error
```json
{
  "message": "Email is required",
  "success": false
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "message": "Invalid credentials",
  "success": false
}
```

**409 Conflict** - Resource already exists
```json
{
  "message": "Email already registered",
  "success": false
}
```

**500 Server Error**
```json
{
  "message": "Registration failed: Database error",
  "success": false
}
```

### Mobile Error Handling

```kotlin
// Repository example
result.onFailure { exception ->
    // exception contains error details
    // Could be network error or backend error
    val errorMessage = exception.message ?: "Unknown error"
}
```

## Security Considerations

✅ **CORS Enabled** - Backend allows mobile requests
✅ **CSRF Protection** - Spring Security enabled
✅ **Password Hashing** - BCrypt with salt
✅ **Token-Based Auth** - Ready for JWT implementation
✅ **HTTPS Ready** - Can use SSL/TLS in production
✅ **Input Validation** - Both client and server side
✅ **Secure Storage** - SharedPreferences for sensitive data

## Testing the Integration

### 1. Start Backend
```bash
cd c:\Users\Ross Mikhail\Desktop\dormfix
./mvnw spring-boot:run
```

Backend will be running at: `http://localhost:8080`

### 2. Build Mobile App
```bash
cd c:\Users\Ross Mikhail\Desktop\dormfix\mobile
./gradlew build
```

### 3. Run on Emulator
- Open Android Studio
- Select emulator
- Click Run
- Or in terminal: `./gradlew run`

### 4. Test Registration
- Click "Register" button
- Fill form:
  - First Name: John
  - Last Name: Doe
  - Email: john@example.com
  - Password: password123
- Click Register
- Should navigate to Dashboard

### 5. Test Login
- Click Logout
- Click "Login"
- Enter: john@example.com / password123
- Click Login
- Should navigate to Dashboard

## Logging & Debugging

### Android Logcat

```
// View all logs
adb logcat

// View only app logs
adb logcat | grep "com.vestil.dormfix"

// View HTTP requests/responses
adb logcat | grep "OkHttp"
```

### HTTP Request Logging

The app logs all HTTP requests/responses:
```
HTTP Request:
POST /api/users/login HTTP/1.1
Content-Type: application/json

{email: "john@example.com", password: "password123"}

HTTP Response:
HTTP/1.1 200 OK
Content-Type: application/json

{id: 1, email: "john@example.com", ...}
```

### Backend Logging

```
2026-04-12 15:34:12 INFO UserController - Processing registration for john@example.com
2026-04-12 15:34:12 INFO UserService - User registered successfully: User(id=1, email=john@example.com)
2026-04-12 15:34:13 INFO UserController - User john@example.com logged in
```

## Common Issues & Solutions

### Issue: "Connection refused" on login

**Cause:** Backend not running

**Solution:**
```bash
# Start backend
cd c:\Users\Ross Mikhail\Desktop\dormfix
./mvnw spring-boot:run

# Check if running
curl http://localhost:8080/api/users
```

### Issue: "10.0.2.2 connection timeout"

**Cause:** Emulator can't reach host

**Solution:**
1. Verify backend is running
2. Check Windows Firewall allows port 8080
3. Use correct IP address for your network

### Issue: Response parsing error

**Cause:** JSON format mismatch

**Solution:**
1. Check backend response in error logs
2. Verify Models.kt fields match API response
3. Check database data types

### Issue: "Email already registered"

**Cause:** Email used in previous registration

**Solution:**
1. Use different email
2. Clear database and restart
3. Delete user from PostgreSQL

## Production Deployment Checklist

- [ ] Change API URL to production server (HTTPS)
- [ ] Disable HTTP logging (remove HttpLoggingInterceptor)
- [ ] Enable ProGuard/R8 obfuscation
- [ ] Test on Android 7.0+ devices
- [ ] Test all API endpoints
- [ ] Test error scenarios
- [ ] Test with slow network
- [ ] Test with no network (offline mode)
- [ ] Generate signed APK
- [ ] Test signed APK
- [ ] Upload to Play Store beta
- [ ] Collect feedback
- [ ] Deploy to production

---

**Last Updated:** April 12, 2026
**Version:** 1.0
**Status:** Complete Integration Ready
