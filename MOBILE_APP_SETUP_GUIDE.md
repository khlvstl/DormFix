# How to Import and Run the Android Project

## Step-by-Step Starting Guide

### 1. Import Project into Android Studio

**Option A: Using Android Studio UI**
- Open Android Studio
- Click "File" → "Open"
- Navigate to `C:\Users\Ross Mikhail\Desktop\dormfix\mobile`
- Click "OK"
- Wait for Gradle sync to complete (5-10 minutes)

**Option B: Using Command Line**
```bash
cd C:\Users\Ross Mikhail\Desktop\dormfix\mobile
./gradlew build
```

### 2. Configure Backend Connection

Edit `mobile/app/build.gradle.kts` and set the API base URL:

```gradle
// Line with buildConfigField
buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8080/api/\"")
```

**For different connection types:**
- Android Emulator on local machine: `http://10.0.2.2:8080/api/`
- Physical device on same network: `http://YOUR_COMPUTER_IP:8080/api/`
- Remote server: `http://YOUR_SERVER_URL:8080/api/`

### 3. Set Up Android Virtual Device (AVD)

If you don't have an emulator:
1. In Android Studio, go to "Tools" → "Device Manager"
2. Click "Create Device"
3. Select "Pixel 6" or similar device
4. Choose API 34 (Android 14)
5. Complete setup

### 4. Run the Application

1. Select emulator from the device dropdown
2. Click the "Run" button or press `Shift + F10`
3. Wait for app to compile and deploy (first run takes 2-5 minutes)

### 5. Test the App

**Login/Register Workflow:**
1. App opens to main screen
2. Click "Register" to create account
   - Fill in: First Name, Last Name, Email, Password
   - Click "Register"
3. On success, redirected to Dashboard
4. Click "Logout" to return to main screen
5. Click "Login" with registered credentials

## Android Studio Panda 3 Configuration

### Verified Compatibility
- ✅ Android Studio Panda 3 (2023.3.1+)
- ✅ Gradle 8.2.0
- ✅ Java 17
- ✅ Kotlin 1.9.21
- ✅ Target API 34

### Required Android SDK Components
Make sure these are installed in Android Studio:
1. SDK Platform API 34
2. Android Emulator
3. Android SDK Build-Tools 34
4. Intel x86 Emulator Accelerator (HAXM) - for Windows

**To install missing components:**
- Tools → SDK Manager
- Check required packages
- Click "OK" to install

## Troubleshooting Connection Issues

### If Backend at http://localhost:8080

**For Emulator:**
- Use: `http://10.0.2.2:8080/api/`
- (10.0.2.2 is special IP that points to host machine)

**For Physical Device:**
- Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Use: `http://192.168.X.X:8080/api/` (example)

### Enable Cleartext Traffic (Development Only)

If using HTTP in development, create `network_security_config.xml`:

```bash
mobile/app/src/main/res/xml/network_security_config.xml
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.0.0</domain>
    </domain-config>
</network-security-config>
```

Then in AndroidManifest.xml:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

## Backend Prerequisites

Before running the Android app, ensure:

1. **Backend is running**
   ```bash
   cd C:\Users\Ross Mikhail\Desktop\dormfix
   ./mvnw spring-boot:run
   ```

2. **Database is connected**
   - Verify PostgreSQL connection in `application.properties`
   - Check database URL and credentials

3. **Server is accessible**
   - Backend runs on `http://localhost:8080`
   - Test with: `http://localhost:8080/api/users` (should get error, but shows server is running)

## Project Structure Breakdown

```
mobile/
├── app/                              # Main app module
│   ├── build.gradle.kts             # Dependencies & build settings
│   ├── src/main/
│   │   ├── AndroidManifest.xml      # App configuration
│   │   ├── java/.../               # Source code (Kotlin)
│   │   └── res/                     # Resources (layouts, strings, colors)
│   └── src/test/                    # Unit tests
├── build.gradle.kts                 # Top-level gradle config
├── settings.gradle.kts              # Project modules
├── gradle.properties                # Gradle settings
└── gradle/wrapper/                  # Gradle executable
```

## Gradle Build Commands

```bash
# Clean and build
./gradlew clean build

# Build debug APK
./gradlew assembleDebug

# Run on emulator/device
./gradlew run

# Run tests
./gradlew test

# Lint checks
./gradlew lint
```

## Main Activities & Screens

1. **MainActivity**
   - Home screen
   - Has "Login" and "Register" buttons
   - Checks if user is already logged in

2. **LoginActivity**
   - Email and password input
   - Calls backend `/api/users/login`
   - Saves session on success

3. **RegisterActivity**
   - First name, last name, email, password
   - Calls backend `/api/users/register`
   - Auto-login on success

4. **DashboardActivity**
   - Main user dashboard
   - Shows welcome message
   - Displays maintenance request count
   - Has buttons for: Create Request, View Requests, Notifications, Logout

## API Integration Layer

### How Data Flows:

```
UI (Activity)
    ↓
Repository (Business Logic)
    ↓
ApiService (Retrofit Interface)
    ↓
RetrofitClient + OKHttp Interceptor
    ↓
Backend API
    ↓
Database
```

### Example Flow:

1. User enters email/password in LoginActivity
2. Activity calls `authRepository.login(request)`
3. Repository calls `apiService.login(request)`
4. Retrofit makes HTTP POST to `/api/users/login`
5. OKHttp interceptor adds headers
6. Backend validates credentials
7. Returns AuthResponse
8. Activity saves session with SessionManager
9. Navigate to DashboardActivity

## Session & Authentication

**Session persistence** is handled by `SessionManager`:
- Stores user ID, email, name, role
- Authentication token (for future JWT implementation)
- SharedPreferences with optional encryption

## What's Not Yet Implemented

These can be built upon the existing foundation:

1. ❌ MaintenanceRequest detail/edit screens
2. ❌ Comment listing and creation UI
3. ❌ Notification center UI
4. ❌ Real-time updates (WebSocket/Firebase)
5. ❌ Image upload for requests
6. ❌ Offline access (local database caching)
7. ❌ Advanced filtering and search

## Next Development Steps

1. **Create Maintenance Request Screen**
   - RecyclerView to list requests
   - Detail view with comments

2. **Implement Comment System**
   - Comment list on request detail
   - Add comment form

3. **Notification Center**
   - List notifications
   - Mark as read functionality

4. **Advanced Features**
   - Image attachments
   - Real-time status updates
   - Push notifications

## FAQ

**Q: App crashes on startup?**
A: Check logcat in Android Studio. Most common issues:
- API_BASE_URL not correctly configured
- Backend not running
- Network permission missing (should be in manifest)

**Q: Login fails with "Connection refused"?**
A: 
- Verify backend is running: `./mvnw spring-boot:run`
- Check API URL in gradle.properties
- Emulator can't reach host? Use 10.0.2.2 instead of localhost

**Q: How do I change the API endpoint?**
A: Edit `app/build.gradle.kts`, find buildConfigField with API_BASE_URL and change the URL

**Q: Can I run on a physical phone?**
A: Yes! Change API_BASE_URL to your computer's IP address on the local network

## Support Resources

- Android Developer Docs: https://developer.android.com/docs
- Kotlin Documentation: https://kotlinlang.org/docs/home.html
- Retrofit Guide: https://square.github.io/retrofit/
- Android Studio Help: Help → Android Studio Help (within IDE)

---

**Ready to run the app?** Start with step 1 above!
