import http from './http';

export const authApi = {
  login:    (data) => http.post('/auth/login', data),
  register: (data) => http.post('/auth/register', data),
  me:       ()     => http.get('/auth/me'),
  logout:   ()     => http.post('/auth/logout'),
};

export default authApi;
