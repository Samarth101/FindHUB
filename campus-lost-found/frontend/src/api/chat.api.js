import http from './http';

export const chatApi = {
  getRooms:   (params) => http.get('/chat/rooms', { params }),
  getRoom:    (id) => http.get(`/chat/rooms/${id}`),
  getMessages:(roomId, params) => http.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage:(roomId, data) => http.post(`/chat/rooms/${roomId}/messages`, data),
  markRead:   (roomId) => http.patch(`/chat/rooms/${roomId}/read`),
};

export default chatApi;
