import React, { useState } from "react";
import { useAppStore } from "./store";
import { API_BASE_URL } from "./config/api";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import RightPanel from "./components/RightPanel";
import ChallengeModal from "./components/ChallengeModal";
import { Code, Dices, GraduationCap, Pencil, ArrowUp } from "lucide-react";
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
  const [skillLevel, setSkillLevel] = useState("intermediate");
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
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
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
    // 将 HTTP URL 转换为 WebSocket URL
    const wsUrl = API_BASE_URL.replace("https://", "wss://").replace(
      "http://",
      "ws://"
    );
    ws.current = new WebSocket(`${wsUrl}/ws/chat/${newSessionId}`);
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
    skillLevel: string
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

      const response = await fetch(`${API_BASE_URL}/api/start_session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem,
          language,
          skillLevel,
          model: "anthropic/claude-3.7-sonnet",
        }),
      });
      if (!response.ok)
        throw new Error((await response.json()).detail || "Server error");
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
        setError(data.error || "Startup failed");
        setIsInitializing(false);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to connect to backend service";
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
      <Box minH="100vh" bg="#faf9f5" position="relative" overflow="hidden">
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
            px={4}
            position="relative"
            maxW="100%"
            overflow="hidden"
            zIndex={1}
          >
            {/* Claude风格的中心内容 */}
            <Box
              textAlign="center"
              mb={8}
              maxW="1400px"
              zIndex={1}
              position="relative"
              px={2}
            >
              <Box mb={8}>
                <Flex align="center" justify="center" mb={4}>
                  <Text fontSize="48px" color="#da7756" mr={3}>
                    ✱
                  </Text>
                  <Text
                    fontSize={{ base: "28px", md: "36px", lg: "40px" }}
                    fontWeight="400"
                    color="#3d3d3a"
                    letterSpacing="-0.02em"
                    lineHeight="1.2"
                    fontFamily="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                  >
                    Hello, I'm your CodeCoach.
                  </Text>
                </Flex>
                <Text
                  fontSize="16px"
                  color="#3d3929"
                  textAlign="center"
                  fontWeight="400"
                  lineHeight="1.5"
                  opacity="0.8"
                  fontFamily="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                >
                  How can I help you today?
                </Text>
              </Box>

              {/* Claude风格输入框 */}
              <Box position="relative" maxW="1400px" mx="auto" mb={8}>
                <Box
                  position="relative"
                  border="1px solid rgba(61, 57, 41, 0.15)"
                  borderRadius="12px"
                  bg="rgba(255, 255, 255, 0.95)"
                  boxShadow="0 1px 3px 0 rgba(61, 57, 41, 0.1)"
                  _hover={{
                    borderColor: "rgba(61, 57, 41, 0.25)",
                  }}
                  _focusWithin={{
                    borderColor: "rgba(61, 57, 41, 0.25)",
                    boxShadow: "0 2px 6px 0 rgba(61, 57, 41, 0.15)",
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter your problem here..."
                    w="100%"
                    minH="100px"
                    p={4}
                    border="none"
                    borderRadius="12px"
                    fontSize="16px"
                    resize="none"
                    outline="none"
                    bg="transparent"
                    color="#3d3929"
                    lineHeight="1.5"
                    fontFamily="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                    fontWeight="400"
                    _placeholder={{
                      color: "rgba(61, 57, 41, 0.6)",
                    }}
                    _focus={{
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />

                  {/* 底部控制栏 */}
                  <Flex
                    align="center"
                    justify="space-between"
                    px={3}
                    py={2}
                    borderTop="1px solid rgba(61, 57, 41, 0.1)"
                  >
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
                            py={1.5}
                            minW="100px"
                            border="none"
                            borderRadius="6px"
                            bg="transparent"
                            fontSize="14px"
                            color="rgba(61, 57, 41, 0.7)"
                            fontWeight="500"
                            fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                            _hover={{
                              bg: "rgba(61, 57, 41, 0.05)",
                              color: "#3d3929",
                            }}
                          >
                            <Select.ValueText />
                            <Select.Indicator />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg="rgba(255, 255, 255, 0.98)"
                            border="1px solid rgba(61, 57, 41, 0.15)"
                            borderRadius="8px"
                            boxShadow="0 4px 12px -2px rgba(61, 57, 41, 0.15)"
                            zIndex={1000}
                            backdropFilter="blur(10px)"
                          >
                            {languageOptions.items.map((item) => (
                              <Select.Item
                                key={item.value}
                                item={item}
                                px={3}
                                py={2}
                                fontSize="14px"
                                color="#3d3929"
                                fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                                _hover={{ bg: "rgba(61, 57, 41, 0.05)" }}
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
                            py={1.5}
                            minW="80px"
                            border="none"
                            borderRadius="6px"
                            bg="transparent"
                            fontSize="14px"
                            color="rgba(61, 57, 41, 0.7)"
                            fontWeight="500"
                            fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                            _hover={{
                              bg: "rgba(61, 57, 41, 0.05)",
                              color: "#3d3929",
                            }}
                          >
                            <Select.ValueText />
                            <Select.Indicator />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg="white"
                            border="1px solid #E5E7EB"
                            borderRadius="8px"
                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            zIndex={1000}
                          >
                            {skillLevelOptions.items.map((item) => (
                              <Select.Item
                                key={item.value}
                                item={item}
                                px={3}
                                py={2}
                                fontSize="14px"
                                color="#3d3929"
                                fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                                _hover={{ bg: "rgba(61, 57, 41, 0.05)" }}
                              >
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Flex>

                    {/* 右侧模型选择和发送按钮 */}
                    <Flex gap={3} align="center">
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
                            py={1.5}
                            minW="140px"
                            border="none"
                            borderRadius="6px"
                            bg="transparent"
                            fontSize="14px"
                            color="rgba(61, 57, 41, 0.7)"
                            fontWeight="500"
                            fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                            _hover={{
                              bg: "rgba(61, 57, 41, 0.05)",
                              color: "#3d3929",
                            }}
                          >
                            <Select.ValueText />
                            <Select.Indicator />
                          </Select.Trigger>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg="white"
                            border="1px solid #E5E7EB"
                            borderRadius="8px"
                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            zIndex={1000}
                          >
                            {modelOptions.items.map((item) => (
                              <Select.Item
                                key={item.value}
                                item={item}
                                px={3}
                                py={2}
                                fontSize="14px"
                                color="#3d3929"
                                fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
                                _hover={{ bg: "rgba(61, 57, 41, 0.05)" }}
                              >
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>

                      <Button
                        w="32px"
                        h="32px"
                        bg={inputValue.trim() ? "#bd5d3a" : "#e4b1a0"}
                        color="white"
                        borderRadius="6px"
                        minW="32px"
                        fontSize="16px"
                        disabled={!inputValue.trim()}
                        _hover={{
                          bg: inputValue.trim() ? "#a04d2f" : "#e4b1a0",
                          transform: inputValue.trim()
                            ? "translateY(-1px)"
                            : "none",
                        }}
                        transition="all 0.2s"
                        onClick={() => {
                          if (inputValue.trim()) {
                            const modelMapping = {
                              "Claude 3.7 Sonnet":
                                "anthropic/claude-3.7-sonnet",
                              "GPT-4o": "openai/gpt-4o",
                              "DeepSeek R1": "deepseek/deepseek-r1:free",
                            };

                            handleStartSession(
                              inputValue,
                              language,
                              skillLevel
                            );
                          }
                        }}
                      >
                        <ArrowUp />
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              </Box>

              {/* Claude风格功能按钮 */}
              <Box
                display="flex"
                gap={3}
                justifyContent="center"
                flexWrap="wrap"
                maxW="600px"
                mx="auto"
              >
                {[
                  {
                    icon: Pencil,
                    text: "Write",
                    prompt:
                      "I want to learn how to write clear code comments and documentation",
                  },
                  {
                    icon: GraduationCap,
                    text: "Learn",
                    prompt:
                      "Please teach me the basic concepts and implementation of stacks in data structures",
                  },
                  {
                    icon: Code,
                    text: "Code",
                    prompt:
                      "I want to practice implementing a simple sorting algorithm",
                  },
                  {
                    icon: Dices,
                    text: "Challenge",
                    prompt:
                      "Give me a programming challenge suitable for my level",
                  },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="md"
                    px={4}
                    py={3}
                    h="auto"
                    bg="transparent"
                    border="0.5px solid rgba(61, 57, 41, 0.15)"
                    borderRadius="8px"
                    color="#3d3d3a"
                    fontSize="14px"
                    fontWeight="500"
                    backdropFilter="blur(15px)"
                    _hover={{
                      borderColor: "rgba(61, 57, 41, 0.25)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px -1px rgba(61, 57, 41, 0.15)",
                      color: "#141413",
                    }}
                    transition="all 0.2s"
                    onClick={() => {
                      setInputValue(item.prompt);
                    }}
                  >
                    <Flex align="center" gap={2}>
                      <item.icon size={16} color="#73726c" />
                      <Text fontFamily="'StyreneB', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif">
                        {item.text}
                      </Text>
                    </Flex>
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
    <Box minH="100vh" bg="#faf9f5" position="relative" overflow="hidden">
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
          bg="#faf9f5"
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
          </Box>

          <Box
            position="sticky"
            bottom={0}
            bg="rgba(250, 249, 245, 0.95)"
            backdropFilter="blur(20px)"
            borderTop="1px solid rgba(61, 57, 41, 0.1)"
            px={8}
            py={4}
          >
            <Box maxW="900px" mx="auto">
              <ChatInput onSendMessage={handleSendMessage} />
            </Box>
          </Box>
        </Flex>
        <RightPanel />
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
