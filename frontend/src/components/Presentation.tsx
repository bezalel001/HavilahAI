import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Brain,
  Upload,
  Database,
  Zap,
  Server,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  GitBranch,
  Lock,
  TestTube,
  Target,
  Award,
} from "lucide-react";

export function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Title
    {
      type: "title",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 text-gray-800 leading-tight max-w-5xl">
            From Notes to Learning Assets: A Multimodal LLM System for Automated
            Educational Content Generation
          </h1>
          <p className="text-2xl text-gray-600 mb-8">Practical Work in AI</p>
          <div className="mt-8 space-y-3">
            <p className="text-xl font-semibold text-gray-700">Michael Ogu</p>
            <p className="text-lg text-gray-600">BSc Artificial Intelligence</p>
            <p className="text-lg text-gray-600">
              Johannes Kepler University Linz
            </p>
          </div>
        </div>
      ),
    },

    // Slide 2: Session Goal
    {
      type: "content",
      title: "Session Goal (20-30 min)",
      content: (
        <div className="space-y-8">
          <p className="text-2xl text-gray-700">
            Explain full functionality, not just UI
          </p>

          <div className="grid gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <Brain className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Show AI + Software Architecture Choices
                  </h3>
                  <p className="text-gray-700">
                    Clear walk-through of LLM integration, data flow, and key
                    engineering decisions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-start gap-4">
                <GitBranch className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Cover Tradeoffs, Limitations, and Roadmap
                  </h3>
                  <p className="text-gray-700">
                    Honest look at what works now, what is limited, and what is
                    next
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <Server className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Production-Ready Patterns
                  </h3>
                  <p className="text-gray-700">
                    Async processing, live updates, and scaling approach
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 mt-8">
            <p className="text-sm text-gray-600 text-center">
              <strong>Original project title:</strong> Havilah: AI-Powered
              Learning Platform for Gen Z
            </p>
          </div>
        </div>
      ),
    },

    // Slide 3: Problem Framing
    {
      type: "content",
      title: "1. Problem and Core Idea",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Learning Format Mismatch
              </h3>
              <p className="text-gray-600">
                Students keep knowledge in <strong>long notes</strong>, but
                usually revise in <strong>short sessions</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Learning Friction
              </h3>
              <p className="text-gray-600">
                Hard wording and little practice{" "}
                <strong>make it harder to remember</strong>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <Target className="w-10 h-10 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Hypothesis</h3>
                <p className="text-lg text-purple-100 mb-4">
                  If AI turns notes into short learning pieces and gives fast
                  feedback, students can study more consistently and learn
                  better
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <h3 className="text-xl font-semibold text-gray-800">
                Core Claim
              </h3>
            </div>
            <p className="text-lg text-gray-700">
              <strong>One upload</strong> can become{" "}
              <strong>many study formats</strong> that match how Gen Z learns
              on mobile
            </p>
          </div>
        </div>
      ),
    },

    // Slide 4: System Overview
    {
      type: "content",
      title: "2. How the System Works (Main Blocks)",
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="w-6 h-6" />
              <h3 className="text-xl font-bold">Ingestion</h3>
              </div>
              <p className="text-sm text-blue-100">
                Upload from camera or file, file checks, and storage (local or
                MinIO)
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-6 h-6" />
              <h3 className="text-xl font-bold">Understanding</h3>
              </div>
              <p className="text-sm text-purple-100">
                OCR and text extraction, then AI analysis and simplification
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6" />
                <h3 className="text-xl font-bold">Learning Assets</h3>
              </div>
              <p className="text-sm text-green-100">
                Summary, key points, quiz items, flashcards, feed-ready snippets
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-6 h-6" />
                <h3 className="text-xl font-bold">Engagement</h3>
              </div>
              <p className="text-sm text-orange-100">
                Feed, chat tutor, goals, progress, topic exploration
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6" />
              <h3 className="text-xl font-bold">Async Runtime</h3>
              </div>
              <p className="text-sm text-yellow-100">
                Heavy jobs run in a Celery + Redis queue
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Server className="w-6 h-6" />
              <h3 className="text-xl font-bold">Realtime UX</h3>
              </div>
              <p className="text-sm text-indigo-100">
                Live status updates via Node.js WebSocket relay
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Data and Control Plane
    {
      type: "content",
      title: "3. System Data Flow",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 text-green-400 rounded-2xl p-8 font-mono text-sm">
              <div className="space-y-3">
                <div>Frontend sends request → FastAPI → DB + storage</div>
                <div>FastAPI sends heavy work to Redis queue → Celery worker</div>
                <div>
                  Worker publishes progress → Redis Pub/Sub → WS → Frontend
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
                <h3 className="text-xl font-semibold">Event Path</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Task updates are published to Redis channels</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Node WebSocket service listens and relays updates</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Client receives progress messages in real time</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold">Stateful Stores</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p>
                  <strong>PostgreSQL:</strong> auth + relational entities
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p>
                  <strong>MongoDB:</strong> generated content docs and flexible
                  assets
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold">Why This Matters</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              This flow keeps the API fast while long AI tasks run in the
              background and send live updates back to users.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 6: LLM Strategy
    {
      type: "content",
      title: "4. AI Model Strategy: OpenAI + Anthropic",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">
                Provider Use
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>OpenAI</strong> is the main model for content
                    planning, summaries, and quiz generation
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Anthropic</strong> is also integrated for selected
                    learning flows
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Fallback logic</strong> lets the app switch model
                    providers if needed
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                Why This Design
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>More reliable service during outages or rate limits</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Pick the best model for quality, speed, or cost</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Cleaner backend code with provider logic separated</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Brain className="w-10 h-10" />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Multi-Provider Architecture
                </h3>
                <p className="text-purple-100">
                  A shared service layer makes switching between OpenAI and
                  Anthropic simple
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 7: Upload Pipeline
    {
      type: "content",
      title: "5. Upload-to-Content Flow",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Pipeline Stages</h3>
            <p className="text-blue-100">
              A clear step-by-step flow where each part has one job
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                1
              </div>
              <div className="flex-1 bg-white rounded-xl p-5 shadow-lg">
                <h4 className="font-semibold text-lg mb-2">Client Upload</h4>
                <p className="text-gray-600">
                  File uploaded via camera/image/document interface
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                2
              </div>
              <div className="flex-1 bg-white rounded-xl p-5 shadow-lg">
                <h4 className="font-semibold text-lg mb-2">Validation</h4>
                <p className="text-gray-600">
                  Backend validates content type and size limits
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                3
              </div>
              <div className="flex-1 bg-white rounded-xl p-5 shadow-lg">
                <h4 className="font-semibold text-lg mb-2">Storage</h4>
                <p className="text-gray-600">
                  Files are saved in local storage or MinIO
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                4
              </div>
              <div className="flex-1 bg-white rounded-xl p-5 shadow-lg">
                <h4 className="font-semibold text-lg mb-2">Extraction</h4>
                <p className="text-gray-600">
                  Backend extracts text from image, PDF, DOCX, or plain text
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                5
              </div>
              <div className="flex-1 bg-white rounded-xl p-5 shadow-lg">
                <h4 className="font-semibold text-lg mb-2">LLM Processing</h4>
                <p className="text-gray-600">
                  Clean text is sent to AI to create learning assets
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-gray-700 text-center">
              ✅ <strong>Design Benefit:</strong> Upload and AI generation are
              separated, so each stage can improve independently
            </p>
          </div>
        </div>
      ),
    },

    // Slide 8: OCR and Understanding
    {
      type: "content",
      title: "6. OCR and AI Understanding",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                Current OCR
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>pytesseract</strong>-based image text extraction
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>OCR language can be set in config</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Clear error handling if OCR is not available</div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">
                AI Outputs
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>Summary and key concepts</div>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>Simplified concept mappings</div>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>Quiz and flashcard generation</div>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>Feed-oriented concise explanations</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">
                Perception + Reasoning
              </h3>
              <p className="text-lg text-purple-100">
                OCR reads raw text → AI turns it into usable study content
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 9: Asset Generation
    {
      type: "content",
      title: "7. How We Generate Learning Assets",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-3">Asset Types</h3>
            <div className="grid md:grid-cols-2 gap-3 text-green-100">
              <div>✓ Structured summary</div>
              <div>✓ Flashcards (front/back/category)</div>
              <div>✓ Multiple-choice quiz items + explanations</div>
              <div>✓ Topic modules and feed snippets</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Prompt/Output Design
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Structured JSON Responses
                  </h4>
                  <p className="text-gray-600 text-sm">
                    AI output follows fixed JSON formats so parsing is stable
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Validation Before Save
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Backend checks structure before writing to the database
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Fallback and Clear Errors
                  </h4>
                  <p className="text-gray-600 text-sm">
                    If AI fails, users get a clear message instead of a crash
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 10: Async Queueing
    {
      type: "content",
      title: "8. Why We Added Async Queueing",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
              <h3 className="text-xl font-semibold mb-4 text-red-600">
                Problems with Sync-Only Requests
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">Long request latency</div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">Higher timeout risk</div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">
                    Hard to scale when many users submit requests at once
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
              <h3 className="text-xl font-semibold mb-4 text-green-600">
                Queue-Based Flow
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">
                    API enqueues and returns{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      task_id
                    </code>{" "}
                    immediately
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">
                    Celery workers handle heavy AI processing in the background
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-700">
                    Frontend tracks progress and gets live updates
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-8">
            <div className="flex items-center gap-4">
              <Zap className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Runtime Design Decision
                </h3>
                <p className="text-lg text-yellow-100">
                  Celery + Redis lets us process more AI jobs without blocking
                  user requests
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 11: Realtime Events
    {
      type: "content",
      title: "9. Real-Time Update Model",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Lifecycle Events</h3>
            <div className="flex items-center justify-center gap-4 text-lg">
              <span className="bg-white/20 px-4 py-2 rounded-lg">enqueued</span>
              <ArrowRight className="w-6 h-6" />
              <span className="bg-white/20 px-4 py-2 rounded-lg">started</span>
              <ArrowRight className="w-6 h-6" />
              <span className="bg-white/20 px-4 py-2 rounded-lg">
                completed
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-lg">failed</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Backend sends task updates to Redis
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Pub/Sub shares events without tight coupling
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Node WebSocket service listens to those updates
                  </h4>
                  <p className="text-gray-600 text-sm">
                    It relays updates to connected frontend clients
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">
                    Client shows only updates for the current user
                  </h4>
                  <p className="text-gray-600 text-sm">
                    UI shows status banners and notifications in real time
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
            <p className="text-gray-700 text-center text-lg">
              <strong>Result:</strong> User gets immediate feedback without
              waiting for long API responses
            </p>
          </div>
        </div>
      ),
    },

    // Slide 12: Product Walkthrough
    {
      type: "content",
      title: "10. Product Functionality Walkthrough",
      content: (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-purple-600">Auth</h3>
            <p className="text-gray-600 text-sm">
              Sign up, sign in, and token-based protected access
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">
              Uploads
            </h3>
            <p className="text-gray-600 text-sm">
              Validated uploads for images and documents
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-green-600">
              Content
            </h3>
            <p className="text-gray-600 text-sm">
              Process notes, simplify them, and fetch generated assets
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-pink-600">Feed</h3>
            <p className="text-gray-600 text-sm">
              Short-form educational cards with interactions
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-orange-600">
              Quiz/Flashcards
            </h3>
            <p className="text-gray-600 text-sm">
              Generated practice content and attempt tracking
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-indigo-600">
              Chat/Topics/Goals
            </h3>
            <p className="text-gray-600 text-sm">
              AI tutor chat, topic modules, and learning goals
            </p>
          </div>
        </div>
      ),
    },

    // Slide 13: Data Modeling
    {
      type: "content",
      title: "11. Database Design Choices",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-600">
                  Relational (PostgreSQL)
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Users and auth-linked entities</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Attempt and interaction records</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Strong data consistency rules</div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-green-600">
                  Document (MongoDB)
                </h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>AI-generated content with nested structures</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Flexible schema changes over time</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>Fast iteration for AI content objects</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Persistence Strategy</h3>
              <p className="text-lg text-blue-100">
                Use SQL for structured data and NoSQL for flexible AI content
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 14: Reliability
    {
      type: "content",
      title: "12. Reliability and Error Handling",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-green-600">
              Failure Cases Handled
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  Invalid files / unsupported MIME types
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">Missing OCR dependencies</div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  AI provider errors returned as clear API responses
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  Async task failures shown in real-time UI
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-orange-600">
              Operational Improvements Planned
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  Better retry rules and dead-letter queue support
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  Tracking task time and failure rates
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  Prompt/version history to debug regressions
                </div>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // Slide 15: Security
    {
      type: "content",
      title: "13. Security and Compliance",
      content: (
        <div className="space-y-6">
          <div className="grid gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    JWT-based authenticated endpoints
                  </h4>
                  <p className="text-gray-600">
                    Role-based access for sensitive actions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Input validation at schema boundaries
                  </h4>
                  <p className="text-gray-600">
                    Strict request checks and sanitization
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Server className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    Config-driven security and GDPR flags
                  </h4>
                  <p className="text-gray-600">
                    Security and GDPR-related options are controlled by config
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Honest Status
                </h3>
                <p className="text-gray-700">
                  <strong>GDPR direction</strong> is reflected in config and
                  architecture, but
                  <strong>
                    {" "}
                    full legal/compliance rollout is still in the roadmap
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 16: Testing
    {
      type: "content",
      title: "14. Testing and Evaluation",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-green-600">
                  Current Tests
                </h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>API-level tests for auth, content, uploads, OCR</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Schema checks and status-code verification</div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>Database override patterns for isolation</div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-4">
                <ArrowRight className="w-8 h-8 text-orange-600" />
                <h3 className="text-xl font-semibold text-orange-600">
                  Evaluation Roadmap
                </h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    Quality metrics (answer quality, hallucination rate)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>Latency targets and throughput tests</div>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>End-to-end scenarios and load tests</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">
              Quality Engineering Approach
            </h3>
            <p className="text-green-100">
              Test foundation is in place, with a clear path to broader
              coverage and performance checks
            </p>
          </div>
        </div>
      ),
    },

    // Slide 17: Requirements
    {
      type: "content",
      title: "15. Requirement Check (Transparent View)",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">✅ Implemented</h3>
            <ul className="space-y-2 text-green-100">
              <li>• FastAPI backend + auth + DB integrations</li>
              <li>• Upload/OCR/AI pipeline with generated learning assets</li>
              <li>• Goals, progress, chat, feed, topics</li>
              <li>• Node.js WebSocket + Celery queue architecture</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">⚠️ Partial / Planned</h3>
            <ul className="space-y-2 text-orange-100">
              <li>• Flutter production client</li>
              <li>• Social groups + leaderboards + offline + push</li>
              <li>• Kubernetes manifests and full CI/CD</li>
              <li>• Full GDPR and EU data residency operations</li>
            </ul>
          </div>

          <div className="bg-gray-100 rounded-xl p-5">
            <p className="text-gray-700 text-center">
              <strong>Scope decision:</strong> Prioritized core AI flow and
              async architecture before all product features
            </p>
          </div>
        </div>
      ),
    },

    // Slide 18: Demo Script
    {
      type: "content",
      title: "16. Live Demo Plan (5-7 min inside talk)",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-3">Demo Flow</h3>
            <p className="text-purple-100">
              Quick walk-through of the most important features
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  1
                </div>
                <h4 className="font-semibold text-lg">
                  Sign in and open Upload page
                </h4>
              </div>
              <p className="text-gray-600 text-sm ml-11">
                Show authentication and navigation
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  2
                </div>
                <h4 className="font-semibold text-lg">
                  Queue async content processing from demo card
                </h4>
              </div>
              <p className="text-gray-600 text-sm ml-11">
                Show async task submission
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                  3
                </div>
                <h4 className="font-semibold text-lg">
                  Show task lifecycle and realtime notifications
                </h4>
              </div>
              <p className="text-gray-600 text-sm ml-11">
                Show live WebSocket updates
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                  4
                </div>
                <h4 className="font-semibold text-lg">
                  Inspect generated summary, key points, and assets
                </h4>
              </div>
              <p className="text-gray-600 text-sm ml-11">
                Review AI-generated outputs
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                  5
                </div>
                <h4 className="font-semibold text-lg">
                  Open Feed/Quiz/Flashcards to show downstream utility
                </h4>
              </div>
              <p className="text-gray-600 text-sm ml-11">
                Show how users consume generated learning content
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 19: Closing
    {
      type: "content",
      title: "17. Wrap-Up: Contributions and Next Steps",
      content: (
        <div className="flex flex-col justify-center h-full space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6">
              <CheckCircle className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-2">
                Working Multi-Service MVP
              </h3>
              <p className="text-purple-100">
                Delivered a functional AI learning platform
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6">
              <Zap className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-2">Production Patterns</h3>
              <p className="text-blue-100">
                Added async processing and real-time updates
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6">
              <ArrowRight className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-2">Clear Roadmap</h3>
              <p className="text-green-100">
                Path from prototype to a scalable product
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6">
              <Brain className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-2">Open to Discussion</h3>
              <p className="text-orange-100">
                Model choices, system design, and evaluation
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Key Technical Contributions
            </h3>
            <p className="text-gray-700 text-lg">
              Multi-provider AI integration • Async task processing • Real-time
              event streaming • SQL + NoSQL data design
            </p>
          </div>
        </div>
      ),
    },

    // Slide 20: Thank You
    {
      type: "title",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mb-8">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6">Thank You</h1>
          <p className="text-2xl text-gray-600 mb-8">Questions & Discussion</p>

          <div className="space-y-4 text-lg text-gray-600 mb-12">
            <p>
              <strong>Michael Ogu</strong>
            </p>
            <p>BSc Artificial Intelligence</p>
            <p>Johannes Kepler University Linz</p>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 max-w-2xl">
            <p className="text-gray-700">
              Open to questions on <strong>model choices</strong>,{" "}
              <strong>system tradeoffs</strong>, and{" "}
              <strong>evaluation approach</strong>
            </p>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (e.key === "ArrowLeft" && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, slides.length]);

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goToPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      {/* Main Slide */}
      <div className="w-full h-full max-w-7xl max-h-[90vh] mx-auto p-8 flex flex-col">
        {/* Slide Content */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {currentSlideData.type === "title" ? (
            <div className="h-full">{currentSlideData.content}</div>
          ) : (
            <div className="h-full flex flex-col p-12 overflow-y-auto">
              <h1 className="text-4xl font-bold mb-8 text-gray-800">
                {currentSlideData.title}
              </h1>
              <div className="flex-1">{currentSlideData.content}</div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-6">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentSlide === 0
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {/* Slide Counter */}
          <div className="flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? "w-8 h-3 bg-gradient-to-r from-purple-600 to-pink-600"
                    : "w-3 h-3 bg-gray-500 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentSlide === slides.length - 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl shadow-lg"
            }`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard Hint */}
        <div className="text-center mt-4 text-sm text-gray-400">
          Use arrow keys (← →) or click buttons to navigate • Slide{" "}
          {currentSlide + 1} of {slides.length}
        </div>
      </div>
    </div>
  );
}
