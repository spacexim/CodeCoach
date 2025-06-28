// frontend/src/store.ts
import { create } from "zustand";

// --- 类型定义 ---
export interface Message {
  sender: "user" | "ai";
  text: string;
}

// --- 学习阶段的定义 (已优化) ---
// 1. 定义一个常量数组作为“单一事实来源”
export const learning_stages = [
  "problem_analysis",
  "solution_design",
  "implementation",
  "testing_refinement",
  "reflection",
] as const;

// 2. 从常量数组中自动推断出 Stage 类型
export type Stage = (typeof learning_stages)[number];

export interface Challenge {
  challenge: string;
  correctAnswer: string;
  explanation: string;
}

// --- Store 的 State 结构 (修正版) ---
interface AppState {
  // 状态 (State)
  sessionId: string | null;
  currentStage: Stage;
  language: string;
  skillLevel: string;
  problem: string;
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  challenge: Challenge | null;

  // 修改状态的函数 (Actions)
  setSession: (sessionData: {
    sessionId: string;
    initialMessage: Message;
    problem: string;
    language: string;
    skillLevel: string;
  }) => void;
  addMessage: (message: Message) => void;
  appendStreamChunk: (chunk: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setCurrentStage: (stage: Stage) => void;
  setError: (error: string | null) => void;
  setChallenge: (challenge: Challenge | null) => void;
  resetSession: () => void;
}

// --- 创建 Store (修正版) ---
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  sessionId: null,
  currentStage: "problem_analysis",
  language: "Python",
  skillLevel: "intermediate",
  problem: "",
  messages: [],
  isStreaming: false,
  error: null,
  challenge: null,

  // Actions 的具体实现
  setSession: ({ sessionId, initialMessage, problem, language, skillLevel }) =>
    set({
      sessionId: sessionId,
      messages: [initialMessage],
      problem: problem,
      language: language,
      skillLevel: skillLevel,
      currentStage: "problem_analysis",
      error: null,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  appendStreamChunk: (chunk) =>
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage?.sender === "ai") {
        const updatedMessage = {
          ...lastMessage,
          text: lastMessage.text + chunk,
        };
        return { messages: [...state.messages.slice(0, -1), updatedMessage] };
      } else {
        return { messages: [...state.messages, { sender: "ai", text: chunk }] };
      }
    }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setCurrentStage: (stage) => set({ currentStage: stage }),

  setError: (error) => set({ error }),

  setChallenge: (challenge) => set({ challenge }),

  resetSession: () =>
    set({
      sessionId: null,
      currentStage: "problem_analysis",
      language: "Python",
      skillLevel: "intermediate",
      problem: "",
      messages: [],
      isStreaming: false,
      error: null,
      challenge: null,
    }),
}));
