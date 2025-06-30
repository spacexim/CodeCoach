// Claude风格图标组件

interface IconProps {
  size?: number;
  color?: string;
}

export const WriteIcon = ({ size = 16, color = "#6B7280" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M11.5 1.5a2.121 2.121 0 013 3L6 13l-4 1 1-4 8.5-8.5z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LearnIcon = ({ size = 16, color = "#6B7280" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M14 8.5a6.5 6.5 0 11-13 0V6a1 1 0 011-1h10a1 1 0 011 1v2.5z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 2v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CodeIcon = ({ size = 16, color = "#6B7280" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="m5 11-3-3 3-3M11 5l3 3-3 3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LifeIcon = ({ size = 16, color = "#6B7280" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <path
      d="M8 5v3l2 2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChoiceIcon = ({ size = 16, color = "#6B7280" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
