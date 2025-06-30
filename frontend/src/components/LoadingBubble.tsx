// frontend/src/components/LoadingBubble.tsx
import React from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

const LoadingBubble: React.FC = () => {
  return (
    <Box w="full">
      <HStack align="flex-start" gap={4} justify="flex-start" w="full">
        {/* AI头像 */}
        <Box
          w="32px"
          h="32px"
          bg="linear-gradient(135deg, #ff6b35, #f7931e)"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          boxShadow="0 2px 8px rgba(255, 107, 53, 0.3)"
        >
          <Text fontSize="16px" color="white">
            🧠
          </Text>
        </Box>

        <VStack align="flex-start" gap={1} maxW="85%">
          <Text fontSize="12px" color="#64748b" fontWeight="500" mb={1}>
            CodeCoach
          </Text>

          <Box
            bg="rgba(255, 255, 255, 0.95)"
            color="#1e293b"
            px={4}
            py={3}
            borderRadius="16px"
            maxW="100%"
            minH="44px"
            boxShadow="0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)"
            border="1px solid rgba(226, 232, 240, 0.6)"
            backdropFilter="blur(10px)"
            position="relative"
            display="flex"
            alignItems="center"
            _before={{
              content: '""',
              position: "absolute",
              top: "-4px",
              left: "12px",
              w: "12px",
              h: "12px",
              bg: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(226, 232, 240, 0.6)",
              borderRight: "none",
              borderBottom: "none",
              transform: "rotate(45deg)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* 加载动画 */}
            <HStack gap={1}>
              <Box
                w="8px"
                h="8px"
                bg="#ff6b35"
                borderRadius="full"
                css={{
                  animation: "bounce 1.4s infinite ease-in-out",
                  animationDelay: "0s",
                  "@keyframes bounce": {
                    "0%, 80%, 100%": {
                      transform: "scale(0.6)",
                      opacity: 0.5,
                    },
                    "40%": {
                      transform: "scale(1)",
                      opacity: 1,
                    },
                  },
                }}
              />
              <Box
                w="8px"
                h="8px"
                bg="#ff6b35"
                borderRadius="full"
                css={{
                  animation: "bounce 1.4s infinite ease-in-out",
                  animationDelay: "0.16s",
                  "@keyframes bounce": {
                    "0%, 80%, 100%": {
                      transform: "scale(0.6)",
                      opacity: 0.5,
                    },
                    "40%": {
                      transform: "scale(1)",
                      opacity: 1,
                    },
                  },
                }}
              />
              <Box
                w="8px"
                h="8px"
                bg="#ff6b35"
                borderRadius="full"
                css={{
                  animation: "bounce 1.4s infinite ease-in-out",
                  animationDelay: "0.32s",
                  "@keyframes bounce": {
                    "0%, 80%, 100%": {
                      transform: "scale(0.6)",
                      opacity: 0.5,
                    },
                    "40%": {
                      transform: "scale(1)",
                      opacity: 1,
                    },
                  },
                }}
              />
            </HStack>
          </Box>
        </VStack>
      </HStack>
    </Box>
  );
};

export default LoadingBubble;
