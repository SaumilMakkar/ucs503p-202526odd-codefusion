# Postman Testing Guide - WhatsApp Reports

## Base URL
```
Production: https://ucs503p-202526odd-codefusion.onrender.com
Local: http://localhost:8000
```

## 1. Login (Get Access Token)

**Method:** POST  
**URL:** `{{baseUrl}}/api/auth/login`

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Action:** Copy `accessToken` and save it in Postman environment variable

---

## 2. Update User with Phone Number

**Method:** PUT  
**URL:** `{{baseUrl}}/api/user/update`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Note:** Replace with YOUR phone number that joined Twilio sandbox

---

## 3. Test WhatsApp Report

**Method:** GET  
**URL:** `{{baseUrl}}/api/reports/send-test-whatsapp`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Params:**
```
from: 2024-01-01
to: 2024-12-31
phoneNumber: +919876543210  (optional)
```

**Full URL:**
```
https://ucs503p-202526odd-codefusion.onrender.com/api/reports/send-test-whatsapp?from=2024-01-01&to=2024-12-31&phoneNumber=+919876543210
```

**Expected Response:**
```json
{
  "message": "Test WhatsApp message sent successfully",
  "phoneNumber": "+919876543210"
}
```

**You should receive WhatsApp message on your phone!**

---

## 4. Test Email Report (Fallback)

**Method:** GET  
**URL:** `{{baseUrl}}/api/reports/send-test-email`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Params:**
```
from: 2024-01-01
to: 2024-12-31
email: test@example.com  (optional)
```

---

## Environment Variables in Postman

Create a Postman Environment with:

```json
{
  "baseUrl": "https://ucs503p-202526odd-codefusion.onrender.com",
  "accessToken": "paste_token_after_login",
  "myPhoneNumber": "+919876543210"
}
```

Then use `{{baseUrl}}`, `{{accessToken}}`, etc. in requests.

---

## Twilio Sandbox Setup

### Step 1: Join Sandbox
1. Open WhatsApp
2. Send to: **+1 415 523 8886**
3. Message: `join <your-sandbox-code>`
4. Wait for confirmation

### Step 2: Get Credentials
1. Twilio Console → Dashboard
2. Copy Account SID and Auth Token
3. Add to Render environment variables

### Step 3: Test
- Use the phone number that joined the sandbox
- Format: `+<country><number>` (E.164)

---

## Phone Number Formats

### Correct ✅
- India: `+919876543210`
- US: `+11234567890`
- UK: `+447911123456`

### Wrong ❌
- `9876543210` (no country code)
- `+91 9876543210` (has spaces)
- `+91-9876-543-210` (has dashes)

---

## How Automatic Reports Work

1. **Cron job runs** on 1st of every month
2. **Checks users** with `isEnabled: true` in report settings
3. **For each user:**
   - Has phone number? → Send WhatsApp
   - WhatsApp failed or no phone? → Send Email
4. **Saves report** in database
5. **Updates next report date**

---

## Testing Checklist

- [ ] Joined Twilio WhatsApp sandbox
- [ ] Added TWILIO credentials to Render
- [ ] Backend deployed with changes
- [ ] Logged in and got access token
- [ ] Updated user profile with phone number
- [ ] Tested send-test-whatsapp endpoint
- [ ] Received WhatsApp message
- [ ] Verified message format and content

