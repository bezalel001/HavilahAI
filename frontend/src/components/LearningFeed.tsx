import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause } from 'lucide-react';

export function LearningFeed() {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<number>>(new Set());

  const videos = [
    {
      id: 1,
      title: 'EU GDPR Explained in 60 Seconds',
      subject: 'Law & Policy',
      duration: '0:58',
      likes: 1243,
      comments: 89,
      thumbnail: '🔒',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      title: 'Quantum Entanglement Made Simple',
      subject: 'Physics',
      duration: '1:15',
      likes: 2156,
      comments: 134,
      thumbnail: '⚛️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Derivatives in 90 Seconds',
      subject: 'Mathematics',
      duration: '1:28',
      likes: 987,
      comments: 67,
      thumbnail: '📊',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 4,
      title: 'DNA Replication Simplified',
      subject: 'Biology',
      duration: '1:42',
      likes: 1876,
      comments: 102,
      thumbnail: '🧬',
      color: 'from-pink-500 to-red-500'
    },
    {
      id: 5,
      title: 'Brexit Impact on EU Trade',
      subject: 'Economics',
      duration: '2:05',
      likes: 1432,
      comments: 156,
      thumbnail: '💰',
      color: 'from-yellow-500 to-orange-500'
    },
  ];

  const toggleLike = (id: number) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSave = (id: number) => {
    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Learning Feed 📺</h1>
        <p className="text-gray-600">Bite-sized educational content tailored for you</p>
      </div>

      {/* Filter Tags */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {['All', 'Physics', 'Mathematics', 'Law & Policy', 'Biology', 'Economics', 'Chemistry'].map((tag) => (
          <button
            key={tag}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
              tag === 'All'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Video Thumbnail */}
            <div className={`relative h-64 bg-gradient-to-br ${video.color} flex items-center justify-center cursor-pointer`}
              onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)}
            >
              <div className="text-8xl">{video.thumbnail}</div>
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                {playingVideo === video.id ? (
                  <Pause className="w-16 h-16 text-white" />
                ) : (
                  <Play className="w-16 h-16 text-white" />
                )}
              </div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-60 text-white rounded-full">
                {video.duration}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6">
              <div className="mb-3">
                <div className="mb-1">{video.title}</div>
                <div className="text-gray-600">{video.subject}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${likedVideos.has(video.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{likedVideos.has(video.id) ? video.likes + 1 : video.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{video.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => toggleSave(video.id)}
                  className={`text-gray-600 hover:text-purple-600 transition-colors ${savedVideos.has(video.id) ? 'text-purple-600' : ''}`}
                >
                  <Bookmark className={`w-5 h-5 ${savedVideos.has(video.id) ? 'fill-purple-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
