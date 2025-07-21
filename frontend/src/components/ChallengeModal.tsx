import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import { API_BASE_URL } from "../config/api";
import { Button, Text, VStack, Box, Heading, HStack } from "@chakra-ui/react";
import { X } from "lucide-react";

interface ParsedChallenge {
  question: string;
  options: { label: string; value: string }[];
  codeBlock?: string;
  codeLanguage?: string;
}

const ChallengeModal: React.FC = () => {
  const { challenge, setChallenge, sessionId, setError } = useAppStore();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [parsedChallenge, setParsedChallenge] =
    useState<ParsedChallenge | null>(null);

  // Parse the challenge text into structured format
  useEffect(() => {
    if (challenge?.challenge) {
      const parsed = parseChallenge(challenge.challenge);
      setParsedChallenge(parsed);
    }
  }, [challenge]);

  const parseChallenge = (challengeText: string): ParsedChallenge => {
    const lines = challengeText.split("\n").filter((line) => line.trim());

    // Find the question part (everything before options)
    const questionLines: string[] = [];
    const optionLines: string[] = [];
    let foundOptions = false;
    let codeBlock = "";
    let codeLanguage = "";
    let inCodeBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Handle code blocks
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          // Extract language from opening tag
          const langMatch = trimmed.match(/^```(\w+)?/);
          codeLanguage = langMatch?.[1] || "text";
        } else {
          inCodeBlock = false;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlock += line + "\n";
        continue;
      }

      // Check if this line looks like an option (starts with A), B), C), D) etc.)
      if (/^[A-D]\)\s/.test(trimmed)) {
        foundOptions = true;
        optionLines.push(trimmed);
      } else if (!foundOptions && !trimmed.toLowerCase().includes("options:")) {
        // Clean up formatting characters and unwanted text
        const cleanLine = trimmed
          .replace(/^#+\s*/, "") // Remove markdown headers
          .replace(/^(Mini-Challenge:|Problem:|Challenge:)\s*/i, "") // Remove prefixes
          .replace(/\*\*/g, "") // Remove bold markdown
          .trim();

        if (
          cleanLine &&
          !cleanLine.includes("CORRECT_ANSWER:") &&
          !cleanLine.includes("EXPLANATION:")
        ) {
          questionLines.push(cleanLine);
        }
      }
    }

    // Extract and clean question
    let question = questionLines.join(" ").trim();

    // Further cleanup of the question
    question = question
      .replace(/^(Mini-Challenge:|Problem:|Challenge:)\s*/i, "")
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Parse options
    const options = optionLines.map((line) => {
      const match = line.match(/^([A-D])\)\s*(.+)$/);
      if (match) {
        return {
          label: match[2].trim(),
          value: match[1],
        };
      }
      return { label: line.replace(/^[A-D]\)\s*/, ""), value: line.charAt(0) };
    });

    return {
      question,
      options,
      codeBlock: codeBlock.trim() || undefined,
      codeLanguage: codeLanguage || undefined,
    };
  };

  const handleCheckAnswer = async () => {
    if (!selectedAnswer.trim() || !sessionId) return;

    setIsChecking(true);
    setFeedback(null);
    setIsCorrect(null);
    setExplanation(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/session/${sessionId}/challenge/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: selectedAnswer,
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
    setSelectedAnswer("");
    setExplanation(null);
  };

  const handleTryAgain = () => {
    setFeedback(null);
    setIsCorrect(null);
    setExplanation(null);
    setSelectedAnswer("");
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
          <Box>
            <Text
              fontSize="lg"
              fontWeight="600"
              color="gray.800"
              mb={4}
              lineHeight="1.6"
            >
              {parsedChallenge?.question || challenge?.challenge || ""}
            </Text>

            {/* Code Block Display */}
            {parsedChallenge?.codeBlock && (
              <Box
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p={4}
                mb={4}
                fontFamily="'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
                fontSize="sm"
                overflow="auto"
              >
                <Text
                  fontSize="xs"
                  color="gray.600"
                  mb={2}
                  fontWeight="500"
                  textTransform="uppercase"
                >
                  {parsedChallenge.codeLanguage || "Code"}
                </Text>
                <Box
                  as="pre"
                  color="gray.800"
                  whiteSpace="pre-wrap"
                  fontFamily="inherit"
                  lineHeight="1.5"
                >
                  <code>{parsedChallenge.codeBlock}</code>
                </Box>
              </Box>
            )}
          </Box>

          {/* Multiple Choice Options */}
          {parsedChallenge?.options && parsedChallenge.options.length > 0 ? (
            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={3}>
                Select your answer:
              </Text>
              <VStack align="stretch" gap={3}>
                {parsedChallenge.options.map((option) => (
                  <Box
                    key={option.value}
                    onClick={() => setSelectedAnswer(option.value)}
                    cursor="pointer"
                    border="2px solid"
                    borderColor={
                      selectedAnswer === option.value ? "#bd5d3a" : "gray.200"
                    }
                    borderRadius="12px"
                    p={4}
                    bg={selectedAnswer === option.value ? "#fdf7f3" : "white"}
                    transition="all 0.2s"
                    _hover={{
                      borderColor:
                        selectedAnswer === option.value
                          ? "#bd5d3a"
                          : "gray.300",
                      bg:
                        selectedAnswer === option.value ? "#fdf7f3" : "gray.50",
                    }}
                  >
                    <HStack>
                      <Box
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={
                          selectedAnswer === option.value
                            ? "#bd5d3a"
                            : "gray.300"
                        }
                        bg={
                          selectedAnswer === option.value ? "#bd5d3a" : "white"
                        }
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.2s"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color={
                            selectedAnswer === option.value
                              ? "white"
                              : "gray.600"
                          }
                        >
                          {option.value}
                        </Text>
                      </Box>
                      <Text fontSize="md" color="gray.800" flex="1">
                        {option.label}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          ) : (
            /* Fallback for non-multiple choice questions */
            <Box
              bg="gray.50"
              p={5}
              borderRadius="12px"
              border="1px solid"
              borderColor="gray.200"
              color="gray.800"
            >
              <Text>{challenge?.challenge || ""}</Text>
            </Box>
          )}

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
                disabled={!selectedAnswer.trim() || isChecking}
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
