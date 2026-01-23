import { useState } from "react";
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
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("signin");
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignIn = (email: string, password: string) => {
    // Mock authentication - in real app, this would call an API
    console.log("Signing in:", email);
    setIsAuthenticated(true);
  };

  const handleSignUp = (
    name: string,
    email: string,
    password: string,
    language: string,
  ) => {
    // Mock registration - in real app, this would call an API
    console.log("Signing up:", { name, email, language });
    setIsAuthenticated(true);
  };

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    if (authView === "signin") {
      return (
        <SignIn
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setAuthView("signup")}
        />
      );
    } else {
      return (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setAuthView("signin")}
        />
      );
    }
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />;
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
      />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        {renderView()}
      </main>
    </div>
  );
}
