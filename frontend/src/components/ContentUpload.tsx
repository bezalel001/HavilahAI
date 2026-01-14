import { useState } from 'react';
import { Upload, Camera, FileText, Image, CheckCircle, Loader } from 'lucide-react';

export function ContentUpload() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  ];

  const handleUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('processing');
      setTimeout(() => {
        setUploadStatus('complete');
      }, 2000);
    }, 1500);
  };

  const handleFileSelect = (type: string) => {
    setSelectedFile(type);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Upload Your Notes 📚</h1>
        <p className="text-gray-600">Transform your study materials into interactive learning experiences</p>
      </div>

      {/* Language Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="mb-4">Select Language</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedLanguage === lang.code
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-1">{lang.flag}</div>
              <div className="text-gray-700">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>

      {uploadStatus === 'idle' && (
        <>
          {/* Upload Options */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <h2 className="mb-6">Choose Upload Method</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => handleFileSelect('file')}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${
                  selectedFile === 'file' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <FileText className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <div className="mb-2">Upload File</div>
                <p className="text-gray-600">PDF, DOCX, TXT</p>
              </button>

              <button
                onClick={() => handleFileSelect('image')}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${
                  selectedFile === 'image' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <Image className="w-12 h-12 mx-auto mb-4 text-pink-600" />
                <div className="mb-2">Upload Image</div>
                <p className="text-gray-600">JPG, PNG, HEIC</p>
              </button>

              <button
                onClick={() => handleFileSelect('camera')}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all hover:scale-105 ${
                  selectedFile === 'camera' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <Camera className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <div className="mb-2">Take Photo</div>
                <p className="text-gray-600">Use camera</p>
              </button>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <div className="mb-2">Drop your files here or click to browse</div>
                <p className="text-gray-600 mb-6">Maximum file size: 50MB</p>
                <button
                  onClick={handleUpload}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Start Upload
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {uploadStatus === 'uploading' && (
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <div className="mb-2">Uploading your notes...</div>
          <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-2/3 transition-all" />
          </div>
        </div>
      )}

      {uploadStatus === 'processing' && (
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <div className="mb-2">Processing with AI...</div>
          <p className="text-gray-600 mb-4">Extracting concepts, generating quizzes & flashcards</p>
          <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-4/5 transition-all" />
          </div>
        </div>
      )}

      {uploadStatus === 'complete' && (
        <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <div className="mb-2">Success! Your notes are ready 🎉</div>
          <p className="text-gray-600 mb-8">We've created 12 flashcards, 5 quizzes, and simplified key concepts</p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
              View Content
            </button>
            <button
              onClick={() => {
                setUploadStatus('idle');
                setSelectedFile(null);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
            >
              Upload More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
