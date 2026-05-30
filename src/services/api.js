const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
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
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'Erro desconhecido');
    }
    return text;
  }
};

export async function login(email, password) {
  const url = `${API_BASE_URL}/api/auth/login`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return await handleResponse(response);
}

export async function register(email, password) {
  const url = `${API_BASE_URL}/api/auth/register`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
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

export async function getDreams() {
  const url = `${API_BASE_URL}/api/dreams`;

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

export async function upgradePlan(plan) {
  const url = `${API_BASE_URL}/api/users/upgrade`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ plan }),
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

export async function getAIGatewayStatus() {
  const url = `${API_BASE_URL}/api/ai/status`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return await handleResponse(response);
}
