// frontend/src/components/Sidebar.tsx
import React, { useState, useRef, useEffect } from "react";
import { useAppStore, learning_stages, type Stage } from "../store";
import { Box, Button, VStack, Text, Input, Flex } from "@chakra-ui/react";
import {
  MessageCircle,
  Target,
  Code,
  Album,
  PanelLeft,
  Check,
} from "lucide-react";

const stageDisplayNames: Record<Stage, string> = {
  problem_analysis: "问题分析",
  solution_design: "方案设计",
  implementation: "代码实现",
  testing_refinement: "测试与优化",
  reflection: "反思与总结",
};

// Reusable button component for the sidebar
const SidebarButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  isCollapsed: boolean;
  showText: boolean;
  disabled?: boolean;
  title?: string;
  [key: string]: unknown;
}> = ({
  icon,
  text,
  onClick,
  isCollapsed,
  showText,
  disabled = false,
  ...props
}) => (
  <Box
    as="button"
    w="full"
    h="40px"
    display="flex"
    alignItems="center"
    justifyContent={isCollapsed ? "center" : "flex-start"}
    px={isCollapsed ? 0 : 3}
    borderRadius="6px"
    bg="transparent"
    color={disabled ? "#b0afaa" : "#73726c"}
    cursor={disabled ? "not-allowed" : "pointer"}
    _hover={!disabled ? { bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" } : {}}
    _active={!disabled ? { bg: "rgba(61, 57, 41, 0.12)" } : {}}
    _disabled={{ cursor: "not-allowed", color: "#b0afaa" }}
    onClick={!disabled ? onClick : () => {}}
    transition="background-color 0.2s, justify-content 0.2s, padding 0.2s, color 0.2s"
    textAlign="left"
    overflow="hidden"
    {...props}
  >
    <Box
      w="20px"
      mr={isCollapsed ? 0 : "12px"}
      display="flex"
      justifyContent="center"
      transition="margin 0.2s"
    >
      {icon}
    </Box>
    <Box
      opacity={!isCollapsed && showText ? 1 : 0}
      transform={
        !isCollapsed && showText ? "translateX(0)" : "translateX(-10px)"
      }
      // MODIFICATION: Collapse the box when not visible to remove it from layout
      maxWidth={!isCollapsed ? "100%" : 0}
      transition="opacity 0.2s ease-out, transform 0.2s ease-out, max-width 0.2s ease-in-out"
      whiteSpace="nowrap"
    >
      <Text
        fontSize="14px"
        fontWeight="500"
        fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
      >
        {text}
      </Text>
    </Box>
  </Box>
);

const Sidebar: React.FC = () => {
  const {
    sessionId,
    currentStage,
    addMessage,
    setCurrentStage,
    setError,
    setChallenge,
    resetSession,
    sidebarCollapsed,
    toggleSidebar,
    toggleRightPanel,
    completeLearning,
    learningCompleted,
  } = useAppStore();

  const [showConceptInput, setShowConceptInput] = useState(false);
  const [conceptInput, setConceptInput] = useState("");
  const [showHintInput, setShowHintInput] = useState(false);
  const [hintInput, setHintInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // A state to control the visibility of text content to sync with sidebar animation
  const [showText, setShowText] = useState(!sidebarCollapsed);

  // Ref for the floating input box to detect clicks outside
  const floatingBoxRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let timer: number;
    if (sidebarCollapsed) {
      setShowText(false);
    } else {
      // Delay showing text to make the transition smoother
      timer = setTimeout(() => {
        setShowText(true);
      }, 150); // This duration should be close to the transition duration
    }
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  // Handle clicking outside the floating input box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        floatingBoxRef.current &&
        !floatingBoxRef.current.contains(event.target as Node) &&
        sidebarCollapsed &&
        (showConceptInput || showHintInput)
      ) {
        setShowConceptInput(false);
        setShowHintInput(false);
      }
    };

    if (sidebarCollapsed && (showConceptInput || showHintInput)) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarCollapsed, showConceptInput, showHintInput]);

  const handleApiCall = async (
    url: string,
    options: RequestInit,
    userMessage: string,
    successCallback: (data: unknown) => void
  ) => {
    if (!sessionId) return;
    addMessage({ sender: "user", text: userMessage });
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error((await response.json()).detail);
      const data = await response.json();
      if (data.success) successCallback(data);
      else setError(data.error);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  const handleExplainConcept = () => {
    if (!conceptInput.trim()) return;
    handleApiCall(
      `http://localhost:8000/api/session/${sessionId}/explain/${conceptInput}`,
      {},
      `请你解释一下"${conceptInput}"这个概念。`,
      (data) =>
        addMessage({
          sender: "ai",
          text: (data as { explanation: string }).explanation,
        })
    );
    setConceptInput("");
    setShowConceptInput(false);
  };

  const handleRequestHint = async () => {
    if (!hintInput.trim() || !sessionId) return;
    addMessage({
      sender: "user",
      text: `我卡住了，需要一个提示：${hintInput}`,
    });
    const hintToFetch = hintInput;
    setHintInput("");
    setShowHintInput(false);
    try {
      const response = await fetch(
        `http://localhost:8000/api/session/${sessionId}/hint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hintRequest: hintToFetch }),
        }
      );
      if (!response.ok) throw new Error((await response.json()).detail);
      const data = await response.json();
      if (data.success) addMessage({ sender: "ai", text: data.hint });
      else setError(data.error);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  const handleStageTransition = async () => {
    if (!sessionId || isTransitioning) return;
    setIsTransitioning(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/session/${sessionId}/stage/next`,
        { method: "POST" }
      );
      if (!response.ok) {
        if (response.status === 404) {
          const shouldReset = window.confirm("会话已过期，是否重新开始学习？");
          if (shouldReset) {
            resetSession();
            return;
          }
          throw new Error("会话已过期，请重新开始学习");
        }
        throw new Error("阶段切换失败");
      }
      const data = await response.json();
      if (data.success) {
        addMessage({ sender: "ai", text: data.transitionMessage });
        setCurrentStage(data.newStage);
      } else {
        alert(data.message);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleCompleteLearning = async () => {
    if (!sessionId || isTransitioning) return;
    setIsTransitioning(true);
    try {
      await completeLearning();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "完成学习时出错";
      setError(errorMessage);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleRequestChallenge = async () => {
    if (!sessionId) return;
    setChallenge(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/session/${sessionId}/challenge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          const shouldReset = window.confirm("会话已过期，是否重新开始学习？");
          if (shouldReset) {
            resetSession();
            return;
          }
          throw new Error("会话已过期，请重新开始学习");
        }
        throw new Error("获取挑战失败");
      }
      const data = await response.json();
      if (data.success) {
        setChallenge(data.challengeData);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  const currentStageIndex = learning_stages.indexOf(currentStage);
  const nextStage =
    currentStageIndex < learning_stages.length - 1
      ? learning_stages[currentStageIndex + 1]
      : null;

  return (
    <Box
      w={sidebarCollapsed ? "60px" : "280px"}
      h="100vh"
      bg="#f5f4ed"
      borderRight="1px solid #e5e5e5"
      display="flex"
      flexDirection="column"
      position="relative"
      zIndex={2}
      transition="width 0.2s ease"
    >
      <Box
        flex="1"
        overflowY="auto"
        overflowX="hidden" // Prevent horizontal scroll during transition
        p={3}
        pb={2}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <VStack gap={1} align="stretch">
          {/* Header */}
          <Flex align="center" mb={1}>
            {" "}
            {/* Add margin bottom to create space */}
            <Button
              h="40px"
              display="flex"
              alignItems="center"
              justifyContent={sidebarCollapsed ? "center" : "flex-start"}
              borderRadius="6px"
              bg="transparent"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
              transition="background-color 0.2s, width 0.2s, padding 0.2s"
              border="none"
              variant="ghost"
              w={sidebarCollapsed ? "full" : "auto"}
              px={sidebarCollapsed ? 0 : 3}
              minW="auto"
            >
              <PanelLeft />
            </Button>
            <Box
              flex={1}
              as="button"
              h="40px"
              display="flex"
              alignItems="center"
              px={2}
              borderRadius="6px"
              bg="transparent"
              onClick={() => resetSession()}
              title="CodeCoach - 返回首页"
              transition="background-color 0.2s, max-width 0.2s"
              textAlign="left"
              overflow="hidden"
              maxW={sidebarCollapsed ? 0 : "200px"}
            >
              <Box
                opacity={!sidebarCollapsed && showText ? 1 : 0}
                transform={
                  !sidebarCollapsed && showText
                    ? "translateX(0)"
                    : "translateX(-10px)"
                }
                transition="opacity 0.2s ease-out, transform 0.2s ease-out"
                whiteSpace="nowrap"
              >
                <Text
                  fontSize="20px"
                  fontWeight="600"
                  color="#3d3929"
                  fontFamily="Georgia, 'Times New Roman', Times, serif"
                >
                  CodeCoach
                </Text>
              </Box>
            </Box>
          </Flex>

          {/* Tools */}
          <SidebarButton
            icon={<Album size={20} />}
            text="解释概念"
            onClick={() => setShowConceptInput(!showConceptInput)}
            isCollapsed={sidebarCollapsed}
            showText={showText}
            title="解释概念"
            disabled={!sessionId}
          />
          <SidebarButton
            icon={<MessageCircle size={20} />}
            text="请求提示"
            onClick={() => setShowHintInput(!showHintInput)}
            isCollapsed={sidebarCollapsed}
            showText={showText}
            title="请求提示"
            disabled={!sessionId}
          />
          <SidebarButton
            icon={<Target size={20} />}
            text="接受挑战"
            onClick={handleRequestChallenge}
            isCollapsed={sidebarCollapsed}
            showText={showText}
            title="接受挑战"
            disabled={!sessionId}
          />
          {sessionId && currentStage === "implementation" && (
            <SidebarButton
              icon={<Code size={20} />}
              text="代码编辑器"
              onClick={toggleRightPanel}
              isCollapsed={sidebarCollapsed}
              showText={showText}
              title="代码编辑器"
            />
          )}

          {/* Input fields */}
          {!sidebarCollapsed && showConceptInput && (
            <Box mt={2}>
              <Input
                placeholder="输入要解释的概念..."
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                size="sm"
                mb={2}
                bg="rgba(255, 255, 255, 0.95)"
                border="1px solid rgba(61, 57, 41, 0.2)"
                _focus={{
                  borderColor: "#bd5d3a",
                  boxShadow: "0 0 0 1px #bd5d3a",
                }}
              />
              <Button
                size="sm"
                bg="#bd5d3a"
                color="white"
                onClick={handleExplainConcept}
                disabled={!conceptInput.trim()}
              >
                解释
              </Button>
            </Box>
          )}

          {!sidebarCollapsed && showHintInput && (
            <Box mt={2}>
              <Input
                placeholder="描述你遇到的问题..."
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                size="sm"
                mb={2}
                bg="rgba(255, 255, 255, 0.95)"
                border="1px solid rgba(61, 57, 41, 0.2)"
                _focus={{
                  borderColor: "#bd5d3a",
                  boxShadow: "0 0 0 1px #bd5d3a",
                }}
              />
              <Button
                size="sm"
                bg="#bd5d3a"
                color="white"
                onClick={handleRequestHint}
                disabled={!hintInput.trim()}
              >
                获取提示
              </Button>
            </Box>
          )}

          {/* Learning Progress & Welcome Message */}
          <Box
            opacity={!sidebarCollapsed && showText ? 1 : 0}
            transform={
              !sidebarCollapsed && showText
                ? "translateY(0)"
                : "translateY(-10px)"
            }
            maxH={!sidebarCollapsed && showText ? "1000px" : "0"}
            overflow="hidden"
            transition="opacity 0.2s ease-out, transform 0.2s ease-out, max-height 0.3s ease-in-out"
            style={{
              transitionDelay: !sidebarCollapsed && showText ? "0.1s" : "0s",
            }}
          >
            {sessionId ? (
              <Box mt={6}>
                <Text
                  fontSize="14px"
                  fontWeight="600"
                  color="#3d3929"
                  mb={4}
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                >
                  学习进度
                </Text>
                <Box
                  p={4}
                  bg="rgba(218, 119, 86, 0.05)"
                  borderRadius="12px"
                  border="1px solid rgba(218, 119, 86, 0.1)"
                  mb={4}
                >
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color="#da7756"
                    mb={1}
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                  >
                    当前阶段
                  </Text>
                  <Text
                    fontSize="15px"
                    fontWeight="600"
                    color="#3d3929"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                  >
                    {stageDisplayNames[currentStage]}
                  </Text>
                </Box>
                <VStack gap={2} align="stretch">
                  {learning_stages.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = stage === currentStage;
                    return (
                      <Flex key={stage} align="center" p={2} borderRadius="8px">
                        <Box
                          w="20px"
                          h="20px"
                          bg={
                            isCompleted
                              ? "#10b981"
                              : isCurrent
                              ? "#bd5d3a"
                              : "rgba(61, 57, 41, 0.2)"
                          }
                          borderRadius="50%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mr={3}
                        >
                          {isCompleted && <Check size={12} />}
                          {isCurrent && (
                            <Box
                              w="8px"
                              h="8px"
                              bg="white"
                              borderRadius="50%"
                            />
                          )}
                        </Box>
                        <Text
                          fontSize="13px"
                          color={
                            isCompleted || isCurrent
                              ? "#3d3929"
                              : "rgba(61, 57, 41, 0.6)"
                          }
                          fontWeight={isCurrent ? "600" : "500"}
                          fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                        >
                          {stageDisplayNames[stage]}
                        </Text>
                      </Flex>
                    );
                  })}
                </VStack>
                {nextStage ? (
                  <Button
                    mt={4}
                    w="full"
                    bg="#bd5d3a"
                    color="white"
                    _hover={{ bg: "#a04d2f" }}
                    onClick={handleStageTransition}
                    loading={isTransitioning}
                    loadingText="切换中..."
                    disabled={isTransitioning}
                  >
                    进入下一阶段 →
                  </Button>
                ) : (
                  // 根据学习状态显示不同的按钮
                  currentStage === "reflection" &&
                  (learningCompleted ? (
                    // 学习已完成，显示开始新问题按钮
                    <Button
                      mt={4}
                      w="full"
                      bg="#007bff"
                      color="white"
                      _hover={{ bg: "#0056b3" }}
                      onClick={() => {
                        resetSession();
                      }}
                      disabled={isTransitioning}
                    >
                      🚀 开始新问题
                    </Button>
                  ) : (
                    // 学习未完成，显示完成学习按钮
                    <Button
                      mt={4}
                      w="full"
                      bg="#28a745"
                      color="white"
                      _hover={{ bg: "#218838" }}
                      onClick={handleCompleteLearning}
                      loading={isTransitioning}
                      loadingText="完成中..."
                      disabled={isTransitioning}
                    >
                      ✨ 完成学习
                    </Button>
                  ))
                )}
              </Box>
            ) : (
              <Box mt={4}>
                <Text
                  fontSize="14px"
                  fontWeight="600"
                  color="#3d3929"
                  mb={4}
                  fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                >
                  开始学习
                </Text>
                <Text
                  fontSize="13px"
                  color="rgba(61, 57, 41, 0.7)"
                  lineHeight="1.5"
                  fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                >
                  在右侧输入框中描述你想学习的编程概念，我将引导你通过结构化的方式深入理解。
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Floating input for collapsed state */}
      {sidebarCollapsed && (showConceptInput || showHintInput) && (
        <Box
          ref={floatingBoxRef}
          position="absolute"
          left="70px" // Position next to the collapsed sidebar
          top="80px"
          w="300px"
          bg="rgba(255, 255, 255, 0.98)"
          border="1px solid rgba(61, 57, 41, 0.15)"
          borderRadius="12px"
          p={4}
          boxShadow="0 4px 20px rgba(61, 57, 41, 0.15)"
          backdropFilter="blur(10px)"
          zIndex={10}
        >
          {showConceptInput && (
            <VStack gap={3} align="stretch">
              <Text
                fontSize="14px"
                fontWeight="600"
                color="#3d3929"
                fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
              >
                解释概念
              </Text>
              <Input
                placeholder="输入要解释的概念..."
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                size="sm"
                bg="rgba(255, 255, 255, 0.95)"
                border="1px solid rgba(61, 57, 41, 0.2)"
                color="#3d3929"
                _placeholder={{ color: "rgba(61, 57, 41, 0.6)" }}
                _focus={{
                  borderColor: "#bd5d3a",
                  boxShadow: "0 0 0 1px #bd5d3a",
                }}
              />
              <Flex gap={2}>
                <Button
                  size="sm"
                  bg="#bd5d3a"
                  color="white"
                  onClick={handleExplainConcept}
                  disabled={!conceptInput.trim()}
                  flex={1}
                >
                  解释
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#bd5d3a"
                  color="#bd5d3a"
                  bg="transparent"
                  _hover={{
                    bg: "rgba(189, 93, 58, 0.05)",
                    borderColor: "#bd5d3a",
                    color: "#bd5d3a",
                  }}
                  _active={{
                    bg: "rgba(189, 93, 58, 0.1)",
                    color: "#bd5d3a",
                  }}
                  onClick={() => setShowConceptInput(false)}
                >
                  取消
                </Button>
              </Flex>
            </VStack>
          )}
          {showHintInput && (
            <VStack gap={3} align="stretch">
              <Text fontSize="14px" fontWeight="600" color="#3d3929">
                请求提示
              </Text>
              <Input
                placeholder="描述你遇到的问题..."
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                size="sm"
                bg="rgba(255, 255, 255, 0.95)"
                border="1px solid rgba(61, 57, 41, 0.2)"
                color="#3d3929"
                _placeholder={{ color: "rgba(61, 57, 41, 0.6)" }}
                _focus={{
                  borderColor: "#bd5d3a",
                  boxShadow: "0 0 0 1px #bd5d3a",
                }}
              />
              <Flex gap={2}>
                <Button
                  size="sm"
                  bg="#bd5d3a"
                  color="white"
                  onClick={handleRequestHint}
                  disabled={!hintInput.trim()}
                  flex={1}
                >
                  获取提示
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#bd5d3a"
                  color="#bd5d3a"
                  bg="transparent"
                  _hover={{
                    bg: "rgba(189, 93, 58, 0.05)",
                    borderColor: "#bd5d3a",
                    color: "#bd5d3a",
                  }}
                  _active={{
                    bg: "rgba(189, 93, 58, 0.1)",
                    color: "#bd5d3a",
                  }}
                  onClick={() => setShowHintInput(false)}
                >
                  取消
                </Button>
              </Flex>
            </VStack>
          )}
        </Box>
      )}

      {/* Footer */}
      <Box px={3} py={3} borderTop="1px solid #e5e5e5" bg="#f5f4ed">
        <Box
          w="full"
          display="flex"
          justifyContent="center"
          overflow="hidden"
          whiteSpace="nowrap"
        >
          <Text
            fontSize="11px"
            color="#9ca3af"
            textAlign="center"
            opacity={!sidebarCollapsed && showText ? 1 : 0}
            transition="opacity 0.2s ease-out"
            fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
          >
            Powered by AI
          </Text>
          <Text
            fontSize="10px"
            color="#9ca3af"
            textAlign="center"
            position="absolute"
            opacity={sidebarCollapsed ? 1 : 0}
            transition="opacity 0.2s ease-out"
            fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
          >
            AI
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
