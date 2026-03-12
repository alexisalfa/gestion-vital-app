import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gestion-vital-app.onrender.com/api/v1', // <--- Único lugar donde se define
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;