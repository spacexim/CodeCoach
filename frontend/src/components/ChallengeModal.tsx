import React, { useState } from "react";
import { useAppStore } from "../store";
import { Button, Input, Text, VStack, Box, Heading } from "@chakra-ui/react";
import MarkdownRenderer from "./MarkdownRenderer";

const ChallengeModal: React.FC = () => {
  const { challenge, setChallenge } = useAppStore();
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCheckAnswer = () => {
    /* ... */
  };
  const handleClose = () => {
    setChallenge(null);
    setFeedback(null);
    setUserAnswer("");
  };

  if (!challenge) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
    >
      <Box
        bg="gray.700"
        p={6}
        borderRadius="lg"
        maxW="xl"
        w="90%"
        maxH="80%"
        overflowY="auto"
      >
        <VStack gap={4} align="stretch">
          <Heading size="md">微型挑战</Heading>
          <Box bg="gray.800" p={4} borderRadius="md">
            <MarkdownRenderer content={challenge?.challenge || ""} />
          </Box>
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="输入您的答案"
          />
          {feedback && (
            <Text color={feedback.startsWith("✅") ? "green.300" : "red.300"}>
              {feedback}
            </Text>
          )}
          <Box display="flex" gap={3} justifyContent="flex-end">
            <Button colorScheme="blue" onClick={handleCheckAnswer}>
              检查答案
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              关闭
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ChallengeModal;
