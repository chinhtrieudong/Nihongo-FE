import React from 'react';

/**
 * Formats AI response text with markdown-like syntax into React elements
 * Supports:
 * - Bold text: **text**
 * - Line breaks
 * - Bullet points: * or •
 * - Numbered lists: 1. 2. etc.
 */
export const formatAIText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Split by lines
  const lines = text.split('\n');
  
  const formattedLines = lines.map((line, lineIndex) => {
    if (!line.trim()) {
      return <br key={lineIndex} />;
    }

    // Process the line for bold text
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let keyCounter = 0;

    // Find all **text** patterns
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;

    const processedLine = line;
    const matches: Array<{ start: number; end: number; content: string }> = [];

    while ((match = boldRegex.exec(processedLine)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      });
    }

    if (matches.length === 0) {
      // No bold text, check for bullet points or numbered lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
        const content = line.trim().substring(2);
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 mt-1">•</span>
            <span>{processInlineBold(content, `${lineIndex}`)}</span>
          </div>
        );
      }
      
      // Check for numbered list
      const numberedMatch = line.trim().match(/^(\d+)\.\s*/);
      if (numberedMatch) {
        const number = numberedMatch[1];
        const content = line.trim().substring(numberedMatch[0].length);
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 font-semibold min-w-[20px]">{number}.</span>
            <span>{processInlineBold(content, `${lineIndex}`)}</span>
          </div>
        );
      }
      
      return (
        <div key={lineIndex} className="my-0.5">
          {processInlineBold(line, `${lineIndex}`)}
        </div>
      );
    }

    // Build the line with bold text
    matches.forEach((match, matchIndex) => {
      // Add text before the match
      if (match.start > currentIndex) {
        parts.push(
          <span key={`text-${lineIndex}-${keyCounter++}`}>
            {processedLine.substring(currentIndex, match.start)}
          </span>
        );
      }

      // Add the bold text
      parts.push(
        <strong key={`bold-${lineIndex}-${keyCounter++}`} className="font-semibold text-gray-900 dark:text-gray-100">
          {match.content}
        </strong>
      );

      currentIndex = match.end;
    });

    // Add remaining text
    if (currentIndex < processedLine.length) {
      parts.push(
        <span key={`text-${lineIndex}-${keyCounter++}`}>
          {processedLine.substring(currentIndex)}
        </span>
      );
    }

    return (
      <div key={lineIndex} className="my-0.5">
        {parts}
      </div>
    );
  });

  return <div className="space-y-0.5">{formattedLines}</div>;
};

/**
 * Process inline bold text within a string
 */
const processInlineBold = (text: string, lineKey: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`inline-${lineKey}-${keyCounter++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Add the bold text
    parts.push(
      <strong key={`inline-bold-${lineKey}-${keyCounter++}`} className="font-semibold text-gray-900 dark:text-gray-100">
        {match[1]}
      </strong>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`inline-${lineKey}-${keyCounter++}`}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? <>{parts}</> : text;
};

export default formatAIText;