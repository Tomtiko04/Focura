Awesome—here’s a tight, implementation-ready spec you can hand to GPT-5/Cursor to build *notification preferences* end-to-end in your Expo React Native app (JavaScript only, offline-first).

---

# Focura — Notification Preferences (Spec for Implementation)

## 1) Goals

* Let users choose *what* they get notified about and *when* during *onboarding* (and later in Settings).
* Support *offline local notifications* (Expo Notifications) so reminders fire without internet.
* Keep logic deterministic (no AI needed) and *cheap*.
* Preferences are stored *locally* and *synced* to backend when online.

---

## 2) Preference Model (single source of truth)

*Storage:*

* Local: AsyncStorage (authoritative for scheduling on device)
* Remote: users.preferences.notifications (for backup/sync)

*Shape (JavaScript object):*

js
// mobile/src/models/notificationPrefs.js
export const DEFAULT_NOTIFICATION_PREFS = {
  // Core reminders around tasks
  taskReminders: {
    before: { enabled: true, minutes: 15 },  // 5/10/15/30/60 selectable
    atStart: { enabled: true },
    atEnd: { enabled: false },               // optional “wrap-up” ping
  },

  // If a task passed its end time and remains incomplete
  missedTask: {
    enabled: true,
    delayMinutes: 15,
  },

  // Daily overviews
  dailySummary: {
    morning: { enabled: true, time: "07:30" },  // HH:mm, device timezone
    evening: { enabled: false, time: "20:30" },
  },

  // Optional “keep going!” soft nudges (off by default)
  motivationalNudges: {
    enabled: false,
    maxPerDay: 1,
  },

  // OS permission + platform specifics
  system: {
    permission: "unknown", // "unknown" | "granted" | "denied"
    androidChannelId: "focura-reminders", // set at runtime
  }
};


*Where to save locally:*

js
// AsyncStorage keys
"focura:notification_prefs"   // JSON.stringify of prefs
"focura:scheduled_ids"        // map of taskId -> { beforeId, atStartId, atEndId }


---

## 3) Onboarding Flow (screens + logic)

*Screen: “Stay on track?” (pre-permission explainer)*

* Short copy explaining value (“Get gentle reminders so you never miss tasks.”)
* Toggles (default states from DEFAULT_NOTIFICATION_PREFS):

  * “Remind me before tasks” (with time picker: 10/15/30 min)
  * “Remind me at start time”
  * “Daily morning summary” (time picker)
  * “Missed task reminders”
* CTA: *Enable notifications*

*Behavior:*

1. Save the chosen toggles to AsyncStorage immediately.
2. Call Notifications.requestPermissionsAsync().
3. Update system.permission in prefs.
4. If *granted*:

   * Create Android channel (Android): Notifications.setNotificationChannelAsync(...).
   * Schedule *daily summaries* (if enabled).
   * From now on, whenever a task is created/updated, schedule per-task reminders.
5. If *denied*:

   * Keep prefs, mark system.permission = "denied", show “Enable in Settings” sheet when user tries to enable reminders.

---

## 4) Scheduling Rules (deterministic)

*When to schedule per task:*

* On *create* and *update*:

  * Cancel any previous scheduled notifications for that task.
  * If prefs say enabled, schedule the new ones.
* On *delete* or *complete*:

  * Cancel the task’s scheduled notifications.

*What to schedule (based on prefs):*

* *Before start:* if startDateTime - minutes is in the future.
* *At start:* if start is in the future.
* *At end:* optional wrap-up; if end is in the future.

*Daily summaries:*

* If enabled, schedule *two repeating local notifications* (morning and/or evening) using the device timezone.

*Missed task check:*

* Use background job to detect tasks that are past end time + delay and not completed. Then fire a one-off local notification.
* Tools: expo-background-fetch + expo-task-manager.

*Edge cases:*

* If the computed fire time is in the past, *skip* scheduling that trigger.
* If OS permission is not granted, *don’t* schedule—show an inline banner prompting to enable.
* On logout, *cancel all scheduled notifications* for safety.

---

## 5) Implementation Tasks (mobile)

