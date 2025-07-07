import React, { useState } from "react";
import { useAppStore } from "../store";
import {
  Button,
  Text,
  VStack,
  Box,
  Heading,
  HStack,
  Textarea,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

const ChallengeModal: React.FC = () => {
  const { challenge, setChallenge, sessionId, setError } = useAppStore();
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleCheckAnswer = async () => {
    if (!userAnswer.trim() || !sessionId) return;

    setIsChecking(true);
    setFeedback(null);
    setIsCorrect(null);
    setExplanation(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/session/${sessionId}/challenge/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: userAnswer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFeedback(data.feedback);
        setIsCorrect(data.isCorrect);
        if (data.explanation) {
          setExplanation(data.explanation);
        }
      } else {
        setError("Failed to check answer, please try again");
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setError("Error checking answer, please try again");
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setChallenge(null);
    setFeedback(null);
    setIsCorrect(null);
    setUserAnswer("");
    setExplanation(null);
  };

  const handleTryAgain = () => {
    setFeedback(null);
    setIsCorrect(null);
    setExplanation(null);
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
      backdropFilter="blur(4px)"
    >
      <Box
        bg="white"
        borderRadius="16px"
        maxW="2xl"
        w="90%"
        maxH="90%"
        overflowY="auto"
        boxShadow="xl"
        border="1px solid"
        borderColor="gray.200"
      >
        {/* Header */}
        <HStack
          justify="space-between"
          align="center"
          p={6}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Heading size="lg" color="gray.800" fontWeight="600">
            🎯 Mini Challenge
          </Heading>
          <Button
            variant="ghost"
            onClick={handleClose}
            size="sm"
            bg="transparent"
            color="gray.500"
            border="none"
            style={{
              color: "#718096",
              backgroundColor: "transparent",
            }}
            _hover={{
              bg: "gray.100",
              color: "gray.700",
            }}
            _active={{
              bg: "gray.200",
            }}
            css={{
              color: "#718096 !important",
              backgroundColor: "transparent !important",
              "&:hover": {
                color: "#4A5568 !important",
                backgroundColor: "#F7FAFC !important",
              },
              "&:active": {
                backgroundColor: "#E2E8F0 !important",
              },
            }}
          >
            <X size={20} style={{ color: "inherit" }} />
          </Button>
        </HStack>

        {/* Content */}
        <VStack gap={6} align="stretch" p={6}>
          {/* Challenge Question */}
          <Box
            bg="gray.50"
            p={5}
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
            color="gray.800"
            css={{
              "& *": {
                color: "#2D3748 !important",
              },
              "& p": {
                color: "#2D3748 !important",
                marginBottom: "8px",
              },
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                color: "#1A202C !important",
              },
              "& code": {
                color: "#4A5568 !important",
                background: "#F7FAFC",
                padding: "2px 4px",
                borderRadius: "4px",
              },
              "& pre": {
                color: "#2D3748 !important",
                background: "#F7FAFC",
                padding: "12px",
                borderRadius: "8px",
                overflow: "auto",
              },
            }}
          >
            <MarkdownRenderer content={challenge?.challenge || ""} />
          </Box>

          {/* Answer Input */}
          <Box>
            <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
              Your Answer:
            </Text>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Please enter your answer..."
              resize="vertical"
              minH="80px"
              bg="white"
              color="gray.800"
              border="2px solid"
              borderColor="gray.200"
              _focus={{
                borderColor: "#bd5d3a",
                boxShadow: "0 0 0 1px #bd5d3a",
                color: "#2D3748",
              }}
              _placeholder={{
                color: "gray.400",
              }}
              style={{
                color: "#2D3748 !important",
                backgroundColor: "#FFFFFF !important",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              css={{
                color: "#2D3748 !important",
                backgroundColor: "#FFFFFF !important",
                "&::placeholder": {
                  color: "#A0AEC0 !important",
                },
                "&:focus": {
                  color: "#2D3748 !important",
                },
                "& textarea": {
                  color: "#2D3748 !important",
                },
                // 强制覆盖任何可能的透明样式
                "& *": {
                  color: "#2D3748 !important",
                },
                // 额外的强制样式
                "&.chakra-textarea": {
                  color: "#2D3748 !important",
                },
                textarea: {
                  color: "#2D3748 !important",
                },
              }}
            />
          </Box>

          {/* Feedback */}
          {feedback && (
            <Box
              bg={isCorrect ? "green.50" : "orange.50"}
              border="1px solid"
              borderColor={isCorrect ? "green.200" : "orange.200"}
              borderRadius="12px"
              p={4}
            >
              <Text
                fontSize="sm"
                fontWeight="500"
                color={isCorrect ? "green.800" : "orange.800"}
              >
                {feedback}
              </Text>
              {explanation && isCorrect && (
                <Box bg="green.100" p={3} borderRadius="8px" mt={3}>
                  <Text fontSize="sm" color="gray.700">
                    <strong>Explanation:</strong> {explanation}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <HStack gap={3} justify="flex-end">
            {isCorrect === false && (
              <Button
                variant="outline"
                onClick={handleTryAgain}
                size="md"
                bg="transparent"
                color="#ea580c"
                border="2px solid #ea580c"
                style={{
                  color: "#ea580c",
                  backgroundColor: "transparent",
                  borderColor: "#ea580c",
                }}
                _hover={{
                  bg: "#fff8f1",
                  color: "#c2410c",
                  borderColor: "#c2410c",
                }}
                _active={{
                  bg: "#fed7aa",
                  color: "#9a3412",
                }}
                css={{
                  color: "#ea580c !important",
                  backgroundColor: "transparent !important",
                  borderColor: "#ea580c !important",
                  "&:hover": {
                    color: "#c2410c !important",
                    backgroundColor: "#fff8f1 !important",
                    borderColor: "#c2410c !important",
                  },
                  "&:active": {
                    backgroundColor: "#fed7aa !important",
                    color: "#9a3412 !important",
                  },
                }}
              >
                Try Again
              </Button>
            )}

            {isCorrect !== true && (
              <Button
                bg="#bd5d3a"
                color="white"
                _hover={{ bg: "#a04d2f" }}
                onClick={handleCheckAnswer}
                disabled={!userAnswer.trim() || isChecking}
                loading={isChecking}
                loadingText="Checking..."
                size="md"
              >
                Check Answer
              </Button>
            )}

            {isCorrect === true && (
              <Button
                bg="#28a745"
                color="white"
                _hover={{ bg: "#218838" }}
                onClick={handleClose}
                size="md"
              >
                Complete Challenge ✨
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleClose}
              size="md"
              bg="transparent"
              color="gray.600"
              border="none"
              style={{
                color: "#718096",
                backgroundColor: "transparent",
              }}
              _hover={{
                bg: "gray.100",
                color: "gray.800",
              }}
              _active={{
                bg: "gray.200",
              }}
              css={{
                color: "#718096 !important",
                backgroundColor: "transparent !important",
                "&:hover": {
                  color: "#2D3748 !important",
                  backgroundColor: "#F7FAFC !important",
                },
                "&:active": {
                  backgroundColor: "#E2E8F0 !important",
                },
              }}
            >
              Close
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default ChallengeModal;
