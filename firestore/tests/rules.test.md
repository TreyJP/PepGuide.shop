# Firestore security rules test plan

Use the Firebase emulator suite (`@firebase/rules-unit-testing`) before production.

## Must pass
- User can read/write only their own profile, chats, messages, saved research, and folders
- User cannot set `subscriptionTier` or `accountStatus` on update
- User cannot write peptide library documents
- User cannot write `safetyEvents` or `usage` documents
- Unauthenticated users cannot read private user data
- Admins (custom claim `admin: true`) can read safety events and manage peptides

## Suggested cases
1. Owner create chat → allow
2. Other user read chat → deny
3. Owner create assistant message directly → deny (server-only path preferred)
4. Owner create user message → allow
5. Anonymous peptide read → deny
6. Signed-in peptide read → allow
7. Signed-in peptide write → deny
