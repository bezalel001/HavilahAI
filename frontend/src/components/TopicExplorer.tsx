import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Video,
  Brain,
  FileText,
  ChevronRight,
  Sparkles,
  Globe,
  Play,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  createTopic,
  fetchRandomTopic,
  fetchTopicDetail,
  fetchTopics,
  generateTopic,
  TopicCard,
  TopicDetail,
  TopicListResponse,
  TopicModule,
  type CreateTopicPayload,
  type TopicModuleInput,
} from "../lib/api";

interface TopicExplorerProps {
  canManageTopics?: boolean;
  onNavigate?: (view: string) => void;
  onStartQuiz?: (topicId: string, topicName: string) => void;
  onStartFlashcards?: (topicId: string, topicName: string) => void;
}

type LearningStyle = "visual" | "auditory" | "kinesthetic";
type Difficulty = CreateTopicPayload["difficulty"];
type ModuleForm = TopicModuleInput;

interface AdminTopicForm extends Omit<CreateTopicPayload, "modules"> {
  modules: ModuleForm[];
}

const createModule = (order: number): ModuleForm => ({
  title: "",
  type: "reading",
  duration_minutes: 10,
  order_index: order,
  content_url: "",
  eu_context: "",
});

const defaultTopicForm = (): AdminTopicForm => ({
  name: "",
  category: "",
  icon: "📘",
  description: "",
  difficulty: "beginner",
  estimated_hours: 1,
  gradient_color: "from-purple-500 to-pink-500",
  is_popular: true,
  modules: [createModule(1)],
});

const GRADIENT_CLASSES = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-yellow-500 to-orange-500",
  "from-teal-500 to-emerald-500",
  "from-indigo-500 to-cyan-500",
] as const;

const resolveGradient = (value?: string) => {
  if (!value) return GRADIENT_CLASSES[1];
  return GRADIENT_CLASSES.find((gradient) => gradient === value) ?? GRADIENT_CLASSES[1];
};

