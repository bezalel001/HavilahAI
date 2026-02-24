import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ContentUpload } from "./components/ContentUpload";
import { LearningFeed } from "./components/LearningFeed";
import { QuizGenerator } from "./components/QuizGenerator";
import { Flashcards } from "./components/Flashcards";
import { AIChat } from "./components/AIChat";
import { ProgressTracker } from "./components/ProgressTracker";
import { TopicExplorer } from "./components/TopicExplorer";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { Toaster, toast } from "sonner";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  type UserResponse,
} from "./lib/api";
import { Presentation } from "./components/Presentation";

export type View =
  | "dashboard"
  | "upload"
  | "feed"
  | "quiz"
  | "flashcards"
  | "chat"
  | "progress"
  | "explore"
  | "presentation";

export type AuthView = "signin" | "signup";
type AuthUser = Partial<
  Pick<
    UserResponse,
    | "id"
    | "full_name"
    | "preferred_language"
    | "learning_style"
    | "is_superuser"
  >
> & { email: string };

type RealtimeTaskState = {
  taskId: string;
  status: string;
  title?: string;
  error?: string;
  updatedAt: string;
};

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("havilah_token"),
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("havilah_user");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("signin");
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [taskState, setTaskState] = useState<RealtimeTaskState | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem("havilah_token", authToken);
    } else {
      localStorage.removeItem("havilah_token");
    }
  }, [authToken]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem("havilah_user", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("havilah_user");
    }
  }, [authUser]);

  const isAuthenticated = useMemo(() => Boolean(authToken), [authToken]);

  useEffect(() => {
    if (!isAuthenticated || !authUser?.id) {
      return;
    }

    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8081";
    const endpoint = `${wsBaseUrl}?userId=${encodeURIComponent(authUser.id)}`;
    const socket = new WebSocket(endpoint);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          type?: string;
          task_id?: string;
          status?: string;
          title?: string;
          error?: string;
        };

        if (!payload.task_id || !payload.status) {
          return;
        }

        setTaskState({
          taskId: payload.task_id,
          status: payload.status,
          title: payload.title,
          error: payload.error,
          updatedAt: new Date().toISOString(),
        });

        if (payload.status === "PENDING") {
          toast.info(`Task ${payload.task_id.slice(0, 8)} queued`);
        } else if (payload.status === "STARTED") {
          toast.loading(`Task ${payload.task_id.slice(0, 8)} started`);
        } else if (payload.status === "SUCCESS") {
          toast.success(payload.title ?? "Content processing completed");
        } else if (payload.status === "FAILURE") {
          toast.error(payload.error ?? "Content processing failed");
        }
      } catch {
        // Ignore malformed events.
      }
    };

    return () => {
      socket.close();
    };
  }, [authUser?.id, isAuthenticated]);

  const mapUserResponse = (user: UserResponse): AuthUser => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name ?? undefined,
    preferred_language: user.preferred_language ?? undefined,
    learning_style: user.learning_style ?? undefined,
    is_superuser: user.is_superuser,
  });

  const handleSignIn = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const token = await loginUser({ email, password });
      localStorage.setItem("havilah_token", token.access_token);
      setAuthToken(token.access_token);
      const user = await getCurrentUser();
      setAuthUser(mapUserResponse(user));
    } catch (error) {
      setAuthToken(null);
      setAuthUser(null);
      localStorage.removeItem("havilah_token");
      setAuthError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
    language: string,
  ) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await registerUser({
        full_name: name,
        email,
        password,
        preferred_language: language,
        learning_style: "not_set",
      });
      const token = await loginUser({ email, password });
      localStorage.setItem("havilah_token", token.access_token);
      setAuthToken(token.access_token);
      const profile = await getCurrentUser();
      setAuthUser(mapUserResponse(profile));
    } catch (error) {
      setAuthToken(null);
      setAuthUser(null);
      localStorage.removeItem("havilah_token");
      setAuthError(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setAuthError(null);
    setAuthView("signin");
    localStorage.removeItem("havilah_token");
    localStorage.removeItem("havilah_user");
  };

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    if (authView === "signin") {
      return (
        <SignIn
          onSignIn={handleSignIn}
          isSubmitting={isAuthLoading}
          error={authError}
          onClearError={() => setAuthError(null)}
          onSwitchToSignUp={() => {
            setAuthError(null);
            setAuthView("signup");
          }}
        />
      );
    } else {
      return (
        <SignUp
          onSignUp={handleSignUp}
          isSubmitting={isAuthLoading}
          error={authError}
          onClearError={() => setAuthError(null)}
          onSwitchToSignIn={() => {
            setAuthError(null);
            setAuthView("signin");
          }}
        />
      );
    }
  }

    // Show presentation if requested (bypasses auth)
  if (showPresentation || currentView === 'presentation') {
    return <Presentation />;
  }

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    // Add button to view presentation without login
    const presentationButton = (
      <button
        onClick={() => setShowPresentation(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all z-50"
      >
        📊 View Presentation
      </button>
    );

    if (authView === 'signin') {
      return (
        <>
          <SignIn onSignIn={handleSignIn} onSwitchToSignUp={() => setAuthView('signup')} />
          {presentationButton}
        </>
      );
    } else {
      return (
        <>
          <SignUp onSignUp={handleSignUp} onSwitchToSignIn={() => setAuthView('signin')} />
          {presentationButton}
        </>
      );
    }
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={setCurrentView}
            userName={authUser?.full_name || authUser?.email}
          />
        );
      case "upload":
        return <ContentUpload onNavigate={setCurrentView} />;
      case "feed":
        return <LearningFeed />;
      case "quiz":
        return <QuizGenerator />;
      case "flashcards":
        return <Flashcards />;
      case "chat":
        return <AIChat />;
      case "progress":
        return <ProgressTracker />;
      case "explore":
        return (
          <TopicExplorer
            canManageTopics={Boolean(authUser?.is_superuser)}
            onNavigate={setCurrentView}
            onStartQuiz={(topicId, topicName) => {
              // In a full implementation, you would pass topic data to QuizGenerator
              console.log("Starting quiz for topic:", topicName);
              setCurrentView("quiz");
            }}
            onStartFlashcards={(topicId, topicName) => {
              // In a full implementation, you would pass topic data to Flashcards
              console.log("Starting flashcards for topic:", topicName);
              setCurrentView("flashcards");
            }}
          />
        );
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Toaster position="top-right" richColors />
      {taskState && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 max-w-sm">
          <div className="text-sm text-gray-500">Background Task</div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {taskState.title ?? `Task ${taskState.taskId.slice(0, 8)}`}
          </div>
          <div className="text-sm mt-1">
            Status: <span className="font-semibold">{taskState.status}</span>
          </div>
          {taskState.error && (
            <div className="text-xs text-red-600 mt-1">{taskState.error}</div>
          )}
        </div>
      )}
      {/* Presentation Button */}
      <button
        onClick={() => setShowPresentation(true)}
        className="fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all z-50 text-sm flex items-center gap-2"
      >
        📊 Presentation Mode
      </button>

      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={authUser}
        onLogout={handleLogout}
      />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        {renderView()}
      </main>
    </div>
  );
}
