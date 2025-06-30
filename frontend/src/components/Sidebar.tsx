// frontend/src/components/Sidebar.tsx
import React, { useState } from "react";
import { useAppStore, learning_stages, type Stage } from "../store";
import { Box, Button, VStack, Text, Input, Flex } from "@chakra-ui/react";
import { MessageCircle, Target, Code, Brain, Album } from "lucide-react";

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
    sidebarCollapsed,
    toggleSidebar,
    toggleRightPanel,
  } = useAppStore();
  const [showConceptInput, setShowConceptInput] = useState(false);
  const [conceptInput, setConceptInput] = useState("");
  const [showHintInput, setShowHintInput] = useState(false);
  const [hintInput, setHintInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // 统一的Sidebar设计
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
      {/* 可滚动的内容区域 */}
      <Box
        flex="1"
        overflowY="auto"
        p={sidebarCollapsed ? 2 : 3}
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
        {sidebarCollapsed ? (
          // 收起状态：所有按钮左对齐，类似Claude收起状态
          <VStack gap={1} align="stretch" w="full">
            {/* 展开按钮 - 改为大脑图标 */}
            <Button
              w="full"
              h="40px"
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              pl={3}
              borderRadius="6px"
              bg="transparent"
              color="#2d2318"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
              _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
              onClick={toggleSidebar}
              title="展开侧边栏"
              transition="background-color 0.2s"
              mb={2}
              border="none"
              minW="auto"
              variant="ghost"
            >
              <Brain />
            </Button>

            {sessionId && (
              <>
                {/* 学习工具按钮 */}
                <Button
                  w="full"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  pl={3}
                  borderRadius="6px"
                  bg="transparent"
                  color="#3d3929"
                  _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                  _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                  onClick={() => setShowConceptInput(!showConceptInput)}
                  title="解释概念"
                  transition="background-color 0.2s"
                  border="none"
                  minW="auto"
                  variant="ghost"
                >
                  <Album color="#73726c" />
                </Button>

                <Button
                  w="full"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  pl={3}
                  borderRadius="6px"
                  bg="transparent"
                  color="#3d3929"
                  _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                  _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                  onClick={() => setShowHintInput(!showHintInput)}
                  title="请求提示"
                  transition="background-color 0.2s"
                  border="none"
                  minW="auto"
                  variant="ghost"
                >
                  <MessageCircle color="#73726c" />
                </Button>

                <Button
                  w="full"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  pl={3}
                  borderRadius="6px"
                  bg="transparent"
                  color="#3d3929"
                  _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                  _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                  onClick={handleRequestChallenge}
                  title="接受挑战"
                  transition="background-color 0.2s"
                  border="none"
                  minW="auto"
                  variant="ghost"
                >
                  <Target color="#73726c" />
                </Button>

                {/* 代码编辑器按钮 - 只在实现阶段显示 */}
                {currentStage === "implementation" && (
                  <Button
                    w="full"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-start"
                    pl={3}
                    borderRadius="6px"
                    bg="transparent"
                    color="#3d3929"
                    _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                    _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                    onClick={toggleRightPanel}
                    title="代码编辑器"
                    transition="background-color 0.2s"
                    border="none"
                    minW="auto"
                    variant="ghost"
                  >
                    <Code />
                  </Button>
                )}
              </>
            )}
          </VStack>
        ) : (
          // 展开状态：显示完整内容，类似Claude
          <VStack gap={2} align="stretch">
            {/* 顶部：收起按钮和CodeCoach文案在一行 */}
            <Flex align="center" mb={2}>
              {/* 收起按钮 - 改为大脑图标 */}
              <Button
                w="40px"
                h="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="6px"
                bg="transparent"
                color="#2d2318"
                _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                onClick={toggleSidebar}
                title="收起侧边栏"
                transition="background-color 0.2s"
                mr={2}
                border="none"
                minW="40px"
                variant="ghost"
              >
                <Brain />
              </Button>

              {/* CodeCoach */}
              <Box
                as="button"
                flex={1}
                h="40px"
                display="flex"
                alignItems="center"
                px={2}
                borderRadius="6px"
                bg="transparent"
                onClick={() => resetSession()}
                title="CodeCoach - 返回首页"
                transition="background-color 0.2s"
                textAlign="left"
              >
                <Text
                  fontSize="18px"
                  fontWeight="600"
                  color="#3d3929"
                  fontFamily="Georgia, 'Times New Roman', Times, serif"
                >
                  CodeCoach
                </Text>
              </Box>
            </Flex>

            {sessionId ? (
              // 有session时显示学习工具
              <>
                {/* 学习工具列表 - 类似Claude的按钮组，都左对齐 */}
                <VStack gap={1} align="stretch">
                  {/* 解释概念 */}
                  <Box
                    as="button"
                    w="full"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    px={3}
                    borderRadius="6px"
                    bg="transparent"
                    color="#3d3929"
                    _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                    _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                    onClick={() => setShowConceptInput(!showConceptInput)}
                    transition="background-color 0.2s"
                    textAlign="left"
                  >
                    <Album
                      size={20}
                      color="#73726c"
                      style={{ marginRight: "12px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#3d3d3a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#73726c")
                      }
                    />
                    <Text
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                    >
                      解释概念
                    </Text>
                  </Box>

                  {/* 请求提示 */}
                  <Box
                    as="button"
                    w="full"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    px={3}
                    borderRadius="6px"
                    bg="transparent"
                    color="#3d3929"
                    _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                    _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                    onClick={() => setShowHintInput(!showHintInput)}
                    transition="background-color 0.2s"
                    textAlign="left"
                  >
                    <MessageCircle
                      size={20}
                      color="#73726c"
                      style={{ marginRight: "12px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#3d3d3a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#73726c")
                      }
                    />
                    <Text
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                    >
                      请求提示
                    </Text>
                  </Box>

                  {/* 接受挑战 */}
                  <Box
                    as="button"
                    w="full"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    px={3}
                    borderRadius="6px"
                    bg="transparent"
                    color="#3d3929"
                    _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                    _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                    onClick={handleRequestChallenge}
                    transition="background-color 0.2s"
                    textAlign="left"
                  >
                    <Target
                      size={20}
                      color="#73726c"
                      style={{ marginRight: "12px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#3d3d3a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#73726c")
                      }
                    />
                    <Text
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                    >
                      接受挑战
                    </Text>
                  </Box>

                  {/* 代码编辑器 - 只在实现阶段显示 */}
                  {currentStage === "implementation" && (
                    <Box
                      as="button"
                      w="full"
                      h="40px"
                      display="flex"
                      alignItems="center"
                      px={3}
                      borderRadius="6px"
                      bg="transparent"
                      color="#3d3929"
                      _hover={{ bg: "rgba(61, 57, 41, 0.08)" }}
                      _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                      onClick={toggleRightPanel}
                      transition="background-color 0.2s"
                      textAlign="left"
                    >
                      <Code
                        color="#73726c"
                        style={{ marginRight: "12px" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#3d3d3a")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#73726c")
                        }
                      />
                      <Text
                        fontSize="14px"
                        fontWeight="500"
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                      >
                        代码编辑器
                      </Text>
                    </Box>
                  )}
                </VStack>

                {/* 展开状态下的输入框 */}
                {showConceptInput && (
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

                {showHintInput && (
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

                {/* 学习进度 */}
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
                        <Flex
                          key={stage}
                          align="center"
                          p={2}
                          borderRadius="8px"
                        >
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
                            {isCompleted && (
                              <Text fontSize="12px" color="white">
                                ✓
                              </Text>
                            )}
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
                            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                          >
                            {stageDisplayNames[stage]}
                          </Text>
                        </Flex>
                      );
                    })}
                  </VStack>

                  {nextStage && (
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
                  )}
                </Box>
              </>
            ) : (
              // 无session时显示简化内容
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#3d3929" mb={4}>
                  开始学习
                </Text>
                <Text
                  fontSize="13px"
                  color="rgba(61, 57, 41, 0.7)"
                  lineHeight="1.5"
                >
                  在右侧输入框中描述你想学习的编程概念，我将引导你通过结构化的方式深入理解。
                </Text>
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* 输入框：当收起状态下有输入需求时，显示为悬浮框 */}
      {sidebarCollapsed && (showConceptInput || showHintInput) && (
        <Box
          position="absolute"
          left="70px"
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
              <Text fontSize="14px" fontWeight="600" color="#3d3929">
                解释概念
              </Text>
              <Input
                placeholder="输入要解释的概念..."
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                size="sm"
                bg="rgba(255, 255, 255, 0.95)"
                border="1px solid rgba(61, 57, 41, 0.2)"
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
                  onClick={() => setShowHintInput(false)}
                >
                  取消
                </Button>
              </Flex>
            </VStack>
          )}
        </Box>
      )}

      {/* 固定在底部的装饰 */}
      <Box
        px={sidebarCollapsed ? 2 : 3}
        py={3}
        borderTop="1px solid #e5e5e5"
        bg="#f7f7f5"
      >
        {sidebarCollapsed ? (
          // 收起状态：显示简化版本或隐藏
          <Box w="100%" display="flex" justifyContent="center">
            <Text
              fontSize="10px"
              color="#9ca3af"
              textAlign="center"
              whiteSpace="nowrap"
            >
              AI
            </Text>
          </Box>
        ) : (
          // 展开状态：显示完整文字
          <Text fontSize="11px" color="#9ca3af" textAlign="center">
            Powered by AI
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
