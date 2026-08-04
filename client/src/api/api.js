const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || response.statusText);
  }
  
  return response.json();
};

const fetchBlobWithAuth = async (url) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || response.statusText);
  }

  return response.blob();
};

export const api = {
  auth: {
    login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  },
  problems: {
    getAll: () => fetchWithAuth('/problems'),
    getBySlug: (slug) => fetchWithAuth(`/problems/${slug}`),
  },
  submissions: {
    run: (data) => fetchWithAuth('/run', { method: 'POST', body: JSON.stringify(data) }),
    submit: (data) => fetchWithAuth('/submit', { method: 'POST', body: JSON.stringify(data) }),
    getAttempt: (problemId) => fetchWithAuth(`/attempt/${problemId}`),
    recordOffense: (data) => fetchWithAuth('/offense', { method: 'POST', body: JSON.stringify(data) }),
    downloadPdf: (userId) => fetchBlobWithAuth(`/results/${userId}/pdf`),
  },
  admin: {
    getAllResults: () => fetchWithAuth('/admin/results'),
    downloadExcel: () => fetchBlobWithAuth('/admin/results/excel'),
    downloadPdfForUser: (userId) => fetchBlobWithAuth(`/admin/results/${userId}/pdf`),
  }
};
