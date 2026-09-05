# Agricultural Survey Mobile Application

This project is a React Native (Expo) mobile conversion of the original Agrisurvey web application. It is designed for agricultural inspectors to manage farmers, field boundaries, and conduct surveys natively on Android devices.

## Project Overview

Agrisurvey Mobile empowers field agronomic inspectors to:
- Register and manage Farmer profiles.
- Visualize and record GPS-based field parcels (cadastral mapping).
- Conduct multi-module crop and soil surveys.
- Analyze collected data via reports.
- Save data locally via `AsyncStorage` for offline readiness.

## Features

- **Dashboard:** At-a-glance telemetry of total farmers, fields, surveys, and sync status.
- **Farmers Management:** View a list of farmers and add new farmer records.
- **Fields (GPS Mapper):** A native mapping interface using `react-native-maps` to locate parcels.
- **Surveys:** Create new survey dossiers for field visits and review drafts/completed surveys.
- **Reports:** Analyze real-time statistics and completion metrics.
- **Native Android UI:** Optimized specifically for touch interfaces and Android material patterns.

## Technology Stack

- **Framework:** React Native, Expo
- **Language:** TypeScript
- **State Management:** Zustand
- **Local Storage:** AsyncStorage
- **Navigation:** React Navigation (Bottom Tabs)
- **Maps:** react-native-maps
- **Icons:** @expo/vector-icons (Ionicons)

## Installation & Environment Setup

1. **Clone the repository:** (If not already cloned)
   ```bash
   git clone <your-repo>
   cd agrisurvey-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file.
   ```bash
   cp .env.example .env
   ```
   *(Currently, no secrets are required as data is persisted locally via AsyncStorage. Future Supabase/Firebase integrations should be added here).*

## Running the Application

To start the Expo development server:

```bash
npm start
# or
npx expo start
```

Press `a` in the terminal to open the app on a connected Android device or emulator.

## Building the APK (Android)

This project is fully configured for APK generation using EAS (Expo Application Services). 
The `eas.json` file is configured with an Android `apk` build type under the `preview` profile.

To generate an installable APK:

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account (Required for cloud builds):**
   ```bash
   eas login
   ```

3. **Start the cloud build process for Android:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Download & Install:**
   Once the build completes on the Expo servers, it will provide a direct download link for the `.apk` file.
   - Download the APK to your Android device.
   - Ensure "Install from Unknown Sources" is enabled in your Android security settings.
   - Tap the APK to install the **Agricultural Survey** application.

*(If you have Android Studio/SDK properly configured locally, you can also run `eas build --platform android --profile preview --local`)*

## Project Structure

```text
agrisurvey-mobile/
├── App.tsx                  # Main entry point and Navigation setup
├── app.json                 # Expo and Android manifest configuration
├── eas.json                 # EAS build configuration for APK
├── src/
│   ├── assets/              # Static images and icons
│   ├── data/                # Initial seed data for offline use
│   ├── screens/             # Native Screen components (Home, Farmers, Fields, etc.)
│   ├── store/               # Zustand state management and persistence
│   ├── theme.ts             # Global UI constants (colors, spacing, radii)
│   └── types.ts             # TypeScript interface definitions
```
