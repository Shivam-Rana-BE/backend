const isNotificationsEnabled = parseInt(process.env.NOTIFICATION) || 0;

const notificationSettings = {
    welcomeNotifications: isNotificationsEnabled,
    messageNotifications: isNotificationsEnabled,
    scheduledReminderNotifications: isNotificationsEnabled,
    updateNotifications: isNotificationsEnabled,
    activityCompilationNotifications: isNotificationsEnabled,
    doctorFeedbackNotifications: isNotificationsEnabled,
    reportUpdateNotifications: isNotificationsEnabled
};

const notificationText = {
    welcomeMail: "welcomeNotifications",
    message: "messageNotifications",
    scheduledReminder: "scheduledReminderNotifications",
    updates: "updateNotifications",
    activityCompilation: "activityCompilationNotifications",
    doctorFeedback: "doctorFeedbackNotifications",
    reportUpdate: "reportUpdateNotifications"
}

export { notificationSettings, notificationText };
