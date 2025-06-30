// frontend/src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Box, Code, Heading, Text, Link } from "@chakra-ui/react";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => <Heading as="h1" size="lg" my={4} {...props} />,
        h2: ({ ...props }) => <Heading as="h2" size="md" my={3} {...props} />,
        p: ({ ...props }) => <Text mb={2} {...props} />,
        a: ({ ...props }) => (
          <Link
            color="blue.500"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          const isInline = !match;

          if (isInline) {
            return (
              <Code
                bg="gray.100"
                color="gray.800"
                fontSize="0.9em"
                px={1}
                py={0.5}
                borderRadius="md"
                {...props}
              >
                {children}
              </Code>
            );
          }

          return (
            <Box
              bg="gray.50"
              borderRadius="md"
              my={4}
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
            >
              <SyntaxHighlighter
                language={language}
                style={oneLight}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  fontFamily:
                    "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace",
                  background: "transparent",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </Box>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
