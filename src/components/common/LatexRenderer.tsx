import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({
  content,
  className = '',
  block = false,
}) => {
  // Check if content contains LaTeX delimiters ($...$ or $$...$$)
  const renderMathWithDelimiters = (text: string) => {
    // Regex matches $$block$$ or $inline$
    const parts: React.ReactNode[] = [];
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let keyIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIdx++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const matchStr = match[0];
      const isBlock = matchStr.startsWith('$$');
      const math = isBlock ? matchStr.slice(2, -2) : matchStr.slice(1, -1);

      try {
        const html = katex.renderToString(math, {
          displayMode: isBlock,
          throwOnError: false,
        });
        parts.push(
          <span
            key={`math-${keyIdx++}`}
            dangerouslySetInnerHTML={{ __html: html }}
            className="inline-block align-middle mx-0.5"
          />
        );
      } catch (err) {
        parts.push(<span key={`err-${keyIdx++}`}>{matchStr}</span>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-tail-${keyIdx++}`}>{text.substring(lastIndex)}</span>
      );
    }

    return parts;
  };

  if (!content.includes('$')) {
    // Direct LaTeX if block is explicitly requested
    if (block) {
      try {
        const html = katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
        });
        return (
          <div
            className={`overflow-x-auto ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        return <div className={className}>{content}</div>;
      }
    }
    return <span className={className}>{content}</span>;
  }

  return <span className={className}>{renderMathWithDelimiters(content)}</span>;
};
