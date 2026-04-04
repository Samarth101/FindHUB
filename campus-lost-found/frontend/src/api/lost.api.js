import http from './http';

export const lostApi = {
  create:     (data) => http.post('/lost', data),
  getAll:     (params) => http.get('/lost', { params }),
  getMine:    (params) => http.get('/lost/mine', { params }),
  getById:    (id) => http.get(`/lost/${id}`),
  update:     (id, data) => http.put(`/lost/${id}`, data),
  delete:     (id) => http.delete(`/lost/${id}`),
  uploadImage:(id, formData) => http.post(`/lost/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default lostApi;
