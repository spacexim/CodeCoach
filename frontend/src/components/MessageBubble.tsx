// frontend/src/components/MessageBubble.tsx
import React from "react";
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <Box w="full">
      <HStack
        align="flex-start"
        gap={4}
        justify={isUser ? "flex-end" : "flex-start"}
        w="full"
      >
        {!isUser && (
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
        )}

        <VStack align={isUser ? "flex-end" : "flex-start"} gap={1} maxW="85%">
          <Text fontSize="12px" color="#64748b" fontWeight="500" mb={1}>
            {isUser ? "You" : "CodeCoach"}
          </Text>

          <Box
            bg={isUser ? "#ff6b35" : "rgba(255, 255, 255, 0.95)"}
            color={isUser ? "white" : "#1e293b"}
            px={4}
            py={3}
            borderRadius="16px"
            maxW="100%"
            minH="44px" // 添加最小高度，防止抖动
            boxShadow={
              isUser
                ? "0 2px 8px rgba(255, 107, 53, 0.2)"
                : "0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)"
            }
            border={isUser ? "none" : "1px solid rgba(226, 232, 240, 0.6)"}
            backdropFilter={isUser ? "none" : "blur(10px)"}
            position="relative"
            transition="none" // 禁用过渡动画，减少抖动
            _before={
              isUser
                ? {}
                : {
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
                  }
            }
            _after={
              isUser
                ? {
                    content: '""',
                    position: "absolute",
                    top: "12px",
                    right: "-4px",
                    w: "12px",
                    h: "12px",
                    bg: "#ff6b35",
                    transform: "rotate(45deg)",
                  }
                : {}
            }
          >
            {isUser ? (
              <Text
                fontSize="15px"
                lineHeight="1.5"
                whiteSpace="pre-wrap"
                fontWeight="400"
              >
                {message.text}
              </Text>
            ) : (
              <Box
                fontSize="15px"
                lineHeight="1.6"
                minH="20px" // 为AI消息添加最小高度
                wordBreak="break-word" // 确保长单词正确换行
              >
                <MarkdownRenderer content={message.text} />
              </Box>
            )}
          </Box>
        </VStack>

        {isUser && (
          <Box
            w="32px"
            h="32px"
            bg="#64748b"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            boxShadow="0 2px 8px rgba(100, 116, 139, 0.3)"
          >
            <Text fontSize="16px" color="white">
              👤
            </Text>
          </Box>
        )}
      </HStack>
    </Box>
  );
};

export default MessageBubble;
