import React, { useState } from "react";
import { useAppStore } from "./store";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import CodeImplementation from "./components/CodeImplementation";
import ChallengeModal from "./components/ChallengeModal";
import { Box, Flex, Text, Button, Textarea } from "@chakra-ui/react";

function App() {
  const sessionId = useAppStore((state) => state.sessionId);
  const currentStage = useAppStore((state) => state.currentStage);
  const {
    setSession,
    addMessage,
    appendStreamChunk,
    setIsStreaming,
    setError,
  } = useAppStore();
  const ws = React.useRef<WebSocket | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState("Python");
  const [skillLevel, setSkillLevel] = useState("中级");

  const connectWebSocket = (newSessionId: string) => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${newSessionId}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chunk") {
        setIsStreaming(true);
        appendStreamChunk(data.content);
      } else if (data.type === "end") {
        setIsStreaming(false);
      } else if (data.type === "error") {
        setError(data.content);
        setIsStreaming(false);
      }
    };
  };

  const handleStartSession = async (
    problem: string,
    language: string,
    skillLevel: string,
    model: string
  ) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/start_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, language, skillLevel, model }),
      });
      if (!response.ok)
        throw new Error((await response.json()).detail || "服务器错误");
      const data = await response.json();
      if (data.success) {
        setSession({
          sessionId: data.sessionId,
          initialMessage: { sender: "ai", text: data.message },
          problem,
          language,
          skillLevel,
        });
        connectWebSocket(data.sessionId);
      } else {
        setError(data.error || "启动失败");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "无法连接到后端服务";
      setError(errorMessage);
    }
  };

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && ws.current?.readyState === WebSocket.OPEN) {
      addMessage({ sender: "user", text: messageText });
      ws.current.send(messageText);
      setIsStreaming(true);
    }
  };

  if (!sessionId) {
    return (
      <Box
        minH="100vh"
        bg="linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #fafafa 100%)"
        position="relative"
        overflow="hidden"
      >
        {/* 更精致的背景装饰 */}
        <Box
          position="absolute"
          top="-10%"
          left="-5%"
          w="600px"
          h="600px"
          bg="radial-gradient(ellipse at center, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 35%, transparent 70%)"
          borderRadius="full"
          filter="blur(80px)"
          zIndex={0}
          animation="float 20s ease-in-out infinite"
        />
        <Box
          position="absolute"
          bottom="-15%"
          right="-10%"
          w="800px"
          h="800px"
          bg="radial-gradient(ellipse at center, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0.015) 40%, transparent 70%)"
          borderRadius="full"
          filter="blur(100px)"
          zIndex={0}
          animation="float 25s ease-in-out infinite reverse"
        />

        {/* 添加微妙的网格背景 */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.4}
          backgroundImage="radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)"
          backgroundSize="24px 24px"
          zIndex={0}
        />

        <Flex h="100vh">
          <Sidebar />
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            px={8}
            position="relative"
            maxW="100%"
            overflow="hidden"
            zIndex={1}
          >
            {/* 右上角模型选择 - 更精致的设计 */}
            <Box position="absolute" top={6} right={6} zIndex={10}>
              <Box
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  inset: "-2px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
                _hover={{
                  _before: {
                    opacity: 1,
                  },
                }}
              >
                <select
                  style={{
                    padding: "12px 18px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: "600",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    position: "relative",
                    zIndex: 1,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f97316";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(249, 115, 22, 0.1), 0 8px 32px rgba(0, 0, 0, 0.12)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow =
                      "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)";
                    e.target.style.transform = "translateY(0px)";
                  }}
                >
                  <option>Claude Sonnet 4</option>
                  <option>GPT-4o</option>
                  <option>DeepSeek R1</option>
                </select>
              </Box>
            </Box>

            {/* Claude风格的中心内容 */}
            <Box
              textAlign="center"
              mb={8}
              maxW="1000px"
              zIndex={1}
              position="relative"
              px={4}
            >
              <Box mb={8}>
                <Text
                  fontSize={{ base: "36px", md: "52px", lg: "64px" }}
                  fontWeight="200"
                  color="#0f172a"
                  mb={4}
                  letterSpacing="-0.03em"
                  lineHeight="0.95"
                  fontFamily="system-ui, -apple-system, 'Segoe UI', 'SF Pro Display', sans-serif"
                  position="relative"
                  _after={{
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    w: "60px",
                    h: "2px",
                    bg: "linear-gradient(90deg, transparent, #f97316, transparent)",
                    borderRadius: "full",
                  }}
                >
                  Good evening, 学习者
                </Text>
                <Text
                  fontSize="24px"
                  color="#374151"
                  mb={16}
                  fontWeight="400"
                  letterSpacing="-0.02em"
                  lineHeight="1.4"
                >
                  How can I help you today?
                </Text>
              </Box>

              {/* 输入框 */}
              <Box position="relative" maxW="800px" mx="auto" mb={12}>
                <Box
                  position="relative"
                  border="2px solid"
                  borderColor="#e2e8f0"
                  borderRadius="12px"
                  bg="white"
                  _focusWithin={{
                    borderColor: "#ff6b35",
                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
                  }}
                >
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="今天想学什么编程概念？比如：如何实现一个栈？"
                    w="100%"
                    minH="120px"
                    p={4}
                    pr={16}
                    border="none"
                    borderRadius="12px"
                    fontSize="16px"
                    resize="none"
                    outline="none"
                    bg="transparent"
                    color="#1e293b"
                    _placeholder={{
                      color: "#9ca3af",
                    }}
                    _focus={{
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />
                  <Button
                    position="absolute"
                    bottom={3}
                    right={3}
                    w="40px"
                    h="40px"
                    bg={inputValue.trim() ? "#ff6b35" : "#e5e7eb"}
                    color="white"
                    borderRadius="8px"
                    minW="40px"
                    fontSize="18px"
                    disabled={!inputValue.trim()}
                    _hover={{
                      bg: inputValue.trim() ? "#e55a2e" : "#e5e7eb",
                      transform: inputValue.trim() ? "scale(1.05)" : "none",
                    }}
                    onClick={() => {
                      if (inputValue.trim()) {
                        handleStartSession(
                          inputValue,
                          language,
                          skillLevel === "中级"
                            ? "intermediate"
                            : skillLevel === "初学者"
                            ? "beginner"
                            : "advanced",
                          "anthropic/claude-3.7-sonnet"
                        );
                      }
                    }}
                  >
                    ↗
                  </Button>
                </Box>
              </Box>

              {/* 更精致的功能按钮 */}
              <Box
                display="flex"
                gap={4}
                justifyContent="center"
                flexWrap="wrap"
                mb={8}
              >
                {[
                  {
                    icon: "✍️",
                    text: "Write",
                    desc: "创作内容",
                    color: "#f59e0b",
                    prompt: "我想学习如何编写清晰的代码注释和文档",
                  },
                  {
                    icon: "🧠",
                    text: "Learn",
                    desc: "学习概念",
                    color: "#ec4899",
                    prompt: "请教我数据结构中栈的基本概念和实现",
                  },
                  {
                    icon: "💻",
                    text: "Code",
                    desc: "编程实践",
                    color: "#3b82f6",
                    prompt: "我想练习实现一个简单的排序算法",
                  },
                  {
                    icon: "🎯",
                    text: "Practice",
                    desc: "刷题练习",
                    color: "#10b981",
                    prompt: "给我一个中等难度的算法练习题",
                  },
                  {
                    icon: "🎲",
                    text: "Surprise me",
                    desc: "随机挑战",
                    color: "#8b5cf6",
                    prompt: "给我一个随机的编程挑战",
                  },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="md"
                    px={6}
                    py={4}
                    h="auto"
                    bg="rgba(255, 255, 255, 0.9)"
                    backdropFilter="blur(20px)"
                    border="1px solid #e2e8f0"
                    borderRadius="16px"
                    color="#475569"
                    fontWeight="600"
                    fontSize="15px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      bg: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.95)",
                      borderColor: item.color,
                      color: item.color,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 32px ${item.color}20, 0 4px 16px rgba(0, 0, 0, 0.1)`,
                      _before: {
                        opacity: 1,
                      },
                    }}
                    _active={{
                      transform: "translateY(-1px)",
                    }}
                    onClick={() => {
                      setInputValue(item.prompt);
                    }}
                  >
                    <Text fontSize="18px" mr={3}>
                      {item.icon}
                    </Text>
                    <Text fontSize="15px" fontWeight="600">
                      {item.text}
                    </Text>
                  </Button>
                ))}
              </Box>
            </Box>

            {/* 更精致的配置选项 */}
            <Box
              display="flex"
              gap={8}
              p={10}
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(30px)"
              borderRadius="24px"
              border="1px solid rgba(226, 232, 240, 0.8)"
              maxW="800px"
              w="full"
              boxShadow="0 8px 40px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)"
              position="relative"
              zIndex={1}
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow:
                  "0 12px 48px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)",
              }}
            >
              <Box flex={1}>
                <Text
                  fontSize="sm"
                  color="#64748b"
                  mb={4}
                  fontWeight="700"
                  letterSpacing="0.02em"
                >
                  编程语言
                </Text>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    fontSize: "16px",
                    color: "#1e293b",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f97316";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(249, 115, 22, 0.1), 0 4px 16px rgba(0, 0, 0, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                    e.target.style.transform = "translateY(0px)";
                  }}
                >
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
              </Box>

              <Box flex={1}>
                <Text
                  fontSize="sm"
                  color="#64748b"
                  mb={4}
                  fontWeight="700"
                  letterSpacing="0.02em"
                >
                  技能水平
                </Text>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    fontSize: "16px",
                    color: "#1e293b",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#f97316";
                    e.target.style.boxShadow =
                      "0 0 0 4px rgba(249, 115, 22, 0.1), 0 4px 16px rgba(0, 0, 0, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                    e.target.style.transform = "translateY(0px)";
                  }}
                >
                  <option value="初学者">初学者</option>
                  <option value="中级">中级</option>
                  <option value="高级">高级</option>
                </select>
              </Box>
            </Box>
          </Box>
        </Flex>

        {/* 添加 CSS 动画 */}
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(1deg); }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #fafafa 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* 背景装饰 - 与无session时保持一致 */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        w="600px"
        h="600px"
        bg="radial-gradient(ellipse at center, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 35%, transparent 70%)"
        borderRadius="full"
        filter="blur(80px)"
        zIndex={0}
        animation="float 20s ease-in-out infinite"
      />
      <Box
        position="absolute"
        bottom="-15%"
        right="-10%"
        w="800px"
        h="800px"
        bg="radial-gradient(ellipse at center, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0.015) 40%, transparent 70%)"
        borderRadius="full"
        filter="blur(100px)"
        zIndex={0}
        animation="float 25s ease-in-out infinite reverse"
      />

      <Flex h="100vh">
        <ChallengeModal />
        <Sidebar />
        <Flex
          as="main"
          flex="1"
          direction="column"
          bg="transparent"
          position="relative"
          overflow="hidden"
          zIndex={1}
        >
          <Box
            flex="1"
            display="flex"
            flexDirection="column"
            w="full"
            h="0" // 关键：确保flex子元素正确计算高度
            overflow="hidden" // 防止整体溢出
          >
            <ChatWindow />
            {currentStage === "implementation" && <CodeImplementation />}
          </Box>

          <Box
            position="sticky"
            bottom={0}
            bg="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(20px)"
            borderTop="1px solid rgba(226, 232, 240, 0.8)"
            px={8}
            py={4}
          >
            <Box maxW="900px" mx="auto">
              <ChatInput onSendMessage={handleSendMessage} />
            </Box>
          </Box>
        </Flex>
      </Flex>

      {/* CSS动画 */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(1deg); }
          }
        `}
      </style>
    </Box>
  );
}

export default App;
