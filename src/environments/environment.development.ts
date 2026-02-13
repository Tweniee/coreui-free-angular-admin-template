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
    length: 4,
    resendTimeout: 30, // seconds
  },
  validation: {
    phoneRegex: /^(?:(?:\+|0{0,2})91[\-\s]?)?[6-9]\d{9}$/,
    phoneMinLength: 10,
    phoneMaxLength: 13,
  },
  app: {
    name: 'CoreUI Admin (Dev)',
    version: '1.0.0-dev',
  },
};
