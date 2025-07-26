# SMS & Contacts Reader App

## 📱 App Description

This Android application demonstrates how to read SMS messages and contacts from a device with proper user permissions. The app is designed for educational purposes and shows the implementation of runtime permissions in Android.

## ⚠️ Important Notes

- **Educational Purpose Only**: This app is created for learning Android development concepts
- **User Privacy**: Always respect user privacy and data protection laws
- **Permissions Required**: The app requires explicit user consent for SMS and Contacts access
- **WhatsApp Messages**: Cannot be accessed due to WhatsApp's security policies

## 🔧 Features

### ✅ Implemented Features
1. **Runtime Permission Handling**: Properly requests and handles SMS and Contacts permissions
2. **SMS Reading**: Reads SMS messages from device inbox (limited to 10 messages for demo)
3. **Contacts Reading**: Reads device contacts (limited to 20 contacts for demo)
4. **User-Friendly UI**: Clean interface with proper feedback

### ❌ Limitations
- **WhatsApp Messages**: Cannot be accessed (WhatsApp's security policy)
- **Message Limits**: Demo version limits to 10 SMS and 20 contacts
- **Read-Only**: Cannot send SMS or modify contacts

## 📋 Required Permissions

```xml
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 🚀 Setup Instructions

### Prerequisites
- Android Studio (latest version)
- Android SDK (API level 21 or higher)
- Kotlin support enabled

### Installation Steps

1. **Clone or Download** the project files
2. **Open Android Studio**
3. **Import Project**: File → Open → Select the `SMSContactsApp` folder
4. **Sync Project**: Wait for Gradle sync to complete
5. **Build Project**: Build → Make Project
6. **Run on Device**: Connect Android device and run the app

### Running the App

1. **Install** the app on your Android device
2. **Launch** the app
3. **Grant Permissions**: Click "Request Permissions" and allow SMS and Contacts access
4. **Use Features**: 
   - Click "Read SMS Messages" to view SMS
   - Click "Read Contacts" to view contacts

## 📁 Project Structure

```
SMSContactsApp/
├── app/
│   └── src/
│       └── main/
│           ├── java/com/example/smscontactsapp/
│           │   └── MainActivity.kt          # Main activity with all logic
│           ├── res/
│           │   ├── layout/
│           │   │   └── activity_main.xml    # UI layout
│           │   └── values/
│           │       ├── strings.xml          # String resources
│           │       ├── colors.xml           # Color definitions
│           │       └── styles.xml           # App themes
│           └── AndroidManifest.xml          # App manifest with permissions
├── build.gradle                             # App-level build config
├── settings.gradle                          # Project settings
└── build.gradle.kts                         # Project-level build config
```

## 🔍 Code Highlights

### Permission Handling
```kotlin
// Request permissions at runtime
private fun requestPermissions() {
    val permissions = arrayOf(SMS_PERMISSION, CONTACTS_PERMISSION)
    ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE)
}
```

### SMS Reading
```kotlin
// Read SMS messages from content provider
val cursor: Cursor? = contentResolver.query(
    Uri.parse("content://sms/inbox"),
    null, null, null, "date DESC"
)
```

### Contacts Reading
```kotlin
// Read contacts from content provider
val cursor: Cursor? = contentResolver.query(
    ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
    null, null, null, 
    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
)
```

## 🛡️ Security Considerations

1. **Runtime Permissions**: Always request permissions at runtime (Android 6.0+)
2. **User Consent**: Never access sensitive data without explicit user permission
3. **Data Protection**: Handle user data responsibly and securely
4. **Privacy Laws**: Comply with local privacy and data protection regulations

## 📱 App Screenshots

The app features:
- Clean, modern UI with Material Design
- Permission request dialog
- SMS message display
- Contacts list display
- Proper error handling

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**: 
   - Go to Settings → Apps → SMS & Contacts Reader → Permissions
   - Enable SMS and Contacts permissions

2. **Build Errors**:
   - Sync project with Gradle files
   - Clean and rebuild project
   - Check Android SDK version compatibility

3. **No Data Displayed**:
   - Ensure permissions are granted
   - Check if device has SMS messages or contacts
   - Verify app is running on a real device (not emulator)

## 📄 License

This project is for educational purposes only. Use responsibly and in compliance with applicable laws and regulations.

## 🤝 Contributing

This is a demo project. For educational purposes, feel free to:
- Study the code structure
- Understand permission handling
- Learn Android development concepts

## 📞 Support

For questions about Android development or this project:
- Check Android Developer Documentation
- Review the code comments for detailed explanations
- Understand the permission system thoroughly before implementing

---

**Remember**: Always respect user privacy and follow best practices when handling sensitive data!