import axios from 'axios';

// Simple API URL configuration
const getApiUrl = () => {
  // Production: use Netlify functions via API redirects
  if (typeof window !== 'undefined' && (
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('hatoname')
  )) {
    return '/api';
  }
  
  // Development: use mock data for now since server has issues
  return '/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error interceptor for better debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      baseURL: API_URL,
    });
    return Promise.reject(error);
  }
);

// Events
export const getEvents = () => api.get('/events');
export const getEvent = (id) => api.get(`/events?id=${id}`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events?id=${id}`, data);
export const deleteEvent = (id) => api.delete(`/events?id=${id}`);

// Guests
export const getGuests = (eventId) => api.get(`/guests?event_id=${eventId}`);
export const getGuest = (id) => api.get(`/guests?id=${id}`);
export const createGuest = (data) => api.post('/guests', data);
export const updateGuest = (id, data) => api.put(`/guests?id=${id}`, data);
export const deleteGuest = (id) => api.delete(`/guests?id=${id}`);
export const updateRSVP = (id, data) => api.put(`/guests?id=${id}`, { ...data, rsvp_status: data.status });

// Tables
export const getTables = (eventId) => api.get(`/tables/event/${eventId}`);
export const getTableArrangement = (eventId) => api.get(`/tables/event/${eventId}/arrangement`);
export const arrangeTables = (eventId, data) => api.post(`/tables/event/${eventId}/arrange`, data);
export const createTable = (eventId, data) => api.post(`/tables/event/${eventId}`, data);
export const deleteTable = (id) => api.delete(`/tables/${id}`);

// Excel
export const uploadExcel = (eventId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/excel/upload/${eventId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Invitations
export const uploadInvitation = (eventId, file, text, position) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('text', text);
  formData.append('position', position);
  return api.post(`/invitations/upload/${eventId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getInvitation = (eventId) => api.get(`/invitations/event/${eventId}`);
export const getInvitationImage = (id) => `${API_URL}/invitations/image/${id}`;

// WhatsApp
export const getWhatsAppStatus = () => api.get('/whatsapp/status');
export const sendWhatsAppMessage = (eventId, guestId) => api.post(`/whatsapp/send/${eventId}/${guestId}`);
export const sendBulkWhatsApp = (eventId, data) => api.post(`/whatsapp/send-bulk/${eventId}`, data);
export const submitRSVP = (eventId, guestId, data) => api.post(`/whatsapp/rsvp/${eventId}/${guestId}`, data);

export default api;

