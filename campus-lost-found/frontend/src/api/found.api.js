import http from './http';

export const foundApi = {
  /* Student: submit only */
  create: (data) => http.post('/found', data),
  uploadImage: (id, formData) => http.post(`/found/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /* Admin-only */
  getAll:   (params) => http.get('/found', { params }),
  getById:  (id) => http.get(`/found/${id}`),
  update:   (id, data) => http.put(`/found/${id}`, data),
  delete:   (id) => http.delete(`/found/${id}`),
};

export default foundApi;
