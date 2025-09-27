import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Types for markdown components
interface MarkdownComponentProps {
  children?: React.ReactNode;
}

interface CodeProps extends MarkdownComponentProps {
  inline?: boolean;
  className?: string;
}

interface LinkProps extends MarkdownComponentProps {
  href?: string;
}

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }: MarkdownComponentProps) => (
            <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>
          ),
          h2: ({ children }: MarkdownComponentProps) => (
            <h2 className="text-base font-bold mb-2 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }: MarkdownComponentProps) => (
            <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>
          ),

          // Paragraphs
          p: ({ children }: MarkdownComponentProps) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),

          // Lists
          ul: ({ children }: MarkdownComponentProps) => (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }: MarkdownComponentProps) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }: MarkdownComponentProps) => (
            <li className="text-sm">{children}</li>
          ),

          // Code
          code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <pre className="bg-gray-100 rounded-md p-3 mb-2 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Links
          a: ({ href, children }: LinkProps) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),

          // Emphasis
          strong: ({ children }: MarkdownComponentProps) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }: MarkdownComponentProps) => (
            <em className="italic">{children}</em>
          ),

          // Blockquotes
          blockquote: ({ children }: MarkdownComponentProps) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }: MarkdownComponentProps) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-gray-300 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }: MarkdownComponentProps) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          th: ({ children }: MarkdownComponentProps) => (
            <th className="border border-gray-300 px-2 py-1 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }: MarkdownComponentProps) => (
            <td className="border border-gray-300 px-2 py-1">{children}</td>
          ),

          // Horizontal rule
          hr: () => <hr className="border-gray-300 my-3" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
