// frontend/src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Box, Code, Heading, Text, Link } from "@chakra-ui/react";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <Heading
            as="h1"
            size="xl"
            my={6}
            color="inherit"
            fontWeight="600"
            fontFamily="inherit"
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <Heading
            as="h2"
            size="lg"
            my={5}
            color="inherit"
            fontWeight="600"
            fontFamily="inherit"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <Heading
            as="h3"
            size="md"
            my={4}
            color="inherit"
            fontWeight="600"
            fontFamily="inherit"
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <Text
            mb={4}
            color="inherit"
            lineHeight="1.7"
            fontSize="15px"
            fontFamily="inherit"
            {...props}
          />
        ),
        a: ({ ...props }) => (
          <Link
            color="#2563eb"
            textDecoration="underline"
            _hover={{ color: "#1d4ed8" }}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ol: ({ children, ...props }) => (
          <ol
            style={{
              margin: "16px 0",
              paddingLeft: "24px",
              color: "inherit",
              fontFamily: "inherit",
            }}
            {...props}
          >
            {children}
          </ol>
        ),
        ul: ({ children, ...props }) => (
          <ul
            style={{
              margin: "16px 0",
              paddingLeft: "24px",
              color: "inherit",
              fontFamily: "inherit",
            }}
            {...props}
          >
            {children}
          </ul>
        ),
        li: ({ children, ...props }) => (
          <li
            style={{
              lineHeight: "1.7",
              fontSize: "15px",
              marginBottom: "4px",
            }}
            {...props}
          >
            {children}
          </li>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          const isInline = !match;

          if (isInline) {
            return (
              <Code
                bg="#f0efec"
                color="#5c1616"
                fontSize="14px"
                px={1.5}
                py={0.5}
                borderRadius="4px"
                fontFamily="'JetBrains Mono', monospace"
                border="1px solid #e5e7eb"
                {...props}
              >
                {children}
              </Code>
            );
          }

          return (
            <Box
              bg="#fdfcfa"
              borderRadius="8px"
              my={4}
              border="1px solid #e5e7eb"
              overflow="hidden"
            >
              {/* 语言标签 */}
              {language && (
                <Box
                  bg="#fdfcfa"
                  px={4}
                  py={2}
                  fontSize="12px"
                  color="#6b7280"
                  fontWeight="500"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {language}
                </Box>
              )}
              <SyntaxHighlighter
                language={language || "text"}
                style={{
                  'code[class*="language-"]': {
                    background: "transparent",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  'pre[class*="language-"]': {
                    background: "transparent",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  comment: {
                    color: "#6a737d",
                    fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  prolog: {
                    color: "#6a737d",
                    fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  doctype: {
                    color: "#6a737d",
                    fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  cdata: {
                    color: "#6a737d",
                    fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  punctuation: {
                    color: "#24292f",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  namespace: {
                    opacity: 0.7,
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  property: {
                    color: "#005cc5",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  tag: {
                    color: "#22863a",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  boolean: {
                    color: "#005cc5",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  number: {
                    color: "#005cc5",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  constant: {
                    color: "#005cc5",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  symbol: {
                    color: "#005cc5",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  deleted: {
                    color: "#d73a49",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  selector: {
                    color: "#22863a",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  "attr-name": {
                    color: "#6f42c1",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  string: {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  char: {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  builtin: {
                    color: "#005cc5",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  inserted: {
                    color: "#22863a",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  variable: {
                    color: "#e36209",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  operator: {
                    color: "#d73a49",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  entity: {
                    color: "#22863a",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  url: {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  ".language-css .token.string": {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  ".style .token.string": {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  atrule: {
                    color: "#d73a49",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  "attr-value": {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  keyword: {
                    color: "#d73a49",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  function: {
                    color: "#6f42c1",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  "class-name": {
                    color: "#6f42c1",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  regex: {
                    color: "#032f62",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  important: {
                    color: "#d73a49",
                    fontWeight: "bold",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  bold: {
                    fontWeight: "bold",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                  italic: {
                    fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                }}
                customStyle={{
                  margin: 0,
                  padding: language ? "0 16px 16px 16px" : "16px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  fontFamily: "'JetBrains Mono', monospace",
                  background: "transparent",
                  color: "#141413",
                }}
                codeTagProps={{
                  style: {
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                  },
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </Box>
          );
        },
        blockquote: ({ children, ...props }) => (
          <blockquote
            style={{
              borderLeft: "4px solid #e5e7eb",
              paddingLeft: "16px",
              margin: "16px 0",
              padding: "8px 0 8px 16px",
              background: "#f9fafb",
              borderRadius: "0 4px 4px 0",
            }}
            {...props}
          >
            {children}
          </blockquote>
        ),
        strong: ({ children, ...props }) => (
          <strong style={{ fontWeight: "600", color: "inherit" }} {...props}>
            {children}
          </strong>
        ),
        em: ({ children, ...props }) => (
          <em style={{ fontStyle: "italic" }} {...props}>
            {children}
          </em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