### 5.1 Install & bootstrap


expo install expo-notifications expo-device
expo install expo-task-manager expo-background-fetch
npm i dayjs


*Notifications setup (App entry):*

js
// mobile/App.js (or a notifications bootstrap file)
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('focura-reminders', {
      name: 'Focura Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: null,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } else if (Platform.OS === 'ios') {
  }
}


### 5.2 Permission helper

js
// mobile/src/services/notifications.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { ensureNotificationChannel } from '../../App';

const PREFS_KEY = 'focura:notification_prefs';
const SCHEDULED_KEY = 'focura:scheduled_ids';

export async function loadPrefs() {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  return raw ? JSON.parse(raw) : null;
}
export async function savePrefs(prefs) {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function requestSystemPermission(prefs) {
  const { status } = await Notifications.requestPermissionsAsync();
  const granted = status === 'granted';
  const next = { ...prefs, system: { ...prefs.system, permission: granted ? 'granted' : 'denied' } };
  await savePrefs(next);
  if (granted) await ensureNotificationChannel();
  return next;
}


### 5.3 Schedule per-task notifications

js
export async function scheduleTaskNotifications(task, prefs) {
  // task: { id, title, start, end, place, completed }
  if (!prefs?.system || prefs.system.permission !== 'granted') return {};

  const ids = { beforeId: null, atStartId: null, atEndId: null };
  const now = dayjs();

  // BEFORE
  if (prefs.taskReminders.before.enabled && task.start) {
    const triggerTime = dayjs(task.start).subtract(prefs.taskReminders.before.minutes, 'minute');
    if (triggerTime.isAfter(now)) {
      ids.beforeId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming task',
          body: `${task.title} starts at ${dayjs(task.start).format('HH:mm')}${task.place ? ` @ ${task.place}` : ''}`,
          data: { taskId: task.id, type: 'before' }
        },
        trigger: triggerTime.toDate(),
      });
    }
  }

  // AT START
  if (prefs.taskReminders.atStart.enabled && task.start) {
    const startTime = dayjs(task.start);
    if (startTime.isAfter(now)) {
      ids.atStartId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'It’s time',
          body: `Start: ${task.title}${task.place ? ` @ ${task.place}` : ''}`,
          data: { taskId: task.id, type: 'start' }
        },
        trigger: startTime.toDate(),
      });
    }
  }

  // AT END (optional)
  if (prefs.taskReminders.atEnd.enabled && task.end) {
    const endTime = dayjs(task.end);
    if (endTime.isAfter(now)) {
      ids.atEndId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Wrap up?',
          body: `Did you complete: ${task.title}?`,
          data: { taskId: task.id, type: 'end' }
        },
        trigger: endTime.toDate(),
      });
    }
  }

  // persist ids for cancel/reschedule later
  const all = JSON.parse(await AsyncStorage.getItem(SCHEDULED_KEY) || '{}');
  all[task.id] = ids;
  await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(all));

  return ids;
}

export async function cancelTaskNotifications(taskId) {
  const all = JSON.parse(await AsyncStorage.getItem(SCHEDULED_KEY) || '{}');
  const ids = all[taskId] || {};
  for (const k of ['beforeId','atStartId','atEndId']) {
    if (ids[k]) await Notifications.cancelScheduledNotificationAsync(ids[k]);
  }
  delete all[taskId];
  await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(all));
}


### 5.4 Daily summaries (repeating)

js
export async function scheduleDailySummaries(prefs) {
  if (prefs.system.permission !== 'granted') return;

  // cancel old summary notifications first (optional: store their ids if you want)
  // For simplicity, schedule fresh each time user changes prefs

  const makeDailyTrigger = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    // If time today has passed, OS will handle next occurrence
    return { hour: h, minute: m, repeats: true };
  };

  if (prefs.dailySummary.morning.enabled) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Today’s plan', body: 'Here’s your schedule for today.' },
      trigger: makeDailyTrigger(prefs.dailySummary.morning.time),
    });
  }

  if (prefs.dailySummary.evening.enabled) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Nice work today', body: 'Review your completed tasks.' },
      trigger: makeDailyTrigger(prefs.dailySummary.evening.time),
    });
  }
}


