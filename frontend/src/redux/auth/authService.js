import axios from 'axios';

// URL base da API
const API_URL = '/api/auth';

// Função para definir o token no cabeçalho de autorização
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Registrar usuário
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);

  if (response.data.token) {
    setAuthToken(response.data.token);
  }

  return response.data;
};

// Login de usuário
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data.token) {
    setAuthToken(response.data.token);
  }

  return response.data;
};

// Obter dados do usuário atual
const getMe = async () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    setAuthToken(token);
  }
  
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

// Atualizar senha
const updatePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/update-password`, passwordData);
  return response.data;
};

// Atualizar perfil
const updateProfile = async (profileData) => {
  const response = await axios.put(`/api/users/profile`, profileData);
  return response.data;
};

// Logout
const logout = async () => {
  // Limpar token do localStorage e dos headers
  setAuthToken(null);
  
  // Opcional: notificar o servidor sobre o logout
  try {
    await axios.post(`${API_URL}/logout`);
  } catch (error) {
    console.error('Erro ao fazer logout no servidor:', error);
  }
};

// Solicitar redefinição de senha
const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

// Redefinir senha
const resetPassword = async (token, password) => {
  const response = await axios.put(`${API_URL}/reset-password/${token}`, {
    password,
  });
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
  updatePassword,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
};

export default authService;