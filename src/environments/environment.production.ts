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
  validation: {
    phoneRegex: /^(?:(?:\+|0{0,2})91[\-\s]?)?[6-9]\d{9}$/,
    phoneMinLength: 10,
    phoneMaxLength: 13,
  },
  app: {
    name: 'CoreUI Admin',
    version: '1.0.0',
  },
};
