import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type MarkdownProps = {
  content: string;
  className?: string;
  inline?: boolean;
};

export function Markdown({ content, className, inline }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) =>
          inline ? (
            <span className="whitespace-pre-wrap">{children}</span>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
          ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children }) => (
          <code className="px-1 py-0.5 bg-gray-100 rounded text-[0.9em]">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a href={href} className="underline underline-offset-2">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
