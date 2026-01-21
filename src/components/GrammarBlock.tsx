import React from 'react';

interface GrammarBlockProps {
  type: 'structure' | 'meaning' | 'examples' | 'comparison';
  title: string;
  content: string[];
  icon: string;
}

const GrammarBlock: React.FC<GrammarBlockProps> = ({ type, title, content, icon }) => {
  const getBlockStyles = () => {
    switch (type) {
      case 'structure':
        return 'bg-blue-50 border-blue-200';
      case 'meaning':
        return 'bg-green-50 border-green-200';
      case 'examples':
        return 'bg-yellow-50 border-yellow-200';
      case 'comparison':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getHeaderStyles = () => {
    switch (type) {
      case 'structure':
        return 'bg-blue-100 text-blue-800';
      case 'meaning':
        return 'bg-green-100 text-green-800';
      case 'examples':
        return 'bg-yellow-100 text-yellow-800';
      case 'comparison':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${getBlockStyles()}`}>
      <div className={`px-4 py-2 font-semibold text-sm ${getHeaderStyles()} flex items-center`}>
        <span className="mr-2 text-lg">{icon}</span>
        {title}
      </div>
      <div className="p-4">
        {content.map((item, index) => (
          <div key={index} className="mb-2 last:mb-0">
            {type === 'examples' ? (
              <div className="font-japanese text-lg leading-relaxed">
                {item.split('(').map((part, index) => (
                  <span key={index}>
                    {index === 0 ? (
                      <span>{part}</span>
                    ) : (
                      <span className="text-sm text-gray-600">({part}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-700 leading-relaxed">
                {item}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrammarBlock;
