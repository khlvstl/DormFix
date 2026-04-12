# DormFix Android Mobile Application

A comprehensive Android mobile app for managing dorm maintenance requests, built with Kotlin and compatible with Android Studio Panda 3.

## Project Overview

DormFix Mobile is a resident-facing Android application that allows dormitory residents to:
- Register and login securely
- Create and track maintenance requests
- View request status and updates  
- Receive notifications about request changes
- Leave comments on maintenance requests
- Manage their user profile

## Compatibility

- **Android Studio**: Version 2023.3.1+ (Panda 3)
- **Minimum SDK**: API 24 (Android 7.0)
- **Target SDK**: API 34 (Android 14)
- **Java Version**: 17
- **Language**: Kotlin

## Project Structure

```
mobile/
├── app/                              # Main application module
│   ├── build.gradle.kts             # App-level dependencies and build config
│   ├── proguard-rules.pro           # ProGuard configuration
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml  # App manifest with permissions
│   │   │   ├── java/com/vestil/dormfix/
│   │   │   │   ├── DormFixApplication.kt        # Application class
│   │   │   │   ├── data/
│   │   │   │   │   ├── api/
│   │   │   │   │   │   ├── ApiService.kt        # Retrofit API endpoints
│   │   │   │   │   │   ├── AuthInterceptor.kt   # Request interceptor for auth
│   │   │   │   │   │   └── RetrofitClient.kt    # Retrofit singleton
│   │   │   │   │   ├── model/
│   │   │   │   │   │   └── Models.kt            # Data models (User, Request, etc.)
│   │   │   │   │   └── repository/
│   │   │   │   │       └── Repositories.kt      # Repository layer for business logic
│   │   │   │   ├── ui/
│   │   │   │   │   ├── MainActivity.kt          # Home screen
│   │   │   │   │   ├── LoginActivity.kt         # Login screen
│   │   │   │   │   ├── RegisterActivity.kt      # Registration screen
│   │   │   │   │   └── DashboardActivity.kt     # Main dashboard
│   │   │   │   └── utils/
│   │   │   │       └── SessionManager.kt        # User session and preferences
│   │   │   └── res/
│   │   │       ├── layout/                      # XML layouts for activities
│   │   │       ├── values/                      # Strings, colors, dimensions, themes
│   │   │       └── xml/                         # Backup and data extraction rules
│   │   └── test/                    # Unit tests
│   └── androidTest/                 # Instrumented tests
├── build.gradle.kts                 # Top-level build config
├── settings.gradle.kts              # Project settings
├── gradle.properties                # Gradle properties
├── gradle/wrapper/                  # Gradle wrapper
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## Key Features & Implementation

### 1. Authentication
- **Register**: Create new user account with validation
- **Login**: Secure login with email/password
- **Session Management**: Automatic session persistence using SharedPreferences
- **Google Sign-In**: Integration ready for OAuth 2.0

### 2. API Integration
- **Retrofit**: HTTP client for backend API calls
- **OKHttp3**: HTTP interceptor for logging and auth headers
- **Gson**: JSON serialization/deserialization
- **Coroutines**: Asynchronous API calls

**Backend API Base URL**: `http://10.0.2.2:8080/api/` (for emulator)
- For physical devices: Change to your backend server IP

### 3. Data Models
All models match the backend API:
- `User`: User profile information
- `RegistrationRequest`: Registration payload
- `LoginRequest`: Login credentials
- `AuthResponse`: Authentication response
- `MaintenanceRequest`: Maintenance request details
- `Comment`: Comments on requests
- `Notification`: System notifications

### 4. Repository Pattern
Clean architecture with repository layer:
- `AuthRepository`: Authentication operations
- `UserRepository`: User profile operations
- `MaintenanceRequestRepository`: Request management
- `CommentRepository`: Comment operations
- `NotificationRepository`: Notification management

### 5. Session Management
- Automatic login state tracking
- Secure preferences storage
- Token-based authentication

## Setup Instructions

### Prerequisites
- Android Studio Panda 3 or higher
- JDK 17
- Gradle 8.2.0 or higher

### Installation Steps

1. **Open Project in Android Studio**
   - Launch Android Studio
   - File → Open → Select `mobile` folder
   - Wait for Gradle sync

2. **Configure Backend URL**
   - Edit `app/build.gradle.kts`
   - Update `buildConfigField("String", "API_BASE_URL", ...)` with your backend server address
   - For emulator testing: `http://10.0.2.2:8080/api/`
   - For device testing: `http://YOUR_SERVER_IP:8080/api/`

3. **Sync Gradle Dependencies**
   ```bash
   ./gradlew build
   ```

4. **Run the Application**
   - Select emulator or physical device
   - Click "Run" or press Shift+F10

