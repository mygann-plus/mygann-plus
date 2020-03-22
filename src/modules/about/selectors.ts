import style from './style.css';

export default {
  wrap: style.locals.wrap,
  releaseNotesShown: style.locals['release-notes-shown'], // applies to wrap
  sectionTitle: style.locals['section-title'],
  mainDescription: style.locals['main-description'],
  updateBadge: style.locals['update-badge'],
  desktopAvatarBadge: style.locals['desktop-avatar-badge'],
  desktopLinkBadge: style.locals['desktop-link-badge'],
  releaseNotesLink: style.locals['release-notes-link'],
  releaseNotes: style.locals['release-notes'],
  updateNotification: {
    buttons: style.locals['update-notification-buttons'],
  },
  bugReport: {
    wrap: style.locals['bug-report-wrap'],
    hidden: style.locals['bug-report-hidden'],
    textarea: style.locals['bug-report-textarea'],
    sendButton: style.locals['bug-report-send-button'],
    fileInput: style.locals['bug-report-file-input'],
    fileLabel: style.locals['bug-report-file-label'],
    fileName: style.locals['bug-report-file-name'],
  },
};
