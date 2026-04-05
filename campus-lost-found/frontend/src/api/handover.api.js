import http from './http';

export const handoverApi = {
  schedule: (data) => http.post('/handover', data),
  getMine:  (params) => http.get('/handover/mine', { params }),
  getById:  (id) => http.get(`/handover/${id}`),
  confirm:  (id) => http.patch(`/handover/${id}/confirm`),
  cancel:   (id) => http.patch(`/handover/${id}/cancel`),

  /* Admin */
  getAll:   (params) => http.get('/handover', { params }),
};

export default handoverApi;
