// API Configuration - Automatikus környezet detektálás
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const API_URL = isProduction 
  ? (process.env.REACT_APP_API_URL || 'https://api.ingatlan-projekt.com')
  : 'https://api.ingatlan-projekt.com';

export const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400x300?text=Nincs+kép';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

export const ENV = {
  isDevelopment,
  isProduction,
  apiUrl: API_URL,
};

console.log('🔧 API Config loaded:', ENV);
