// frontend/src/components/RightPanel.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { Box, Button, VStack, Text, Flex, Collapsible } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import MarkdownRenderer from "./MarkdownRenderer";
import { PanelRight, FileText, Code2 } from "lucide-react";

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
  const [code, setCode] = useState<string>(
    "# Start writing your code here...\n"
  );

  const handleGetCodeFeedback = async () => {
    if (!code.trim() || code.trim() === "# Start writing your code here...") {
      console.log("Please write some code first");
      return;
    }

    // If not in implementation or testing_refinement stage, switch to implementation stage first
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

    // Switch to implementation stage
    setCurrentStage("implementation");
  };

  // Define a custom theme for the editor on mount
  const handleEditorMount = (_editor: unknown, monaco: unknown) => {
    (monaco as any).editor.defineTheme("customTheme", {
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

  // Determine display content based on current stage
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
        // Collapsed state: show icons
        <Box p={3} bg="rgba(245, 244, 237, 0.8)">
          <VStack gap={4} align="center">
            {/* Toggle button */}
            <Button
              variant="ghost"
              w="40px"
              h="40px"
              borderRadius="6px"
              bg="transparent"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
              onClick={toggleRightPanel}
              title="Expand right panel"
            >
              <PanelRight />
            </Button>

            {/* Problem description icon */}
            <Button
              variant="ghost"
              w="40px"
              h="40px"
              bg="transparent"
              borderRadius="6px"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
              onClick={toggleRightPanel}
              title="Problem Description"
            >
              <FileText />
            </Button>

            {/* Code icon */}
            <Button
              variant="ghost"
              w="40px"
              h="40px"
              bg="transparent"
              borderRadius="6px"
              color="#73726c"
              _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
              _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
              onClick={toggleRightPanel}
              title="Code Editor"
            >
              <Code2 />
            </Button>
          </VStack>
        </Box>
      ) : (
        // Expanded state: show full content
        <>
          {/* Title bar */}
          <Box
            p={4}
            borderBottom="1px solid rgba(61, 57, 41, 0.1)"
            bg="rgba(245, 244, 237, 0.8)"
          >
            <Flex justify="space-between" align="center">
              <Text
                fontFamily="Georgia, 'Times New Roman', Times, serif"
                fontSize="20px"
                fontWeight="600"
                color="#3d3929"
              >
                Code
              </Text>
              <Button
                variant="ghost"
                w="40px"
                h="40px"
                borderRadius="6px"
                bg="transparent"
                color="#73726c"
                _hover={{ bg: "rgba(61, 57, 41, 0.08)", color: "#3d3d3a" }}
                _active={{ bg: "rgba(61, 57, 41, 0.12)" }}
                onClick={toggleRightPanel}
                title="Expand right panel"
              >
                <PanelRight />
              </Button>
            </Flex>
          </Box>

          {/* Problem description area */}
          {problem && (
            <Collapsible.Root defaultOpen>
              <Box
                borderBottom="1px solid rgba(61, 57, 41, 0.1)"
                bg="rgba(245, 244, 237, 0.8)"
              >
                {/* Problem title bar */}
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
                    <Flex align="center" gap={3}>
                      <FileText size={18} />
                      <Text
                        fontSize="14px"
                        fontWeight="600"
                        fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                      >
                        Current Problem
                      </Text>
                    </Flex>
                  </Flex>
                </Collapsible.Trigger>

                {/* Problem content */}
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

          {/* Main content area */}
          <Box flex="1" display="flex" flexDirection="column">
            {isCodeStage ? (
              // Implementation stage: show code editor
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
                      guides: {
                        indentation: false,
                      },
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

                {/* Bottom action area - Implementation stage */}
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
                      loadingText="Getting feedback..."
                      disabled={isStreaming}
                    >
                      Get Code Feedback
                    </Button>
                  </VStack>
                </Box>
              </>
            ) : (
              // First two stages: show code editor but different button functionality
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
                      guides: {
                        indentation: false,
                      },
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

                {/* Bottom action area - First two stages */}
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
                        Write your initial code ideas here, submit to enter
                        implementation stage
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
                          code.trim() === "# Start writing your code here..."
                        }
                      >
                        Submit Code and Enter Implementation Phase
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
