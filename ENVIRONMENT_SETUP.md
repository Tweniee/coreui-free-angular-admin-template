# Environment Configuration Guide

This project uses Angular's environment files for configuration management.

## Environment Files

The project has three environment files:

1. **environment.ts** - Default environment (development)
2. **environment.development.ts** - Development environment
3. **environment.production.ts** - Production environment

## File Locations

```
src/
└── environments/
    ├── environment.ts
    ├── environment.development.ts
    └── environment.production.ts
```

## Configuration Structure

```typescript
export const environment = {
  production: boolean,
  apiUrl: string,
  apiEndpoints: {
    auth: {
      sendOtp: string,
      verifyOtp: string,
    },
    roles: string,
    users: string,
  },
  storage: {
    tokenKey: string,
    userKey: string,
  },
  otp: {
    length: number,
    resendTimeout: number, // seconds
  },
  app: {
    name: string,
    version: string,
  },
};
```

## Available Configurations

### API Configuration

- **apiUrl**: Base URL for the backend API
- **apiEndpoints**: Object containing all API endpoint paths

### Storage Configuration

- **tokenKey**: LocalStorage key for JWT token
- **userKey**: LocalStorage key for user data

### OTP Configuration

- **length**: Number of digits in OTP (default: 6)
- **resendTimeout**: Seconds before allowing OTP resend (default: 30)

### App Configuration

- **name**: Application name
- **version**: Application version

## How to Use

### 1. Development Environment

The development environment is used by default when running:

```bash
npm start
# or
ng serve
```

This uses `environment.development.ts`

### 2. Production Build

For production builds:

```bash
npm run build
# or
ng build --configuration production
```

This uses `environment.production.ts`

### 3. Accessing Environment Variables

Import the environment in your service or component:

```typescript
import { environment } from "../environments/environment";

// Use the variables
const apiUrl = environment.apiUrl;
const otpLength = environment.otp.length;
```

## Customizing for Your Environment

### Development Setup

Edit `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000", // Your local API
  // ... other configs
};
```

### Production Setup

Edit `src/environments/environment.production.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api.yourdomain.com", // Your production API
  // ... other configs
};
```

## Build Configuration

The `angular.json` file is configured to replace environment files during build:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.production.ts"
  }
]
```

## Best Practices

1. **Never commit sensitive data** like API keys or secrets to environment files
2. **Use different API URLs** for development and production
3. **Keep environment files in sync** - when adding new config, update all files
4. **Document all configurations** in this file
5. **Use TypeScript interfaces** for type safety

## Adding New Configuration

To add a new configuration:

1. Add it to all three environment files
2. Update this documentation
3. Use it in your code:

```typescript
import { environment } from "../environments/environment";

const myNewConfig = environment.myNewConfig;
```

## Environment-Specific Features

### Development

- Source maps enabled
- No optimization
- Detailed error messages
- API URL points to local/dev server

### Production

- Source maps disabled
- Full optimization
- Minified code
- API URL points to production server
- Output hashing for cache busting

## Troubleshooting

### Environment not loading

- Check that you're importing from the correct path
- Verify the build configuration in `angular.json`

### Changes not reflecting

- Restart the dev server (`ng serve`)
- Clear browser cache
- Check which environment file is being used

### Build errors

- Ensure all environment files have the same structure
- Check for TypeScript errors in environment files

## Security Notes

⚠️ **Important**: Environment files are bundled with your application and are visible in the browser. Never store:

- API keys
- Secrets
- Passwords
- Private tokens

For sensitive data, use:

- Backend environment variables
- Secure configuration services
- Server-side configuration endpoints
