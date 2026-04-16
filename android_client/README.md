# ORCare Android Client (Example)

This folder contains example Android client code (Kotlin) for SignIn, SignUp, Forgot Password, OTP verification, Reset Password, and Profile flow.

Structure:
- `models/` - data models
- `network/` - Retrofit client, API interface, auth interceptor
- `activities/` - example Activities using ViewBinding and coroutines
- `res/layout/` - minimal XML layouts used by the Activities

How to use
1. Copy the `models/`, `network/`, and `activities/` packages into your Android app module (e.g., `app/src/main/java/...`).
2. Copy XML files into `app/src/main/res/layout/`.
3. Add dependencies to your `build.gradle` (app):

```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.9.3'
implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4'
implementation 'com.google.code.gson:gson:2.10.1'
```

4. Set the correct `BASE_URL` in `network/RetrofitClient.kt` (use `http://10.0.2.2:3000/` for Android emulator).
5. Ensure backend is running and accessible.

Notes
- These examples use ViewBinding. Update Activity code if you use synthetic views or Compose.
- Store JWT token securely (this example uses SharedPreferences for brevity).

```bash
# Example: expose backend with ngrok and use the ngrok URL as BASE_URL
ngrok http 3000
```
