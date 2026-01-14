import { useState } from 'react';
import { Brain, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export function QuizGenerator() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const quiz = {
    title: 'EU Data Protection & GDPR',
    subject: 'Law & Policy',
    difficulty: 'Intermediate',
    questions: [
      {
        question: 'What does GDPR stand for?',
        options: [
          'General Data Protection Regulation',
          'Global Data Privacy Rights',
          'General Digital Protection Rights',
          'Global Digital Privacy Regulation'
        ],
        correct: 0,
        explanation: 'GDPR stands for General Data Protection Regulation, implemented in the EU in 2018.'
      },
      {
        question: 'What is the maximum fine for GDPR violations?',
        options: [
          '€10 million or 2% of global revenue',
          '€20 million or 4% of global revenue',
          '€50 million or 5% of global revenue',
          '€100 million or 10% of global revenue'
        ],
        correct: 1,
        explanation: 'The maximum fine is €20 million or 4% of annual global turnover, whichever is higher.'
      },
      {
        question: 'Which of these is NOT a principle of GDPR?',
        options: [
          'Data minimization',
          'Lawfulness and transparency',
          'Profit maximization',
          'Accuracy'
        ],
        correct: 2,
        explanation: 'Profit maximization is not a GDPR principle. GDPR focuses on data protection, not business profits.'
      },
      {
        question: 'How long do companies have to report a data breach?',
        options: [
          '24 hours',
          '48 hours',
          '72 hours',
          '1 week'
        ],
        correct: 2,
        explanation: 'Organizations must report data breaches to authorities within 72 hours of becoming aware of them.'
      },
      {
        question: 'What right does "Right to be Forgotten" refer to?',
        options: [
          'Right to delete social media',
          'Right to erasure of personal data',
          'Right to anonymous browsing',
          'Right to encrypted communication'
        ],
        correct: 1,
        explanation: 'The Right to be Forgotten allows individuals to request deletion of their personal data under certain conditions.'
      }
    ]
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === quiz.questions[currentQuestion].correct;
    setAnswers([...answers, isCorrect]);
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizStarted(false);
  };

  const isQuizComplete = currentQuestion === quiz.questions.length - 1 && showResult;
  const currentQ = quiz.questions[currentQuestion];

  if (!quizStarted) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">AI Quiz Generator 🧠</h1>
          <p className="text-gray-600">Test your knowledge with personalized quizzes</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="mb-1">{quiz.title}</h2>
              <p className="text-gray-600">{quiz.subject}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Questions</div>
              <div className="text-purple-600">{quiz.questions.length}</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Difficulty</div>
              <div className="text-pink-600">{quiz.difficulty}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Est. Time</div>
              <div className="text-blue-600">{quiz.questions.length * 2} min</div>
            </div>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <div className={percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}>
              {percentage}%
            </div>
          </div>

          <h1 className="mb-2">Quiz Complete! 🎉</h1>
          <p className="text-gray-600 mb-8">You scored {score} out of {quiz.questions.length}</p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Correct</div>
              <div className="text-green-600">{score}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Incorrect</div>
              <div className="text-red-600">{quiz.questions.length - score}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Accuracy</div>
              <div className="text-blue-600">{percentage}%</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2>Question {currentQuestion + 1} of {quiz.questions.length}</h2>
          <span className="text-gray-600">Score: {score}/{currentQuestion + (showResult ? 1 : 0)}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="mb-8">{currentQ.question}</h2>

        <div className="space-y-4 mb-8">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQ.correct;
            const showCorrectAnswer = showResult && isCorrect;
            const showWrongAnswer = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  showCorrectAnswer
                    ? 'border-green-500 bg-green-50'
                    : showWrongAnswer
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showCorrectAnswer && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {showWrongAnswer && <XCircle className="w-6 h-6 text-red-600" />}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl">
            <div className="text-blue-900 mb-2">💡 Explanation</div>
            <p className="text-blue-700">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex gap-4">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`flex-1 py-3 rounded-xl transition-all ${
                selectedAnswer === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
