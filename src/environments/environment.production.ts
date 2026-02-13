export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
  apiEndpoints: {
    auth: {
      sendOtp: '/auth/send-otp',
      verifyOtp: '/auth/verify-otp',
    },
    roles: '/roles',
    users: '/users',
  },
  storage: {
    tokenKey: 'accessToken',
    userKey: 'currentUser',
  },
  otp: {
    length: 6,
    resendTimeout: 30, // seconds
  },
  app: {
    name: 'CoreUI Admin',
    version: '1.0.0',
  },
};
