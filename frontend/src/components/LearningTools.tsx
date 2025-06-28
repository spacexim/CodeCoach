// frontend/src/components/LearningTools.tsx
import React from "react";

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
  return (
    <div className="learning-tools" style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={onExplainConceptClick}>解释概念</button>
      <button onClick={onRequestHintClick}>请求提示</button>
      <button onClick={onRequestChallengeClick}>接受挑战</button>
    </div>
  );
};

export default LearningTools;
