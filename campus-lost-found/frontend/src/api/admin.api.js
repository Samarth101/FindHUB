import http from './http';

export const adminApi = {
  getStats:         () => http.get('/admin/stats'),
  getUsers:         (params) => http.get('/admin/users', { params }),
  getUserById:      (id) => http.get(`/admin/users/${id}`),
  banUser:          (id) => http.patch(`/admin/users/${id}/ban`),
  unbanUser:        (id) => http.patch(`/admin/users/${id}/unban`),
  getFlaggedContent:(params) => http.get('/admin/flagged', { params }),
  resolveFlag:      (id, action) => http.patch(`/admin/flagged/${id}`, { action }),
  getAuditLogs:     (params) => http.get('/admin/audit-logs', { params }),
  getAnalytics:     (params) => http.get('/admin/analytics', { params }),
  getChatLogs:      (params) => http.get('/admin/chat-logs', { params }),
};

export default adminApi;
