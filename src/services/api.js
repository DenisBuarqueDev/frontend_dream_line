const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erro na requisição');
    }
    return data;
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || 'Erro desconhecido');
  }

  // Se veio HTML onde esperávamos JSON, é um erro de roteamento
  if (contentType && contentType.includes('text/html')) {
    throw new Error('API indisponível: servidor retornou HTML');
  }

  return text;
};

export async function login(email, password, recaptchaToken) {
  const url = `${API_BASE_URL}/api/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, recaptchaToken }),
  });

  return await handleResponse(response);
}

export async function register(email, password, recaptchaToken) {
  const url = `${API_BASE_URL}/api/auth/register`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, recaptchaToken }),
  });

  return await handleResponse(response);
}

export async function verifyEmail(token) {
  const url = `${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const response = await fetch(url, {
    method: 'GET',
  });

  return await handleResponse(response);
}

export async function forgotPassword(email) {
  const url = `${API_BASE_URL}/api/auth/forgot-password`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return await handleResponse(response);
}

export async function validateResetToken(token) {
  const url = `${API_BASE_URL}/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`;

  const response = await fetch(url);

  return await handleResponse(response);
}

export async function resetPassword(token, password) {
  const url = `${API_BASE_URL}/api/auth/reset-password`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  return await handleResponse(response);
}

export async function resendVerification(email) {
  const url = `${API_BASE_URL}/api/auth/resend-verification`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return await handleResponse(response);
}

export async function saveDream(dreamData) {
  const url = `${API_BASE_URL}/api/dreams`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dreamData),
  });

  return await handleResponse(response);
}

export async function getDreams(page = 1, limit = 20) {
  const url = `${API_BASE_URL}/api/dreams?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function deleteDream(dreamId) {
  const url = `${API_BASE_URL}/api/dreams/${dreamId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function searchDreamsByDate(startDate, endDate) {
  const url = `${API_BASE_URL}/api/dreams/search?startDate=${startDate}&endDate=${endDate}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function generateDreamImage(dreamId, imageUrl, imagePublicId) {
  const url = `${API_BASE_URL}/api/dreams/${dreamId}/image`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageUrl, imagePublicId }),
  });

  return await handleResponse(response);
}

export async function getCurrentPlan() {
  const url = `${API_BASE_URL}/api/users/plan`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function generateAstralChart(chartData) {
  const url = `${API_BASE_URL}/api/astral-charts/generate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(chartData),
  });

  return await handleResponse(response);
}

export async function getAstralCharts() {
  const url = `${API_BASE_URL}/api/astral-charts`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getAstralChartById(chartId) {
  const url = `${API_BASE_URL}/api/astral-charts/${chartId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function deleteAstralChart(chartId) {
  const url = `${API_BASE_URL}/api/astral-charts/${chartId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

const MIME_TO_EXT = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
};

export async function transcribeAudio(audioBlob, signal) {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  const baseType = audioBlob.type.split(';')[0].trim();
  const ext = MIME_TO_EXT[baseType] || 'webm';
  formData.append('audio', audioBlob, `dream-recording.${ext}`);

  const response = await fetch(`${API_BASE_URL}/api/transcribe-audio`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    signal,
  });

  return await handleResponse(response);
}

export async function interpretDreamWithAI(dreamText, options = {}) {
  const url = `${API_BASE_URL}/api/ai/interpret`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      dreamText,
      generateImage: options.generateImage || false,
      psychologicalAnalysis: options.psychologicalAnalysis || false,
      sunSign: options.sunSign,
      moonSign: options.moonSign,
      ascendant: options.ascendant,
    }),
    signal: options.signal,
  });

  return await handleResponse(response);
}

export async function generateDreamImageWithAI(dreamId) {
  const url = `${API_BASE_URL}/api/dreams/${dreamId}/image`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  });

  return await handleResponse(response);
}

export async function createCheckout() {
  const url = `${API_BASE_URL}/api/subscription/create-checkout`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getSubscriptionStatus() {
  const url = `${API_BASE_URL}/api/subscription/status`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getAIGatewayStatus() {
  const url = `${API_BASE_URL}/api/ai/status`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function createEmotion(text) {
  const url = `${API_BASE_URL}/api/emotions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  return await handleResponse(response);
}

export async function getEmotions(page = 1, limit = 20) {
  const url = `${API_BASE_URL}/api/emotions?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getEmotionById(emotionId) {
  const url = `${API_BASE_URL}/api/emotions/${emotionId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function deleteEmotion(emotionId) {
  const url = `${API_BASE_URL}/api/emotions/${emotionId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function sendEmotionChatMessage(emotionId, message) {
  const url = `${API_BASE_URL}/api/emotions/${emotionId}/chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  return await handleResponse(response);
}

export async function getEmotionConversation(emotionId) {
  const url = `${API_BASE_URL}/api/emotions/${emotionId}/chat`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getEmotionInsights() {
  const url = `${API_BASE_URL}/api/emotions/insights`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getEmotionStats() {
  const url = `${API_BASE_URL}/api/emotions/stats`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getDreamEmotionCorrelations(days = 30) {
  const url = `${API_BASE_URL}/api/insights/correlations?days=${days}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function generateNameNumerology(fullName, birthDate) {
  const url = `${API_BASE_URL}/api/numerology-name/generate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ fullName, birthDate }),
  });

  return await handleResponse(response);
}

export async function getNameNumerologyList(page = 1, limit = 20) {
  const url = `${API_BASE_URL}/api/numerology-name?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}

export async function getNameNumerologyRemaining() {
  const url = `${API_BASE_URL}/api/numerology-name/remaining`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}
