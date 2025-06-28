// frontend/src/components/LearningTools.tsx
import React from "react";
import { HStack, Button } from "@chakra-ui/react";

interface LearningToolsProps {
  onExplainConceptClick: () => void;
  onRequestHintClick: () => void;
  onRequestChallengeClick: () => void;
}

const LearningTools: React.FC<LearningToolsProps> = ({
  onExplainConceptClick,
  onRequestHintClick,
  onRequestChallengeClick,
}) => {
  const buttonStyle = {
    bg: "white",
    border: "1px solid #e5e7eb",
    color: "gray.700",
    _hover: { bg: "gray.50", borderColor: "#d1d5db" },
    _active: { bg: "gray.100" },
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "14px",
    h: "36px",
    px: 4,
  };

  return (
    <HStack gap={3}>
      <Button {...buttonStyle} onClick={onExplainConceptClick}>
        解释概念
      </Button>
      <Button {...buttonStyle} onClick={onRequestHintClick}>
        请求提示
      </Button>
      <Button {...buttonStyle} onClick={onRequestChallengeClick}>
        接受挑战
      </Button>
    </HStack>
  );
};

export default LearningTools;
