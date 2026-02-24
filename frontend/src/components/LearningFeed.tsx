import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause } from 'lucide-react';
import { fetchLearningFeed, likeLearningVideo, saveLearningVideo, type LearningVideo } from "../lib/api";

export function LearningFeed() {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string>("All");
  const [error, setError] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState<Record<number, number>>(
    {},
  );
  const [playbackProgress, setPlaybackProgress] = useState<Record<number, number>>(
    {},
  );
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setSpeechVoices(voices);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getPreferredVoice = () => {
    if (speechVoices.length === 0) return null;
    const preferred = speechVoices.find((voice) =>
      /(natural|enhanced|premium|siri|google|neural)/i.test(voice.name),
    );
    return preferred ?? speechVoices[0];
  };

  const parseDurationSeconds = (duration: string) => {
    const [minutes, seconds] = duration.split(":").map((part) => Number(part));
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return 60;
    return minutes * 60 + seconds;
  };

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await fetchLearningFeed();
        setVideos(data.videos);
        setTags(data.tags);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feed.");
      }
    };
    loadFeed();
  }, []);

  const derivedTags = Array.from(
    new Set(videos.map((video) => video.subject).filter(Boolean)),
  ).sort();
  const effectiveTags =
    tags.length > 1 ? tags : ["All", ...derivedTags.filter((tag) => tag !== "All")];
  const normalizeTag = (value: string) => value.trim().toLowerCase();
  const tagAliases: Record<string, string[]> = {
    math: ["mathematics", "maths"],
    mathematics: ["math", "maths"],
    ai: ["artificial intelligence", "ai & data"],
    programming: ["computer science", "software"],
  };
  const filteredVideos =
    activeTag === "All"
      ? videos
      : videos.filter((video) => {
          const subject = normalizeTag(video.subject || "");
          const tag = normalizeTag(activeTag);
          if (!subject) return false;
          if (subject.includes(tag)) return true;
          const aliases = tagAliases[tag] || [];
          return aliases.some((alias) => subject.includes(alias));
        });

  const toggleLike = (id: number) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, liked: !video.liked, likes: video.likes + (video.liked ? -1 : 1) } : video
      )
    );
    const target = videos.find((video) => video.id === id);
    if (!target) return;
    likeLearningVideo(id, !target.liked).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to update like.");
    });
  };

  const toggleSave = (id: number) => {
    setVideos((prev) =>
      prev.map((video) => (video.id === id ? { ...video, saved: !video.saved } : video))
    );
    const target = videos.find((video) => video.id === id);
    if (!target) return;
    saveLearningVideo(id, !target.saved).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to update save.");
    });
  };

  useEffect(() => {
    if (playingVideo === null) return;
    const video = videos.find((item) => item.id === playingVideo);
    if (!video) return;
    const contentText =
      video.summary?.trim() ||
      (video.key_points?.length ? video.key_points.join(" ") : "");
    if (!contentText) return;

    setStreamProgress((prev) => ({ ...prev, [playingVideo]: 0 }));
    const durationSeconds = parseDurationSeconds(video.duration);
    const intervalMs = 90;
    const totalTicks = Math.max(1, Math.floor((durationSeconds * 1000) / intervalMs));
    const charsPerTick = Math.max(1, Math.ceil(contentText.length / totalTicks));
    const intervalId = window.setInterval(() => {
      setStreamProgress((prev) => {
        const next = (prev[playingVideo] ?? 0) + charsPerTick;
        if (next >= contentText.length) {
          window.clearInterval(intervalId);
          return { ...prev, [playingVideo]: contentText.length };
        }
        return { ...prev, [playingVideo]: next };
      });
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [playingVideo, videos]);

  useEffect(() => {
    if (playingVideo === null) return;
    const video = videos.find((item) => item.id === playingVideo);
    if (!video) return;
    const durationSeconds = parseDurationSeconds(video.duration);
    const start = Date.now();
    setPlaybackProgress((prev) => ({ ...prev, [playingVideo]: 0 }));

    const intervalId = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const percent = Math.min(100, (elapsed / durationSeconds) * 100);
      setPlaybackProgress((prev) => ({ ...prev, [playingVideo]: percent }));
      if (percent >= 100) {
        window.clearInterval(intervalId);
        setPlayingVideo(null);
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [playingVideo, videos]);

  useEffect(() => {
    if (playingVideo === null) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
      return;
    }
    const video = videos.find((item) => item.id === playingVideo);
    if (!video) return;
    const contentText =
      video.summary?.trim() ||
      (video.key_points?.length ? video.key_points.join(". ") : "");
    if (!contentText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(contentText);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    };
  }, [playingVideo, videos]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Learning Feed 📺</h1>
        <p className="text-gray-600">Bite-sized educational content tailored for you</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Filter Tags */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {effectiveTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
              tag === activeTag
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
        {filteredVideos.map((video) => {
          const contentText =
            video.summary?.trim() ||
            (video.key_points?.length ? video.key_points.join(" ") : "");
          const streamedCount = streamProgress[video.id] ?? 0;
          const streamedText = contentText.slice(0, streamedCount);
          const streamComplete = streamedCount >= contentText.length && contentText.length > 0;
          return (
          <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Video Thumbnail */}
            <div className={`relative h-64 bg-gradient-to-br ${video.color} ${playingVideo === video.id ? "learning-feed-motion" : ""} flex items-center justify-center cursor-pointer`}
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
              <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-white/20">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${playbackProgress[video.id] ?? 0}%` }}
                />
              </div>
              {playingVideo === video.id && contentText && (
                <div className="absolute inset-0 bg-black bg-opacity-60 text-white p-4 flex flex-col justify-end">
                  <div className="text-xs uppercase tracking-wide text-white/80 mb-2">
                    Now Playing
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-4">{streamedText}</p>
                  {streamComplete && (video.key_points?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {video.key_points?.slice(0, 3).map((point) => (
                        <span
                          key={point}
                          className="px-2 py-1 rounded-full bg-white/20 text-xs"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-6">
              <div className="mb-3">
                <div className="mb-1">{video.title}</div>
                <div className="text-gray-600">
                  {video.subject}
                  {video.source ? ` • ${video.source === "upload" ? "Upload" : "Topic"}` : ""}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${video.liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{video.likes}</span>
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
                  className={`text-gray-600 hover:text-purple-600 transition-colors ${video.saved ? 'text-purple-600' : ''}`}
                >
                  <Bookmark className={`w-5 h-5 ${video.saved ? 'fill-purple-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
