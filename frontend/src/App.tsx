import React, { useState } from "react";
import { useAppStore } from "./store";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import CodeImplementation from "./components/CodeImplementation";
import ChallengeModal from "./components/ChallengeModal";
import {
  Box,
  Flex,
  Text,
  Button,
  Textarea,
  Select,
  createListCollection,
} from "@chakra-ui/react";

function App() {
  const sessionId = useAppStore((state) => state.sessionId);
  const currentStage = useAppStore((state) => state.currentStage);
  const {
    setSession,
    setSessionInfo,
    addMessage,
    appendStreamChunk,
    setIsStreaming,
    setIsInitializing,
    setError,
  } = useAppStore();
  const ws = React.useRef<WebSocket | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState("Python");
  const [skillLevel, setSkillLevel] = useState("中级");
  const [selectedModel, setSelectedModel] = useState("Claude 3.7 Sonnet");

  // 选择器数据
  const languageOptions = createListCollection({
    items: [
      { label: "Python", value: "Python" },
      { label: "JavaScript", value: "JavaScript" },
      { label: "Java", value: "Java" },
      { label: "C++", value: "C++" },
    ],
  });

  const skillLevelOptions = createListCollection({
    items: [
      { label: "初学者", value: "初学者" },
      { label: "中级", value: "中级" },
      { label: "高级", value: "高级" },
    ],
  });

  const modelOptions = createListCollection({
    items: [
      { label: "Claude 3.7 Sonnet", value: "Claude 3.7 Sonnet" },
      { label: "GPT-4o", value: "GPT-4o" },
      { label: "DeepSeek R1", value: "DeepSeek R1" },
    ],
  });

  const connectWebSocket = (newSessionId: string) => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${newSessionId}`);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chunk") {
        setIsInitializing(false); // 收到第一个chunk时，结束初始化状态
        setIsStreaming(true);
        appendStreamChunk(data.content);
      } else if (data.type === "end") {
        setIsStreaming(false);
      } else if (data.type === "error") {
        setError(data.content);
        setIsStreaming(false);
        setIsInitializing(false); // 错误时也结束初始化状态
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
      // 先设置session信息并进入初始化状态（显示骨架屏）
      const tempSessionId = Date.now().toString(); // 临时ID，等后端返回真实ID
      setSessionInfo({
        sessionId: tempSessionId,
        problem,
        language,
        skillLevel,
      });

      const response = await fetch("http://localhost:8000/api/start_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, language, skillLevel, model }),
      });
      if (!response.ok)
        throw new Error((await response.json()).detail || "服务器错误");
      const data = await response.json();
      if (data.success) {
        // 更新为真实的session ID并设置初始AI消息
        setSession({
          sessionId: data.sessionId,
          initialMessage: { sender: "ai", text: data.message },
          problem,
          language,
          skillLevel,
        });
        connectWebSocket(data.sessionId);
        // isInitializing在setSession中已经设置为false
      } else {
        setError(data.error || "启动失败");
        setIsInitializing(false);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "无法连接到后端服务";
      setError(errorMessage);
      setIsInitializing(false);
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
                  {/* 上方输入区域 */}
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="今天想学什么编程概念？比如：如何实现一个栈？"
                    w="100%"
                    minH="120px"
                    p={4}
                    border="none"
                    borderRadius="12px 12px 0 0"
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

                  {/* 底部一行：选择器 + 提交按钮 */}
                  <Flex align="center" justify="space-between" p={3} pt={2}>
                    {/* 左侧选择器组 */}
                    <Flex gap={3} align="center">
                      <Select.Root
                        collection={languageOptions}
                        value={[language]}
                        onValueChange={(details) =>
                          setLanguage(details.value[0])
                        }
                        size="sm"
                      >
                        <Select.Control>
                          <Select.Trigger
                            px={3}
                            py={2}
                            minW="100px"
                            border="1px solid #e2e8f0"
                            borderRadius="8px"
                            bg="white"
                            fontSize="14px"
                            color="#475569"
                            fontWeight="500"
                            transition="all 0.2s"
                            _hover={{
                              borderColor: "#d1d5db",
                              bg: "#fafafa",
                            }}
                            _focus={{
                              borderColor: "#9ca3af",
                              boxShadow: "0 0 0 1px rgba(156, 163, 175, 0.2)",
                              outline: "none",
                            }}
                            _active={{
                              borderColor: "#9ca3af",
                              bg: "#fafafa",
                            }}
                          >
                            <Select.ValueText placeholder="选择语言" />
                            <Select.Indicator />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="8px"
                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            minW="120px"
                            zIndex={1000}
                          >
                            {languageOptions.items.map((item) => (
                              <Select.Item
                                key={item.value}
                                item={item}
                                px={3}
                                py={2}
                                fontSize="14px"
                                color="#374151"
                                bg="white"
                                _hover={{
                                  bg: "#f8fafc",
                                  color: "#1f2937",
                                }}
                                _focus={{
                                  bg: "#f8fafc",
                                  outline: "none",
                                }}
                                _selected={{
                                  bg: "#f8fafc",
                                  color: "#1f2937",
                                  fontWeight: "500",
                                }}
                              >
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>

                      <Select.Root
                        collection={skillLevelOptions}
                        value={[skillLevel]}
                        onValueChange={(details) =>
                          setSkillLevel(details.value[0])
                        }
                        size="sm"
                      >
                        <Select.Control>
                          <Select.Trigger
                            px={3}
                            py={2}
                            minW="80px"
                            border="1px solid #e2e8f0"
                            borderRadius="8px"
                            bg="white"
                            fontSize="14px"
                            color="#475569"
                            fontWeight="500"
                            transition="all 0.2s"
                            _hover={{
                              borderColor: "#d1d5db",
                              bg: "#fafafa",
                            }}
                            _focus={{
                              borderColor: "#9ca3af",
                              boxShadow: "0 0 0 1px rgba(156, 163, 175, 0.2)",
                              outline: "none",
                            }}
                            _active={{
                              borderColor: "#9ca3af",
                              bg: "#fafafa",
                            }}
                          >
                            <Select.ValueText placeholder="技能水平" />
                            <Select.Indicator />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="8px"
                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            minW="100px"
                            zIndex={1000}
                          >
                            {skillLevelOptions.items.map((item) => (
                              <Select.Item
                                key={item.value}
                                item={item}
                                px={3}
                                py={2}
                                fontSize="14px"
                                color="#374151"
                                bg="white"
                                _hover={{
                                  bg: "#f8fafc",
                                  color: "#1f2937",
                                }}
                                _focus={{
                                  bg: "#f8fafc",
                                  outline: "none",
                                }}
                                _selected={{
                                  bg: "#f8fafc",
                                  color: "#1f2937",
                                  fontWeight: "500",
                                }}
                              >
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>

                      <Select.Root
                        collection={modelOptions}
                        value={[selectedModel]}
                        onValueChange={(details) =>
                          setSelectedModel(details.value[0])
                        }
                        size="sm"
                      >
                        <Select.Control>
                          <Select.Trigger
                            px={3}
                            py={2}
                            minW="160px"
                            border="1px solid #e2e8f0"
                            borderRadius="8px"
                            bg="white"
                            fontSize="14px"
                            color="#475569"
                            fontWeight="500"
                            transition="all 0.2s"
                            _hover={{
                              borderColor: "#d1d5db",
                              bg: "#fafafa",
                            }}
                            _focus={{
                              borderColor: "#9ca3af",
                              boxShadow: "0 0 0 1px rgba(156, 163, 175, 0.2)",
                              outline: "none",
                            }}
                            _active={{
                              borderColor: "#9ca3af",
                              bg: "#fafafa",
                            }}
                          >
                            <Select.ValueText placeholder="选择模型" />
                            <Select.Indicator />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="8px"
                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                            minW="180px"
                            zIndex={1000}
                          >
                            {modelOptions.items.map((item) => (
                              <Select.Item
                                key={item.value}
                                item={item}
                                px={3}
                                py={2}
                                fontSize="14px"
                                color="#374151"
                                bg="white"
                                _hover={{
                                  bg: "#f8fafc",
                                  color: "#1f2937",
                                }}
                                _focus={{
                                  bg: "#f8fafc",
                                  outline: "none",
                                }}
                                _selected={{
                                  bg: "#f8fafc",
                                  color: "#1f2937",
                                  fontWeight: "500",
                                }}
                              >
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Flex>

                    {/* 右侧提交按钮 */}
                    <Button
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
                          // 模型映射
                          const modelMapping = {
                            "Claude 3.7 Sonnet": "anthropic/claude-3.7-sonnet",
                            "GPT-4o": "openai/gpt-4o",
                            "DeepSeek R1": "deepseek/deepseek-r1:free",
                          };

                          handleStartSession(
                            inputValue,
                            language,
                            skillLevel === "中级"
                              ? "intermediate"
                              : skillLevel === "初学者"
                              ? "beginner"
                              : "advanced",
                            modelMapping[
                              selectedModel as keyof typeof modelMapping
                            ] || "anthropic/claude-3.7-sonnet"
                          );
                        }
                      }}
                    >
                      ↗
                    </Button>
                  </Flex>
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
