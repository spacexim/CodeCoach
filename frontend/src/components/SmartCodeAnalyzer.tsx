import React, { useState } from "react";
import { useAppStore } from "../store";
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Textarea,
  Badge,
  Separator,
} from "@chakra-ui/react";
import {
  Code,
  Zap,
  Bug,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface AnalysisResult {
  intent: string;
  reason: string;
  analysis: string;
  analysis_type: string;
}

const SmartCodeAnalyzer: React.FC = () => {
  const { sessionId } = useAppStore();
  const [code, setCode] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      setError("请输入代码进行分析");
      return;
    }

    if (!sessionId) {
      setError("请先开始一个学习会话");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/session/${sessionId}/feedback_v2`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        throw new Error(`分析失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAnalysisResult({
          intent: "code_analysis",
          reason: "精准代码分析",
          analysis: data.analysis,
          analysis_type: data.analysis_type,
        });
      } else {
        setError(data.error || "分析失败");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "网络连接错误");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case "debugging_assistance":
        return <Bug size={16} />;
      case "code_review":
        return <CheckCircle2 size={16} />;
      case "optimization_help":
        return <TrendingUp size={16} />;
      default:
        return <Code size={16} />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "debugging_assistance":
        return "red";
      case "code_review":
        return "green";
      case "optimization_help":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Box
      p={4}
      bg="#faf9f5"
      borderRadius="12px"
      border="1px solid rgba(61, 57, 41, 0.1)"
    >
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <Flex align="center" gap={3}>
          <Zap size={20} color="#f97316" />
          <Text
            fontFamily="Georgia, 'Times New Roman', Times, serif"
            fontSize="18px"
            fontWeight="600"
            color="#3d3929"
          >
            智能代码分析
          </Text>
        </Flex>

        {/* Code Input */}
        <Box>
          <Text mb={2} fontSize="14px" fontWeight="500" color="#73726c">
            粘贴你的代码进行分析：
          </Text>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="在这里输入你的代码..."
            rows={8}
            bg="#f5f4ed"
            border="1px solid rgba(61, 57, 41, 0.2)"
            borderRadius="8px"
            fontFamily="'JetBrains Mono', 'Courier New', monospace"
            fontSize="13px"
            resize="vertical"
            _focus={{
              borderColor: "#f97316",
              boxShadow: "0 0 0 1px #f97316",
            }}
          />
        </Box>

        {/* Analyze Button */}
        <Flex align="center" gap={2}>
          <Zap size={16} color="#f97316" />
          <Button
            onClick={handleAnalyzeCode}
            loading={isAnalyzing}
            bg="#f97316"
            color="white"
            size="sm"
            borderRadius="8px"
            _hover={{ bg: "#ea580c" }}
            _active={{ bg: "#dc2626" }}
            disabled={!code.trim()}
            flex={1}
          >
            {isAnalyzing ? "分析中..." : "分析代码"}
          </Button>
        </Flex>

        {/* Error Display */}
        {error && (
          <Box p={3} bg="#fee2e2" borderRadius="8px" border="1px solid #fca5a5">
            <Flex align="center" gap={2}>
              <AlertCircle size={16} color="#dc2626" />
              <Text fontSize="14px" color="#dc2626">
                {error}
              </Text>
            </Flex>
          </Box>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <Box
            p={4}
            bg="white"
            borderRadius="12px"
            border="1px solid rgba(61, 57, 41, 0.1)"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
          >
            <VStack align="stretch" gap={3}>
              {/* Intent Badge */}
              <Flex align="center" gap={2}>
                <Badge
                  colorScheme={getIntentColor(analysisResult.intent)}
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="6px"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  {getIntentIcon(analysisResult.intent)}
                  <Text fontSize="12px" fontWeight="500">
                    精准分析
                  </Text>
                </Badge>
                <Text fontSize="12px" color="#73726c">
                  {analysisResult.reason}
                </Text>
              </Flex>

              <Separator />

              {/* Analysis Content */}
              <Box>
                <MarkdownRenderer content={analysisResult.analysis} />
              </Box>
            </VStack>
          </Box>
        )}

        {/* Tips */}
        <Box
          p={3}
          bg="rgba(249, 115, 22, 0.05)"
          borderRadius="8px"
          border="1px solid rgba(249, 115, 22, 0.1)"
        >
          <Text fontSize="12px" color="#73726c" lineHeight="1.5">
            💡 <strong>提示：</strong>
            智能分析会识别代码中的具体问题、给出改进建议，并提供可操作的解决方案。
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default SmartCodeAnalyzer;
