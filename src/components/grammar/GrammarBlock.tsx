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
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'meaning':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'examples':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'comparison':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
      default:
        return 'bg-secondary-50 dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900';
    }
  };

  const getHeaderStyles = () => {
    switch (type) {
      case 'structure':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200';
      case 'meaning':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200';
      case 'examples':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200';
      case 'comparison':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-600';
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
