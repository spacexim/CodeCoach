// API configuration for different environments
const getApiBaseUrl = () => {
  // 生产环境 - 使用 Vercel 代理（相对路径）
  if (!import.meta.env.DEV) {
    return ""; // 空字符串表示使用相对路径，通过 Vercel 代理
  }

  // 检查是否有环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 开发环境 - 检查是否在 Codespace 中
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("github.dev")) {
      // Codespace 环境：将前端端口 5173 替换为后端端口 8000
      return window.location.origin.replace("-5173", "-8000");
    }
  }

  // 本地开发环境
  return "http://localhost:8000";
};

const API_BASE_URL = getApiBaseUrl();

console.log("🔧 API_BASE_URL:", API_BASE_URL); // 调试信息

export { API_BASE_URL };
