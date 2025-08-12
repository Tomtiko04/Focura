export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const API_ROUTES = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me'
  },
  tasks: {
    create: '/api/tasks/create',
    list: '/api/tasks',
    ocr: '/api/tasks/ocr'
  }
};


