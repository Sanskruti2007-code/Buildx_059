# Security — Mehfus

## Zero Trust Model

No user, device, or service is trusted by default.
Every request is verified before access is granted.

### Three Principles

1. **Verify Explicitly** — Every request carries a Firebase ID token.
   Token verified server-side. Expires in 1 hour.

2. **Least-Privilege Access** — Users see only what their role permits:
   - Citizen: own data only
   - Volunteer: alerts within 2 km only
   - Police: cases in jurisdiction only
   - Control Room: all cases, dispatch only
   - Admin: system config only

3. **Assume Breach** — Every action logged. Daily backups.
   Recovery in under 15 minutes.

### Authentication

- Phone OTP (Firebase Auth)
- MFA for police and control room
- Biometric lock for citizen app
- Token expires in 1 hour, refresh rotates on use

### Micro-Segmentation

Each service is a separate Cloud Function:
alert-engine, missing-person, found-child,
crowd-analytics, notification, volunteer-tasks.

If one is compromised, others keep running.

### Encryption

- In transit: TLS 1.3
- At rest: AES-256
- Mobile: flutter_secure_storage (Keychain/Keystore)

### Audit

Every action logged to `audit_logs` (append-only).
Failed logins trigger rate limiting.
Admin dashboard shows live security events.

### Compliance

DPDP Act 2023, JJ Act 2015, IT Act 2000,
CERT-In Smart City Guidelines.

### Demo: How to Show Zero Trust

1. Login as Citizen → only SOS + report screens
2. Login as Volunteer → only assigned tasks
3. Login as Police → case management
4. Login as Control Room → all cases
5. Try to access police data as citizen → denied
6. Show audit log → every action recorded
