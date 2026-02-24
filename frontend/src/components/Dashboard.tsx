import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Target,
  Zap,
  Award,
  Clock,
  TrendingUp,
  BookOpen,
  Brain,
  Video,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Upload as UploadIcon,
  Sparkles,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import { View } from "../App";
import {
  fetchDashboardSummary,
  createGoal,
  deleteGoal,
  getUploadAssets,
  listGoals,
  listUploadAssets,
  updateGoal,
  deleteUpload,
  type DashboardActivity,
  type DashboardQuickAction,
  type DashboardStat,
  type DashboardSummary,
  type ContentLearningAssetsSummary,
  type GoalResponse,
} from "../lib/api";
import { Button } from "./ui/button";
import { createPortal } from "react-dom";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DashboardProps {
  onNavigate: (view: View) => void;
  userName?: string | null;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  current: number;
  total: number;
  type: string;
  deadline?: string;
}

interface GoalType {
  value: string;
  label: string;
  unit: string;
}

interface UploadSummary {
  id: string;
  uploadId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  fullDate: string;
  mainSummary: string;
  keyTopics: string[];
  simplifiedConcepts: { original: string; simplified: string }[];
  generatedContent: {
    flashcards: number;
    quizzes: number;
    videoSegments: number;
  };
}

const EMPTY_UPLOAD_SUMMARY: UploadSummary = {
  id: "",
  uploadId: "",
  fileName: "Uploaded file",
  fileSize: "0 B",
  fileType: "Document",
  uploadDate: "-",
  fullDate: "-",
  mainSummary: "No summary available yet.",
  keyTopics: [],
  simplifiedConcepts: [],
  generatedContent: {
    flashcards: 0,
    quizzes: 0,
    videoSegments: 0,
  },
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const buildSimplifiedConcepts = (summary: string, keyPoints: string[]) => {
  const concepts: string[] = [];
  if (summary) {
    summary
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .slice(0, 2)
      .forEach((sentence) => concepts.push(sentence));
  }
  if (concepts.length < 2) {
    keyPoints
      .slice(0, 2 - concepts.length)
      .forEach((point) => concepts.push(point));
  }
  if (concepts.length === 0) {
    return [
      {
        original: "No detailed concepts were detected in the upload.",
        simplified: "We could not simplify concepts without more content.",
      },
    ];
  }
  return concepts.map((sentence) => {
    const cleaned = sentence.replace(/[.!?]$/, "");
    return {
      original: sentence,
      simplified: `In simple terms, ${cleaned}.`,
    };
  });
};

const estimateVideoSegments = (keyPoints: string[]) => {
  if (keyPoints.length === 0) return 8;
  return Math.max(3, Math.min(12, Math.ceil(keyPoints.length / 2)));
};

export function Dashboard({ onNavigate, userName }: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<UploadSummary[]>([]);
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<UploadSummary | null>(
    null,
  );

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "quizzes",
    total: "",
    deadline: "",
  });
  const isBrowser = typeof document !== "undefined";

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard.",
        );
      }
    };
    loadSummary();
  }, []);

  useEffect(() => {
    const loadGoals = async () => {
      setGoalsLoading(true);
      setGoalsError(null);
      try {
        const response = await listGoals();
        const items = response.items.map((goal: GoalResponse) => ({
          id: goal.id,
          title: goal.title,
          progress: goal.progress,
          current: goal.current,
          total: goal.total,
          type: goal.type,
          deadline: goal.deadline ?? undefined,
        }));
        setGoals(items);
      } catch (err) {
        setGoalsError(
          err instanceof Error ? err.message : "Failed to load goals.",
        );
      } finally {
        setGoalsLoading(false);
      }
    };
    loadGoals();
  }, []);

  useEffect(() => {
    const loadUploads = async () => {
      setUploadsLoading(true);
      setUploadsError(null);
      try {
        const response = await listUploadAssets();
        const uploads = response.items
          .slice(0, 3)
          .map((item: ContentLearningAssetsSummary) => {
            const uploadedAt = item.upload_created_at ?? item.created_at;
            const fileType = item.content_type ?? "";
            const fileTypeLabel = fileType
              ? fileType.startsWith("image/")
                ? "Image"
                : fileType.split("/").pop()?.toUpperCase() || "Document"
              : "Document";
            return {
              id: item.document_id,
              uploadId: item.upload_id,
              fileName: item.original_filename ?? "Uploaded file",
              fileSize: formatFileSize(item.size_bytes),
              fileType: fileTypeLabel,
              uploadDate: new Date(uploadedAt).toLocaleDateString(),
              fullDate: new Date(uploadedAt).toLocaleString(),
              mainSummary: item.summary ?? "No summary available yet.",
              keyTopics: item.key_points ?? [],
              simplifiedConcepts: buildSimplifiedConcepts(
                item.summary ?? "",
                item.key_points ?? [],
              ),
              generatedContent: {
                flashcards: item.flashcards_count,
                quizzes: item.quiz_questions_count,
                videoSegments: estimateVideoSegments(item.key_points ?? []),
              },
            };
          });
        setRecentUploads(uploads);
      } catch (err) {
        setUploadsError(
          err instanceof Error ? err.message : "Failed to load uploads.",
        );
      } finally {
        setUploadsLoading(false);
      }
    };
    loadUploads();
  }, []);

  const firstName = userName?.trim().split(" ")[0] || "Learner";
  const stats: DashboardStat[] = summary?.stats ?? [];
  const recentActivity: DashboardActivity[] = summary?.recent_activity ?? [];
  const quickActions: DashboardQuickAction[] = summary?.quick_actions ?? [];
  const activeUpload = selectedUpload ?? EMPTY_UPLOAD_SUMMARY;

  const goalTypes = useMemo<GoalType[]>(
    () => [
      { value: "quizzes", label: "Complete Quizzes", unit: "quizzes" },
      { value: "hours", label: "Study Hours", unit: "hours" },
      { value: "topics", label: "Master Topics", unit: "topics" },
      { value: "flashcards", label: "Review Flashcards", unit: "flashcards" },
      { value: "videos", label: "Watch Videos", unit: "videos" },
    ],
    [],
  );

  const getGoalTypeUnit = (type: string) => {
    const goalType = goalTypes.find((item: GoalType) => item.value === type);
    return goalType?.unit || type;
  };

  const openAddGoalDialog = () => {
    setEditingGoal(null);
    setFormData({ title: "", type: "quizzes", total: "", deadline: "" });
    setIsGoalDialogOpen(true);
  };

  const openEditGoalDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      type: goal.type,
      total: goal.total.toString(),
      deadline: goal.deadline ?? "",
    });
    setIsGoalDialogOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!formData.title || !formData.total) return;
    const total = Number(formData.total);
    if (!Number.isFinite(total) || total <= 0) return;

    setGoalsError(null);
    try {
      if (editingGoal) {
        const updated = await updateGoal(editingGoal.id, {
          title: formData.title,
          type: formData.type,
          total,
          deadline: formData.deadline || null,
        });
        setGoals((prev: Goal[]) =>
          prev.map((goal: Goal) =>
            goal.id === updated.id
              ? {
                  id: updated.id,
                  title: updated.title,
                  progress: updated.progress,
                  current: updated.current,
                  total: updated.total,
                  type: updated.type,
                  deadline: updated.deadline ?? undefined,
                }
              : goal,
          ),
        );
      } else {
        const created = await createGoal({
          title: formData.title,
          type: formData.type,
          total,
          deadline: formData.deadline || null,
        });
        setGoals((prev: Goal[]) => [
          {
            id: created.id,
            title: created.title,
            progress: created.progress,
            current: created.current,
            total: created.total,
            type: created.type,
            deadline: created.deadline ?? undefined,
          },
          ...prev,
        ]);
      }
      setIsGoalDialogOpen(false);
      setFormData({ title: "", type: "quizzes", total: "", deadline: "" });
    } catch (err) {
      setGoalsError(
        err instanceof Error ? err.message : "Failed to save goal.",
      );
    }
  };

  const openDeleteDialog = (goalId: string) => {
    setGoalToDelete(goalId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGoal = async () => {
    if (goalToDelete) {
      setGoalsError(null);
      try {
        await deleteGoal(goalToDelete);
        setGoals((prev: Goal[]) =>
          prev.filter((goal: Goal) => goal.id !== goalToDelete),
        );
        setGoalToDelete(null);
      } catch (err) {
        setGoalsError(
          err instanceof Error ? err.message : "Failed to delete goal.",
        );
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleViewSummary = (upload: UploadSummary) => {
    setSelectedUpload(upload);
    setIsSummaryModalOpen(true);
    setUploadsError(null);
    setIsSummaryLoading(true);
    void (async () => {
      try {
        const detail = await getUploadAssets(upload.id);
        const contentType = detail.content_type ?? "";
        const fileTypeLabel = contentType
          ? contentType.startsWith("image/")
            ? "Image"
            : contentType.split("/").pop()?.toUpperCase() || "Document"
          : "Document";
        const createdAt = detail.upload_created_at ?? detail.created_at;
        const summaryText =
          detail.summary?.trim() || "No summary available yet.";
        const keyPoints = detail.key_points ?? [];
        setSelectedUpload({
          id: detail.document_id,
          uploadId: detail.upload_id,
          fileName: detail.original_filename ?? "Uploaded file",
          fileSize: formatFileSize(detail.size_bytes),
          fileType: fileTypeLabel,
          uploadDate: new Date(createdAt).toLocaleDateString(),
          fullDate: new Date(createdAt).toLocaleString(),
          mainSummary: summaryText,
          keyTopics: keyPoints,
          simplifiedConcepts: detail.simplified_concepts?.length
            ? detail.simplified_concepts
            : buildSimplifiedConcepts(summaryText, keyPoints),
          generatedContent: {
            flashcards: detail.flashcards?.length ?? 0,
            quizzes: detail.quiz_questions?.length ?? 0,
            videoSegments: estimateVideoSegments(keyPoints),
          },
        });
      } catch (err) {
        setUploadsError(
          err instanceof Error ? err.message : "Failed to load upload summary.",
        );
      } finally {
        setIsSummaryLoading(false);
      }
    })();
  };

  const handleDeleteUpload = async () => {
    if (!deleteUploadId) return;
    try {
      await deleteUpload(deleteUploadId);
      setRecentUploads((prev) =>
        prev.filter((item) => item.uploadId !== deleteUploadId),
      );
      if (selectedUpload?.uploadId === deleteUploadId) {
        setSelectedUpload(null);
        setIsSummaryModalOpen(false);
      }
    } catch (err) {
      setUploadsError(
        err instanceof Error ? err.message : "Failed to delete upload.",
      );
    } finally {
      setDeleteUploadId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 mt-16 md:mt-0">
        <h1 className="mb-2">
          {summary?.greeting ?? `Welcome back, ${firstName}! 👋`}
        </h1>
        <p className="text-gray-600">
          {summary?.subtitle ?? "Ready to continue your learning journey?"}
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {stats.map((stat: DashboardStat, index: number) => {
          const iconLookup = {
            zap: Zap,
            award: Award,
            clock: Clock,
            "trending-up": TrendingUp,
          } as const;
          const ResolvedIcon =
            iconLookup[stat.icon as keyof typeof iconLookup] ?? Zap;
          return (
            <div
              key={index}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <ResolvedIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-gray-600 mb-1 text-sm sm:text-base">
                {stat.label}
              </div>
              <div className="text-lg sm:text-xl">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action: DashboardQuickAction, index: number) => (
            <button
              key={index}
              onClick={() => onNavigate(action.view as View)}
              className={`${action.color} text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-transform shadow-lg`}
            >
              <div className="text-3xl sm:text-4xl mb-2">{action.icon}</div>
              <div className="text-sm sm:text-base">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h2>Recent Uploads</h2>
            </div>
            <button
              onClick={() => onNavigate("upload")}
              className="text-purple-600 text-sm hover:text-purple-700 transition-colors"
            >
              View All
            </button>
          </div>
          {uploadsError && (
            <p className="text-sm text-red-600 mb-3">{uploadsError}</p>
          )}
          {uploadsLoading ? (
            <p className="text-sm text-gray-500">Loading uploads...</p>
          ) : recentUploads.length === 0 ? (
            <p className="text-sm text-gray-600">
              No uploads yet. Start by uploading your notes.
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentUploads.map((upload: UploadSummary) => (
                <div
                  key={upload.id}
                  className="p-4 rounded-2xl border-2 border-gray-300 bg-purple-50/30 hover:border-purple-400 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-gray-900 text-sm sm:text-base font-medium truncate mb-1">
                          {upload.fileName}
                        </div>
                        <div className="text-gray-500 text-xs sm:text-sm">
                          {upload.fileSize} • {upload.uploadDate}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto self-start flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewSummary(upload)}
                        type="button"
                        className="min-w-[110px] px-3 py-1.5 text-xs sm:text-sm rounded-full text-white transition-colors shadow-sm"
                        style={{ backgroundColor: "#7c3aed" }}
                      >
                        View Summary
                      </button>
                      <button
                        onClick={() =>
                          upload.uploadId && setDeleteUploadId(upload.uploadId)
                        }
                        disabled={!upload.uploadId}
                        type="button"
                        className="px-3 py-1.5 text-xs sm:text-sm border border-red-200 text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {upload.keyTopics.slice(0, 3).map((topic: string) => {
                      const label =
                        topic.length > 32 ? `${topic.slice(0, 32)}…` : topic;
                      return (
                        <span
                          key={topic}
                          className="px-2.5 py-1 bg-white text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                        >
                          {label}
                        </span>
                      );
                    })}
                    {upload.keyTopics.length > 3 && (
                      <span className="px-2.5 py-1 bg-white text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                        +{upload.keyTopics.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
                    <span>
                      📘 {upload.generatedContent.flashcards} flashcards
                    </span>
                    <span>🧠 {upload.generatedContent.quizzes} quizzes</span>
                    <span>
                      🎥 {upload.generatedContent.videoSegments} videos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Goals Progress */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h2>Your Goals</h2>
            </div>
            <button
              onClick={openAddGoalDialog}
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {goalsError && (
            <p className="text-sm text-red-600 mb-3">{goalsError}</p>
          )}
          {goalsLoading ? (
            <p className="text-sm text-gray-500">Loading goals...</p>
          ) : goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-4">
                No goals yet. Start by adding your first goal!
              </p>
              <button
                onClick={openAddGoalDialog}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Your First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {goals.map((goal: Goal) => (
                <div key={goal.id} className="group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="text-gray-700 text-sm sm:text-base">
                        {goal.title}
                      </span>
                      {goal.deadline && (
                        <div className="text-xs text-gray-500 mt-1">
                          Due:{" "}
                          {new Date(goal.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-gray-600 text-sm sm:text-base">
                        {goal.current}/{goal.total} {getGoalTypeUnit(goal.type)}
                      </span>
                      <button
                        onClick={() => openEditGoalDialog(goal)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded transition-all"
                        title="Edit goal"
                      >
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(goal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h2>Recent Activity</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map(
              (activity: DashboardActivity, index: number) => {
                const iconLookup = {
                  brain: Brain,
                  "book-open": BookOpen,
                  video: Video,
                } as const;
                const ResolvedIcon =
                  iconLookup[activity.icon as keyof typeof iconLookup] ?? Brain;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ResolvedIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 text-sm sm:text-base truncate">
                        {activity.title}
                      </div>
                      <div className="text-gray-500 text-xs sm:text-sm">
                        {activity.date}
                      </div>
                    </div>
                    <div className="text-purple-600 text-sm sm:text-base flex-shrink-0">
                      {activity.score}%
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {isGoalDialogOpen && isBrowser
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
              onClick={() => setIsGoalDialogOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="w-[92%] max-w-[520px] rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {editingGoal ? "Edit Goal" : "Add New Goal"}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {editingGoal
                          ? "Update your goal details below."
                          : "Create a new learning goal to track your progress."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGoalDialogOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input
                        id="goal-title"
                        placeholder="e.g., Complete 10 Quizzes This Month"
                        value={formData.title}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            title: event.target.value,
                          })
                        }
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-type">Goal Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger id="goal-type" className="h-11">
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent>
                          {goalTypes.map((type: GoalType) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-target">
                        Target{" "}
                        {goalTypes.find(
                          (item: GoalType) => item.value === formData.type,
                        )?.unit || "amount"}
                      </Label>
                      <Input
                        id="goal-target"
                        type="number"
                        min="1"
                        step={formData.type === "hours" ? "0.5" : "1"}
                        placeholder="e.g., 10"
                        value={formData.total}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            total: event.target.value,
                          })
                        }
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
                      <Input
                        id="goal-deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            deadline: event.target.value,
                          })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsGoalDialogOpen(false)}
                      className="px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveGoal}
                      disabled={!formData.title || !formData.total}
                      className="px-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      {editingGoal ? "Save Changes" : "Create Goal"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {isDeleteDialogOpen && isBrowser
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="w-[92%] max-w-[420px] rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-6">
                  <div className="text-lg font-semibold text-gray-900">
                    Delete Goal
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete this goal? This action
                    cannot be undone.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteGoal}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {isSummaryModalOpen && isBrowser
        ? createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
              }}
              onClick={() => setIsSummaryModalOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  width: "96vw",
                  maxWidth: "820px",
                  maxHeight: "85vh",
                  overflowY: "auto",
                  backgroundColor: "#fff",
                  borderRadius: "1rem",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-6 sm:p-7">
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Upload Summary
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Full details of your uploaded content and AI-generated
                      materials
                    </p>
                  </div>

                  <div className="space-y-4 py-1">
                    {isSummaryLoading && (
                      <p className="text-sm text-gray-600">
                        Loading latest summary details...
                      </p>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold">File Details</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">File Name</p>
                          <p className="font-medium break-all">
                            {activeUpload.fileName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Size</p>
                          <p className="font-medium">{activeUpload.fileSize}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-medium">{activeUpload.fileType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Uploaded</p>
                          <p className="font-medium">
                            {activeUpload.uploadDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">Content Summary</h3>
                      </div>
                      <div className="max-h-52 overflow-y-auto pr-1">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {activeUpload.mainSummary?.trim() ||
                            "No summary available yet."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold">
                          Key Topics ({activeUpload.keyTopics.length})
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeUpload.keyTopics.length > 0 ? (
                          activeUpload.keyTopics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {topic}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">
                            No key topics available.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold">
                          AI Simplification Examples
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {activeUpload.simplifiedConcepts.length > 0 ? (
                          activeUpload.simplifiedConcepts.map(
                            (concept, index) => (
                              <div
                                key={index}
                                className="border-l-4 border-purple-400 pl-3"
                              >
                                <p className="text-xs text-gray-600 mb-1.5">
                                  <span className="font-semibold">
                                    Original:
                                  </span>{" "}
                                  {concept.original}
                                </p>
                                <p className="text-xs text-gray-900">
                                  <span className="font-semibold text-purple-600">
                                    Simplified:
                                  </span>{" "}
                                  {concept.simplified}
                                </p>
                              </div>
                            ),
                          )
                        ) : (
                          <p className="text-sm text-gray-600">
                            No simplified concepts available.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold">
                          Generated Learning Materials
                        </h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {activeUpload.generatedContent.flashcards}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Flashcards
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-pink-600">
                            {activeUpload.generatedContent.quizzes}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Quizzes</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {activeUpload.generatedContent.videoSegments}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Video Clips
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setIsSummaryModalOpen(false)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {deleteUploadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="mb-2">Delete upload?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This removes the upload and any generated learning assets.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteUploadId(null)}
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
