import { useState } from "react";
import {
  Brain,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Upload,
  Sparkles,
  BookOpen,
  Edit3,
  Loader,
  Settings,
} from "lucide-react";

type QuizSource = "uploaded" | "topic" | "custom";

interface UploadedMaterial {
  id: string;
  title: string;
  type: string;
  uploadDate: string;
}

export function QuizGenerator() {
  // Quiz generation states
  const [step, setStep] = useState<
    "source" | "configure" | "generating" | "quiz"
  >("source");
  const [quizSource, setQuizSource] = useState<QuizSource | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [language, setLanguage] = useState("en");

  // Quiz playing states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  // Mock uploaded materials
  const uploadedMaterials: UploadedMaterial[] = [
    {
      id: "1",
      title: "EU Data Protection & GDPR Notes",
      type: "PDF",
      uploadDate: "2 days ago",
    },
    {
      id: "2",
      title: "Quantum Physics Lecture",
      type: "Image",
      uploadDate: "5 days ago",
    },
    {
      id: "3",
      title: "Calculus Chapter 3",
      type: "Document",
      uploadDate: "1 week ago",
    },
    {
      id: "4",
      title: "Biology Lab Notes",
      type: "PDF",
      uploadDate: "2 weeks ago",
    },
  ];

  // Popular topics from Topic Explorer
  const popularTopics = [
    {
      id: 1,
      name: "GDPR & Data Privacy",
      icon: "🔒",
      category: "Law & Policy",
    },
    { id: 2, name: "Quantum Physics", icon: "⚛️", category: "Physics" },
    {
      id: 3,
      name: "Calculus Fundamentals",
      icon: "📊",
      category: "Mathematics",
    },
    { id: 4, name: "Molecular Biology", icon: "🧬", category: "Biology" },
    { id: 5, name: "EU Economic Policy", icon: "💰", category: "Economics" },
    {
      id: 6,
      name: "Climate Change",
      icon: "🌍",
      category: "Environmental Science",
    },
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
  ];

  // Mock quiz question banks for different topics
  const questionBanks: Record<string, any[]> = {
    "GDPR & Data Privacy": [
      {
        question: "What does GDPR stand for?",
        options: [
          "General Data Protection Regulation",
          "Global Data Privacy Rights",
          "General Digital Protection Rights",
          "Global Digital Privacy Regulation",
        ],
        correct: 0,
        explanation:
          "GDPR stands for General Data Protection Regulation, implemented in the EU in 2018.",
      },
      {
        question: "What is the maximum fine for GDPR violations?",
        options: [
          "€10 million or 2% of global revenue",
          "€20 million or 4% of global revenue",
          "€50 million or 5% of global revenue",
          "€100 million or 10% of global revenue",
        ],
        correct: 1,
        explanation:
          "The maximum fine is €20 million or 4% of annual global turnover, whichever is higher.",
      },
      {
        question: "Which of these is NOT a principle of GDPR?",
        options: [
          "Data minimization",
          "Lawfulness and transparency",
          "Profit maximization",
          "Accuracy",
        ],
        correct: 2,
        explanation:
          "Profit maximization is not a GDPR principle. GDPR focuses on data protection, not business profits.",
      },
      {
        question: "How long do companies have to report a data breach?",
        options: ["24 hours", "48 hours", "72 hours", "1 week"],
        correct: 2,
        explanation:
          "Organizations must report data breaches to authorities within 72 hours of becoming aware of them.",
      },
      {
        question: 'What right does "Right to be Forgotten" refer to?',
        options: [
          "Right to delete social media",
          "Right to erasure of personal data",
          "Right to anonymous browsing",
          "Right to encrypted communication",
        ],
        correct: 1,
        explanation:
          "The Right to be Forgotten allows individuals to request deletion of their personal data under certain conditions.",
      },
    ],
    "Quantum Physics": [
      {
        question: "What is the Heisenberg Uncertainty Principle?",
        options: [
          "You cannot know both position and momentum precisely",
          "Energy cannot be created or destroyed",
          "Light behaves only as a wave",
          "Mass equals energy times speed squared",
        ],
        correct: 0,
        explanation:
          "The Heisenberg Uncertainty Principle states that you cannot simultaneously know the exact position and momentum of a particle.",
      },
      {
        question: "What is quantum superposition?",
        options: [
          "Adding quantum numbers together",
          "A particle existing in multiple states simultaneously",
          "The mass of a quantum particle",
          "The speed of quantum entanglement",
        ],
        correct: 1,
        explanation:
          "Quantum superposition means a particle can exist in multiple states at once until measured.",
      },
      {
        question:
          'Who proposed the famous thought experiment "Schrödinger\'s Cat"?',
        options: [
          "Albert Einstein",
          "Niels Bohr",
          "Erwin Schrödinger",
          "Werner Heisenberg",
        ],
        correct: 2,
        explanation:
          "Erwin Schrödinger proposed this thought experiment to illustrate the paradox of quantum superposition.",
      },
      {
        question: "What does quantum entanglement describe?",
        options: [
          "Particles getting tangled together",
          "Particles remaining connected regardless of distance",
          "The energy level of electrons",
          "The weight of subatomic particles",
        ],
        correct: 1,
        explanation:
          "Quantum entanglement describes particles that remain connected so that actions on one affect the other, even at great distances.",
      },
      {
        question: "What is a photon?",
        options: [
          "A unit of sound",
          "A particle of light",
          "A type of electron",
          "A quantum of heat",
        ],
        correct: 1,
        explanation:
          "A photon is a quantum of electromagnetic radiation, essentially a particle of light.",
      },
    ],
    "Calculus Fundamentals": [
      {
        question: "What does the derivative represent?",
        options: [
          "The area under a curve",
          "The rate of change at a point",
          "The total distance traveled",
          "The average value of a function",
        ],
        correct: 1,
        explanation:
          "The derivative represents the instantaneous rate of change of a function at a specific point.",
      },
      {
        question: "What is the derivative of x²?",
        options: ["x", "2x", "x²", "2"],
        correct: 1,
        explanation: "Using the power rule, the derivative of x² is 2x.",
      },
      {
        question: "What does integration calculate?",
        options: [
          "The slope of a curve",
          "The rate of change",
          "The area under a curve",
          "The maximum value",
        ],
        correct: 2,
        explanation:
          "Integration calculates the area under a curve or the accumulated quantity.",
      },
      {
        question: "What is the fundamental theorem of calculus?",
        options: [
          "Derivatives and integrals are inverse operations",
          "All functions are continuous",
          "Limits always exist",
          "Derivatives equal integrals",
        ],
        correct: 0,
        explanation:
          "The fundamental theorem of calculus establishes that differentiation and integration are inverse operations.",
      },
      {
        question: "What is a limit in calculus?",
        options: [
          "The maximum value of a function",
          "The value a function approaches as x approaches a point",
          "The derivative at infinity",
          "The integral from 0 to 1",
        ],
        correct: 1,
        explanation:
          "A limit describes the value that a function approaches as the input approaches some value.",
      },
    ],
    "Molecular Biology": [
      {
        question: "What is DNA?",
        options: [
          "A type of protein",
          "The genetic material carrying hereditary information",
          "A cellular organelle",
          "A type of carbohydrate",
        ],
        correct: 1,
        explanation:
          "DNA (Deoxyribonucleic Acid) is the molecule that carries genetic information for development and function.",
      },
      {
        question: "What are the base pairs in DNA?",
        options: ["A-T and G-C", "A-C and G-T", "A-G and T-C", "A-U and G-C"],
        correct: 0,
        explanation:
          "In DNA, Adenine pairs with Thymine (A-T) and Guanine pairs with Cytosine (G-C).",
      },
      {
        question: "What is the role of RNA?",
        options: [
          "Energy storage",
          "Protein synthesis and gene regulation",
          "Cell membrane structure",
          "Immune response",
        ],
        correct: 1,
        explanation:
          "RNA plays crucial roles in protein synthesis, gene regulation, and other cellular processes.",
      },
      {
        question: "What is a gene?",
        options: [
          "A type of cell",
          "A segment of DNA that codes for a protein",
          "A cellular organelle",
          "A type of chromosome",
        ],
        correct: 1,
        explanation:
          "A gene is a segment of DNA that contains the instructions for making a specific protein.",
      },
      {
        question: "What is mitosis?",
        options: [
          "Cell death",
          "DNA replication",
          "Cell division producing identical daughter cells",
          "Protein synthesis",
        ],
        correct: 2,
        explanation:
          "Mitosis is the process of cell division that produces two genetically identical daughter cells.",
      },
    ],
    "EU Economic Policy": [
      {
        question: "What is the primary currency of the European Union?",
        options: ["Dollar", "Pound", "Euro", "Franc"],
        correct: 2,
        explanation:
          "The Euro is the official currency of the Eurozone, used by 20 of the 27 EU member states.",
      },
      {
        question: "What does ECB stand for?",
        options: [
          "European Central Bank",
          "European Commerce Board",
          "Economic Control Bureau",
          "European Credit Bank",
        ],
        correct: 0,
        explanation:
          "The European Central Bank manages monetary policy for the Eurozone.",
      },
      {
        question: "What is the EU Single Market?",
        options: [
          "A shopping center",
          "A free trade area with free movement of goods, services, capital, and people",
          "A stock exchange",
          "An online marketplace",
        ],
        correct: 1,
        explanation:
          "The EU Single Market allows free movement of goods, services, capital, and people within member states.",
      },
      {
        question: "What is the Stability and Growth Pact?",
        options: [
          "A trade agreement",
          "Rules to ensure fiscal discipline in EU member states",
          "An environmental treaty",
          "A migration policy",
        ],
        correct: 1,
        explanation:
          "The Stability and Growth Pact sets rules to ensure fiscal discipline and limit government deficits in EU states.",
      },
      {
        question: "What percentage is the EU's typical VAT?",
        options: ["5-10%", "15-25%", "30-40%", "50%"],
        correct: 1,
        explanation:
          "EU VAT rates typically range from 15% to 25%, with most countries around 20-23%.",
      },
    ],
    "Climate Change": [
      {
        question: "What is the greenhouse effect?",
        options: [
          "Growing plants in greenhouses",
          "Gases trapping heat in Earth's atmosphere",
          "The effect of green energy",
          "Photosynthesis process",
        ],
        correct: 1,
        explanation:
          "The greenhouse effect is when gases in the atmosphere trap heat, warming the planet.",
      },
      {
        question: "What is the main greenhouse gas?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correct: 2,
        explanation:
          "Carbon Dioxide (CO2) is the primary greenhouse gas contributing to climate change.",
      },
      {
        question: "What is the Paris Agreement?",
        options: [
          "A trade deal",
          "An international treaty to combat climate change",
          "A tourism agreement",
          "A cultural exchange program",
        ],
        correct: 1,
        explanation:
          "The Paris Agreement is an international treaty where countries commit to reducing greenhouse gas emissions.",
      },
      {
        question: "What causes sea level rise?",
        options: [
          "Underwater earthquakes",
          "Melting ice and thermal expansion of water",
          "Ocean currents",
          "Tides",
        ],
        correct: 1,
        explanation:
          "Sea levels rise due to melting glaciers and ice sheets, plus thermal expansion as ocean water warms.",
      },
      {
        question: "What is renewable energy?",
        options: [
          "Energy from fossil fuels",
          "Energy from sources that naturally replenish",
          "Energy from nuclear power",
          "Energy stored in batteries",
        ],
        correct: 1,
        explanation:
          "Renewable energy comes from naturally replenishing sources like solar, wind, and hydroelectric power.",
      },
    ],
    default: [
      {
        question: "What does GDPR stand for?",
        options: [
          "General Data Protection Regulation",
          "Global Data Privacy Rights",
          "General Digital Protection Rights",
          "Global Digital Privacy Regulation",
        ],
        correct: 0,
        explanation:
          "GDPR stands for General Data Protection Regulation, implemented in the EU in 2018.",
      },
      {
        question: "What is the maximum fine for GDPR violations?",
        options: [
          "€10 million or 2% of global revenue",
          "€20 million or 4% of global revenue",
          "€50 million or 5% of global revenue",
          "€100 million or 10% of global revenue",
        ],
        correct: 1,
        explanation:
          "The maximum fine is €20 million or 4% of annual global turnover, whichever is higher.",
      },
      {
        question: "Which of these is NOT a principle of GDPR?",
        options: [
          "Data minimization",
          "Lawfulness and transparency",
          "Profit maximization",
          "Accuracy",
        ],
        correct: 2,
        explanation:
          "Profit maximization is not a GDPR principle. GDPR focuses on data protection, not business profits.",
      },
      {
        question: "How long do companies have to report a data breach?",
        options: ["24 hours", "48 hours", "72 hours", "1 week"],
        correct: 2,
        explanation:
          "Organizations must report data breaches to authorities within 72 hours of becoming aware of them.",
      },
      {
        question: 'What right does "Right to be Forgotten" refer to?',
        options: [
          "Right to delete social media",
          "Right to erasure of personal data",
          "Right to anonymous browsing",
          "Right to encrypted communication",
        ],
        correct: 1,
        explanation:
          "The Right to be Forgotten allows individuals to request deletion of their personal data under certain conditions.",
      },
    ],
  };

  // Generate quiz questions based on selected topic
  const getQuizQuestions = () => {
    let topicName = "default";

    if (quizSource === "uploaded" && selectedMaterial) {
      const material = uploadedMaterials.find((m) => m.id === selectedMaterial);
      topicName = material?.title || "default";
    } else if (quizSource === "topic" && selectedMaterial) {
      const topic = popularTopics.find(
        (t) => t.id.toString() === selectedMaterial,
      );
      topicName = topic?.name || "default";
    } else if (quizSource === "custom") {
      topicName = customTopic;
    }

    // Find matching question bank
    let questions = questionBanks["default"];
    for (const [key, value] of Object.entries(questionBanks)) {
      if (topicName.includes(key) || key.includes(topicName.split(" ")[0])) {
        questions = value;
        break;
      }
    }

    return questions.slice(0, questionCount);
  };

  const quiz = {
    title:
      quizSource === "uploaded" && selectedMaterial
        ? uploadedMaterials.find((m) => m.id === selectedMaterial)?.title ||
          "Quiz"
        : quizSource === "topic" && selectedMaterial
          ? popularTopics.find((t) => t.id.toString() === selectedMaterial)
              ?.name || "Quiz"
          : customTopic || "EU Data Protection & GDPR",
    subject:
      quizSource === "topic" && selectedMaterial
        ? popularTopics.find((t) => t.id.toString() === selectedMaterial)
            ?.category || "General"
        : "Generated Quiz",
    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    questions: getQuizQuestions(),
  };

  const handleGenerateQuiz = () => {
    setStep("generating");
    // Simulate AI generation
    setTimeout(() => {
      setStep("quiz");
    }, 2500);
  };

  const handleStartOver = () => {
    setStep("source");
    setQuizSource(null);
    setSelectedMaterial(null);
    setCustomTopic("");
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect =
      selectedAnswer === quiz.questions[currentQuestion].correct;
    setAnswers([...answers, isCorrect]);
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizStarted(false);
  };

  const isQuizComplete =
    currentQuestion === quiz.questions.length - 1 && showResult;
  const currentQ = quiz.questions[currentQuestion];

  // Step 1: Choose Source
  if (step === "source") {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-16 md:mt-0">
          <h1 className="mb-2">AI Quiz Generator 🧠</h1>
          <p className="text-gray-600">
            Generate personalized quizzes from your materials or any topic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {/* From Uploaded Content */}
          <button
            onClick={() => {
              setQuizSource("uploaded");
              setStep("configure");
            }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group h-full"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="mb-2">From Your Notes</h2>
            <p className="text-gray-600 text-sm">
              Generate quizzes from your uploaded materials
            </p>
            <div className="mt-4 text-blue-600 text-sm flex items-center gap-1">
              <span>{uploadedMaterials.length} materials available</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* From Topic Explorer */}
          <button
            onClick={() => {
              setQuizSource("topic");
              setStep("configure");
            }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group h-full"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="mb-2">From Topics</h2>
            <p className="text-gray-600 text-sm">
              Choose from popular learning topics
            </p>
            <div className="mt-4 text-purple-600 text-sm flex items-center gap-1">
              <span>{popularTopics.length} topics available</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Custom Topic */}
          <button
            onClick={() => {
              setQuizSource("custom");
              setStep("configure");
            }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group h-full"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Edit3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="mb-2">Custom Topic</h2>
            <p className="text-gray-600 text-sm">
              Enter any topic and let AI create a quiz
            </p>
            <div className="mt-4 text-green-600 text-sm flex items-center gap-1">
              <span>Powered by AI</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Quick tip */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-purple-900 mb-1 text-sm sm:text-base">
                AI-Powered Quiz Generation
              </h3>
              <p className="text-purple-700 text-xs sm:text-sm">
                Our AI analyzes your content and creates personalized questions
                tailored to your learning style and difficulty level.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Configure Quiz
  if (step === "configure") {
    const canGenerate =
      quizSource === "uploaded"
        ? selectedMaterial !== null
        : quizSource === "topic"
          ? selectedMaterial !== null
          : customTopic.trim().length > 0;

    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-16 md:mt-0">
          <button
            onClick={() => setStep("source")}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to source selection
          </button>
          <h1 className="mb-2">Configure Your Quiz ⚙️</h1>
          <p className="text-gray-600">Customize your quiz settings</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Select Material/Topic */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="mb-4">
              {quizSource === "uploaded"
                ? "Select Material"
                : quizSource === "topic"
                  ? "Select Topic"
                  : "Enter Topic"}
            </h2>

            {quizSource === "uploaded" && (
              <div className="space-y-3">
                {uploadedMaterials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      selectedMaterial === material.id
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium mb-1">{material.title}</div>
                        <div className="text-sm text-gray-600">
                          {material.type} • Uploaded {material.uploadDate}
                        </div>
                      </div>
                      {selectedMaterial === material.id && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {quizSource === "topic" && (
              <div className="grid sm:grid-cols-2 gap-3">
                {popularTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedMaterial(topic.id.toString())}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      selectedMaterial === topic.id.toString()
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{topic.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{topic.name}</div>
                        <div className="text-sm text-gray-600">
                          {topic.category}
                        </div>
                      </div>
                      {selectedMaterial === topic.id.toString() && (
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {quizSource === "custom" && (
              <div>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="E.g., French Revolution, Photosynthesis, Machine Learning..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none"
                />
                <p className="text-sm text-gray-600 mt-2">
                  💡 Be specific for better results
                </p>
              </div>
            )}
          </div>

          {/* Quiz Settings */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quiz Settings
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Difficulty */}
              <div>
                <label className="block mb-3 font-medium">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["easy", "intermediate", "advanced"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-3 rounded-xl border-2 transition-all capitalize ${
                        difficulty === level
                          ? "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block mb-3 font-medium">
                  Number of Questions
                </label>
                <div className="flex flex-wrap gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 min-w-[110px] text-center p-3 rounded-2xl border-2 font-medium transition-all ${
                        questionCount === count
                          ? "border-purple-600 bg-purple-50 text-purple-600"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block mb-3 font-medium">Quiz Language</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        language === lang.code
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className="text-xs">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={!canGenerate}
            className={`w-full py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 ${
              canGenerate
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Generate Quiz with AI
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Generating Quiz (Loading)
  if (step === "generating") {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h2 className="mb-3">Generating Your Quiz...</h2>
            <p className="text-gray-600 mb-8">
              AI is analyzing your content and creating personalized questions
            </p>

            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-3 text-left p-4 bg-purple-50 rounded-xl">
                <Loader className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
                <span className="text-purple-900">
                  Analyzing content structure...
                </span>
              </div>
              <div className="flex items-center gap-3 text-left p-4 bg-pink-50 rounded-xl">
                <Loader className="w-5 h-5 text-pink-600 animate-spin flex-shrink-0" />
                <span className="text-pink-900">Generating questions...</span>
              </div>
              <div className="flex items-center gap-3 text-left p-4 bg-blue-50 rounded-xl">
                <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                <span className="text-blue-900">
                  Optimizing for your level...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Quiz Preview (before starting)
  if (!quizStarted) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 mt-16 md:mt-0">
          <button
            onClick={handleStartOver}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Generate new quiz
          </button>
          <h1 className="mb-2">Your Quiz is Ready! 🎉</h1>
          <p className="text-gray-600">
            Review the details and start when you're ready
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="mb-1">{quiz.title}</h2>
              <p className="text-gray-600">{quiz.subject}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Questions</div>
              <div className="text-purple-600">{quiz.questions.length}</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Difficulty</div>
              <div className="text-pink-600">{quiz.difficulty}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Est. Time</div>
              <div className="text-blue-600">
                {quiz.questions.length * 2} min
              </div>
            </div>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Quiz Playing
  if (isQuizComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg text-center mt-16 md:mt-0">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center ${
              percentage >= 80
                ? "bg-green-100"
                : percentage >= 60
                  ? "bg-yellow-100"
                  : "bg-red-100"
            }`}
          >
            <div
              className={`text-2xl sm:text-3xl ${percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"}`}
            >
              {percentage}%
            </div>
          </div>

          <h1 className="mb-2">Quiz Complete! 🎉</h1>
          <p className="text-gray-600 mb-6 sm:mb-8">
            You scored {score} out of {quiz.questions.length}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Correct</div>
              <div className="text-green-600">{score}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Incorrect</div>
              <div className="text-red-600">
                {quiz.questions.length - score}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-gray-600 mb-1">Accuracy</div>
              <div className="text-blue-600">{percentage}%</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button className="px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-6 sm:mb-8 mt-16 md:mt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <h2 className="text-lg sm:text-xl">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </h2>
          <span className="text-gray-600 text-sm sm:text-base">
            Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
        <h2 className="mb-6 sm:mb-8">{currentQ.question}</h2>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQ.correct;
            const showCorrectAnswer = showResult && isCorrect;
            const showWrongAnswer = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  showCorrectAnswer
                    ? "border-green-500 bg-green-50"
                    : showWrongAnswer
                      ? "border-red-500 bg-red-50"
                      : isSelected
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                } ${showResult ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showCorrectAnswer && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {showWrongAnswer && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mb-8 p-4 bg-blue-50 rounded-xl">
            <div className="text-blue-900 mb-2">💡 Explanation</div>
            <p className="text-blue-700">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex gap-4">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`flex-1 py-3 rounded-xl transition-all ${
                selectedAnswer === null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {currentQuestion < quiz.questions.length - 1
                ? "Next Question"
                : "See Results"}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default QuizGenerator;
