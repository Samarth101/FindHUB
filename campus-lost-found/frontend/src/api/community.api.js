import http from './http';

export const communityApi = {
  getAll:      (params) => http.get('/community', { params }),
  getById:     (id) => http.get(`/community/${id}`),
  create:      (data) => http.post('/community', data),
  addReply:    (id, data) => http.post(`/community/${id}/replies`, data),
  getReplies:  (id, params) => http.get(`/community/${id}/replies`, { params }),
  upvoteReply: (threadId, replyId) => http.patch(`/community/${threadId}/replies/${replyId}/upvote`),
  downvoteReply:(threadId, replyId) => http.patch(`/community/${threadId}/replies/${replyId}/downvote`),
  delete:      (id) => http.delete(`/community/${id}`),
  flag:        (id) => http.patch(`/community/${id}/flag`),
};

export default communityApi;
