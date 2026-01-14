import { Target, Zap, Award, Clock, TrendingUp, BookOpen, Brain, Video } from 'lucide-react';
import { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: 'Study Streak', value: '12 days', icon: Zap, color: 'from-orange-500 to-red-500' },
    { label: 'Total Points', value: '2,450', icon: Award, color: 'from-yellow-500 to-orange-500' },
    { label: 'Study Time', value: '23.5 hrs', icon: Clock, color: 'from-blue-500 to-purple-500' },
    { label: 'Topics Mastered', value: '18', icon: TrendingUp, color: 'from-green-500 to-teal-500' },
  ];

  const recentActivity = [
    { title: 'Quantum Physics Quiz', type: 'quiz', score: 85, date: '2 hours ago', icon: Brain },
    { title: 'EU Data Protection Law', type: 'flashcards', score: 92, date: '5 hours ago', icon: BookOpen },
    { title: 'Calculus Simplified', type: 'video', score: 100, date: 'Yesterday', icon: Video },
    { title: 'Chemistry Basics', type: 'quiz', score: 78, date: '2 days ago', icon: Brain },
  ];

  const quickActions = [
    { label: 'Upload Notes', view: 'upload' as View, icon: '📤', color: 'bg-purple-500' },
    { label: 'Explore Topics', view: 'explore' as View, icon: '🧭', color: 'bg-blue-500' },
    { label: 'Take Quiz', view: 'quiz' as View, icon: '🧠', color: 'bg-pink-500' },
    { label: 'AI Tutor Chat', view: 'chat' as View, icon: '💬', color: 'bg-green-500' },
  ];

  const goals = [
    { title: 'Complete 5 Quizzes This Week', progress: 60, current: 3, total: 5 },
    { title: 'Study for 10 Hours', progress: 75, current: 7.5, total: 10 },
    { title: 'Master EU Policy Basics', progress: 40, current: 4, total: 10 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-600">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-gray-600 mb-1">{stat.label}</div>
              <div>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onNavigate(action.view)}
              className={`${action.color} text-white rounded-2xl p-6 hover:scale-105 transition-transform shadow-lg`}
            >
              <div className="text-4xl mb-2">{action.icon}</div>
              <div>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Goals Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-purple-600" />
            <h2>Your Goals</h2>
          </div>
          <div className="space-y-6">
            {goals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">{goal.title}</span>
                  <span className="text-gray-600">{goal.current}/{goal.total}</span>
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
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-purple-600" />
            <h2>Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">{activity.title}</div>
                    <div className="text-gray-500">{activity.date}</div>
                  </div>
                  <div className="text-purple-600">{activity.score}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
