# Environment Files

## Quick Reference

| File                         | Usage                 | Command                               |
| ---------------------------- | --------------------- | ------------------------------------- |
| `environment.ts`             | Default (Development) | `ng serve`                            |
| `environment.development.ts` | Development           | `ng serve`                            |
| `environment.production.ts`  | Production            | `ng build --configuration production` |

## Current Configuration

### API Settings

```typescript
apiUrl: "http://10.100.71.172:3000";
```

### Endpoints

- Send OTP: `/auth/send-otp`
- Verify OTP: `/auth/verify-otp`
- Roles: `/roles`
- Users: `/users`

### OTP Settings

- Length: 6 digits
- Resend timeout: 30 seconds

### Storage Keys

- Token: `accessToken`
- User: `currentUser`

## How to Change API URL

1. Open the appropriate environment file
2. Update the `apiUrl` value:

```typescript
export const environment = {
  apiUrl: "http://your-new-api-url:port",
  // ...
};
```

3. Restart the dev server if running

## Adding New Endpoints

Add to the `apiEndpoints` object:

```typescript
apiEndpoints: {
  auth: {
    sendOtp: '/auth/send-otp',
    verifyOtp: '/auth/verify-otp'
  },
  roles: '/roles',
  users: '/users',
  // Add your new endpoint
  products: '/products'
}
```

Then use it in your service:

```typescript
import { environment } from "../../environments/environment";

this.http.get(`${environment.apiUrl}${environment.apiEndpoints.products}`);
```
