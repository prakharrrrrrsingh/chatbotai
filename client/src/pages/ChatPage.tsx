import React, { useState } from 'react';
import SuggestedQuestions from '../components/SuggestedQuestions';

const ChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSuggestion = (text: string) => {
    setInput(text); // Pre-fill the input with the selected suggestion
  };

  const handleSend = async () => {
    // Call your backend API here
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: input }] })
    });

    const data = await response.json();
    setMessages([...messages, `You: ${input}`, `Bot: ${data.message}`]);
    setInput('');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <SuggestedQuestions onSelect={handleSuggestion} />

      <div className="mt-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="bg-gray-100 p-2 rounded">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