export function TopicExplorer({
  canManageTopics = false,
  onNavigate,
  onStartQuiz,
  onStartFlashcards,
}: TopicExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [topicList, setTopicList] = useState<TopicListResponse | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicDetail | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>("visual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState("");
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [topicForm, setTopicForm] = useState<AdminTopicForm>(() => defaultTopicForm());
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [topicFormError, setTopicFormError] = useState<string | null>(null);
  const [topicFormSuccess, setTopicFormSuccess] = useState<string | null>(null);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const parseError = (err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message;
    if (err && typeof err === "object") {
      const detail = (err as { detail?: string; message?: string }).detail;
      const message = (err as { detail?: string; message?: string }).message;
      if (detail || message) return detail ?? message ?? fallback;
      return JSON.stringify(err);
    }
    if (typeof err === "string") return err;
    return fallback;
  };

  const popularTopics = topicList?.popular ?? [];
  const recentTopics = topicList?.recent ?? [];
  const difficultyOptions: Difficulty[] = ["beginner", "intermediate", "advanced"];
  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return popularTopics;
    return popularTopics.filter((topic) => {
      return (
        topic.name.toLowerCase().includes(query) ||
        topic.category.toLowerCase().includes(query)
      );
    });
  }, [popularTopics, searchQuery]);

  const loadTopics = async (query?: string, rememberQuery = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopics(query?.trim() || undefined);
      setTopicList(data);
      if (!rememberQuery) {
        setActiveQuery(query?.trim() || "");
      }
    } catch (err) {
      setError(parseError(err, "Failed to load topics."));
    } finally {
      setLoading(false);
    }
  };

  const loadTopicDetail = async (topic: TopicCard) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopicDetail(topic.id);
      setSelectedTopic(data.topic);
    } catch (err) {
      setError(parseError(err, "Unable to load topic details."));
    } finally {
      setLoading(false);
    }
  };

  const loadTopicDetailById = async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopicDetail(topicId);
      setSelectedTopic(data.topic);
    } catch (err) {
      setError(parseError(err, "Unable to load topic details."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    setActiveQuery(trimmed);
    loadTopics(trimmed, true);
    setSelectedTopic(null);
  };

  const handleGenerateTopic = async () => {
    const rawPrompt = (searchQuery || activeQuery).trim();
    const aliasMap: Record<string, string> = {
      ml: "Machine Learning",
      ai: "Artificial Intelligence",
      nlp: "Natural Language Processing",
    };
    const normalized = rawPrompt.toLowerCase();
    const prompt = aliasMap[normalized] ?? rawPrompt;
    if (!prompt) {
      setError("Enter a topic prompt to generate.");
      return;
    }
    if (prompt.length < 3) {
      setError("Please enter at least 3 characters or use a full topic name.");
      return;
    }
    setIsGeneratingTopic(true);
    setError(null);
    try {
      const data = await generateTopic({
        prompt,
        difficulty: "intermediate",
        module_count: 5,
        category_hint: "AI & Data",
        is_popular: false,
      });
      setSelectedTopic(data.topic);
      await loadTopics(activeQuery || undefined, true);
    } catch (err) {
      setError(parseError(err, "Unable to generate topic."));
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const handleRandomTopic = async () => {
    setIsLoadingRandom(true);
    setError(null);
    try {
      const data = await fetchRandomTopic();
      setSelectedTopic(data.topic);
    } catch (err) {
      setError(parseError(err, "Unable to load a random topic."));
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const resetView = () => {
    setSelectedTopic(null);
    setError(null);
  };

  const resetTopicForm = () => {
    setTopicForm(defaultTopicForm());
  };

  const handleTopicFieldChange = <K extends keyof AdminTopicForm>(
    field: K,
    value: AdminTopicForm[K],
  ) => {
    setTopicForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModuleFieldChange = <K extends keyof ModuleForm>(
    index: number,
    field: K,
    value: ModuleForm[K],
  ) => {
    setTopicForm((prev) => {
      const modules = [...prev.modules];
      modules[index] = {
        ...modules[index],
        [field]: value,
      };
      return { ...prev, modules };
    });
  };

  const addModule = () => {
    setTopicForm((prev) => ({
      ...prev,
      modules: [...prev.modules, createModule(prev.modules.length + 1)],
    }));
  };

  const removeModule = (index: number) => {
    setTopicForm((prev) => {
      if (prev.modules.length === 1) return prev;
      const modules = prev.modules.filter((_, idx) => idx !== index).map((module, idx) => ({
        ...module,
        order_index: idx + 1,
      }));
      return { ...prev, modules };
    });
  };

  const handleCreateTopic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingTopic(true);
    setTopicFormError(null);
    setTopicFormSuccess(null);
    try {
      const payload: CreateTopicPayload = {
        ...topicForm,
        modules: topicForm.modules.map((module, index) => ({
          ...module,
          order_index: index + 1,
          duration_minutes: Number(module.duration_minutes),
          content_url: module.content_url?.trim() ? module.content_url.trim() : undefined,
          eu_context: module.eu_context?.trim() ? module.eu_context.trim() : undefined,
        })),
      };
      await createTopic(payload);
      setTopicFormSuccess("Topic created successfully.");
      resetTopicForm();
      await loadTopics(activeQuery || undefined, true);
    } catch (err) {
      setTopicFormError(err instanceof Error ? err.message : "Unable to create topic.");
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const moduleIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "interactive":
        return <Sparkles className="w-5 h-5" />;
      case "quiz":
        return <Brain className="w-5 h-5" />;
      case "reading":
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const moduleDescription = (module: TopicModule) => {
    if (module.explanation) return module.explanation;
    switch (module.type) {
      case "video":
        return "Watch the video lesson";
      case "interactive":
        return "Hands-on interactive activity";
      case "quiz":
        return "Assess your knowledge";
      default:
        return "Read the accompanying material";
    }
  };

  const styleDescriptions: Record<LearningStyle, string> = {
    visual: "Focus on diagrams, mind maps, and visual explainers.",
    auditory: "Listen to lectures and narrated explainers.",
    kinesthetic: "Practice with interactive modules and quizzes.",
  };

  const completedModules = selectedTopic?.modules.filter((module) => module.completed).length ?? 0;
  const totalModules = selectedTopic?.modules.length ?? 0;
  const progressPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const handleModuleClick = (module: TopicModule) => {
    if (module.type === "quiz" && selectedTopic && onStartQuiz) {
      onStartQuiz(selectedTopic.id, selectedTopic.name);
    }
  };

  const handleStartLearning = () => {
    if (!selectedTopic) return;
    const nextModule = selectedTopic.modules.find((module) => !module.completed);
    if (nextModule) {
      handleModuleClick(nextModule);
    }
  };

  const handleGenerateQuiz = () => {
    if (selectedTopic && onStartQuiz) {
      onStartQuiz(selectedTopic.id, selectedTopic.name);
    }
  };

  const handleGenerateFlashcards = () => {
    if (selectedTopic && onStartFlashcards) {
      onStartFlashcards(selectedTopic.id, selectedTopic.name);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Explore Topics 🧭</h1>
        <p className="text-gray-600">
          Discover and master any subject with AI-powered learning paths
        </p>
      </div>

      {canManageTopics && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-medium">Admin controls</div>
              <p className="text-sm text-gray-500">
                Create new learning paths for the community.
              </p>
            </div>
            <button
              onClick={() => {
                setShowAdminForm(!showAdminForm);
                setTopicFormError(null);
                setTopicFormSuccess(null);
              }}
              className="px-6 py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
            >
              {showAdminForm ? "Hide form" : "New topic"}
            </button>
          </div>

          {showAdminForm && (
            <form className="mt-6 space-y-6" onSubmit={handleCreateTopic}>
              {topicFormError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                  {topicFormError}
                </div>
              )}
              {topicFormSuccess && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-600">
                  {topicFormSuccess}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Topic Name</label>
                  <input
                    type="text"
                    required
                    value={topicForm.name}
                    onChange={(e) => handleTopicFieldChange("name", e.target.value)}
                    className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                    placeholder="e.g., Climate Policy"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <input
                    type="text"
                    required
                    value={topicForm.category}
                    onChange={(e) => handleTopicFieldChange("category", e.target.value)}
                    className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                    placeholder="e.g., Law & Policy"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Icon</label>
                  <input
                    type="text"
                    required
                    value={topicForm.icon}
                    onChange={(e) => handleTopicFieldChange("icon", e.target.value)}
                    className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                    placeholder="Emoji, e.g., 📘"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gradient</label>
                  <input
                    type="text"
                    required
                    value={topicForm.gradient_color}
                    onChange={(e) => handleTopicFieldChange("gradient_color", e.target.value)}
                    className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                    placeholder="from-purple-500 to-pink-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={topicForm.estimated_hours}
                    onChange={(e) => handleTopicFieldChange("estimated_hours", Number(e.target.value))}
                    className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Difficulty</label>
                  <select
                    className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                    value={topicForm.difficulty}
                    onChange={(e) => handleTopicFieldChange("difficulty", e.target.value as Difficulty)}
                  >
                    {difficultyOptions.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  required
                  value={topicForm.description}
                  onChange={(e) => handleTopicFieldChange("description", e.target.value)}
                  className="w-full mt-1 rounded-xl border border-gray-200 p-3"
                  rows={3}
                  placeholder="Describe what learners will master..."
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={topicForm.is_popular}
                  onChange={(e) => handleTopicFieldChange("is_popular", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Feature in popular topics
              </label>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Learning modules</h3>
                  <button
                    type="button"
                    onClick={addModule}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"
                  >
                    Add module
                  </button>
                </div>
                <div className="space-y-4">
                  {topicForm.modules.map((module, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-700">
                          Module {index + 1}
                        </div>
                        {topicForm.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(index)}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Module title"
                          value={module.title}
                          onChange={(e) => handleModuleFieldChange(index, "title", e.target.value)}
                          className="rounded-xl border border-gray-200 p-3"
                        />
                        <select
                          value={module.type}
                          onChange={(e) => handleModuleFieldChange(index, "type", e.target.value as ModuleForm["type"])}
                          className="rounded-xl border border-gray-200 p-3"
                        >
                          <option value="reading">Reading</option>
                          <option value="video">Video</option>
                          <option value="interactive">Interactive</option>
                          <option value="quiz">Quiz</option>
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={module.duration_minutes}
                          onChange={(e) =>
                            handleModuleFieldChange(index, "duration_minutes", Number(e.target.value))
                          }
                          className="rounded-xl border border-gray-200 p-3"
                          placeholder="Duration (minutes)"
                        />
                        <input
                          type="text"
                          value={module.content_url ?? ""}
                          onChange={(e) => handleModuleFieldChange(index, "content_url", e.target.value)}
                          className="rounded-xl border border-gray-200 p-3"
                          placeholder="Resource URL (optional)"
                        />
                      </div>
                      <textarea
                        value={module.eu_context ?? ""}
                        onChange={(e) => handleModuleFieldChange(index, "eu_context", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 p-3"
                        rows={2}
                        placeholder="EU context or summary (optional)"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isCreatingTopic}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-60"
                >
                  {isCreatingTopic ? "Creating..." : "Create topic"}
                </button>
                <button
                  type="button"
                  onClick={resetTopicForm}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Reset form
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-2 mb-4">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-gray-400 ml-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search any topic... (e.g., Quantum Computing, EU Law, Calculus)"
            className="flex-1 py-4 outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Search
          </button>
          <button
            onClick={handleRandomTopic}
            disabled={isLoadingRandom}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            {isLoadingRandom ? "Loading..." : "Surprise me"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {loading && (
          <div className="mb-4 text-sm text-gray-500">
            Loading topics...
          </div>
        )}

      {!selectedTopic ? (
        <>
          {recentTopics.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-4">Continue Learning</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {recentTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => loadTopicDetailById(topic.id)}
                    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="text-4xl sm:text-5xl mb-3">{topic.icon}</div>
                    <div className="mb-4 font-medium">{topic.name}</div>
                    <div className="mb-2 text-sm sm:text-base text-gray-600">
                      {topic.progress}% Complete
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4">
              {searchQuery.trim()
                ? `Search Results for "${searchQuery.trim()}"`
                : "Popular Topics"}
            </h2>
            {filteredTopics.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-3xl mb-4">
                    🔍
                  </div>
                  <h3 className="text-gray-900 mb-2">No topics found</h3>
                  <p className="text-gray-600 max-w-md">
                    {searchQuery.trim()
                      ? "Try searching with different keywords"
                      : "No topics available yet."}
                  </p>
                  {searchQuery.trim() && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={handleGenerateTopic}
                        disabled={isGeneratingTopic}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                      >
                        {isGeneratingTopic ? "Generating..." : "Generate with AI"}
                      </button>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => loadTopicDetail(topic)}
                    className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div
                      className={`h-24 sm:h-32 bg-gradient-to-br ${resolveGradient(topic.color)} flex items-center justify-center text-5xl sm:text-6xl`}
                    >
                      {topic.icon}
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="mb-2 font-medium">{topic.name}</div>
                      <div className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{topic.category}</div>
                      <div className="flex items-center justify-between text-sm sm:text-base">
                        <span className="text-purple-600">{topic.lessons} lessons</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={resetView}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to topics
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div
                className={`bg-gradient-to-br ${resolveGradient(selectedTopic.hero_color)} rounded-2xl p-6 sm:p-8 text-white`}
              >
                <div className="text-5xl sm:text-6xl mb-4">{selectedTopic.icon}</div>
                <h1 className="mb-2 text-white text-2xl sm:text-3xl">{selectedTopic.name}</h1>
                <p className="text-white text-opacity-90 mb-6 text-sm sm:text-base">
                  {selectedTopic.description}
                </p>

                {completedModules > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-white text-opacity-90 mb-2 text-sm">
                      <span>Your Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleStartLearning}
                    className="px-6 py-3 bg-white text-purple-600 rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {completedModules > 0 ? "Continue Learning" : "Start Learning"}
                  </button>
                  <button
                    onClick={handleGenerateQuiz}
                    className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Generate Quiz
                  </button>
                  <button
                    onClick={handleGenerateFlashcards}
                    className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Flashcards
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="mb-4">Learning Path</h2>
                <div className="space-y-3">
                  {selectedTopic.modules.map((module) => (
                    <div
                      key={module.id}
                      onClick={() => handleModuleClick(module)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        module.completed
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          module.completed
                            ? "bg-green-500 text-white"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {module.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          moduleIcon(module.type)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-900">{module.title}</div>
                        <div className="text-sm text-gray-500">{moduleDescription(module)}</div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        {module.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div className="text-blue-900">EU Context</div>
                </div>
                <p className="text-blue-700">{selectedTopic.eu_connection}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="mb-4">Course Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="text-purple-600">
                      {selectedTopic.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Time</span>
                    <span className="text-purple-600">
                      {selectedTopic.estimated_time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Modules</span>
                    <span className="text-purple-600">
                      {selectedTopic.total_modules}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-green-600">
                      {selectedTopic.completed_modules}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="mb-4">Adapt to Your Style</h3>
                <p className="text-sm text-gray-500 mb-3">{styleDescriptions[learningStyle]}</p>
                <div className="space-y-3">
                  {(["visual", "auditory", "kinesthetic"] as LearningStyle[]).map(
                    (style) => (
                      <button
                        key={style}
                        onClick={() => setLearningStyle(style)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          learningStyle === style
                            ? "bg-purple-500 text-white border-purple-600"
                            : "text-gray-600 border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        {style === "visual"
                          ? "📺 Visual Learner"
                          : style === "auditory"
                            ? "🎧 Auditory Learner"
                            : "✋ Kinesthetic Learner"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="mb-4">Related Topics</h3>
                {selectedTopic.related_topics.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Discover more learning paths by exploring other categories.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedTopic.related_topics.map((topic) => (
                      <button
                        key={topic}
                        className="w-full text-left p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
