const getApiBaseUrl = () => {
  // 暂时直接使用后端 URL，绕过代理问题
  return "https://spacexim.pythonanywhere.com";

  // 原来的逻辑先注释掉
  /*
  if (import.meta.env.PROD) {
    return '';
  }
  
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    const hostname = window.location.hostname;
    return `https://${hostname.replace('-5173', '-8000')}`;
  }
  
  return 'http://localhost:8000';
  */
};

export const API_BASE_URL = getApiBaseUrl();
