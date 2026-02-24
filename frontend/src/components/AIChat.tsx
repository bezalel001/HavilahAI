import { useState, useRef, useEffect } from "react";
import { Send, Mic, Image, Sparkles, Volume2 } from 'lucide-react';
import { createChatSession, postChatSessionMessage } from "../lib/api";
import { Markdown } from "./ui/Markdown";

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const suggestedQuestions = [
    "Explain GDPR in simple terms",
    "How does photosynthesis work?",
    "What is quantum computing?",
    "Help me with calculus derivatives"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await createChatSession("AI Tutor");
        setSessionId(session.session_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start chat session.");
      }
    };
    initSession();
  }, []);

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

    if (!sessionId) {
      setError("Chat session is not ready yet.");
      setIsTyping(false);
      return;
    }

    postChatSessionMessage(sessionId, inputText)
      .then((response) => {
        const latest = response.messages.find((msg) => msg.role === "assistant");
        if (latest) {
          const aiResponse: Message = {
            id: messages.length + 2,
            text: latest.content,
            sender: "ai",
            timestamp: new Date(),
            hasAudio: true,
          };
          setMessages((prev) => [...prev, aiResponse]);
        }
        setIsTyping(false);
      })
      .catch((err) => {
        setIsTyping(false);
        setError(err instanceof Error ? err.message : "Unable to send message.");
      });
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const handleSpeak = (message: Message) => {
    if (message.sender !== "ai") return;
    if (!message.text.trim()) return;
    if (speakingId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    speechRef.current = utterance;
    setSpeakingId(message.id);
    utterance.onend = () => {
      setSpeakingId((prev) => (prev === message.id ? null : prev));
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="mb-2">AI Tutor Chat 💬</h1>
        <p className="text-gray-600">Get instant help with any topic, anytime</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
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
                <Markdown content={message.text} className="text-sm" />
                {message.hasAudio && (
                  <button
                    onClick={() => handleSpeak(message)}
                    className="mt-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{speakingId === message.id ? "Stop audio" : "Listen to explanation"}</span>
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
