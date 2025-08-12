# Snap-To-Plan MVP 📅✨

A productivity app for **paper planners** and **digital lovers** alike.  
Snap your handwritten tasks OR type them in, and the app automatically organizes them into **main tasks, subtasks, and implementation intentions** — then sends notifications & email reminders.

---

## 🚀 MVP Features

### 1. **Task Capture**
- **Snap Mode** 📷:
  - Upload or take a picture of your handwritten daily plan.
  - AI-powered OCR extracts tasks & times.
  - Automatically detects:
    - **Main tasks**
    - **Subtasks**
    - **Time & place** (Implementation Intention).
- **Type Mode** ⌨:
  - Manually enter tasks, subtasks, time & place like a regular to-do list.

### 2. **Smart Scheduling**
- Automatically schedules tasks into your day based on:
  - Time specified in the snap/typed plan.
  - User-set priority (if no time given).
- Option to edit & rearrange tasks after extraction.

### 3. **Reminders & Notifications**
- **Pre-task reminder**: Notify user 5–15 min before task start.
- **Post-task nudge**: Ask if task was completed.
- Email + in-app notifications.

### 4. **Basic Task Management**
- Mark tasks/subtasks as complete ✅.
- Delete or reschedule tasks.
- Daily view of all planned tasks.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [React Native](https://reactnative.dev/) (Cross-platform: iOS + Android)
- **UI Kit**: [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design components)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight store)
- **Image Upload**: [React Native Image Picker](https://github.com/react-native-image-picker/react-native-image-picker)

### **Backend**
- **Server**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Cloud NoSQL)
- **Auth**: [Clerk](https://clerk.com/) or [Firebase Auth](https://firebase.google.com/)
- **File Storage**: [Cloudinary](https://cloudinary.com/) (for storing snapped images)
- **OCR**: [Google Cloud Vision API](https://cloud.google.com/vision) or [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Email Notifications**: [SendGrid](https://sendgrid.com/) or [Resend](https://resend.com/)
- **Push Notifications**: [Expo Notifications](https://docs.expo.dev/push-notifications/overview/) (if using Expo)

### **AI Parsing** 🤖
- **LLM API**: [OpenAI GPT-5](https://platform.openai.com/) for:
  - Cleaning & structuring OCR text.
  - Extracting tasks, subtasks, and times.

---

## 📌 User Flow

1. **Sign Up / Log In**
   - Email/password or Google/Apple auth.

2. **Choose Input Mode**
   - **Snap Task** → Take/Upload photo → OCR → AI parse → Display tasks.
   - **Type Task** → Enter manually in digital planner.

3. **Review & Edit Tasks**
   - Edit text, add missing times/places.
   - Add subtasks if needed.

4. **Set Implementation Intentions**
   - Define exact **time & place** for each main task.
   - Option to skip if already extracted.

5. **Reminders & Tracking**
   - Receive notifications before & after each task.
   - Mark complete or reschedule.

