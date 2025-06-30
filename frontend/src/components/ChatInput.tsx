import React, { useState } from "react";
import { useAppStore } from "../store";
import { Box, Textarea, Button, Spinner } from "@chakra-ui/react";

interface ChatInputProps {
  onSendMessage: (messageText: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState("");
  const isStreaming = useAppStore((state) => state.isStreaming);

  const handleSend = () => {
    if (inputValue.trim() && !isStreaming) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <Box position="relative" maxW="800px" mx="auto" w="full">
      <Box
        position="relative"
        border="1px solid"
        borderColor="#E5E7EB"
        borderRadius="12px"
        bg="white"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
        _focusWithin={{
          borderColor: "#bd5d3a",
          boxShadow: "0 0 0 3px rgba(189, 93, 58, 0.1)",
        }}
        transition="border-color 0.2s ease, box-shadow 0.2s ease"
      >
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="继续对话..."
          w="100%"
          minH="80px"
          p={4}
          pr={16}
          border="none"
          borderRadius="12px"
          fontSize="16px"
          resize="none"
          outline="none"
          bg="transparent"
          color="#3d3929"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
          disabled={isStreaming}
          _placeholder={{
            color: isStreaming ? "#bd5d3a" : "#9CA3AF",
          }}
          _focus={{
            outline: "none",
            boxShadow: "none",
            border: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          position="absolute"
          bottom={3}
          right={3}
          w="40px"
          h="40px"
          bg={inputValue.trim() && !isStreaming ? "#bd5d3a" : "#e5e7eb"}
          color="white"
          borderRadius="8px"
          minW="40px"
          fontSize="18px"
          disabled={!inputValue.trim() || isStreaming}
          _hover={{
            bg: inputValue.trim() && !isStreaming ? "#a04d2f" : "#e5e7eb",
            transform:
              inputValue.trim() && !isStreaming ? "scale(1.05)" : "none",
          }}
          transition="all 0.2s ease"
          onClick={handleSend}
        >
          {isStreaming ? <Spinner size="sm" color="white" /> : "↗"}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInput;
