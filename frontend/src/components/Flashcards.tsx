import { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Check, X, BookOpen } from 'lucide-react';

export function Flashcards() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());

  const flashcards = [
    {
      id: 1,
      front: 'What is GDPR?',
      back: 'General Data Protection Regulation - EU law on data protection and privacy that came into effect in May 2018',
      category: 'Law & Policy'
    },
    {
      id: 2,
      front: 'Define Quantum Entanglement',
      back: 'A physical phenomenon where particles remain connected so that actions on one affect the other, regardless of distance',
      category: 'Physics'
    },
    {
      id: 3,
      front: 'What is a derivative in calculus?',
      back: 'A measure of how a function changes as its input changes. It represents the slope of the tangent line to the function at a point',
      category: 'Mathematics'
    },
    {
      id: 4,
      front: 'Explain DNA Replication',
      back: 'The process by which DNA makes a copy of itself during cell division. The double helix unwinds and each strand serves as a template',
      category: 'Biology'
    },
    {
      id: 5,
      front: 'What is Brexit?',
      back: "The UK's withdrawal from the European Union, officially completed on January 31, 2020, affecting trade, immigration, and regulations",
      category: 'Economics'
    },
    {
      id: 6,
      front: 'Define Photosynthesis',
      back: 'The process by which plants use sunlight, water, and CO2 to produce oxygen and energy in the form of sugar',
      category: 'Biology'
    },
    {
      id: 7,
      front: 'What is the Pythagorean Theorem?',
      back: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²',
      category: 'Mathematics'
    },
    {
      id: 8,
      front: 'Explain Newton\'s First Law',
      back: 'An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by force',
      category: 'Physics'
    }
  ];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleKnown = () => {
    const newKnown = new Set(knownCards);
    newKnown.add(currentCard);
    setKnownCards(newKnown);
    unknownCards.delete(currentCard);
    setUnknownCards(new Set(unknownCards));
    handleNext();
  };

  const handleUnknown = () => {
    const newUnknown = new Set(unknownCards);
    newUnknown.add(currentCard);
    setUnknownCards(newUnknown);
    knownCards.delete(currentCard);
    setKnownCards(new Set(knownCards));
    handleNext();
  };

  const card = flashcards[currentCard];
  const progress = ((knownCards.size + unknownCards.size) / flashcards.length) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Flashcards 🎴</h1>
        <p className="text-gray-600">Master concepts with spaced repetition</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-gray-600 mb-1">Total Cards</div>
          <div className="text-purple-600">{flashcards.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-gray-600 mb-1">Known</div>
          <div className="text-green-600">{knownCards.size}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-gray-600 mb-1">Learning</div>
          <div className="text-orange-600">{unknownCards.size}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8" style={{ perspective: '1000px' }}>
        <div
          onClick={handleFlip}
          className="relative h-96 cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full">
                  {card.category}
                </span>
                <span className="text-gray-400">
                  {currentCard + 1} / {flashcards.length}
                </span>
              </div>
              <div className="flex items-center justify-center flex-1 min-h-[200px]">
                <h2 className="text-center">{card.front}</h2>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <RotateCw className="w-5 h-5" />
              <span>Click to flip</span>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 flex flex-col justify-between text-white"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-full">
                  Answer
                </span>
                <span className="text-white text-opacity-70">
                  {currentCard + 1} / {flashcards.length}
                </span>
              </div>
              <div className="flex items-center justify-center flex-1 min-h-[200px]">
                <p className="text-white text-center leading-relaxed">{card.back}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-white text-opacity-70">
              <RotateCw className="w-5 h-5" />
              <span>Click to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handlePrevious}
          className="flex-1 py-4 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-4 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Knowledge Rating */}
      {isFlipped && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleUnknown}
            className="py-4 bg-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Still Learning
          </button>
          <button
            onClick={handleKnown}
            className="py-4 bg-green-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Got It!
          </button>
        </div>
      )}

      {/* Study Tips */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div className="text-blue-900">Study Tip</div>
        </div>
        <p className="text-blue-700">
          Review flashcards daily for optimal retention. Our AI schedules reviews using spaced repetition for maximum learning efficiency.
        </p>
      </div>
    </div>
  );
}
