import { useEffect, useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, Check, X, BookOpen } from 'lucide-react';
import {
  deleteUpload,
  generateFlashcardsFromTopic,
  getUploadAssets,
  listUploadAssets,
  listUploads,
  processUploadToAssets,
  submitFlashcardAttempt,
  type ContentLearningAssetsSummary,
  type Flashcard as FlashcardType,
  type UploadRecord,
} from "../lib/api";
import { Markdown } from "./ui/Markdown";

export function Flashcards() {
  const [source, setSource] = useState<"upload" | "topic">("upload");
  const [uploadOptions, setUploadOptions] = useState<UploadRecord[]>([]);
  const [uploadSelection, setUploadSelection] = useState<string>("latest");
  const [uploadAssetsMap, setUploadAssetsMap] = useState<Record<string, string>>({});
  const [topicInput, setTopicInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [topic, setTopic] = useState<string>("General");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUploads = async () => {
      try {
        const [assets, uploads] = await Promise.all([
          listUploadAssets(),
          listUploads(),
        ]);
        const map: Record<string, string> = {};
        assets.items.forEach((item: ContentLearningAssetsSummary) => {
          if (item.upload_id) {
            map[item.upload_id] = item.document_id;
          }
        });
        setUploadAssetsMap(map);
        setUploadOptions(uploads.items);
        if (uploads.items.length === 0) {
          setSource("topic");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load uploads.");
      }
    };
    loadUploads();
  }, []);

  useEffect(() => {
    if (source !== "upload") return;
    if (uploadOptions.length === 0) return;
    void loadUploadDeck(uploadSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, uploadSelection, uploadOptions.length]);

  const normalizeFlashcards = (cards: FlashcardType[]) =>
    cards.map((card, index) => ({
      ...card,
      id: typeof card.id === "number" ? card.id : index + 1,
    }));

  const resetDeckState = (cards: FlashcardType[], label: string) => {
    setFlashcards(normalizeFlashcards(cards));
    setTopic(label);
    setCurrentCard(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
  };

  const loadUploadDeck = async (selection: string) => {
    setError(null);
    setIsLoading(true);
    const target =
      selection === "latest"
        ? uploadOptions[0]
        : uploadOptions.find((item) => item.file_id === selection);
    if (!target) {
      setFlashcards([]);
      setError("No uploads with generated flashcards yet. Upload notes first.");
      setIsLoading(false);
      return;
    }
    try {
      const existingDocId = uploadAssetsMap[target.file_id];
      if (existingDocId) {
        const detail = await getUploadAssets(existingDocId);
        resetDeckState(
          detail.flashcards,
          detail.original_filename || "Upload Flashcards",
        );
      } else {
        const detail = await processUploadToAssets(target.file_id);
        setUploadAssetsMap((prev) => ({
          ...prev,
          [target.file_id]: detail.document_id,
        }));
        resetDeckState(
          detail.flashcards,
          target.original_filename || "Upload Flashcards",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load upload flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTopic = async () => {
    const trimmed = topicInput.trim();
    if (!trimmed) {
      setError("Enter a topic to generate flashcards.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const data = await generateFlashcardsFromTopic(trimmed);
      resetDeckState(data.cards, data.topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUpload = async () => {
    if (!deletingUploadId) return;
    setError(null);
    setIsLoading(true);
    try {
      await deleteUpload(deletingUploadId);
      const nextUploads = uploadOptions.filter(
        (item) => item.file_id !== deletingUploadId,
      );
      setUploadOptions(nextUploads);
      setUploadAssetsMap((prev) => {
        const updated = { ...prev };
        delete updated[deletingUploadId];
        return updated;
      });
      if (uploadSelection === deletingUploadId || uploadSelection === "latest") {
        setFlashcards([]);
        if (nextUploads.length > 0) {
          setUploadSelection("latest");
          await loadUploadDeck("latest");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete upload.");
    } finally {
      setIsLoading(false);
      setDeletingUploadId(null);
    }
  };

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
    const cardId = flashcards[currentCard]?.id;
    if (cardId === undefined) return;
    const newKnown = new Set(knownCards);
    newKnown.add(cardId);
    setKnownCards(newKnown);
    unknownCards.delete(cardId);
    setUnknownCards(new Set(unknownCards));
    handleNext();
    submitFlashcardAttempt({
      topic,
      known: Array.from(newKnown),
      unknown: Array.from(unknownCards),
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to save flashcard progress.");
    });
  };

  const handleUnknown = () => {
    const cardId = flashcards[currentCard]?.id;
    if (cardId === undefined) return;
    const newUnknown = new Set(unknownCards);
    newUnknown.add(cardId);
    setUnknownCards(newUnknown);
    knownCards.delete(cardId);
    setKnownCards(new Set(knownCards));
    handleNext();
    submitFlashcardAttempt({
      topic,
      known: Array.from(knownCards),
      unknown: Array.from(newUnknown),
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to save flashcard progress.");
    });
  };

  const card = flashcards[currentCard] ?? flashcards[0];
  const progress =
    flashcards.length === 0
      ? 0
      : ((knownCards.size + unknownCards.size) / flashcards.length) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Flashcards 🎴</h1>
        <p className="text-gray-600">Master concepts with spaced repetition</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Source Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setSource("upload")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              source === "upload"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            }`}
          >
            From Uploads
          </button>
          <button
            onClick={() => setSource("topic")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              source === "topic"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            }`}
          >
            From Topic
          </button>
        </div>

        {source === "upload" ? (
          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <select
              value={uploadSelection}
              onChange={(event) => setUploadSelection(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="latest">Latest upload</option>
              {uploadOptions.map((item) => (
                <option key={item.file_id} value={item.file_id}>
                  {item.original_filename || "Untitled upload"}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => loadUploadDeck(uploadSelection)}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all text-sm"
              >
                Load Flashcards
              </button>
              <button
                onClick={() => {
                  const targetId =
                    uploadSelection === "latest"
                      ? uploadOptions[0]?.file_id
                      : uploadSelection;
                  if (!targetId) return;
                  setDeletingUploadId(targetId);
                }}
                className="px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <input
              value={topicInput}
              onChange={(event) => setTopicInput(event.target.value)}
              placeholder="Enter a topic (e.g., Quantum Physics)"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleGenerateTopic}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all text-sm"
            >
              Generate
            </button>
          </div>
        )}
      </div>

      {flashcards.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center text-gray-600 mb-8">
          {isLoading ? "Loading flashcards..." : "No flashcards available yet."}
        </div>
      ) : (
        <>
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
                    <Markdown content={card.front} className="text-center text-xl" />
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
                    <Markdown content={card.back} className="text-white text-center" />
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
        </>
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

      {deletingUploadId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="mb-2">Delete upload?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This removes the upload and any generated flashcards or quizzes.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingUploadId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUpload}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
