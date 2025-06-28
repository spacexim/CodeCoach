import React, { useState } from "react";
import { useAppStore } from "../store";
import Editor from "@monaco-editor/react";
import { Box, Button, VStack, Heading } from "@chakra-ui/react";

const CodeImplementation: React.FC = () => {
  const { language } = useAppStore();
  const [code, setCode] = useState<string>("# 在这里开始编写你的代码...\n");
  const [isLoading] = useState(false);

  const handleGetCodeFeedback = async () => {
    /* ... */
  };

  return (
    <VStack align="stretch" gap={4} bg="gray.700" p={4} borderRadius="lg">
      <Heading size="md">代码实现区</Heading>
      <Box
        borderWidth={1}
        borderColor="gray.600"
        borderRadius="md"
        overflow="hidden"
      >
        <Editor
          height="40vh"
          language={language.toLowerCase()}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
        />
      </Box>
      <Button
        colorScheme="teal"
        onClick={handleGetCodeFeedback}
        loading={isLoading}
      >
        获取代码反馈
      </Button>
    </VStack>
  );
};

export default CodeImplementation;