## API Endpoints Reference

### Authentication
```
POST   /api/users/register      - Register new user
POST   /api/users/login         - User login
POST   /api/users/google-login  - Google OAuth login
```

### Users
```
GET    /api/users/{id}                - Get user by ID
GET    /api/users/email/{email}       - Get user by email
PUT    /api/users/{id}                - Update user
```

### Maintenance Requests
```
GET    /api/maintenance-requests              - Get all requests
GET    /api/maintenance-requests/{id}         - Get request by ID
POST   /api/maintenance-requests              - Create request
PUT    /api/maintenance-requests/{id}         - Update request
DELETE /api/maintenance-requests/{id}         - Delete request
GET    /api/maintenance-requests/user/{userId} - Get user's requests
```

### Comments
```
GET    /api/comments/request/{requestId}     - Get comments for request
POST   /api/comments                         - Create comment
DELETE /api/comments/{id}                    - Delete comment
```

### Notifications
```
GET    /api/notifications                     - Get all notifications
GET    /api/notifications/{id}                - Get notification
PUT    /api/notifications/{id}/read           - Mark as read
DELETE /api/notifications/{id}                - Delete notification
```

## Dependencies

### Core Android
- AndroidX AppCompat, ConstraintLayout, RecyclerView
- Material Design 3

### Networking
- Retrofit 2.10.0 - REST client
- OKHttp 4.12.0 - HTTP client
- Gson 2.10.1 - JSON parser

### Async & Reactive
- Kotlin Coroutines 1.7.3
- Lifecycle & LiveData 2.7.0

### Database & Storage
- Room 2.6.1 - Local database
- Shared Preferences - Session storage
- DataStore 1.0.0 - Preferences

### Security
- Google Play Services Auth 20.7.0
- Android Security Crypto 1.1.0

### Testing
- JUnit 4.13.2
- Espresso 3.5.1

## Error Handling

The app implements comprehensive error handling:
- API response validation
- Network error handling
- Validation error messages
- User-friendly error dialogs

## Security Features

✅ **HTTPS/TLS Support**: Configure for production
✅ **Secure Token Storage**: SharedPreferences with encryption
✅ **Request Interception**: Automatic auth header injection
✅ **Input Validation**: Client-side validation
✅ **CORS Enabled**: Backend configured for mobile access

## Next Steps for Full Implementation

1. **Complete UI Components**
   - Create MaintenanceRequest list/detail views
   - Implement comment system UI
   - Build notification center

2. **ViewModels & LiveData**
   - Create ViewModels for each screen
   - Implement reactive data binding
   - Handle lifecycle awareness

3. **Local Database**
   - Implement Room database for offline support
   - Cache API responses
   - Sync on reconnect

4. **Firebase Integration** (Optional)
   - Push notifications
   - Analytics
   - Crash reporting

5. **Testing**
   - Unit tests for repositories
   - Integration tests for API calls
   - UI tests with Espresso

## Testing

### Running Tests
```bash
# Unit tests
./gradlew test

# Instrumented tests  
./gradlew connectedAndroidTest
```

## Building Release APK

```bash
# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease
```

## Troubleshooting

### Gradle Sync Issues
- Clear `.gradle` folder
- Invalidate caches in Android Studio (File → Invalidate Caches)
- Update Android Studio and SDK

### API Connection Issues
- Verify backend is running on specified port
- Check emulator network settings (for 10.0.2.2)
- Enable cleartext traffic for HTTP (not recommended for production)

### Build Issues
- Ensure JDK 17 is selected in Android Studio settings
- Check Gradle version compatibility
- Update all dependencies

## Development Guidelines

### Code Style
- Follow Kotlin style guide
- Use meaningful variable names
- Add comments for complex logic

### Git Workflow
- Branch naming: `feature/description` or `bugfix/description`
- Commit messages: Clear and descriptive
- Pull requests for code review

## Production Deployment

Before deploying to production:

1. **Security**
   - Update API URL to production server
   - Disable HTTP logging
   - Enable ProGuard/R8 obfuscation

2. **Performance**
   - Optimize images and resources
   - Test on low-end devices
   - Profile memory usage

3. **Testing**
   - Comprehensive testing across devices
   - Test on various Android versions
   - Beta testing with real users

## Support & Documentation

- Backend API Documentation: See `AUTHENTICATION_API.md` in project root
- Android Documentation: https://developer.android.com
- Retrofit Documentation: https://square.github.io/retrofit
- Kotlin Documentation: https://kotlinlang.org/docs

## License

Copyright © 2026 Vestil. All rights reserved.

## Contact

For issues or questions about the mobile app integration:
- Review backend API documentation
- Check Android Studio logs
- Verify gradle.properties and build.gradle configuration
