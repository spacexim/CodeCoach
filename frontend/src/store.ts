// fronte// --- Learning Stage Definitions (Optimized) ---
// 1. Define a constant array as "single source of truth"/src/store.ts
import { create } from "zustand";

// --- Type Definitions ---
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

// 2. Automatically infer Stage type from the constant array
export type Stage = (typeof learning_stages)[number];

export interface Challenge {
  challenge: string;
  correctAnswer: string;
  explanation: string;
}

// --- Store State Structure (Revised) ---
interface AppState {
  // State
  sessionId: string | null;
  currentStage: Stage;
  language: string;
  skillLevel: string;
  problem: string;
  messages: Message[];
  isStreaming: boolean;
  isInitializing: boolean; // New: transition state from submission to first AI response
  error: string | null;
  challenge: Challenge | null;
  learningCompleted: boolean; // New: mark whether learning is completed
  sidebarCollapsed: boolean; // New: sidebar collapse state
  rightPanelCollapsed: boolean; // New: right panel collapse state

  // State-modifying functions (Actions)
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
  }) => void; // New: only set session info, don't set initial message
  addMessage: (message: Message) => void;
  appendStreamChunk: (chunk: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsInitializing: (isInitializing: boolean) => void; // New
  setCurrentStage: (stage: Stage) => void;
  setError: (error: string | null) => void;
  setChallenge: (challenge: Challenge | null) => void;
  toggleSidebar: () => void; // New: toggle sidebar state
  toggleRightPanel: () => void; // New: toggle right panel state
  getCodeFeedback: (code: string) => Promise<void>; // New: get code feedback
  completeLearning: () => Promise<void>; // New: complete learning
  resetSession: () => void;
}

// --- Create Store (Revised) ---
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  sessionId: null,
  currentStage: "problem_analysis",
  language: "Python",
  skillLevel: "intermediate",
  problem: "",
  messages: [],
  isStreaming: false,
  isInitializing: false, // New initial state
  error: null,
  challenge: null,
  learningCompleted: false, // New: initially incomplete
  sidebarCollapsed: false, // New: sidebar initially expanded
  rightPanelCollapsed: false, // Modified: right panel initially expanded

  // Actions implementation
  setSession: ({ sessionId, initialMessage, problem, language, skillLevel }) =>
    set({
      sessionId: sessionId,
      messages: [initialMessage],
      problem: problem,
      language: language,
      skillLevel: skillLevel,
      currentStage: "problem_analysis",
      error: null,
      isInitializing: false, // End initialization state when setting initial message
    }),

  setSessionInfo: ({ sessionId, problem, language, skillLevel }) =>
    set({
      sessionId: sessionId,
      messages: [], // Empty message list, waiting for AI response
      problem: problem,
      language: language,
      skillLevel: skillLevel,
      currentStage: "problem_analysis",
      error: null,
      isInitializing: true, // Set to initialization state
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

  setIsInitializing: (isInitializing) => set({ isInitializing }), // New

  setCurrentStage: (stage) => set({ currentStage: stage }),

  setError: (error) => set({ error }),

  setChallenge: (challenge) => set({ challenge }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })), // New

  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })), // New

  getCodeFeedback: async (code: string) => {
    const state = useAppStore.getState();
    if (!state.sessionId) {
      set({ error: "Session not found, please restart" });
      return;
    }

    try {
      set({ isStreaming: true, error: null });

      // First display user's submitted code in chat window
      const userMessage: Message = {
        sender: "user",
        text: `I have completed the code, please give me some feedback:\n\`\`\`${state.language.toLowerCase()}\n${code}\n\`\`\``,
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
        // Add AI feedback message
        const aiMessage: Message = {
          sender: "ai",
          text: data.feedback,
        };
        set((state) => ({
          messages: [...state.messages, aiMessage],
          isStreaming: false,
        }));
      } else {
        throw new Error("Failed to get code feedback");
      }
    } catch (error) {
      console.error("Error getting code feedback:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error getting code feedback",
        isStreaming: false,
      });
    }
  },

  completeLearning: async () => {
    const state = useAppStore.getState();
    if (!state.sessionId) {
      set({ error: "Session not found, please restart" });
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
        // Add learning summary message
        const summaryMessage: Message = {
          sender: "ai",
          text: data.summary,
        };
        set((state) => ({
          messages: [...state.messages, summaryMessage],
          isStreaming: false,
          learningCompleted: true, // Mark learning as completed
        }));
      } else {
        throw new Error(data.message || "Failed to complete learning");
      }
    } catch (error) {
      console.error("Error completing learning:", error);
      set({
        error:
          error instanceof Error ? error.message : "Error completing learning",
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
