import React from 'react';

const suggestions = [
  "Tell me a joke",
  "Flip a coin",
  "Roll a dice",
  "What is 5 + 7?",
  "Motivate me",
  "Give me some trivia",
  "What's the sentiment of 'I love this!'?",
  "Generate an embedding for 'machine learning'",
  "Analyze this image",
];

type Props = {
  onSelect: (text: string) => void;
};

const SuggestedQuestions: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="bg-white shadow p-4 rounded-2xl mt-4">
      <h2 className="text-lg font-semibold mb-2">Try asking:</h2>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((text, i) => (
          <button
            key={i}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-2 rounded-xl text-left"
            onClick={() => onSelect(text)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
