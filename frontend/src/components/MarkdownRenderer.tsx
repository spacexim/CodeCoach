// frontend/src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
            color="teal.300"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;
          return !isInline ? (
            <Box
              as="pre"
              p={4}
              bg="gray.700"
              borderRadius="md"
              my={4}
              overflowX="auto"
            >
              <Code className={className} {...props}>
                {String(children).replace(/\n$/, "")}
              </Code>
            </Box>
          ) : (
            <Code colorScheme="purple" fontSize="0.9em" {...props}>
              {children}
            </Code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
