import http from './http';

export const notificationsApi = {
  getAll:    (params) => http.get('/notifications', { params }),
  markRead:  (id) => http.patch(`/notifications/${id}/read`),
  markAllRead:() => http.patch('/notifications/read-all'),
  getUnreadCount:() => http.get('/notifications/unread-count'),
};

export default notificationsApi;
