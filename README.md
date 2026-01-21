# NowPost

A minimal Expo app for Android that lets you post updates to your GitHub-hosted "Now" page. Take a photo, add text, and publish directly from your phone.

## What it does

- Take a photo or pick from gallery
- Add a description
- Post to your GitHub "Now" page with one tap
- Images are uploaded to `docs/` folder
- HTML is automatically updated with new entry at the top

## Target Repository

Posts are made to [OutFoxD/Project-Portfolio](https://github.com/OutFoxD/Project-Portfolio):
- Images: `docs/<timestamp>.jpg`
- Page: `now/index.html`
- Live at: https://protofox.at/now/

## Setup

### Prerequisites
- Node.js 20+
- pnpm (or npm/yarn)
- Expo Go app on Android (SDK 54) for development
- GitHub Personal Access Token with `repo` or `Contents` permission

### Install dependencies
```bash
pnpm install
```

### Run in development
```bash
pnpm exec expo start
```
Scan QR code with Expo Go on Android.

### Build APK for installation
```bash
npx eas-cli build -p android --profile preview
```
Download the APK from the provided link and install on device.

## GitHub Token Setup

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (fine-grained recommended)
3. Select repository: `OutFoxD/Project-Portfolio`
4. Set **Contents** permission to **Read and write**
5. Copy token and paste into app on first launch

## Tech Stack

- [Expo](https://expo.dev/) SDK 54
- React Native 0.81.5
- expo-image-picker
- expo-secure-store
- GitHub REST API

## Notes

- Includes patch for React Native 0.81 Event bug ([#54732](https://github.com/facebook/react-native/issues/54732))
- Uses `react-native-url-polyfill` for Hermes URL compatibility
- Token is stored securely using expo-secure-store

## License

MIT
