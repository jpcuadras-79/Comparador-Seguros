# Security Specification: Comparador de Propuestas BN (Role-Based Access Control & Production Hardening)

## 1. Data Invariants
1. **Identity Integrity**: Any user document created at `/users/{userId}` MUST match `request.auth.uid == userId`.
2. **Role Elevation Guard**: Users CANNOT grant themselves the `"admin"` role upon sign-up or profile update. Only existing verified admins (or the initial bootstrapped super admin `jp.cuadras@gmail.com`) can set `role: "admin"` or write to `/admins/{userId}`.
3. **Comparison Ownership**: Every comparison record in `/comparisons/{comparisonId}` MUST have `incoming().userId == request.auth.uid`. An advisor cannot save comparisons under another user's ID.
4. **Data Isolation**: Standard advisors can ONLY read and list their own comparisons (`resource.data.userId == request.auth.uid`). Only the verified administrator can audit all comparisons across the brokerage.
5. **Admin Access Control**: Write access to `/admins/{userId}` and `/settings/{settingId}` is strictly restricted to verified administrators.
6. **Immutable Fields**: `userId`, `email`, and `createdAt` cannot be modified once set.
7. **Email Verification Requirement**: All database mutations require `request.auth.token.email_verified == true`.
8. **Catch-All Default Deny**: Any path not explicitly matched is denied (`match /{document=**} { allow read, write: if false; }`).

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Payload 1 (Self-Elevation Attack)**: Non-admin signs up and injects `role: "admin"` into `/users/{uid}`.
2. **Payload 2 (Admin Collection Poisoning)**: Unprivileged user tries to write a document directly to `/admins/{uid}`.
3. **Payload 3 (Unverified Email Write)**: Attacker with `email_verified: false` attempts to write to `/users/{uid}`.
4. **Payload 4 (Identity Spoofing in Comparison)**: User `user_A` submits a comparison with `userId: "user_B"`.
5. **Payload 5 (Cross-Tenant List Scraping)**: User `user_A` executes a query on `/comparisons` without scoping to `where("userId", "==", "user_A")`.
6. **Payload 6 (Cross-User Read)**: User `user_A` executes `get(/comparisons/user_B_comparison)`.
7. **Payload 7 (Settings Hijacking)**: Non-admin attempts to update `/settings/general`.
8. **Payload 8 (Oversized ID Injection Attack)**: Attacker attempts to create a document with a 2KB garbage string as `comparisonId`.
9. **Payload 9 (Oversized Payload / Denial of Wallet)**: Submitting a client name with 10,000 characters.
10. **Payload 10 (Immutability Bypass)**: User attempts to update `/comparisons/{id}` altering the original `userId`.
11. **Payload 11 (Unauthenticated Probe)**: Anonymous or unauthenticated request to read `/users` or `/comparisons`.
12. **Payload 12 (Admin Email String Spoofing without Verified Token)**: Sending an auth token with email `"jp.cuadras@gmail.com"` but `email_verified: false`.
