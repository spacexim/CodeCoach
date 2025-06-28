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
  isInitializing: boolean; // 新增：从提交到AI首次响应的过渡状态
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
  setSessionInfo: (sessionData: {
    sessionId: string;
    problem: string;
    language: string;
    skillLevel: string;
  }) => void; // 新增：只设置session信息，不设置初始消息
  addMessage: (message: Message) => void;
  appendStreamChunk: (chunk: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsInitializing: (isInitializing: boolean) => void; // 新增
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
  isInitializing: false, // 新增初始状态
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
      isInitializing: false, // 设置初始消息时结束初始化状态
    }),

  setSessionInfo: ({ sessionId, problem, language, skillLevel }) =>
    set({
      sessionId: sessionId,
      messages: [], // 空消息列表，等待AI响应
      problem: problem,
      language: language,
      skillLevel: skillLevel,
      currentStage: "problem_analysis",
      error: null,
      isInitializing: true, // 设置为初始化状态
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

  setIsInitializing: (isInitializing) => set({ isInitializing }), // 新增

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
      isInitializing: false, // 新增重置状态
      error: null,
      challenge: null,
    }),
}));
