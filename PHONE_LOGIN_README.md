# Phone Number OTP Authentication

A modern, user-friendly phone number OTP authentication system integrated with your backend API.

## Features

✨ **Modern UI Design**

- Clean, centered card-based layout
- Smooth animations and transitions
- Responsive design for all screen sizes
- Dark mode support

🔐 **Security**

- JWT token-based authentication
- HTTP interceptor for automatic token injection
- Route guards to protect authenticated pages
- Secure token storage in localStorage

📱 **OTP Experience**

- Auto-focus on next input field
- Paste support for 6-digit codes
- Auto-submit when all digits entered
- 30-second countdown for resend
- Clear error messaging

## API Integration

The system integrates with your backend at `http://10.100.71.172:3000`:

### 1. Send OTP

```
POST /auth/send-otp
Body: { "phoneNumber": "+919876543210" }
```

### 2. Verify OTP

```
POST /auth/verify-otp
Body: { "phoneNumber": "+919876543210", "otp": "123456" }
Response: { "accessToken": "...", "user": {...} }
```

### 3. Protected Endpoints

All authenticated requests automatically include:

```
Authorization: Bearer <token>
```

## File Structure

```
src/app/
├── services/
│   └── auth.service.ts              # Authentication service
├── guards/
│   └── auth.guard.ts                # Route protection
├── interceptors/
│   └── auth.interceptor.ts          # JWT token injection
└── views/
    └── auth/
        └── phone-login/
            ├── phone-login.component.ts
            ├── phone-login.component.html
            └── phone-login.component.scss
```

## Usage

### 1. Start the Application

```bash
npm start
```

### 2. Login Flow

1. Enter your 10-digit phone number
2. Click "Send OTP"
3. Enter the 6-digit OTP received
4. Automatically redirected to dashboard on success

### 3. Logout

Click the user avatar in the header → Logout

## Configuration

### Change API URL

Edit `src/app/services/auth.service.ts`:

```typescript
private apiUrl = 'http://your-api-url:port';
```

### Change Default Route

Edit `src/app/app.routes.ts`:

```typescript
{
  path: '',
  redirectTo: 'your-route',
  pathMatch: 'full',
}
```

## Phone Number Format

The system automatically formats phone numbers:

- Input: `9876543210` → Formatted: `+919876543210`
- Input: `919876543210` → Formatted: `+919876543210`
- Input: `+919876543210` → Formatted: `+919876543210`

## Features in Detail

### Auto-Focus

When entering OTP, focus automatically moves to the next input field.

### Paste Support

Paste a 6-digit code anywhere in the OTP inputs, and it will auto-fill all fields.

### Resend OTP

After 30 seconds, you can request a new OTP code.

### Error Handling

Clear error messages for:

- Invalid phone number
- Failed OTP send
- Invalid OTP
- Network errors

### Route Protection

All routes under the main layout are protected and require authentication.

## Customization

### Change OTP Length

Edit `phone-login.component.ts`:

```typescript
otp = signal(["", "", "", "", "", ""]); // 6 digits
```

### Change Countdown Duration

Edit `phone-login.component.ts`:

```typescript
private startCountdown() {
  this.countdown.set(30); // 30 seconds
  // ...
}
```

### Styling

Customize colors and styles in `phone-login.component.scss`

## Testing

### Test Phone Numbers

Use your backend's test phone numbers for development.

### Mock OTP

If your backend supports it, use test OTPs like `123456` for development.

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your backend allows requests from your frontend origin.

### Token Not Persisting

Check browser localStorage to ensure the token is being saved:

```javascript
localStorage.getItem("accessToken");
```

### OTP Not Received

- Check phone number format
- Verify backend SMS/WhatsApp configuration
- Check network connectivity

## Security Notes

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Always use HTTPS in production
- Implement token refresh mechanism for long sessions
- Add rate limiting on OTP requests
- Consider adding CAPTCHA for production

## Next Steps

- [ ] Add token refresh mechanism
- [ ] Implement remember me functionality
- [ ] Add biometric authentication
- [ ] Add social login options
- [ ] Implement session timeout warnings
