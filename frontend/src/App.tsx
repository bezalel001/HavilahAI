import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ContentUpload } from './components/ContentUpload';
import { LearningFeed } from './components/LearningFeed';
import { QuizGenerator } from './components/QuizGenerator';
import { Flashcards } from './components/Flashcards';
import { AIChat } from './components/AIChat';
import { ProgressTracker } from './components/ProgressTracker';
import { TopicExplorer } from './components/TopicExplorer';

export type View = 'dashboard' | 'upload' | 'feed' | 'quiz' | 'flashcards' | 'chat' | 'progress' | 'explore';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'upload':
        return <ContentUpload />;
      case 'feed':
        return <LearningFeed />;
      case 'quiz':
        return <QuizGenerator />;
      case 'flashcards':
        return <Flashcards />;
      case 'chat':
        return <AIChat />;
      case 'progress':
        return <ProgressTracker />;
      case 'explore':
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
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {renderView()}
      </main>
    </div>
  );
}
