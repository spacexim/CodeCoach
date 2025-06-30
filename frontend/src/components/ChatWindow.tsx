import React, { useRef, useEffect, useState } from "react";
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
  const isInitializing = useAppStore((state) => state.isInitializing);
  const isStreaming = useAppStore((state) => state.isStreaming);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);

  // 调试日志
  console.log("ChatWindow render:", {
    messagesCount: messages.length,
    isInitializing,
    isStreaming,
  });

  // 检查用户是否在底部附近
  const checkIfNearBottom = () => {
    if (chatWindowRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      const threshold = 100; // 100px的阈值
      setIsUserNearBottom(scrollTop + clientHeight >= scrollHeight - threshold);
    }
  };

  // 平滑滚动到底部
  const scrollToBottom = (behavior: "smooth" | "instant" = "smooth") => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // 当消息变化时处理滚动
  useEffect(() => {
    if (isUserNearBottom) {
      // 如果用户在底部附近，自动滚动到底部
      if (isStreaming) {
        // 流式输出时使用即时滚动，减少抖动
        scrollToBottom("instant");
      } else {
        // 非流式输出时使用平滑滚动
        scrollToBottom("smooth");
      }
    }
  }, [messages, isUserNearBottom, isStreaming]);

  // 添加滚动事件监听
  useEffect(() => {
    const chatElement = chatWindowRef.current;
    if (chatElement) {
      chatElement.addEventListener("scroll", checkIfNearBottom);
      return () => chatElement.removeEventListener("scroll", checkIfNearBottom);
    }
  }, []);

  return (
    <>
      {/* 顶部加载进度条 */}
      {isStreaming && !isInitializing && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg="rgba(255, 107, 53, 0.2)"
          zIndex={10}
          overflow="hidden"
        >
          <Box
            h="100%"
            w="100%"
            bg="#ff6b35"
            animation="pulse 1.5s ease-in-out infinite"
            css={{
              "@keyframes pulse": {
                "0%": {
                  opacity: 0.4,
                  transform: "scaleX(0.8)",
                },
                "50%": {
                  opacity: 1,
                  transform: "scaleX(1)",
                },
                "100%": {
                  opacity: 0.4,
                  transform: "scaleX(0.8)",
                },
              },
            }}
          />
        </Box>
      )}

      <Box
        ref={chatWindowRef}
        flex="1"
        overflowY="auto"
        py={6}
        position="relative"
        h="0" // 这很重要：确保flex子元素正确计算高度
        maxH="100%" // 限制最大高度
        // 自定义滚动条样式 - 支持自动隐藏
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
            transition: "opacity 0.3s ease",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
            transition: "background 0.3s ease",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.4)",
          },
          // 默认隐藏滚动条
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
          // 鼠标悬停时显示滚动条
          "&:hover": {
            scrollbarColor: "rgba(0,0,0,0.2) transparent",
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.3)",
            },
          },
        }}
      >
        <VStack
          gap={6}
          align="stretch"
          maxW="800px"
          mx="auto"
          px={4}
          minH="full"
          pb={4} // 底部留一些空间
        >
          {messages.map((msg, index) => (
            <Box key={index} minH="fit-content">
              <MessageBubble message={msg} />
            </Box>
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
