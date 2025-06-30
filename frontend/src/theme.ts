// frontend/src/theme.ts
// Claude风格主题配置 - 定义CSS自定义属性
export const claudeColors = {
  // Claude主色调 - 温暖的橙色系
  primary: "#FF6B35",
  primaryHover: "#EA580C",
  primaryLight: "#FFF8F1",
  primaryLighter: "#FEECDC",

  // 背景色系
  bgPrimary: "#FAFAFA",
  bgSecondary: "#FFFFFF",
  bgTertiary: "#F5F5F5",

  // 文字色系
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // 边框色系
  borderLight: "#E5E7EB",
  borderMedium: "#D1D5DB",
  borderDark: "#9CA3AF",

  // 状态色
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

// 将颜色应用到CSS变量
export const applyClaudeTheme = () => {
  const root = document.documentElement;
  Object.entries(claudeColors).forEach(([key, value]) => {
    root.style.setProperty(`--claude-${key}`, value);
  });
};

export default claudeColors;
