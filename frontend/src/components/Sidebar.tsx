import { Home, Upload, Video, Brain, CreditCard, MessageCircle, TrendingUp, Compass, Menu, X } from 'lucide-react';
import { View } from '../App';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentView, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, icon: Home, label: 'Dashboard' },
    { id: 'upload' as View, icon: Upload, label: 'Upload Notes' },
    { id: 'explore' as View, icon: Compass, label: 'Explore Topics' },
    { id: 'feed' as View, icon: Video, label: 'Learning Feed' },
    { id: 'quiz' as View, icon: Brain, label: 'Quizzes' },
    { id: 'flashcards' as View, icon: CreditCard, label: 'Flashcards' },
    { id: 'chat' as View, icon: MessageCircle, label: 'AI Tutor' },
    { id: 'progress' as View, icon: TrendingUp, label: 'Progress' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white shadow-xl transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Havilah</span>
            </div>
          )}
          <button 
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
              JD
            </div>
            {!collapsed && (
              <div className="flex-1">
                <div>John Doe</div>
                <div className="text-gray-500">Level 5 • 🔥 12 day streak</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
