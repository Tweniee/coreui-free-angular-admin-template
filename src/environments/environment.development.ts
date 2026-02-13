export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
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
    name: 'CoreUI Admin (Dev)',
    version: '1.0.0-dev',
  },
};