### 5.5 Missed tasks (background check)

js
// mobile/src/background/missedTasks.js
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MISSED_TASKS_JOB = 'FocuraMissedTasksJob';

TaskManager.defineTask(MISSED_TASKS_JOB, async () => {
  try {
    // Load tasks from local storage/SQLite
    const tasks = await loadLocalTasks(); // <- implement for your DB
    const prefs = JSON.parse(await AsyncStorage.getItem('focura:notification_prefs') || '{}');
    if (!prefs?.missedTask?.enabled || prefs.system?.permission !== 'granted') {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const now = dayjs();
    const due = tasks.filter(t =>
      !t.completed && t.end && now.isAfter(dayjs(t.end).add(prefs.missedTask.delayMinutes, 'minute'))
    );

    for (const t of due) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Missed task', body: `You missed: ${t.title}. Reschedule?` },
        trigger: null, // fire immediately
      });
    }

    return due.length
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;

  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerMissedTasksJob() {
  await BackgroundFetch.registerTaskAsync(MISSED_TASKS_JOB, {
    minimumInterval: 15 * 60, // 15 min
    stopOnTerminate: false,
    startOnBoot: true,
  });
}


> Call registerMissedTasksJob() once after login or app start.

---

## 6) Settings Screen (manage preferences later)

* Mirror the onboarding toggles with live values from AsyncStorage.
* On save:

  1. Persist prefs.
  2. (Re)request system permission if user enabled something that requires it and permission is denied.
  3. Reschedule *daily summaries* with new times.
  4. Future: push to backend (/api/users/me/preferences).

---

## 7) Backend Touchpoints (optional but recommended)

* PATCH /api/users/me/preferences → save user’s notification prefs (for backup/sync).
* GET /api/users/me/preferences → restore on login and merge with local.

> *Note:* Backend does *not* need to schedule local notifications; the app does. Backend may schedule *emails* based on the same prefs if you support email reminders.

---

## 8) Task CRUD hooks for notifications

On the mobile side:

* *Create task:*

  * Save task locally (SQLite/AsyncStorage).
  * scheduleTaskNotifications(task, prefs).

* *Update task (time/place/status change):*

  * cancelTaskNotifications(task.id) then scheduleTaskNotifications(updatedTask, prefs).

* *Complete task:*

  * cancelTaskNotifications(task.id).
  * Optionally schedule a small “nice work” nudge (if motivational enabled).

* *Delete task:*

  * cancelTaskNotifications(task.id).

---

## 9) QA Checklist

* First-run onboarding shows explainer → toggles → OS prompt → schedules summaries.
* Denying permissions keeps UI state but blocks scheduling with a clear “Enable in Settings” banner.
* Task create/update/delete correctly schedules/cancels local notifications.
* Daily summaries fire at chosen time in local timezone (test across DST).
* Missed task checker fires only for tasks past end + delay and not completed.
* Logout cancels all scheduled notifications.

---

## 10) Hand-this-to-Cursor Prompt (copy/paste)

> Implement notification preferences in the Expo React Native app (JavaScript, no TypeScript) using expo-notifications.
>
> *Deliverables:*
>
> 1. A preference model stored in AsyncStorage using the shape in DEFAULT_NOTIFICATION_PREFS above.
> 2. Onboarding screen that shows toggles (before, at start, at end, missed tasks, daily summaries with time pickers) and an “Enable notifications” CTA.
> 3. Permission flow: save prefs → request system permission → if granted create Android channel “focura-reminders” → schedule daily summaries.
> 4. Functions to schedule/cancel per-task notifications on create/update/delete using expo-notifications, storing scheduled notification IDs per task.
> 5. Background job (expo-background-fetch + task-manager) to detect missed tasks and fire an immediate local notification.
> 6. Settings screen to edit the same preferences later; reschedule summaries when times change.
> 7. Wire task CRUD hooks to schedule/cancel notifications.
>
> Use the code patterns and function names provided in the spec. Keep everything offline-first. Do not use TypeScript.
