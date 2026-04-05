import http from './http';

export const claimsApi = {
  create:       (data) => http.post('/claims', data),
  getMine:      (params) => http.get('/claims/mine', { params }),
  getById:      (id) => http.get(`/claims/${id}`),
  submitAnswers:(id, answers) => http.post(`/claims/${id}/verify`, { answers }),
  getQuestions: (matchId) => http.get(`/claims/questions/${matchId}`),

  /* Admin */
  getAll:       (params) => http.get('/claims', { params }),
  approve:      (id) => http.patch(`/claims/${id}/approve`),
  reject:       (id) => http.patch(`/claims/${id}/reject`),
};

export default claimsApi;
