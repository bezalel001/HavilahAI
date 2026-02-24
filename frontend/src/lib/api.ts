const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const method = options.method ?? "GET";
  if (!headers.has("Content-Type") && method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Authorization") && typeof window !== "undefined") {
    const token = localStorage.getItem("havilah_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // ignore body parsing errors for empty responses
  }

  if (!response.ok) {
    const message =
      (payload as { detail?: string; message?: string } | null)?.detail ??
      (payload as { detail?: string; message?: string } | null)?.message ??
      "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return payload as T;
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers();
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("havilah_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // ignore body parsing errors for empty responses
  }
  if (!response.ok) {
    const message =
      (payload as { detail?: string; message?: string } | null)?.detail ??
      (payload as { detail?: string; message?: string } | null)?.message ??
      "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return payload as T;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  preferred_language?: string;
  learning_style?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name?: string | null;
  preferred_language?: string | null;
  learning_style?: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface DashboardQuickAction {
  label: string;
  view: string;
  icon: string;
  color: string;
}

export interface DashboardGoal {
  title: string;
  progress: number;
  current: number;
  total: number;
}

export interface DashboardActivity {
  title: string;
  type: string;
  score: number;
  date: string;
  icon: string;
}

export interface DashboardSummary {
  greeting: string;
  subtitle: string;
  stats: DashboardStat[];
  quick_actions: DashboardQuickAction[];
  goals: DashboardGoal[];
  recent_activity: DashboardActivity[];
}

export interface ProgressWeeklyStat {
  day: string;
  minutes: number;
  goal: number;
}

export interface ProgressAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface ProgressSubject {
  name: string;
  progress: number;
  color: string;
}

export interface ProgressMilestone {
  title: string;
  date: string;
  icon: string;
  color: string;
}

export interface NextLevelInfo {
  next_level: string;
  current_xp: number;
  target_xp: number;
  remaining_xp: number;
  percentage: number;
}

export interface ProgressOverview {
  level: string;
  streak: string;
  study_time: string;
  total_points: string;
  weekly_stats: ProgressWeeklyStat[];
  achievements: ProgressAchievement[];
  subjects: ProgressSubject[];
  milestones: ProgressMilestone[];
  next_level: NextLevelInfo;
}

export interface TopicCard {
  id: string;
  name: string;
  icon: string;
  category: string;
  lessons: number;
  color: string;
}

export interface RecentTopic {
  id: string;
  name: string;
  progress: number;
  icon: string;
}

export interface TopicModule {
  id: string;
  title: string;
  duration: string;
  type: string;
  completed: boolean;
  explanation?: string;
}

export interface TopicDetail {
  id: string;
  name: string;
  icon: string;
  description: string;
  hero_color: string;
  modules: TopicModule[];
  eu_connection: string;
  difficulty: string;
  estimated_time: string;
  total_modules: number;
  completed_modules: number;
  related_topics: string[];
}

export interface TopicListResponse {
  popular: TopicCard[];
  recent: RecentTopic[];
}

export interface TopicDetailResponse {
  topic: TopicDetail;
}

export type ModuleType = "video" | "reading" | "interactive" | "quiz";

export interface TopicModuleInput {
  title: string;
  type: ModuleType;
  duration_minutes: number;
  order_index: number;
  content_url?: string;
  eu_context?: string;
}

export interface CreateTopicPayload {
  name: string;
  category: string;
  icon: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  gradient_color: string;
  is_popular: boolean;
  modules: TopicModuleInput[];
}

export interface TopicGeneratePayload {
  prompt: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  module_count?: number;
  category_hint?: string;
  is_popular?: boolean;
}

export interface LearningVideo {
  id: number;
  title: string;
  subject: string;
  duration: string;
  likes: number;
  comments: number;
  thumbnail: string;
  color: string;
  summary?: string | null;
  key_points?: string[];
  source?: string;
  liked: boolean;
  saved: boolean;
}

export interface LearningFeedResponse {
  tags: string[];
  videos: LearningVideo[];
}

export interface FeedLikeResponse {
  video_id: number;
  likes: number;
  liked: boolean;
}

export interface FeedSaveResponse {
  video_id: number;
  saved: boolean;
}

export interface FileUploadResponse {
  file_id: string;
  original_filename: string;
  stored_filename: string;
  content_type: string;
  size_bytes: number;
  storage_backend: string;
  storage_path: string;
  bucket_name?: string | null;
}

export interface UploadRecord {
  file_id: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  status: string;
  storage_backend: string;
  storage_path: string;
  bucket_name?: string | null;
}

export interface UploadListResponse {
  items: UploadRecord[];
}

export interface ContentProcessRequest {
  title: string;
  raw_content: string;
  target_audience: string;
  learning_objective: string;
  desired_tone?: string;
  additional_context?: string;
}

export interface ContentProcessResponse {
  document_id: string;
  title: string;
  summary: string;
  key_points: string[];
  learning_objectives: string[];
  quiz_questions: string[];
  recommended_media: string[];
  estimated_reading_time_minutes: number;
  created_at: string;
}

export interface ContentProcessTaskEnqueueResponse {
  task_id: string;
  status: string;
}

export interface ContentProcessTaskStatusResponse {
  task_id: string;
  status: string;
  result?: ContentProcessResponse | null;
  error?: string | null;
}

export interface ContentLearningAssetsResponse {
  document_id: string;
  summary: string;
  key_points: string[];
  simplified_concepts: { original: string; simplified: string }[];
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
  created_at: string;
  upload_id: string;
}

export interface ContentLearningAssetsSummary {
  document_id: string;
  upload_id: string;
  summary: string;
  key_points: string[];
  created_at: string;
  status: string;
  flashcards_count: number;
  quiz_questions_count: number;
  original_filename?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  upload_created_at?: string | null;
}

export interface ContentLearningAssetsListResponse {
  items: ContentLearningAssetsSummary[];
}

export interface ContentLearningAssetsDetailResponse {
  document_id: string;
  upload_id: string;
  summary: string;
  key_points: string[];
  simplified_concepts: { original: string; simplified: string }[];
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
  created_at: string;
  status: string;
  original_filename?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  upload_created_at?: string | null;
}

export interface ContentDocumentSummary {
  document_id: string;
  title: string;
  status: string;
  created_at: string;
}

export interface ContentDocumentListResponse {
  items: ContentDocumentSummary[];
}

export interface ContentDocumentDetailResponse {
  document_id: string;
  title: string;
  summary: string;
  key_points: string[];
  learning_objectives: string[];
  quiz_questions: string[];
  recommended_media: string[];
  estimated_reading_time_minutes: number;
  created_at: string;
  status: string;
  target_audience: string;
  learning_objective: string;
  desired_tone?: string | null;
  additional_context?: string | null;
  raw_content?: string | null;
}

export interface GoalResponse {
  id: string;
  title: string;
  type: string;
  total: number;
  current: number;
  progress: number;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalListResponse {
  items: GoalResponse[];
}

export interface GoalCreateRequest {
  title: string;
  type: string;
  total: number;
  deadline?: string | null;
}

export interface GoalUpdateRequest {
  title?: string;
  type?: string;
  total?: number;
  current?: number;
  deadline?: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizResponse {
  title: string;
  subject: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptResponse {
  attempt_id: string;
  score: number;
  correct_count: number;
  total: number;
  created_at: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

export interface FlashcardDeck {
  topic: string;
  cards: Flashcard[];
}

export interface FlashcardAttemptResponse {
  topic: string;
  known_count: number;
  unknown_count: number;
  progress_percent: number;
}

export interface ChatMessageResponse {
  reply: string;
  suggestions: string[];
}

export interface ChatSessionResponse {
  session_id: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }[];
}

export function registerUser(payload: RegisterPayload) {
  return request<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      preferred_language: payload.preferred_language ?? "en",
      learning_style: payload.learning_style ?? "not_set",
    }),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return request<UserResponse>("/auth/me", { method: "GET" });
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>("/dashboard/summary", { method: "GET" });
}

export function fetchProgressOverview() {
  return request<ProgressOverview>("/progress/overview", { method: "GET" });
}

export function fetchTopics(query?: string) {
  const search = query ? `?q=${encodeURIComponent(query)}` : "";
  return request<TopicListResponse>(`/topics${search}`, {
    method: "GET",
  });
}

export function fetchTopicDetail(topicId: string) {
  return request<TopicDetailResponse>(`/topics/${topicId}`, {
    method: "GET",
  });
}

export function createTopic(payload: CreateTopicPayload) {
  return request<TopicDetailResponse>("/topics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateTopic(payload: TopicGeneratePayload) {
  return request<TopicDetailResponse>("/topics/ai-generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchRandomTopic() {
  return request<TopicDetailResponse>("/topics/random", {
    method: "GET",
  });
}

export function fetchLearningFeed() {
  return request<LearningFeedResponse>("/feed/videos", { method: "GET" });
}

export function likeLearningVideo(videoId: number, liked: boolean) {
  return request<FeedLikeResponse>(`/feed/videos/${videoId}/like`, {
    method: "POST",
    body: JSON.stringify({ liked }),
  });
}

export function saveLearningVideo(videoId: number, saved: boolean) {
  return request<FeedSaveResponse>(`/feed/videos/${videoId}/save`, {
    method: "POST",
    body: JSON.stringify({ saved }),
  });
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return requestForm<FileUploadResponse>("/uploads", formData);
}

export function listUploads() {
  return request<UploadListResponse>("/uploads", { method: "GET" });
}

export function deleteUpload(uploadId: string) {
  return request<void>(`/uploads/${uploadId}`, { method: "DELETE" });
}

export function processContent(payload: ContentProcessRequest) {
  return request<ContentProcessResponse>("/content/process", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function processContentAsync(payload: ContentProcessRequest) {
  return request<ContentProcessTaskEnqueueResponse>("/content/process/async", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getContentTaskStatus(taskId: string) {
  return request<ContentProcessTaskStatusResponse>(`/content/tasks/${taskId}`);
}

export function processUploadToAssets(uploadId: string) {
  return request<ContentLearningAssetsResponse>("/content/from-upload", {
    method: "POST",
    body: JSON.stringify({ upload_id: uploadId }),
  });
}

export function listUploadAssets() {
  return request<ContentLearningAssetsListResponse>("/content/from-upload");
}

export function getUploadAssets(documentId: string) {
  return request<ContentLearningAssetsDetailResponse>(`/content/from-upload/${documentId}`);
}

export function listGoals() {
  return request<GoalListResponse>("/goals");
}

export function createGoal(payload: GoalCreateRequest) {
  return request<GoalResponse>("/goals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGoal(goalId: string, payload: GoalUpdateRequest) {
  return request<GoalResponse>(`/goals/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteGoal(goalId: string) {
  return request<void>(`/goals/${goalId}`, { method: "DELETE" });
}

export function listContentDocuments() {
  return request<ContentDocumentListResponse>("/content", { method: "GET" });
}

export function getContentDocument(documentId: string) {
  return request<ContentDocumentDetailResponse>(`/content/${documentId}`, { method: "GET" });
}

export function generateQuiz(payload: {
  topic?: string;
  difficulty?: string;
  question_count?: number;
}) {
  return request<QuizResponse>("/quiz/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitQuizAttempt(payload: {
  topic?: string;
  question_count?: number;
  answers: number[];
  duration_seconds?: number;
}) {
  return request<QuizAttemptResponse>("/quiz/attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchFlashcards(topic?: string) {
  const search = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  return request<FlashcardDeck>(`/flashcards${search}`, { method: "GET" });
}

export function generateFlashcardsFromTopic(topic: string) {
  return request<FlashcardDeck>("/flashcards/generate", {
    method: "POST",
    body: JSON.stringify({ topic }),
  });
}

export function submitFlashcardAttempt(payload: {
  topic: string;
  known: number[];
  unknown: number[];
}) {
  return request<FlashcardAttemptResponse>("/flashcards/attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function sendChatMessage(message: string) {
  return request<ChatMessageResponse>("/chat/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function createChatSession(title?: string) {
  return request<{ session_id: string; title?: string | null }>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function postChatSessionMessage(sessionId: string, content: string) {
  return request<ChatSessionResponse>(`/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
