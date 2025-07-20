// frontend/src/components/RightPanelImproved.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { Box, Button, VStack, Text, Flex, Collapsible } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import MarkdownRenderer from "./MarkdownRenderer";
import SmartCodeAnalyzer from "./SmartCodeAnalyzer";
import { PanelRight, FileText, Code2, Zap } from "lucide-react";

const RightPanelImproved: React.FC = () => {
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

  const [code, setCode] = useState<string>(
    "# Start writing your code here...\n"
  );
  const [activeTab, setActiveTab] = useState<"code" | "analysis">("code");

  const handleGetCodeFeedback = async () => {
    if (!code.trim() || code.trim() === "# Start writing your code here...") {
      console.log("Please write some code first");
      return;
    }

    if (
      currentStage !== "implementation" &&
      currentStage !== "testing_refinement"
    ) {
      setCurrentStage("implementation");
    }

    await getCodeFeedback(code);
  };

  const handleCodeSubmit = () => {
    if (!code.trim() || code.trim() === "# Start writing your code here...") {
      console.log("Please write some code first");
      return;
    }
    setCurrentStage("implementation");
  };

  // Define a custom theme for the editor on mount
  const handleEditorMount = (_editor: unknown, monaco: unknown) => {
    // TypeScript workaround for Monaco types
    const monacoEditor = monaco as {
      editor: { defineTheme: (name: string, theme: object) => void };
    };
    monacoEditor.editor.defineTheme("customTheme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#f5f4ed",
        "editorGutter.background": "#f5f4ed",
        "editor.lineHighlightBackground": "rgba(61, 57, 41, 0.05)",
        "scrollbarSlider.background": "#d4d3c9",
        "scrollbarSlider.hoverBackground": "#c4c3b9",
        "scrollbarSlider.activeBackground": "#b4b3a9",
      },
    });
  };

  const isCodeStage =
    currentStage === "implementation" || currentStage === "testing_refinement";
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
        // Collapsed state
        <Box p={3} bg="rgba(245, 244, 237, 0.8)">
          <VStack gap={4} align="center">
            <Button
              variant="ghost"
              w="40px"
              h="40px"
              borderRadius="6px"
              bg="transparent"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              onClick={toggleRightPanel}
              title="展开右侧面板"
            >
              <PanelRight />
            </Button>
            <Button
              variant="ghost"
              w="40px"
              h="40px"
              borderRadius="6px"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              onClick={toggleRightPanel}
              title="代码编辑"
            >
              <Code2 />
            </Button>
            <Button
              variant="ghost"
              w="40px"
              h="40px"
              borderRadius="6px"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              onClick={toggleRightPanel}
              title="智能分析"
            >
              <Zap />
            </Button>
          </VStack>
        </Box>
      ) : (
        // Expanded state
        <>
          {/* Title bar with tabs */}
          <Box
            borderBottom="1px solid rgba(61, 57, 41, 0.1)"
            bg="rgba(245, 244, 237, 0.8)"
          >
            {/* Main title bar */}
            <Flex justify="space-between" align="center" px={4} pt={4} pb={2}>
              <Text
                fontFamily="Georgia, 'Times New Roman', Times, serif"
                fontSize="20px"
                fontWeight="600"
                color="#3d3929"
              >
                编程助手
              </Text>
              <Button
                variant="ghost"
                w="40px"
                h="40px"
                borderRadius="6px"
                bg="transparent"
                color="#73726c"
                _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
                onClick={toggleRightPanel}
                title="收起右侧面板"
              >
                <PanelRight />
              </Button>
            </Flex>

            {/* Tab buttons */}
            <Flex px={4} pb={2} gap={1}>
              <Button
                size="sm"
                variant={activeTab === "code" ? "solid" : "ghost"}
                bg={activeTab === "code" ? "#f97316" : "transparent"}
                color={activeTab === "code" ? "white" : "#73726c"}
                _hover={{
                  bg:
                    activeTab === "code" ? "#ea580c" : "rgba(61, 57, 41, 0.08)",
                  color: activeTab === "code" ? "white" : "#3d3d3a",
                }}
                onClick={() => setActiveTab("code")}
                borderRadius="6px"
                h="32px"
              >
                <Flex align="center" gap={1}>
                  <Code2 size={14} />
                  <Text>代码编辑</Text>
                </Flex>
              </Button>
              <Button
                size="sm"
                variant={activeTab === "analysis" ? "solid" : "ghost"}
                bg={activeTab === "analysis" ? "#f97316" : "transparent"}
                color={activeTab === "analysis" ? "white" : "#73726c"}
                _hover={{
                  bg:
                    activeTab === "analysis"
                      ? "#ea580c"
                      : "rgba(61, 57, 41, 0.08)",
                  color: activeTab === "analysis" ? "white" : "#3d3d3a",
                }}
                onClick={() => setActiveTab("analysis")}
                borderRadius="6px"
                h="32px"
              >
                <Flex align="center" gap={1}>
                  <Zap size={14} />
                  <Text>智能分析</Text>
                </Flex>
              </Button>
            </Flex>
          </Box>

          {/* Problem description area */}
          {problem && activeTab === "code" && (
            <Collapsible.Root defaultOpen>
              <Box
                borderBottom="1px solid rgba(61, 57, 41, 0.1)"
                bg="rgba(245, 244, 237, 0.8)"
              >
                <Collapsible.Trigger asChild>
                  <Flex
                    as="button"
                    p={4}
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    _hover={{ bg: "rgba(61, 57, 41, 0.05)" }}
                    _focus={{ outline: "none", boxShadow: "none" }}
                  >
                    <Flex align="center" gap={2}>
                      <FileText size={16} color="#73726c" />
                      <Text fontSize="14px" fontWeight="500" color="#3d3929">
                        问题描述
                      </Text>
                    </Flex>
                  </Flex>
                </Collapsible.Trigger>

                <Collapsible.Content>
                  <Box
                    px={4}
                    pb={4}
                    maxH="200px"
                    overflowY="auto"
                    bg="rgba(245, 244, 237, 0.8)"
                    color="#3d3929"
                    css={{
                      "&::-webkit-scrollbar": { display: "none" },
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

          {/* Main content area */}
          <Box flex="1" display="flex" flexDirection="column">
            {activeTab === "code" ? (
              // Code editor tab
              <>
                <Box flex="1" border="0" overflow="hidden" bg="#f5f4ed">
                  <Editor
                    onMount={handleEditorMount}
                    height="100%"
                    language={language.toLowerCase()}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="customTheme"
                    options={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: "'JetBrains Mono', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      lineNumbers: "on",
                      glyphMargin: false,
                      folding: false,
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "none",
                      guides: { indentation: false },
                      rulers: [],
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                      },
                    }}
                  />
                </Box>

                {/* Bottom action area */}
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
                      {isCodeStage
                        ? "编写代码并获取AI反馈"
                        : "编写初始代码想法，提交进入实现阶段"}
                    </Text>

                    {isCodeStage ? (
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
                        disabled={
                          isStreaming ||
                          !code.trim() ||
                          code.trim() === "# Start writing your code here..."
                        }
                      >
                        {isStreaming ? "获取反馈中..." : "获取代码反馈"}
                      </Button>
                    ) : canSubmitCode ? (
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
                          code.trim() === "# Start writing your code here..."
                        }
                      >
                        提交代码并进入实现阶段
                      </Button>
                    ) : null}
                  </VStack>
                </Box>
              </>
            ) : activeTab === "analysis" ? (
              // Smart analysis tab
              <Box flex="1" overflow="auto">
                <SmartCodeAnalyzer />
              </Box>
            ) : null}
          </Box>
        </>
      )}
    </Box>
  );
};

export default RightPanelImproved;
