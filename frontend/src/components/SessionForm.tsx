// frontend/src/components/SessionForm.tsx
import React, { useState } from "react";
import { useAppStore } from "../store";
import { Box, Button, VStack, Heading, Textarea, Text } from "@chakra-ui/react";

interface SessionFormProps {
  onStart: (
    problem: string,
    language: string,
    skillLevel: string
  ) => Promise<void>;
}

const SessionForm: React.FC<SessionFormProps> = ({ onStart }) => {
  const [problem, setProblem] = useState("");
  const [language, setLanguage] = useState("Python");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [isLoading, setIsLoading] = useState(false);
  const error = useAppStore((state) => state.error);

  const handleStartClick = async () => {
    setIsLoading(true);
    await onStart(problem, language, skillLevel);
    setIsLoading(false);
  };

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt="4rem"
      p={8}
      bg="gray.700"
      borderRadius="xl"
      borderWidth={1}
      borderColor="gray.600"
    >
      <VStack gap={6}>
        <Heading size="lg">开始新的学习会话</Heading>
        {error && (
          <Box
            p={3}
            bg="red.100"
            borderLeft="4px solid"
            borderColor="red.500"
            borderRadius="md"
            color="red.700"
          >
            {error}
          </Box>
        )}
        <Box w="full">
          <Text mb={2} fontWeight="medium">
            编程问题 *
          </Text>
          <Textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="输入您想解决的编程问题..."
          />
        </Box>
        <Box w="full">
          <Text mb={2} fontWeight="medium">
            编程语言
          </Text>
          <select
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "white",
              border: "1px solid #CBD5E0",
              borderRadius: "6px",
            }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Java">Java</option>
          </select>
        </Box>
        <Box w="full">
          <Text mb={2} fontWeight="medium">
            技能水平
          </Text>
          <select
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "white",
              border: "1px solid #CBD5E0",
              borderRadius: "6px",
            }}
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          >
            <option value="beginner">初学者</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </Box>
        <Button
          colorScheme="purple"
          size="lg"
          width="full"
          onClick={handleStartClick}
          loading={isLoading}
          loadingText="正在开启..."
        >
          开始学习
        </Button>
      </VStack>
    </Box>
  );
};

export default SessionForm;
