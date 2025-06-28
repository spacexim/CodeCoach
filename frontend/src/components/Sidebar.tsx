// frontend/src/components/Sidebar.tsx
import React, { useState } from "react";
import { useAppStore, learning_stages, type Stage } from "../store";
import { Box, Button, VStack, Text, Input, Flex } from "@chakra-ui/react";

const stageDisplayNames: Record<Stage, string> = {
  problem_analysis: "问题分析",
  solution_design: "方案设计",
  implementation: "代码实现",
  testing_refinement: "测试与优化",
  reflection: "反思与总结",
};

const Sidebar: React.FC = () => {
  const {
    sessionId,
    currentStage,
    addMessage,
    setCurrentStage,
    setError,
    setChallenge,
    resetSession,
  } = useAppStore();
  const [showConceptInput, setShowConceptInput] = useState(false);
  const [conceptInput, setConceptInput] = useState("");
  const [showHintInput, setShowHintInput] = useState(false);
  const [hintInput, setHintInput] = useState("");

  const handleApiCall = async (
    url: string,
    options: RequestInit,
    userMessage: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    successCallback: (data: any) => void
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
      (data) => addMessage({ sender: "ai", text: data.explanation })
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
    if (!sessionId) return;
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
          headers: {
            "Content-Type": "application/json",
          },
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

  // 统一的Sidebar设计 - Claude浅色风格
  return (
    <Box
      w="300px"
      h="100vh"
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(20px)"
      borderRight="1px solid rgba(226, 232, 240, 0.8)"
      display="flex"
      flexDirection="column"
      position="relative"
      zIndex={2}
    >
      {/* 可滚动的内容区域 */}
      <Box
        flex="1"
        overflowY="auto"
        p={6}
        pb={2}
        css={{
          // 隐藏滚动条但保持功能
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE
        }}
      >
        <VStack gap={6} align="stretch">
          {/* CodeCoach Logo - 可点击返回首页 */}
          <Box
            cursor="pointer"
            onClick={() => resetSession()}
            transition="all 0.2s"
            title="点击返回首页开启新会话" // 添加hover提示
            _hover={{
              transform: "scale(1.02)",
              opacity: 0.8,
            }}
            _active={{
              transform: "scale(0.98)",
            }}
          >
            <Flex align="center" mb={2}>
              <Box
                w="32px"
                h="32px"
                bg="linear-gradient(135deg, #ff6b35, #f7931e)"
                borderRadius="8px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={3}
                boxShadow="0 2px 8px rgba(255, 107, 53, 0.3)"
              >
                <Text fontSize="18px" color="white">
                  🧠
                </Text>
              </Box>
              <Text fontSize="18px" fontWeight="700" color="#1e293b">
                CodeCoach
              </Text>
            </Flex>
            <Text fontSize="13px" color="#64748b" ml={11}>
              AI Coding Mentor
            </Text>
          </Box>

          {sessionId ? (
            // 有session时显示学习工具
            <>
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#374151" mb={4}>
                  学习工具
                </Text>
                <VStack gap={3} align="stretch">
                  <Button
                    size="sm"
                    bg="rgba(59, 130, 246, 0.1)"
                    color="#3b82f6"
                    borderRadius="8px"
                    _hover={{ bg: "rgba(59, 130, 246, 0.15)" }}
                    onClick={() => setShowConceptInput(!showConceptInput)}
                  >
                    解释概念
                  </Button>

                  {showConceptInput && (
                    <Box>
                      <Input
                        placeholder="输入要解释的概念..."
                        value={conceptInput}
                        onChange={(e) => setConceptInput(e.target.value)}
                        size="sm"
                        mb={2}
                        bg="white"
                        border="1px solid #e2e8f0"
                        _focus={{
                          borderColor: "#ff6b35",
                          boxShadow: "0 0 0 1px #ff6b35",
                        }}
                      />
                      <Button
                        size="sm"
                        bg="#ff6b35"
                        color="white"
                        onClick={handleExplainConcept}
                        disabled={!conceptInput.trim()}
                      >
                        解释
                      </Button>
                    </Box>
                  )}

                  <Button
                    size="sm"
                    bg="rgba(16, 185, 129, 0.1)"
                    color="#10b981"
                    borderRadius="8px"
                    _hover={{ bg: "rgba(16, 185, 129, 0.15)" }}
                    onClick={() => setShowHintInput(!showHintInput)}
                  >
                    请求提示
                  </Button>

                  {showHintInput && (
                    <Box>
                      <Input
                        placeholder="描述你遇到的问题..."
                        value={hintInput}
                        onChange={(e) => setHintInput(e.target.value)}
                        size="sm"
                        mb={2}
                        bg="white"
                        border="1px solid #e2e8f0"
                        _focus={{
                          borderColor: "#ff6b35",
                          boxShadow: "0 0 0 1px #ff6b35",
                        }}
                      />
                      <Button
                        size="sm"
                        bg="#ff6b35"
                        color="white"
                        onClick={handleRequestHint}
                        disabled={!hintInput.trim()}
                      >
                        获取提示
                      </Button>
                    </Box>
                  )}

                  <Button
                    size="sm"
                    bg="rgba(249, 115, 22, 0.1)"
                    color="#f97316"
                    borderRadius="8px"
                    _hover={{ bg: "rgba(249, 115, 22, 0.15)" }}
                    onClick={handleRequestChallenge}
                  >
                    接受挑战
                  </Button>
                </VStack>
              </Box>

              {/* 学习进度 */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#374151" mb={4}>
                  学习进度
                </Text>
                <Box
                  p={4}
                  bg="rgba(249, 115, 22, 0.05)"
                  borderRadius="12px"
                  border="1px solid rgba(249, 115, 22, 0.1)"
                  mb={4}
                >
                  <Text fontSize="13px" fontWeight="600" color="#f97316" mb={1}>
                    当前阶段
                  </Text>
                  <Text fontSize="15px" fontWeight="600" color="#1e293b">
                    {stageDisplayNames[currentStage]}
                  </Text>
                </Box>

                <VStack gap={2} align="stretch">
                  {learning_stages.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = stage === currentStage;
                    const isPending = index > currentStageIndex;

                    return (
                      <Flex key={stage} align="center" p={2} borderRadius="8px">
                        <Box
                          w="20px"
                          h="20px"
                          bg={
                            isCompleted
                              ? "#10b981"
                              : isCurrent
                              ? "#ff6b35"
                              : "#e5e7eb"
                          }
                          borderRadius="4px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mr={3}
                          fontSize="12px"
                          color={isPending ? "#9ca3af" : "white"}
                          fontWeight="600"
                        >
                          {isCompleted ? "✓" : index + 1}
                        </Box>
                        <Box flex="1">
                          <Text
                            fontSize="13px"
                            fontWeight={isCurrent ? "600" : "500"}
                            color={isCurrent ? "#1e293b" : "#64748b"}
                          >
                            {stageDisplayNames[stage]}
                          </Text>
                        </Box>
                      </Flex>
                    );
                  })}
                </VStack>

                {nextStage && (
                  <Button
                    size="sm"
                    bg="#ff6b35"
                    color="white"
                    borderRadius="8px"
                    mt={4}
                    w="full"
                    _hover={{ bg: "#e55a2e" }}
                    onClick={handleStageTransition}
                  >
                    进入下一阶段 →
                  </Button>
                )}
              </Box>
            </>
          ) : (
            // 无session时显示简化内容
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#374151" mb={4}>
                开始学习
              </Text>
              <Text fontSize="13px" color="#64748b" lineHeight="1.5">
                在右侧输入框中描述你想学习的编程概念，我将引导你通过结构化的方式深入理解。
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

      {/* 固定在底部的装饰 */}
      <Box
        px={6}
        py={4}
        borderTop="1px solid rgba(226, 232, 240, 0.5)"
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(10px)"
      >
        <Text fontSize="11px" color="#9ca3af" textAlign="center">
          Powered by AI
        </Text>
      </Box>
    </Box>
  );
};

export default Sidebar;
