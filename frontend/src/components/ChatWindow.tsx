import React, { useRef, useEffect } from "react";
import { useAppStore } from "../store";
import MessageBubble from "./MessageBubble";
import {
  Box,
  Stack,
  VStack,
  HStack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";

const ChatWindow: React.FC = () => {
  const messages = useAppStore((state) => state.messages);
  const isInitializing = useAppStore((state) => state.isInitializing); // 新增
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // 调试日志
  console.log("ChatWindow render:", {
    messagesCount: messages.length,
    isInitializing,
  });

  useEffect(() => {
    if (chatWindowRef.current) {
      // 平滑滚动到底部
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <>
      <Box
        ref={chatWindowRef}
        flex="1"
        overflowY="auto"
        py={6}
        position="relative"
        h="0" // 这很重要：确保flex子元素正确计算高度
        maxH="100%" // 限制最大高度
        // 自定义滚动条样式
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.1)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.3)",
          },
        }}
      >
        <VStack
          gap={6}
          align="stretch"
          maxW="800px"
          mx="auto"
          px={4}
          minH="full" // 确保内容至少填满容器
        >
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}

          {/* Skeleton过渡效果 - 当isInitializing为true时显示 */}
          {isInitializing && (
            <Stack gap="6" maxW="full">
              <HStack width="full">
                <SkeletonCircle size="10" />
                <SkeletonText noOfLines={2} />
              </HStack>
              <Skeleton height="200px" />
            </Stack>
          )}
        </VStack>
      </Box>
    </>
  );
};

export default ChatWindow;
