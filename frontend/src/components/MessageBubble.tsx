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
            w="28px"
            h="28px"
            bg="#da7756"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            fontSize="14px"
            color="white"
            fontWeight="600"
          >
            C
          </Box>
        )}

        <VStack align={isUser ? "flex-end" : "flex-start"} gap={1} maxW="80%">
          <Text
            fontSize="12px"
            color="rgba(61, 57, 41, 0.7)"
            fontWeight="500"
            mb={1}
          >
            {isUser ? "You" : "CodeCoach"}
          </Text>

          <Box
            bg={isUser ? "#f0eee6" : "transparent"}
            color={isUser ? "#3d3929" : "#3d3929"}
            px={4}
            py={3}
            borderRadius="16px"
            maxW="100%"
            minH="44px" // 添加最小高度，防止抖动
            boxShadow={isUser ? "none" : "none"}
            border={isUser ? "1px solid rgba(61, 57, 41, 0.1)" : "none"}
            backdropFilter="none"
            position="relative"
            transition="none" // 禁用过渡动画，减少抖动
            _before={{}}
            _after={{}}
          >
            {isUser ? (
              <Text
                fontSize="15px"
                lineHeight="1.5"
                whiteSpace="pre-wrap"
                fontWeight="400"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
              >
                {message.text}
              </Text>
            ) : (
              <Box
                fontSize="15px"
                lineHeight="1.6"
                minH="20px" // 为AI消息添加最小高度
                wordBreak="break-word" // 确保长单词正确换行
                fontFamily="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
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
