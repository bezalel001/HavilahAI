import { useState } from 'react';
import { Search, BookOpen, Video, Brain, FileText, ChevronRight, Sparkles, Globe } from 'lucide-react';

export function TopicExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const popularTopics = [
    { id: 1, name: 'GDPR & Data Privacy', icon: '🔒', category: 'Law & Policy', lessons: 12, color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Quantum Physics', icon: '⚛️', category: 'Physics', lessons: 15, color: 'from-purple-500 to-pink-500' },
    { id: 3, name: 'Calculus Fundamentals', icon: '📊', category: 'Mathematics', lessons: 20, color: 'from-green-500 to-teal-500' },
    { id: 4, name: 'Molecular Biology', icon: '🧬', category: 'Biology', lessons: 18, color: 'from-pink-500 to-rose-500' },
    { id: 5, name: 'EU Economic Policy', icon: '💰', category: 'Economics', lessons: 14, color: 'from-yellow-500 to-orange-500' },
    { id: 6, name: 'Climate Change', icon: '🌍', category: 'Environmental Science', lessons: 16, color: 'from-teal-500 to-emerald-500' },
  ];

  const recentTopics = [
    { name: 'Neural Networks', progress: 65, icon: '🤖' },
    { name: 'European History', progress: 40, icon: '🏛️' },
    { name: 'Organic Chemistry', progress: 80, icon: '⚗️' },
  ];

  const topicDetails = {
    modules: [
      { title: 'Introduction & Overview', duration: '15 min', type: 'video', completed: true },
      { title: 'Core Concepts Explained', duration: '25 min', type: 'reading', completed: true },
      { title: 'Interactive Examples', duration: '20 min', type: 'interactive', completed: false },
      { title: 'Practice Quiz', duration: '10 min', type: 'quiz', completed: false },
      { title: 'Deep Dive Discussion', duration: '30 min', type: 'reading', completed: false },
    ],
    euConnection: 'This topic is directly related to EU Regulation 2016/679 and covers key aspects of data protection within European Union member states.',
    difficulty: 'Intermediate',
    estimatedTime: '3.5 hours',
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'reading': return <FileText className="w-5 h-5" />;
      case 'quiz': return <Brain className="w-5 h-5" />;
      case 'interactive': return <Sparkles className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Explore Topics 🧭</h1>
        <p className="text-gray-600">Discover and master any subject with AI-powered learning paths</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-gray-400 ml-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any topic... (e.g., Quantum Computing, EU Law, Calculus)"
            className="flex-1 py-4 outline-none"
          />
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
            Search
          </button>
        </div>
      </div>

      {!selectedTopic ? (
        <>
          {/* Continue Learning */}
          {recentTopics.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4">Continue Learning</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {recentTopics.map((topic, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="text-5xl mb-3">{topic.icon}</div>
                    <div className="mb-4">{topic.name}</div>
                    <div className="mb-2 text-gray-600">{topic.progress}% Complete</div>
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

          {/* Popular Topics */}
          <div>
            <h2 className="mb-4">Popular Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.name)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className={`h-32 bg-gradient-to-br ${topic.color} flex items-center justify-center text-6xl`}>
                    {topic.icon}
                  </div>
                  <div className="p-6">
                    <div className="mb-2">{topic.name}</div>
                    <div className="text-gray-600 mb-4">{topic.category}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600">{topic.lessons} lessons</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Topic Detail View */
        <div>
          <button
            onClick={() => setSelectedTopic(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to topics
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="mb-2 text-white">{selectedTopic}</h1>
                <p className="text-white text-opacity-90 mb-6">Master the fundamentals of data protection in the European Union</p>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:shadow-lg transition-all">
                    Start Learning
                  </button>
                  <button className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all">
                    Preview
                  </button>
                </div>
              </div>

              {/* Learning Modules */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="mb-4">Learning Path</h2>
                <div className="space-y-3">
                  {topicDetails.modules.map((module, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        module.completed
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        module.completed ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {module.completed ? '✓' : getModuleIcon(module.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-900">{module.title}</div>
                        <div className="text-gray-600">{module.duration}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* EU Connection */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div className="text-blue-900">EU Context</div>
                </div>
                <p className="text-blue-700">{topicDetails.euConnection}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="mb-4">Course Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Difficulty</span>
                    <span className="text-purple-600">{topicDetails.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Time</span>
                    <span className="text-purple-600">{topicDetails.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Modules</span>
                    <span className="text-purple-600">{topicDetails.modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-green-600">{topicDetails.modules.filter(m => m.completed).length}</span>
                  </div>
                </div>
              </div>

              {/* Learning Style */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="mb-4">Adapt to Your Style</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 rounded-lg bg-purple-50 text-purple-600 border-2 border-purple-600">
                    📺 Visual Learner
                  </button>
                  <button className="w-full p-3 rounded-lg text-gray-600 border-2 border-gray-200 hover:border-purple-300">
                    🎧 Auditory Learner
                  </button>
                  <button className="w-full p-3 rounded-lg text-gray-600 border-2 border-gray-200 hover:border-purple-300">
                    ✋ Kinesthetic Learner
                  </button>
                </div>
              </div>

              {/* Related Topics */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="mb-4">Related Topics</h3>
                <div className="space-y-2">
                  {['Cybersecurity Basics', 'EU Digital Policy', 'Privacy Laws'].map((topic, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
