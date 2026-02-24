import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import {
  Upload,
  Camera,
  FileText,
  Image,
  CheckCircle,
  Loader,
  Play,
  Brain,
  CreditCard,
  FileCheck,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { View } from "../App";
import {
  getContentTaskStatus,
  getUploadAssets,
  processContentAsync,
  processUploadToAssets,
  uploadFile,
} from "../lib/api";
import { Markdown } from "./ui/Markdown";

type UploadType = "file" | "image" | "camera";

type SimplifiedConcept = {
  original: string;
  simplified: string;
};

type ContentSummary = {
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  mainSummary: string;
  keyTopics: string[];
  simplifiedConcepts: SimplifiedConcept[];
  generatedContent: {
    flashcards: number;
    quizzes: number;
    videoSegments: number;
  };
};

const uploadConfigs: Record<UploadType, { accept: string; capture?: string }> =
  {
    file: { accept: ".pdf,.doc,.docx,.txt" },
    image: { accept: "image/*" },
    camera: { accept: "image/*", capture: "environment" },
  };

const dataUrlToBlob = (dataUrl: string) => {
  const [header, base64] = dataUrl.split(",");
  const match = header.match(/data:(.*);base64/);
  const mime = match ? match[1] : "image/png";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
};

const formatFileSize = (bytes: number) => {
  if (Number.isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const buildSimplifiedConcepts = (summary: string, keyPoints: string[]) => {
  const concepts: string[] = [];
  if (summary) {
    summary
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .slice(0, 2)
      .forEach((sentence) => concepts.push(sentence));
  }
  if (concepts.length < 2) {
    keyPoints
      .slice(0, 2 - concepts.length)
      .forEach((point) => concepts.push(point));
  }
  if (concepts.length === 0) {
    return [
      {
        original: "No detailed concepts were detected in the upload.",
        simplified: "We could not simplify concepts without more content.",
      },
    ];
  }
  return concepts.map((sentence) => {
    const cleaned = sentence.replace(/[.!?]$/, "");
    return {
      original: sentence,
      simplified: `In simple terms, ${cleaned}.`,
    };
  });
};

const estimateVideoSegments = (keyPoints: string[]) => {
  if (keyPoints.length === 0) return 8;
  return Math.max(3, Math.min(12, Math.ceil(keyPoints.length / 2)));
};

export function ContentUpload({
  onNavigate,
}: {
  onNavigate: (view: View) => void;
}) {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "summary" | "complete"
  >("idle");
  const [selectedFile, setSelectedFile] = useState<UploadType | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileObject, setSelectedFileObject] = useState<File | null>(
    null,
  );
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetSummary, setAssetSummary] = useState<{
    flashcards: number;
    quizzes: number;
  } | null>(null);
  const [contentSummary, setContentSummary] = useState<ContentSummary | null>(
    null,
  );
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [asyncTitle, setAsyncTitle] = useState("Introduction to Neural Networks");
  const [asyncAudience, setAsyncAudience] = useState("Undergraduate students");
  const [asyncObjective, setAsyncObjective] = useState(
    "Explain how neurons, layers, and activation functions work together.",
  );
  const [asyncTone, setAsyncTone] = useState("engaging");
  const [asyncRawContent, setAsyncRawContent] = useState(
    "A neural network is a machine learning model inspired by the human brain. It is made of layers of nodes called neurons. The input layer receives data, hidden layers transform it through weighted connections, and the output layer produces predictions. During training, the model adjusts weights using backpropagation and gradient descent to reduce prediction error. Activation functions like ReLU and sigmoid help the model learn non-linear patterns.",
  );
  const [asyncTaskId, setAsyncTaskId] = useState<string | null>(null);
  const [asyncTaskStatus, setAsyncTaskStatus] = useState<string | null>(null);
  const [asyncTaskError, setAsyncTaskError] = useState<string | null>(null);
  const [asyncTaskResult, setAsyncTaskResult] = useState<{
    title: string;
    summary: string;
    key_points: string[];
  } | null>(null);
  const [isAsyncSubmitting, setIsAsyncSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
  ];

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not available on this device.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraError(null);
      setIsCameraActive(true);
    } catch (error) {
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!asyncTaskId) return;
    if (asyncTaskStatus === "SUCCESS" || asyncTaskStatus === "FAILURE") return;

    const intervalId = window.setInterval(() => {
      getContentTaskStatus(asyncTaskId)
        .then((task) => {
          setAsyncTaskStatus(task.status);
          if (task.status === "SUCCESS" && task.result) {
            setAsyncTaskResult({
              title: task.result.title,
              summary: task.result.summary,
              key_points: task.result.key_points ?? [],
            });
            setAsyncTaskError(null);
          }
          if (task.status === "FAILURE") {
            setAsyncTaskError(task.error ?? "Background processing failed.");
          }
        })
        .catch((taskError) => {
          setAsyncTaskError(
            taskError instanceof Error
              ? taskError.message
              : "Failed to fetch task status.",
          );
        });
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [asyncTaskId, asyncTaskStatus]);

  const handleAsyncProcess = () => {
    setAsyncTaskError(null);
    setAsyncTaskResult(null);
    setIsAsyncSubmitting(true);
    processContentAsync({
      title: asyncTitle,
      raw_content: asyncRawContent,
      target_audience: asyncAudience,
      learning_objective: asyncObjective,
      desired_tone: asyncTone,
    })
      .then((queued) => {
        setAsyncTaskId(queued.task_id);
        setAsyncTaskStatus(queued.status);
      })
      .catch((taskError) => {
        setAsyncTaskError(
          taskError instanceof Error
            ? taskError.message
            : "Unable to enqueue async task.",
        );
      })
      .finally(() => {
        setIsAsyncSubmitting(false);
      });
  };

  const handleUpload = () => {
    if (!selectedFileObject) {
      setError("Please select a file to upload.");
      return;
    }
    setError(null);
    setUploadStatus("uploading");
    uploadFile(selectedFileObject)
      .then((upload) => {
        setUploadStatus("processing");
        return processUploadToAssets(upload.file_id);
      })
      .then((assets) => {
        const flashcardsCount = assets.flashcards.length;
        const quizzesCount = assets.quiz_questions.length;
        const keyTopics = assets.key_points.slice(0, 6);
        const fileName = selectedFileObject.name || "Uploaded file";
        const fileType = selectedFileObject.type;
        const fileTypeLabel = fileType
          ? fileType.startsWith("image/")
            ? `${fileType.split("/").pop()?.toUpperCase() || "Image"} Image`
            : `${fileType.split("/").pop()?.toUpperCase() || "Document"} Document`
          : "Document";
        const summary = assets.summary || "No summary available yet.";
        const simplifiedConcepts = assets.simplified_concepts?.length
          ? assets.simplified_concepts
          : buildSimplifiedConcepts(summary, assets.key_points);
        setAssetSummary({
          flashcards: flashcardsCount,
          quizzes: quizzesCount,
        });
        setContentSummary({
          fileName,
          fileSize: formatFileSize(selectedFileObject.size),
          fileType: fileTypeLabel,
          uploadDate: new Date().toLocaleString(),
          mainSummary: summary,
          keyTopics,
          simplifiedConcepts,
          generatedContent: {
            flashcards: flashcardsCount,
            quizzes: quizzesCount,
            videoSegments: estimateVideoSegments(assets.key_points),
          },
        });
        setIsContentModalOpen(false);
        setUploadStatus("summary");
      })
      .catch((err) => {
        setUploadStatus("idle");
        setError(err instanceof Error ? err.message : "Upload failed.");
      });
  };

  const buildSummaryFromDetail = (
    detail: Awaited<ReturnType<typeof getUploadAssets>>,
  ) => {
    const flashcardsCount = detail.flashcards.length;
    const quizzesCount = detail.quiz_questions.length;
    const summaryText = detail.summary || "No summary available yet.";
    const keyTopics = detail.key_points.slice(0, 6);
    const contentType = detail.content_type ?? "";
    const fileTypeLabel = contentType
      ? contentType.startsWith("image/")
        ? `${contentType.split("/").pop()?.toUpperCase() || "Image"} Image`
        : `${contentType.split("/").pop()?.toUpperCase() || "Document"} Document`
      : "Document";

    setAssetSummary({
      flashcards: flashcardsCount,
      quizzes: quizzesCount,
    });
    setContentSummary({
      fileName: detail.original_filename ?? "Uploaded file",
      fileSize: formatFileSize(detail.size_bytes ?? 0),
      fileType: fileTypeLabel,
      uploadDate: new Date(
        detail.upload_created_at ?? detail.created_at,
      ).toLocaleString(),
      mainSummary: summaryText,
      keyTopics,
      simplifiedConcepts: detail.simplified_concepts?.length
        ? detail.simplified_concepts
        : buildSimplifiedConcepts(summaryText, detail.key_points),
      generatedContent: {
        flashcards: flashcardsCount,
        quizzes: quizzesCount,
        videoSegments: estimateVideoSegments(detail.key_points),
      },
    });
  };

  const handleFileButtonClick = (type: UploadType) => {
    setSelectedFile(type);
    setSelectedFileName(null);
    setSelectedFileObject(null);
    setCapturedPhoto(null);
    if (type === "camera") {
      startCamera();
    } else {
      stopCamera();
      setTimeout(() => fileInputRef.current?.click(), 0);
    }
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setSelectedFileName(files[0].name);
    setSelectedFileObject(files[0]);
  };

  const handleCapturePhoto = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedPhoto(dataUrl);
    setSelectedFileName("Captured photo");
    const blob = dataUrlToBlob(dataUrl);
    setSelectedFileObject(
      new File([blob], "capture.png", { type: "image/png" }),
    );
    stopCamera();
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setSelectedFileName(null);
    setSelectedFileObject(null);
    startCamera();
  };

  const activeUploadConfig = selectedFile ? uploadConfigs[selectedFile] : null;

  const handleContinueFromSummary = () => {
    setUploadStatus("complete");
  };
  const isBrowser = typeof document !== "undefined";

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={activeUploadConfig?.accept}
        capture={activeUploadConfig?.capture}
        onChange={handleFileSelected}
      />
      <div className="mb-8">
        <h1 className="mb-2">Upload Your Notes 📚</h1>
        <p className="text-gray-600">
          Transform your study materials into interactive learning experiences
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="mb-2">Async AI Content Processing (Live Demo)</h2>
        <p className="text-gray-600 mb-4">
          Queue background processing and watch live status updates.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            value={asyncTitle}
            onChange={(event) => setAsyncTitle(event.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300"
            placeholder="Title"
          />
          <input
            value={asyncAudience}
            onChange={(event) => setAsyncAudience(event.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300"
            placeholder="Target audience"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            value={asyncObjective}
            onChange={(event) => setAsyncObjective(event.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300"
            placeholder="Learning objective"
          />
          <input
            value={asyncTone}
            onChange={(event) => setAsyncTone(event.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300"
            placeholder="Desired tone"
          />
        </div>
        <textarea
          value={asyncRawContent}
          onChange={(event) => setAsyncRawContent(event.target.value)}
          className="w-full min-h-[130px] px-3 py-2 rounded-lg border border-gray-300 mb-3"
          placeholder="Raw content..."
        />
        <button
          type="button"
          onClick={handleAsyncProcess}
          disabled={isAsyncSubmitting}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-60"
        >
          {isAsyncSubmitting ? "Queueing..." : "Queue Async Processing"}
        </button>

        {(asyncTaskId || asyncTaskStatus) && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-700">
              Task ID:{" "}
              <span className="font-mono">{asyncTaskId ?? "pending"}</span>
            </p>
            <p className="text-sm text-gray-700">
              Status: <span className="font-semibold">{asyncTaskStatus}</span>
            </p>
          </div>
        )}

        {asyncTaskError && (
          <p className="text-sm text-red-600 mt-3">{asyncTaskError}</p>
        )}

        {asyncTaskResult && (
          <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
            <p className="text-sm font-semibold text-green-900 mb-2">
              {asyncTaskResult.title}
            </p>
            <p className="text-sm text-green-900 mb-3">{asyncTaskResult.summary}</p>
            <div className="flex flex-wrap gap-2">
              {asyncTaskResult.key_points.slice(0, 4).map((point) => (
                <span
                  key={point}
                  className="px-2 py-1 text-xs rounded-full bg-white border border-green-200 text-green-900"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
        <h2 className="mb-3 sm:mb-4">Select Language</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                selectedLanguage === lang.code
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-1">{lang.flag}</div>
              <div className="text-gray-700 text-xs sm:text-sm">
                {lang.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {uploadStatus === "idle" && (
        <>
          {/* Upload Options */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <h2 className="mb-6">Choose Upload Method</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => handleFileButtonClick("file")}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${
                  selectedFile === "file"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                <FileText className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <div className="mb-2">Upload File</div>
                <p className="text-gray-600">PDF, DOCX, TXT</p>
              </button>

              <button
                onClick={() => handleFileButtonClick("image")}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${
                  selectedFile === "image"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                <Image className="w-12 h-12 mx-auto mb-4 text-pink-600" />
                <div className="mb-2">Upload Image</div>
                <p className="text-gray-600">JPG, PNG, HEIC</p>
              </button>

              <button
                onClick={() => handleFileButtonClick("camera")}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${
                  selectedFile === "camera"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                <Camera className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <div className="mb-2">Take Photo</div>
                <p className="text-gray-600">Use camera</p>
              </button>
            </div>
          </div>

          {selectedFile && selectedFile !== "camera" && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <div className="mb-2">
                  Drop your files here or click to browse
                </div>
                <p className="text-gray-600 mb-6">Maximum file size: 50MB</p>
                {selectedFileName && (
                  <p className="mb-4 text-sm text-purple-700">
                    {selectedFileName}
                  </p>
                )}
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUpload();
                  }}
                  disabled={!selectedFileObject}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Start Upload
                </button>
              </div>
            </div>
          )}

          {selectedFile === "camera" && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              {cameraError ? (
                <div className="text-center text-red-600">{cameraError}</div>
              ) : (
                <div className="text-center">
                  {capturedPhoto ? (
                    <>
                      <img
                        src={capturedPhoto}
                        alt="Captured"
                        className="rounded-2xl mx-auto mb-6 max-h-96 object-contain"
                      />
                      <div className="flex flex-wrap gap-4 justify-center">
                        <button
                          onClick={handleRetakePhoto}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                        >
                          Retake Photo
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={!selectedFileObject}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          Use Photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-2xl mb-6 bg-black"
                        autoPlay
                        muted
                        playsInline
                      />
                      <div className="flex flex-wrap gap-4 justify-center">
                        <button
                          onClick={handleCapturePhoto}
                          disabled={!isCameraActive}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                        >
                          Capture Photo
                        </button>
                        {isCameraActive && (
                          <button
                            onClick={stopCamera}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      {!isCameraActive && (
                        <p className="text-gray-500 mt-4">Starting camera...</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {uploadStatus === "uploading" && (
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <div className="mb-2">Uploading your notes...</div>
          <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-2/3 transition-all" />
          </div>
        </div>
      )}

      {uploadStatus === "processing" && (
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <div className="mb-2">Processing with AI...</div>
          <p className="text-gray-600 mb-4">
            Extracting concepts, generating quizzes & flashcards
          </p>
          <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-4/5 transition-all" />
          </div>
        </div>
      )}

      {uploadStatus === "summary" && contentSummary && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <FileCheck className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="mb-2">Content Successfully Extracted! ✨</h2>
            <p className="text-gray-600">
              Here's what we found in your document.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h3>File Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">File Name</p>
                <p className="font-medium text-gray-900">
                  {contentSummary.fileName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Size</p>
                <p className="font-medium text-gray-900">
                  {contentSummary.fileSize}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium text-gray-900">
                  {contentSummary.fileType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Uploaded</p>
                <p className="font-medium text-gray-900">
                  {contentSummary.uploadDate}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3>Content Summary</h3>
            </div>
            <Markdown
              content={contentSummary.mainSummary}
              className="text-gray-700 leading-relaxed"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3>Key Topics Identified ({contentSummary.keyTopics.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {contentSummary.keyTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-600" />
              <h3>AI Simplification Preview</h3>
            </div>
            <div className="space-y-4">
              {contentSummary.simplifiedConcepts.map((concept, index) => (
                <div
                  key={`${concept.original}-${index}`}
                  className="border-l-4 border-purple-400 pl-4"
                >
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Original:</span>{" "}
                    <Markdown
                      content={concept.original}
                      inline
                      className="text-sm text-gray-600"
                    />
                  </div>
                  <div className="text-sm text-gray-900">
                    <span className="font-semibold text-purple-600">
                      Simplified:
                    </span>{" "}
                    <Markdown
                      content={concept.simplified}
                      inline
                      className="text-sm text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3>Generated Learning Materials</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-3xl font-bold text-purple-600">
                  {contentSummary.generatedContent.flashcards}
                </div>
                <p className="text-sm text-gray-600 mt-1">Flashcards</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-3xl font-bold text-pink-600">
                  {contentSummary.generatedContent.quizzes}
                </div>
                <p className="text-sm text-gray-600 mt-1">Quizzes</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-3xl font-bold text-blue-600">
                  {contentSummary.generatedContent.videoSegments}
                </div>
                <p className="text-sm text-gray-600 mt-1">Video Clips</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <button
              onClick={handleContinueFromSummary}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Continue to Your Learning Materials →
            </button>
            <p className="text-sm text-gray-500 mt-3">
              You can review this summary anytime in your dashboard.
            </p>
          </div>
        </div>
      )}

      {uploadStatus === "complete" && (
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <div className="mb-2">Success! Your notes are ready 🎉</div>
          <p className="text-gray-600 mb-8">
            {assetSummary
              ? `We've created ${assetSummary.flashcards} flashcards and ${assetSummary.quizzes} quiz questions.`
              : "We've created your learning assets."}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => setIsContentModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              View Content
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadStatus("idle");
                setSelectedFile(null);
                setSelectedFileObject(null);
                setSelectedFileName(null);
                setCapturedPhoto(null);
                setAssetSummary(null);
                setContentSummary(null);
                setError(null);
                setIsContentModalOpen(false);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              Upload More
            </button>
          </div>
        </div>
      )}

      {isContentModalOpen && isBrowser
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
              onClick={() => setIsContentModalOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                style={{ width: "80%" }}
                className="w-[92%] sm:w-[85%] md:w-[60%] max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        Your Generated Learning Content 🎉
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose which type of content you'd like to explore first
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsContentModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className="py-6 space-y-4">
                    <button
                      onClick={() => {
                        setIsContentModalOpen(false);
                        onNavigate("feed");
                      }}
                      className="w-full p-5 sm:p-6 bg-purple-50 border border-purple-200 rounded-2xl hover:border-purple-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            Learning Feed
                          </div>
                          <p className="text-sm text-gray-600">
                            Watch TikTok-style educational videos created from
                            your notes
                          </p>
                        </div>
                        <div className="text-2xl">📱</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsContentModalOpen(false);
                        onNavigate("flashcards");
                      }}
                      className="w-full p-5 sm:p-6 bg-blue-50 border border-blue-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            Flashcards ({assetSummary?.flashcards ?? 0} cards)
                          </div>
                          <p className="text-sm text-gray-600">
                            Review key concepts with interactive flashcards
                          </p>
                        </div>
                        <div className="text-2xl">🎴</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsContentModalOpen(false);
                        onNavigate("quiz");
                      }}
                      className="w-full p-5 sm:p-6 bg-green-50 border border-green-200 rounded-2xl hover:border-green-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            Quizzes ({assetSummary?.quizzes ?? 0} questions)
                          </div>
                          <p className="text-sm text-gray-600">
                            Test your knowledge with AI-generated quizzes
                          </p>
                        </div>
                        <div className="text-2xl">🧠</div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsContentModalOpen(false)}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    I'll Explore Later
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
