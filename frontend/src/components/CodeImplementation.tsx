import React, { useState } from "react";
import { useAppStore } from "../store";
import Editor from "@monaco-editor/react";
import { Box, Button, VStack, Text } from "@chakra-ui/react";

const CodeImplementation: React.FC = () => {
  const { language } = useAppStore();
  const [code, setCode] = useState<string>("# 在这里开始编写你的代码...\n");
  const [isLoading] = useState(false);

  const handleGetCodeFeedback = async () => {
    /* ... */
  };

  return (
    <VStack
      align="stretch"
      gap={4}
      bg="white"
      p={6}
      borderRadius="12px"
      border="1px solid #e5e7eb"
    >
      <Text fontSize="16px" fontWeight="600" color="gray.900">
        代码实现区
      </Text>
      <Box
        border="1px solid #e5e7eb"
        borderRadius="8px"
        overflow="hidden"
        bg="white"
      >
        <Editor
          height="40vh"
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
      <Button
        bg="#f97316"
        color="white"
        _hover={{ bg: "#ea580c" }}
        _active={{ bg: "#dc2626" }}
        borderRadius="8px"
        fontWeight="500"
        fontSize="14px"
        h="40px"
        onClick={handleGetCodeFeedback}
        loading={isLoading}
        loadingText="获取反馈中..."
      >
        获取代码反馈
      </Button>
    </VStack>
  );
};

export default CodeImplementation;
