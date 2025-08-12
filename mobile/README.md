## Focura Mobile (Expo)

Scripts:
- `npm start` – start Expo dev server

Environment:
- Configure `EXPO_PUBLIC_API_BASE_URL` in `app.config`, `.env`, or set to default `http://localhost:4000`.

Navigation:
- Screens: `Splash` → `Decide` → `Login`/`Register` → `Home` → `Tasks` | `AddTypedTask` | `SnapTask`.

Camera/OCR:
- Install native deps and run prebuild as needed:
  - npm i
  - npx expo prebuild
  - npx expo run:android or npx expo run:ios
  - Packages: `react-native-vision-camera`, `@react-native-ml-kit/text-recognition`


