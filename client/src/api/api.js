const API_BASE = 'https://codeasses-api.up.railway.app/api';

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
    submit: (data) => fetchWithAuth('/submit', { method: 'POST', body: JSON.stringify(data) })
  }
};
