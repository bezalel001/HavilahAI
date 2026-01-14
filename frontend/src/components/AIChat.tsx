import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image, Sparkles, Volume2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  hasAudio?: boolean;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI tutor. Ask me anything about your studies, or let me help you understand complex topics! 🚀",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Explain GDPR in simple terms",
    "How does photosynthesis work?",
    "What is quantum computing?",
    "Help me with calculus derivatives"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: generateAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date(),
        hasAudio: true,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    if (question.toLowerCase().includes('gdpr')) {
      return "GDPR (General Data Protection Regulation) is an EU law that protects people's personal data. Think of it as rules that companies must follow to keep your information safe. Key points: 1) Companies need your permission to use your data, 2) You can ask to see or delete your data, 3) Companies must report data breaches within 72 hours. Would you like me to explain any specific aspect in more detail?";
    } else if (question.toLowerCase().includes('photosynthesis')) {
      return "Photosynthesis is how plants make their food! Here's the simple version: Plants take in sunlight (energy), water (from roots), and CO2 (from air). Using chlorophyll (the green stuff), they convert these into glucose (sugar for energy) and oxygen (what we breathe). The equation: 6CO2 + 6H2O + light → C6H12O6 + 6O2. Want me to break down any part further?";
    } else if (question.toLowerCase().includes('quantum')) {
      return "Quantum computing uses quantum mechanics to process information in a fundamentally different way than regular computers. While normal computers use bits (0 or 1), quantum computers use 'qubits' that can be both 0 and 1 simultaneously (superposition). This allows them to solve certain problems exponentially faster. Think of it like checking all paths in a maze at once, rather than one at a time. Interested in learning about specific applications?";
    } else if (question.toLowerCase().includes('derivative') || question.toLowerCase().includes('calculus')) {
      return "A derivative measures how fast something changes! If you're driving, speed is the derivative of distance - it tells you how quickly your position changes over time. Mathematically, if f(x) = x², the derivative f'(x) = 2x. This means at any point x, the slope of the curve is 2x. For example, at x=3, the slope is 6. Would you like to see more examples or practice problems?";
    } else {
      return "That's a great question! I can help you understand this better. Could you provide a bit more context or let me know which aspect you'd like to focus on? I can explain it using text, and I can also generate visual aids or audio explanations if that helps your learning style!";
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="mb-2">AI Tutor Chat 💬</h1>
        <p className="text-gray-600">Get instant help with any topic, anytime</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-600">AI Tutor</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.hasAudio && (
                  <button className="mt-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
                    <Volume2 className="w-4 h-4" />
                    <span>Listen to explanation</span>
                  </button>
                )}
                <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white text-opacity-70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-600">AI Tutor</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <div className="text-gray-600 mb-3">Suggested questions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Image className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-3 rounded-xl transition-all ${
                inputText.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
