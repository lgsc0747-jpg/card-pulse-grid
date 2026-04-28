---
name: 90-day password rotation
description: PasswordRotationPrompt dialog gates email-password users after 90 days of unchanged password
type: feature
---
Email-password users are prompted to update their password every 90 days via the PasswordRotationPrompt dialog (mounted in App.tsx). Snooze button defers the prompt for 7 days. The `passwordChangedAt` timestamp is stored in `user_preferences.prefs` and stamped on successful password updates (ResetPasswordPage + the prompt itself). OAuth users are skipped.
