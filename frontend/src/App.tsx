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
import {
  loginUser,
  registerUser,
  type UserResponse,
} from "./lib/api";

export type View =
  | "dashboard"
  | "upload"
  | "feed"
  | "quiz"
  | "flashcards"
  | "chat"
  | "progress"
  | "explore";
export type AuthView = "signin" | "signup";
type AuthUser = Partial<
  Pick<UserResponse, "id" | "full_name" | "preferred_language" | "learning_style">
> & { email: string };

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

  const handleSignIn = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const token = await loginUser({ email, password });
      setAuthToken(token.access_token);
      setAuthUser((prev) =>
        prev && prev.email === email ? prev : ({ email } as AuthUser),
      );
    } catch (error) {
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
      const user = await registerUser({
        full_name: name,
        email,
        password,
        preferred_language: language,
        learning_style: "not_set",
      });
      setAuthUser({
        id: user.id,
        email: user.email,
        full_name: user.full_name ?? undefined,
        preferred_language: user.preferred_language ?? undefined,
        learning_style: user.learning_style ?? undefined,
      });
      const token = await loginUser({ email, password });
      setAuthToken(token.access_token);
    } catch (error) {
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
        return <ContentUpload />;
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
        return <TopicExplorer />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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
