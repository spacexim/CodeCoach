import React, { useState } from "react";
import { useAppStore } from "../store";
import { Box, Textarea, Button, Spinner } from "@chakra-ui/react";
import { ArrowUp } from "lucide-react";

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
        border="1px solid rgba(61, 57, 41, 0.15)"
        borderRadius="12px"
        bg="rgba(255, 255, 255, 0.95)"
        boxShadow="0 1px 3px 0 rgba(61, 57, 41, 0.1)"
        _hover={{
          borderColor: "rgba(61, 57, 41, 0.25)",
        }}
        _focusWithin={{
          borderColor: "rgba(61, 57, 41, 0.25)",
          boxShadow: "0 2px 6px 0 rgba(61, 57, 41, 0.15)",
        }}
        transition="all 0.2s ease-in-out"
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
          fontFamily="'StyreneB', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
          disabled={isStreaming}
          _placeholder={{
            color: "#9CA3AF",
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
          {isStreaming ? (
            <Spinner size="sm" color="white" />
          ) : (
            <ArrowUp size="16px" />
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInput;
