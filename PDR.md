# **Snap-to-Plan MVP – Expanded PRD + Dev Stack**

## **1. Core Concept**

A hybrid planning app where users can:

1. **Snap** their handwritten daily plan → AI extracts tasks, subtasks, and implementation intentions (time & place) → App schedules them with reminders.
2. **Type** tasks, subtasks, and implementation intentions directly like a standard to-do list.
3. Get **push notifications** and **email reminders** before tasks start and after they end.

---

## **2. MVP Features**

### **2.1 Task Input Methods**

#### **A. Snap-to-Plan (Paper-to-Digital)**

* Camera capture inside app.
* Gallery import option.
* OCR + NLP to detect:

  * Main task.
  * Subtasks.
  * Time & place (for implementation intentions).

#### **B. Manual Entry (Digital Planning)**

* Simple form to:

  * Add main task.
  * Add subtasks.
  * Select time & place.
* Optional “implementation intention” generator: *"I will \[task] at \[time] in \[place]."*

---

### **2.2 Task Organization**

* Auto-categorize by **Today**, **Upcoming**, and **Completed**.
* Collapsible subtasks under main task.
* Edit & delete options.

---

### **2.3 Notifications & Emails**

* **Push notifications**:

  * Default: 15 min before.
  * Customizable per task.
* **Email reminders** (with task details & subtasks).
* **Post-task notification**: “Mark as done?”

---

### **2.4 Task Management**

* Mark as complete.
* Auto-archive completed tasks.
* Daily task summary (optional notification).

---

## **3. Technical Stack & Packages**

### **Frontend (Mobile App)**

**Framework:** React Native (Expo) → Fast dev, cross-platform (iOS + Android).

**Key Packages:**

* `expo-camera` → For taking task snaps.
* `expo-image-picker` → For importing from gallery.
* `react-navigation` → For navigation between screens.
* `react-native-paper` or `native-base` → UI components.
* `react-native-calendars` → For date picking if needed.
* `@react-native-async-storage/async-storage` → Local caching.
* `axios` → API calls.

---

### **Backend (API)**

**Framework:** Node.js + Express (lightweight & flexible for MVP).

**Key Packages:**

* `multer` → For image upload handling.
* `tesseract.js` → Local OCR processing (can use cloud for better accuracy).
* **Alternative for better accuracy:** Google Cloud Vision API.
* `node-cron` → For scheduling task-based jobs.
* `nodemailer` → Email sending (via Gmail/SMTP or SendGrid).
* `dayjs` → Time parsing and formatting.
* `express-validator` → Input validation.
* `dotenv` → Config management.

---

### **Database**

**Choice:** MongoDB (MongoDB Atlas cloud hosting).

**Collections:**

* `users`
* `tasks`
* `notifications`

**ODM:** `mongoose` (schema modeling).

---

### **NLP Processing**

* For extracting **time**, **place**, and **task hierarchy**:

  * `compromise` (lightweight NLP for parsing time/place).
  * and **OpenAI API** for better understanding of unstructured plans.

---

### **Push Notifications**

* **Service:** Firebase Cloud Messaging (FCM).
* Package: `expo-notifications` (for React Native + Expo).

---

### **Email Service**

* **Service:** SendGrid

---

## **4. API Endpoints (Draft)**

| Method | Endpoint              | Purpose                                |
| ------ | --------------------- | -------------------------------------- |
| POST   | `/auth/register`      | User registration                      |
| POST   | `/auth/login`         | User login                             |
| POST   | `/tasks/snap`         | Upload image → OCR + NLP extract tasks |
| POST   | `/tasks/manual`       | Add tasks via typing                   |
| GET    | `/tasks/today`        | Get today’s tasks                      |
| PUT    | `/tasks/:id`          | Edit task                              |
| DELETE | `/tasks/:id`          | Delete task                            |
| POST   | `/notifications/send` | Send push/email notification           |

---

## **5. Database Schema**

**User**

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  preferences: {
    notification_time_before: Number // in minutes
  },
  createdAt: Date
}
```

**Task**

```js
{
  _id: ObjectId,
  userId: ObjectId,
  mainTask: String,
  subtasks: [String],
  time: Date, // start time
  place: String,
  status: { type: String, enum: ['pending', 'completed'] },
  createdAt: Date
}
```

---

## **6. User Flow**

**Snap Flow:**

1. User taps "Snap Plan".
2. Takes photo / selects from gallery.
3. Image sent to backend.
4. Backend → OCR → NLP → Detect tasks, time, place.
5. Returns structured task list.
6. User edits → Saves → Notifications scheduled.

**Manual Flow:**

1. User taps "Add Task".
2. Inputs main task, subtasks, time, place.
3. App generates implementation intention.
4. Saves → Notifications scheduled.

---

## **7. Success Metrics**

* % of tasks completed daily.
* # of users returning after 7 days.
* Average scans/tasks per user per week.
* % of users using both snap and manual modes.
