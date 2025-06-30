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
  learningCompleted: boolean; // 新增：标记学习是否已完成
  sidebarCollapsed: boolean; // 新增：侧边栏收起状态
  rightPanelCollapsed: boolean; // 新增：右侧面板收起状态

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
  toggleSidebar: () => void; // 新增：切换侧边栏状态
  toggleRightPanel: () => void; // 新增：切换右侧面板状态
  getCodeFeedback: (code: string) => Promise<void>; // 新增：获取代码反馈
  completeLearning: () => Promise<void>; // 新增：完成学习
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
  learningCompleted: false, // 新增：初始为未完成
  sidebarCollapsed: false, // 新增：侧边栏初始为展开状态
  rightPanelCollapsed: false, // 修改：右侧面板初始为展开状态

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

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })), // 新增

  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })), // 新增

  getCodeFeedback: async (code: string) => {
    const state = useAppStore.getState();
    if (!state.sessionId) {
      set({ error: "会话未找到，请重新开始" });
      return;
    }

    try {
      set({ isStreaming: true, error: null });

      // 先在聊天窗口显示用户提交的代码
      const userMessage: Message = {
        sender: "user",
        text: `我已经完成了代码，请给我一些反馈：\n\`\`\`${state.language.toLowerCase()}\n${code}\n\`\`\``,
      };
      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      const response = await fetch(
        `http://localhost:8000/api/session/${state.sessionId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // 添加AI反馈消息
        const aiMessage: Message = {
          sender: "ai",
          text: data.feedback,
        };
        set((state) => ({
          messages: [...state.messages, aiMessage],
          isStreaming: false,
        }));
      } else {
        throw new Error("获取代码反馈失败");
      }
    } catch (error) {
      console.error("获取代码反馈时出错:", error);
      set({
        error: error instanceof Error ? error.message : "获取代码反馈时出错",
        isStreaming: false,
      });
    }
  },

  completeLearning: async () => {
    const state = useAppStore.getState();
    if (!state.sessionId) {
      set({ error: "会话未找到，请重新开始" });
      return;
    }

    try {
      set({ isStreaming: true, error: null });

      const response = await fetch(
        `http://localhost:8000/api/session/${state.sessionId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // 添加学习总结消息
        const summaryMessage: Message = {
          sender: "ai",
          text: data.summary,
        };
        set((state) => ({
          messages: [...state.messages, summaryMessage],
          isStreaming: false,
          learningCompleted: true, // 标记学习已完成
        }));
      } else {
        throw new Error(data.message || "完成学习失败");
      }
    } catch (error) {
      console.error("完成学习时出错:", error);
      set({
        error: error instanceof Error ? error.message : "完成学习时出错",
        isStreaming: false,
      });
    }
  },

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
      learningCompleted: false, // 重置学习状态
      sidebarCollapsed: false, // 重置侧边栏状态
      rightPanelCollapsed: false, // 修改：重置右侧面板为展开状态
    }),
}));
