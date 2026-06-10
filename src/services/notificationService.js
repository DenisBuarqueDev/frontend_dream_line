import { getAuthHeaders } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function apiCall(method, path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  return data;
}

export async function registerFCMToken(token) {
  return apiCall('POST', '/api/notifications/register-token', { token });
}

export async function unregisterFCMToken() {
  return apiCall('POST', '/api/notifications/unregister-token');
}

export async function updateNotificationSettings(settings) {
  return apiCall('PUT', '/api/notifications/settings', settings);
}

export async function getNotificationSettings() {
  return apiCall('GET', '/api/notifications/settings');
}

export async function sendTestNotification() {
  return apiCall('POST', '/api/notifications/test');
}
