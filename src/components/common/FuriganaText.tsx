import React from 'react';

interface FuriganaTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders Japanese text with furigana (ruby) annotations.
 * 
 * Format: {漢字|よみ} → <ruby>漢字<rt>よみ</rt></ruby>
 * Example: "{私|わたし}は{学生|がくせい}です。"
 */
const FuriganaText: React.FC<FuriganaTextProps> = ({ text, className, style }) => {
  // Parse {kanji|reading} format into ruby elements
  const parts = text.split(/(\{[^}]+\})/g);
  
  const elements = parts.map((part, index) => {
    const match = part.match(/^\{([^|]+)\|([^}]+)\}$/);
    if (match) {
      const [, kanji, reading] = match;
      return (
        <ruby key={index} className="furigana-ruby">
          {kanji}
          <rt className="furigana-rt">{reading}</rt>
        </ruby>
      );
    }
    return <span key={index}>{part}</span>;
  });

  return (
    <span className={className} style={style}>
      {elements}
    </span>
  );
};

export default FuriganaText;