# Security Specification for AI Insurance Network OS

## 1. Data Invariants
1. A member cannot be created without a valid memberCode and valid unique member ID matching schema limits.
2. Only authorized administrators and system users can modify compensation plans or audit logs.
3. Candidate applications can be submitted with valid contact information, and status can only be transitioned by authenticated leaders.
4. Audit logs are append-only and cannot be altered or deleted.

## 2. The "Dirty Dozen" Threat Payloads
- **Payload 1 (Ghost Field / Shadow Injection)**: Attempting to insert `__privilege_escalation: true` or `isAdmin: true` into member record.
- **Payload 2 (ID Poisoning Attack)**: Injecting 2000-character malicious string into `memberId` path variable.
- **Payload 3 (Orphan Write)**: Writing an application without email or phone number.
- **Payload 4 (Log Tampering)**: Attempting to update or delete an existing `auditLogs` entry.
- **Payload 5 (Plan Hijack)**: Non-admin updating active compensation plan rates.
- **Payload 6 (PII Extraction)**: Anonymous unauthorized bulk reading of internal member data.
- **Payload 7 (Status Tampering)**: Changing application status from approved back to draft without proper permission.
- **Payload 8 (Extreme String Payload)**: Sending a 10MB payload into member description to cause denial-of-wallet.
- **Payload 9 (Fake Auth Token)**: Spoofing user auth token claims.
- **Payload 10 (Direct Field Mutation)**: Overwriting `createdAt` / `joinDate` immutable field.
- **Payload 11 (Malicious SQL/NoSQL Injection in IDs)**: Document ID containing special characters like `../` or invalid regex.
- **Payload 12 (Negative FYC Manipulation)**: Submitting negative `personalFYC` to artificially skew group bonus calculations.
