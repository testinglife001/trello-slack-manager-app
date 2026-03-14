import axios from './axios';

const cardApi = {
  getByProject: (projectId) => axios.get(`/cards/project/${projectId}`),
  getOne: (id) => axios.get(`/cards/${id}`),
  getActivity: (id) => axios.get(`/cards/${id}/activity`),
  create: (data) => axios.post('/cards', data),
  update: (id, data) => axios.put(`/cards/${id}`, data),
  delete: (id) => axios.delete(`/cards/${id}`),
  reorder: (cards) => axios.put('/cards/reorder', { cards }),
  toggleTimer: (id) => axios.post(`/cards/${id}/toggle-timer`),
};

export default cardApi;
