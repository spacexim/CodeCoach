// frontend/src/theme.ts
// Claude-style theme configuration - Define CSS custom properties
export const claudeColors = {
  // Claude primary colors - Warm orange tones
  primary: "#FF6B35",
  primaryHover: "#EA580C",
  primaryLight: "#FFF8F1",
  primaryLighter: "#FEECDC",

  // Background colors
  bgPrimary: "#FAFAFA",
  bgSecondary: "#FFFFFF",
  bgTertiary: "#F5F5F5",

  // Text colors
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Border colors
  borderLight: "#E5E7EB",
  borderMedium: "#D1D5DB",
  borderDark: "#9CA3AF",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

// Apply colors to CSS variables
export const applyClaudeTheme = () => {
  const root = document.documentElement;
  Object.entries(claudeColors).forEach(([key, value]) => {
    root.style.setProperty(`--claude-${key}`, value);
  });
};

export default claudeColors;
