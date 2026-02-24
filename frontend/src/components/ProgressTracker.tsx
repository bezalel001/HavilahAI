import { useEffect, useState } from "react";
import { Trophy, Target, Clock, Calendar, TrendingUp, Award, Zap, Star } from "lucide-react";
import { fetchProgressOverview, type ProgressOverview } from "../lib/api";

export function ProgressTracker() {
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await fetchProgressOverview();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress.");
      }
    };
    loadOverview();
  }, []);

  const weeklyStats = overview?.weekly_stats ?? [];
  const achievements = overview?.achievements ?? [];
  const subjects = overview?.subjects ?? [];
  const recentMilestones = overview?.milestones ?? [];

  const maxMinutes = Math.max(1, ...weeklyStats.map((s) => Math.max(s.minutes, s.goal)));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Your Progress 📊</h1>
        <p className="text-gray-600">Track your learning journey and celebrate achievements</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8" />
            <span className="text-3xl">🎯</span>
          </div>
          <div className="mb-1">Current Level</div>
          <div>{overview?.level ?? "Level 0"}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8" />
            <span className="text-3xl">🔥</span>
          </div>
          <div className="mb-1">Study Streak</div>
          <div>{overview?.streak ?? "0 Days"}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <span className="text-3xl">⏱️</span>
          </div>
          <div className="mb-1">Total Study Time</div>
          <div>{overview?.study_time ?? "0 hrs"}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8" />
            <span className="text-3xl">⭐</span>
          </div>
          <div className="mb-1">Total Points</div>
          <div>{overview?.total_points ?? "0"}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2>This Week's Activity</h2>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex flex-col items-center justify-end flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(stat.minutes / maxMinutes) * 100}%` }}
                  />
                  <div
                    className="absolute bottom-0 w-full border-b-2 border-dashed border-gray-300"
                    style={{ bottom: `${(stat.goal / maxMinutes) * 100}%` }}
                  />
                </div>
                <div className="text-gray-600">{stat.day}</div>
                <div className="text-purple-600">{stat.minutes}m</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-b-2 border-dashed border-gray-300" />
            <span>Daily goal: 60 minutes</span>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2>Subject Mastery</h2>
          </div>
          <div className="space-y-5">
            {subjects.map((subject, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">{subject.name}</span>
                  <span className="text-gray-600">{subject.progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subject.color} rounded-full transition-all`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h2>Achievements</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="mb-1">{achievement.name}</div>
                <p className="text-gray-600">{achievement.description}</p>
                {achievement.unlocked && (
                  <div className="mt-2 text-purple-600 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>Unlocked!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Milestones */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-purple-600" />
            <h2>Recent Milestones</h2>
          </div>
          <div className="space-y-4">
            {recentMilestones.map((milestone, index) => {
              const iconLookup = {
                trophy: Trophy,
                star: Star,
                zap: Zap,
              } as const;
              const Icon = iconLookup[milestone.icon as keyof typeof iconLookup] ?? Star;
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Icon className={`w-6 h-6 ${milestone.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">{milestone.title}</div>
                    <div className="text-gray-600">{milestone.date}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Level Progress */}
          {overview?.next_level && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <span>Next Level: {overview.next_level.next_level}</span>
                <span>{overview.next_level.current_xp} / {overview.next_level.target_xp} XP</span>
              </div>
              <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${overview.next_level.percentage}%` }} />
              </div>
              <p className="mt-2 text-white text-opacity-90">
                {overview.next_level.remaining_xp} XP away from leveling up! 🚀
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
