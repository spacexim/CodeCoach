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
      bg="#f5f4ed"
      backdropFilter="blur(20px)"
      borderLeft="1px solid rgba(61, 57, 41, 0.1)"
      display="flex"
      flexDirection="column"
      position="relative"
      zIndex={2}
      transition="width 0.3s ease"
    >
      {rightPanelCollapsed ? (
        // 收起状态：显示图标
        <Box p={3} bg="rgba(245, 244, 237, 0.8)">
          <VStack gap={4} align="center">
            {/* 切换按钮 */}
            <Button
              size="sm"
              w="40px"
              h="40px"
              borderRadius="8px"
              bg="rgba(218, 119, 86, 0.1)"
              color="#da7756"
              _hover={{ bg: "rgba(218, 119, 86, 0.15)" }}
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
              bg="rgba(218, 119, 86, 0.1)"
              color="#da7756"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={toggleRightPanel}
              title="问题描述"
              _hover={{ bg: "rgba(218, 119, 86, 0.15)" }}
            >
              <Text fontSize="18px">📋</Text>
            </Box>

            {/* 代码图标 */}
            <Box
              w="40px"
              h="40px"
              bg="rgba(218, 119, 86, 0.1)"
              color="#da7756"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={toggleRightPanel}
              title="代码编辑器"
              _hover={{ bg: "rgba(218, 119, 86, 0.15)" }}
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
            borderBottom="1px solid rgba(61, 57, 41, 0.1)"
            bg="rgba(245, 244, 237, 0.8)"
          >
            <Flex justify="space-between" align="center">
              <Text fontSize="16px" fontWeight="600" color="#3d3929">
                {isCodeStage ? "代码实现区" : "学习助手"}
              </Text>
              <Button
                size="sm"
                w="32px"
                h="32px"
                borderRadius="6px"
                bg="rgba(218, 119, 86, 0.1)"
                color="#da7756"
                _hover={{ bg: "rgba(218, 119, 86, 0.15)" }}
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
              <Box
                borderBottom="1px solid rgba(61, 57, 41, 0.1)"
                bg="rgba(245, 244, 237, 0.8)"
              >
                {/* 问题标题栏 */}
                <Collapsible.Trigger asChild>
                  <Flex
                    as="button"
                    p={4}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    _hover={{
                      bg: "rgba(61, 57, 41, 0.05)",
                    }}
                    _active={{
                      bg: "rgba(61, 57, 41, 0.08)",
                    }}
                    _focus={{
                      outline: "none",
                      boxShadow: "none",
                    }}
                    transition="background-color 0.2s"
                    w="full"
                    textAlign="left"
                    bg="rgba(245, 244, 237, 0.8)"
                    color="#3d3929"
                    borderRadius="0"
                    boxShadow="none"
                  >
                    <Flex align="center" gap={2}>
                      <Text fontSize="16px">📋</Text>
                      <Text fontSize="14px" fontWeight="600" color="#3d3929">
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
                    bg="rgba(245, 244, 237, 0.8)"
                    color="#3d3929"
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
                      bg="transparent"
                      border="none"
                      fontSize="13px"
                      lineHeight="1.6"
                      color="#3d3929"
                      fontFamily="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
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
                <Box
                  flex="1"
                  border="0"
                  overflow="hidden"
                  bg="rgba(245, 244, 237, 0.8)"
                >
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
                  borderTop="1px solid rgba(61, 57, 41, 0.1)"
                  bg="rgba(245, 244, 237, 0.8)"
                >
                  <VStack gap={3}>
                    <Button
                      w="full"
                      bg="#bd5d3a"
                      color="white"
                      _hover={{ bg: "#a04d2f" }}
                      _active={{ bg: "#8b4513" }}
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
                      borderColor="rgba(61, 57, 41, 0.3)"
                      color="rgba(61, 57, 41, 0.7)"
                      _hover={{
                        bg: "rgba(61, 57, 41, 0.05)",
                        borderColor: "rgba(61, 57, 41, 0.4)",
                      }}
                      _active={{
                        bg: "rgba(61, 57, 41, 0.1)",
                        borderColor: "rgba(61, 57, 41, 0.4)",
                      }}
                      _focus={{
                        boxShadow: "none",
                        outline: "none",
                        borderColor: "rgba(61, 57, 41, 0.4)",
                      }}
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
                <Box
                  flex="1"
                  border="0"
                  overflow="hidden"
                  bg="rgba(245, 244, 237, 0.8)"
                >
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
                    borderTop="1px solid rgba(61, 57, 41, 0.1)"
                    bg="rgba(245, 244, 237, 0.8)"
                  >
                    <VStack gap={3}>
                      <Text
                        fontSize="12px"
                        color="rgba(61, 57, 41, 0.7)"
                        textAlign="center"
                      >
                        在这里编写你的初步代码想法，提交后进入代码实现阶段
                      </Text>
                      <Button
                        w="full"
                        bg="#bd5d3a"
                        color="white"
                        _hover={{ bg: "#a04d2f" }}
                        _active={{ bg: "#8b4513" }}
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
