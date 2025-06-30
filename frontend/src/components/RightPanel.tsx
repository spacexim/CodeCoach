// frontend/src/components/RightPanel.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { Box, Button, VStack, Text, Flex, Collapsible } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import MarkdownRenderer from "./MarkdownRenderer";

const RightPanel: React.FC = () => {
  const {
    rightPanelCollapsed,
    toggleRightPanel,
    language,
    currentStage,
    isStreaming,
    getCodeFeedback,
    problem,
    setCurrentStage,
  } = useAppStore();
  const [code, setCode] = useState<string>("# 在这里开始编写你的代码...\n");

  const handleGetCodeFeedback = async () => {
    if (!code.trim() || code.trim() === "# 在这里开始编写你的代码...") {
      console.log("请先编写一些代码");
      return;
    }

    // 如果当前不在代码实现阶段，先跳转到代码实现阶段
    if (currentStage !== "implementation") {
      setCurrentStage("implementation");
    }

    await getCodeFeedback(code);
  };

  const handleCodeSubmit = () => {
    if (!code.trim() || code.trim() === "# 在这里开始编写你的代码...") {
      console.log("请先编写一些代码");
      return;
    }

    // 跳转到代码实现阶段
    setCurrentStage("implementation");
  };

  const handleClearCode = () => {
    setCode("# 在这里开始编写你的代码...\n");
  };

  // 根据当前阶段确定显示内容
  const isCodeStage = currentStage === "implementation";
  const canSubmitCode =
    currentStage === "problem_analysis" || currentStage === "solution_design";

  return (
    <Box
      w={rightPanelCollapsed ? "60px" : "400px"}
      h="100vh"
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(20px)"
      borderLeft="1px solid rgba(226, 232, 240, 0.8)"
      display="flex"
      flexDirection="column"
      position="relative"
      zIndex={2}
      transition="width 0.3s ease"
    >
      {rightPanelCollapsed ? (
        // 收起状态：显示图标
        <Box p={3} bg="white">
          <VStack gap={4} align="center">
            {/* 切换按钮 */}
            <Button
              size="sm"
              w="40px"
              h="40px"
              borderRadius="8px"
              bg="rgba(249, 115, 22, 0.1)"
              color="#f97316"
              _hover={{ bg: "rgba(249, 115, 22, 0.15)" }}
              _focus={{ boxShadow: "none", outline: "none" }}
              onClick={toggleRightPanel}
              title="展开右侧面板"
            >
              ←
            </Button>

            {/* 问题描述图标 */}
            <Box
              w="40px"
              h="40px"
              bg="rgba(16, 185, 129, 0.1)"
              color="#10b981"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={toggleRightPanel}
              title="问题描述"
              _hover={{ bg: "rgba(16, 185, 129, 0.15)" }}
            >
              <Text fontSize="18px">📋</Text>
            </Box>

            {/* 代码图标 */}
            <Box
              w="40px"
              h="40px"
              bg="rgba(59, 130, 246, 0.1)"
              color="#3b82f6"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={toggleRightPanel}
              title="代码编辑器"
              _hover={{ bg: "rgba(59, 130, 246, 0.15)" }}
            >
              <Text fontSize="18px">💻</Text>
            </Box>
          </VStack>
        </Box>
      ) : (
        // 展开状态：显示完整内容
        <>
          {/* 标题栏 */}
          <Box
            p={4}
            borderBottom="1px solid rgba(226, 232, 240, 0.8)"
            bg="white"
          >
            <Flex justify="space-between" align="center">
              <Text fontSize="16px" fontWeight="600" color="gray.900">
                {isCodeStage ? "代码实现区" : "学习助手"}
              </Text>
              <Button
                size="sm"
                w="32px"
                h="32px"
                borderRadius="6px"
                bg="rgba(249, 115, 22, 0.1)"
                color="#f97316"
                _hover={{ bg: "rgba(249, 115, 22, 0.15)" }}
                _focus={{ boxShadow: "none", outline: "none" }}
                onClick={toggleRightPanel}
                title="收起右侧面板"
              >
                →
              </Button>
            </Flex>
          </Box>

          {/* 问题描述区域 */}
          {problem && (
            <Collapsible.Root defaultOpen>
              <Box borderBottom="1px solid rgba(226, 232, 240, 0.8)" bg="white">
                {/* 问题标题栏 */}
                <Collapsible.Trigger asChild>
                  <Flex
                    as="button"
                    p={4}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    transition="background-color 0.2s"
                    w="full"
                    textAlign="left"
                    bg="white"
                    color="gray.700"
                  >
                    <Flex align="center" gap={2}>
                      <Text fontSize="16px">📋</Text>
                      <Text fontSize="14px" fontWeight="600" color="gray.700">
                        当前问题
                      </Text>
                    </Flex>
                  </Flex>
                </Collapsible.Trigger>

                {/* 问题内容 */}
                <Collapsible.Content>
                  <Box
                    px={4}
                    pb={4}
                    maxH="200px"
                    overflowY="auto"
                    bg="white"
                    color="gray.800"
                    css={{
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <Box
                      p={3}
                      bg="white"
                      borderRadius="8px"
                      border="1px solid rgba(226, 232, 240, 0.8)"
                      fontSize="13px"
                      lineHeight="1.6"
                      color="gray.800"
                      boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                    >
                      <MarkdownRenderer content={problem} />
                    </Box>
                  </Box>
                </Collapsible.Content>
              </Box>
            </Collapsible.Root>
          )}

          {/* 主要内容区域 */}
          <Box flex="1" display="flex" flexDirection="column">
            {isCodeStage ? (
              // 代码实现阶段：显示代码编辑器
              <>
                <Box flex="1" border="0" overflow="hidden">
                  <Editor
                    height="100%"
                    language={language.toLowerCase()}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="light"
                    options={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily:
                        "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      lineNumbers: "on",
                      glyphMargin: false,
                      folding: false,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "none",
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                      },
                    }}
                  />
                </Box>

                {/* 底部操作区 - 代码实现阶段 */}
                <Box
                  p={4}
                  borderTop="1px solid rgba(226, 232, 240, 0.8)"
                  bg="white"
                >
                  <VStack gap={3}>
                    <Button
                      w="full"
                      bg="#f97316"
                      color="white"
                      _hover={{ bg: "#ea580c" }}
                      _active={{ bg: "#dc2626" }}
                      borderRadius="8px"
                      fontWeight="500"
                      fontSize="14px"
                      h="40px"
                      onClick={handleGetCodeFeedback}
                      loading={isStreaming}
                      loadingText="获取反馈中..."
                      disabled={isStreaming}
                    >
                      获取代码反馈
                    </Button>
                    <Button
                      w="full"
                      variant="outline"
                      borderColor="gray.300"
                      color="gray.600"
                      _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                      _active={{ bg: "gray.100" }}
                      borderRadius="8px"
                      fontWeight="500"
                      fontSize="14px"
                      h="36px"
                      onClick={handleClearCode}
                    >
                      清空代码
                    </Button>
                  </VStack>
                </Box>
              </>
            ) : (
              // 前两个阶段：显示代码编辑器但按钮功能不同
              <>
                <Box flex="1" border="0" overflow="hidden">
                  <Editor
                    height="100%"
                    language={language.toLowerCase()}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="light"
                    options={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily:
                        "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      lineNumbers: "on",
                      glyphMargin: false,
                      folding: false,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "none",
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                      },
                    }}
                  />
                </Box>

                {/* 底部操作区 - 前两个阶段 */}
                {canSubmitCode && (
                  <Box
                    p={4}
                    borderTop="1px solid rgba(226, 232, 240, 0.8)"
                    bg="white"
                  >
                    <VStack gap={3}>
                      <Text fontSize="12px" color="gray.600" textAlign="center">
                        在这里编写你的初步代码想法，提交后进入代码实现阶段
                      </Text>
                      <Button
                        w="full"
                        bg="#10b981"
                        color="white"
                        _hover={{ bg: "#059669" }}
                        _active={{ bg: "#047857" }}
                        borderRadius="8px"
                        fontWeight="500"
                        fontSize="14px"
                        h="40px"
                        onClick={handleCodeSubmit}
                        disabled={
                          !code.trim() ||
                          code.trim() === "# 在这里开始编写你的代码..."
                        }
                      >
                        提交代码并进入实现阶段
                      </Button>
                    </VStack>
                  </Box>
                )}
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default RightPanel;
