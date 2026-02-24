from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, List


DASHBOARD_SUMMARY: Dict[str, Any] = {
    "greeting": "Welcome back, John! 👋",
    "subtitle": "Ready to continue your learning journey?",
    "stats": [
        {"label": "Study Streak", "value": "12 days", "icon": "zap", "color": "from-orange-500 to-red-500"},
        {"label": "Total Points", "value": "2,450", "icon": "award", "color": "from-yellow-500 to-orange-500"},
        {"label": "Study Time", "value": "23.5 hrs", "icon": "clock", "color": "from-blue-500 to-purple-500"},
        {"label": "Topics Mastered", "value": "18", "icon": "trending-up", "color": "from-green-500 to-teal-500"},
    ],
    "quick_actions": [
        {"label": "Upload Notes", "view": "upload", "icon": "📤", "color": "bg-purple-500"},
        {"label": "Explore Topics", "view": "explore", "icon": "🧭", "color": "bg-blue-500"},
        {"label": "Take Quiz", "view": "quiz", "icon": "🧠", "color": "bg-pink-500"},
        {"label": "AI Tutor Chat", "view": "chat", "icon": "💬", "color": "bg-green-500"},
    ],
    "goals": [
        {"title": "Complete 5 Quizzes This Week", "progress": 60, "current": 3, "total": 5},
        {"title": "Study for 10 Hours", "progress": 75, "current": 7.5, "total": 10},
        {"title": "Master EU Policy Basics", "progress": 40, "current": 4, "total": 10},
    ],
    "recent_activity": [
        {"title": "Quantum Physics Quiz", "type": "quiz", "score": 85, "date": "2 hours ago", "icon": "brain"},
        {"title": "EU Data Protection Law", "type": "flashcards", "score": 92, "date": "5 hours ago", "icon": "book-open"},
        {"title": "Calculus Simplified", "type": "video", "score": 100, "date": "Yesterday", "icon": "video"},
        {"title": "Chemistry Basics", "type": "quiz", "score": 78, "date": "2 days ago", "icon": "brain"},
    ],
}

FEED_TAGS: List[str] = [
    "All",
    "Physics",
    "Mathematics",
    "Law & Policy",
    "Biology",
    "Economics",
    "Chemistry",
    "Computer Science",
    "AI",
    "Programming",
    "Entrepreneurship",
    "History",
    "Psychology",
    "Engineering",
    "Medicine",
    "Literature",
]

LEARNING_VIDEOS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "title": "EU GDPR Explained in 60 Seconds",
        "subject": "Law & Policy",
        "duration": "0:58",
        "likes": 1243,
        "comments": 89,
        "thumbnail": "🔒",
        "color": "from-blue-500 to-purple-500",
    },
    {
        "id": 2,
        "title": "Quantum Entanglement Made Simple",
        "subject": "Physics",
        "duration": "1:15",
        "likes": 2156,
        "comments": 134,
        "thumbnail": "⚛️",
        "color": "from-purple-500 to-pink-500",
    },
    {
        "id": 3,
        "title": "Derivatives in 90 Seconds",
        "subject": "Mathematics",
        "duration": "1:28",
        "likes": 987,
        "comments": 67,
        "thumbnail": "📊",
        "color": "from-green-500 to-teal-500",
    },
    {
        "id": 4,
        "title": "DNA Replication Simplified",
        "subject": "Biology",
        "duration": "1:42",
        "likes": 1876,
        "comments": 102,
        "thumbnail": "🧬",
        "color": "from-pink-500 to-red-500",
    },
    {
        "id": 5,
        "title": "Brexit Impact on EU Trade",
        "subject": "Economics",
        "duration": "2:05",
        "likes": 1432,
        "comments": 156,
        "thumbnail": "💰",
        "color": "from-yellow-500 to-orange-500",
    },
    {
        "id": 6,
        "title": "Algorithms in 90 Seconds",
        "subject": "Computer Science",
        "duration": "1:30",
        "likes": 1689,
        "comments": 112,
        "thumbnail": "💻",
        "color": "from-indigo-500 to-blue-600",
    },
    {
        "id": 7,
        "title": "French Revolution Snapshot",
        "subject": "History",
        "duration": "1:12",
        "likes": 981,
        "comments": 64,
        "thumbnail": "🏛️",
        "color": "from-amber-500 to-orange-600",
    },
    {
        "id": 8,
        "title": "Memory & Recall Explained",
        "subject": "Psychology",
        "duration": "1:08",
        "likes": 1204,
        "comments": 78,
        "thumbnail": "🧠",
        "color": "from-fuchsia-500 to-pink-600",
    },
    {
        "id": 9,
        "title": "AI Models in 60 Seconds",
        "subject": "AI",
        "duration": "0:59",
        "likes": 2310,
        "comments": 184,
        "thumbnail": "🤖",
        "color": "from-violet-500 to-purple-600",
    },
    {
        "id": 10,
        "title": "Programming Basics: Loops",
        "subject": "Programming",
        "duration": "1:05",
        "likes": 1754,
        "comments": 121,
        "thumbnail": "🧑‍💻",
        "color": "from-sky-500 to-blue-600",
    },
    {
        "id": 11,
        "title": "Startup Ideas to MVP",
        "subject": "Entrepreneurship",
        "duration": "1:18",
        "likes": 1428,
        "comments": 96,
        "thumbnail": "🚀",
        "color": "from-orange-500 to-amber-500",
    },
]

QUIZ_LIBRARY: List[Dict[str, Any]] = [
    {
        "topic": "gdpr",
        "title": "EU Data Protection & GDPR",
        "subject": "Law & Policy",
        "difficulty": "Intermediate",
        "questions": [
            {
                "question": "What does GDPR stand for?",
                "options": [
                    "General Data Protection Regulation",
                    "Global Data Privacy Rights",
                    "General Digital Protection Rights",
                    "Global Digital Privacy Regulation",
                ],
                "correct": 0,
                "explanation": "GDPR stands for General Data Protection Regulation, implemented in the EU in 2018.",
            },
            {
                "question": "What is the maximum fine for GDPR violations?",
                "options": [
                    "€10 million or 2% of global revenue",
                    "€20 million or 4% of global revenue",
                    "€50 million or 5% of global revenue",
                    "€100 million or 10% of global revenue",
                ],
                "correct": 1,
                "explanation": "The maximum fine is €20 million or 4% of annual global turnover, whichever is higher.",
            },
            {
                "question": "Which of these is NOT a principle of GDPR?",
                "options": [
                    "Data minimization",
                    "Lawfulness and transparency",
                    "Profit maximization",
                    "Accuracy",
                ],
                "correct": 2,
                "explanation": "Profit maximization is not a GDPR principle. GDPR focuses on data protection, not business profits.",
            },
            {
                "question": "How long do companies have to report a data breach?",
                "options": [
                    "24 hours",
                    "48 hours",
                    "72 hours",
                    "1 week",
                ],
                "correct": 2,
                "explanation": "Organizations must report data breaches to authorities within 72 hours of becoming aware of them.",
            },
            {
                "question": 'What right does "Right to be Forgotten" refer to?',
                "options": [
                    "Right to delete social media",
                    "Right to erasure of personal data",
                    "Right to anonymous browsing",
                    "Right to encrypted communication",
                ],
                "correct": 1,
                "explanation": "The Right to be Forgotten allows individuals to request deletion of their personal data under certain conditions.",
            },
        ],
    },
    {
        "topic": "quantum",
        "title": "Quantum Physics Fundamentals",
        "subject": "Physics",
        "difficulty": "Advanced",
        "questions": [
            {
                "question": "What is superposition in quantum mechanics?",
                "options": [
                    "Particles spinning rapidly",
                    "Particles existing in multiple states simultaneously",
                    "Particles with opposite charges",
                    "Particles moving faster than light",
                ],
                "correct": 1,
                "explanation": "Superposition describes the ability of quantum systems to exist in multiple states until measured.",
            },
            {
                "question": "Which experiment demonstrated the wave-particle duality of light?",
                "options": [
                    "Stern-Gerlach experiment",
                    "Double-slit experiment",
                    "Michelson-Morley experiment",
                    "Photoelectric experiment",
                ],
                "correct": 1,
                "explanation": "The double-slit experiment showed interference patterns that proved light behaves as both wave and particle.",
            },
            {
                "question": "What does entanglement imply about particles?",
                "options": [
                    "They share the same mass",
                    "They remain connected regardless of distance",
                    "They orbit one another",
                    "They are electrically neutral",
                ],
                "correct": 1,
                "explanation": "Entangled particles influence each other instantly, regardless of how far apart they are.",
            },
        ],
    },
]

FLASHCARD_DECKS: List[Dict[str, Any]] = [
    {
        "topic": "general",
        "title": "General Knowledge",
        "cards": [
            {
                "id": 1,
                "front": "What is GDPR?",
                "back": (
                    "General Data Protection Regulation - EU law on data protection and privacy "
                    "that came into effect in May 2018"
                ),
                "category": "Law & Policy",
            },
            {
                "id": 2,
                "front": "Define Quantum Entanglement",
                "back": (
                    "A physical phenomenon where particles remain connected so that actions on "
                    "one affect the other, regardless of distance"
                ),
                "category": "Physics",
            },
            {
                "id": 3,
                "front": "What is a derivative in calculus?",
                "back": (
                    "A measure of how a function changes as its input changes. It represents "
                    "the slope of the tangent line to the function at a point"
                ),
                "category": "Mathematics",
            },
            {
                "id": 4,
                "front": "Explain DNA Replication",
                "back": (
                    "The process by which DNA makes a copy of itself during cell division. "
                    "The double helix unwinds and each strand serves as a template"
                ),
                "category": "Biology",
            },
            {
                "id": 5,
                "front": "What is Brexit?",
                "back": (
                    "The UK's withdrawal from the European Union, officially completed on "
                    "January 31, 2020, affecting trade, immigration, and regulations"
                ),
                "category": "Economics",
            },
            {
                "id": 6,
                "front": "Define Photosynthesis",
                "back": (
                    "The process by which plants use sunlight, water, and CO2 to produce "
                    "oxygen and energy in the form of sugar"
                ),
                "category": "Biology",
            },
            {
                "id": 7,
                "front": "What is the Pythagorean Theorem?",
                "back": "In a right triangle, a² + b² = c² where c is the hypotenuse.",
                "category": "Mathematics",
            },
            {
                "id": 8,
                "front": "Explain Newton's First Law",
                "back": (
                    "An object at rest stays at rest and an object in motion stays in motion "
                    "with the same speed and direction unless acted upon by force"
                ),
                "category": "Physics",
            },
        ],
    },
    {
        "topic": "biology",
        "title": "Biology Basics",
        "cards": [
            {
                "id": 101,
                "front": "What is mitosis?",
                "back": "A type of cell division that results in two daughter cells each having the same number of chromosomes.",
                "category": "Biology",
            },
            {
                "id": 102,
                "front": "Define homeostasis.",
                "back": "The process by which organisms maintain a stable internal environment despite external changes.",
                "category": "Biology",
            },
        ],
    },
]

PROGRESS_OVERVIEW: Dict[str, Any] = {
    "level": "Level 5",
    "streak": "12 Days",
    "study_time": "23.5 hrs",
    "total_points": "2,450",
    "weekly_stats": [
        {"day": "Mon", "minutes": 45, "goal": 60},
        {"day": "Tue", "minutes": 75, "goal": 60},
        {"day": "Wed", "minutes": 60, "goal": 60},
        {"day": "Thu", "minutes": 90, "goal": 60},
        {"day": "Fri", "minutes": 55, "goal": 60},
        {"day": "Sat", "minutes": 30, "goal": 60},
        {"day": "Sun", "minutes": 0, "goal": 60},
    ],
    "achievements": [
        {"id": 1, "name": "First Steps", "description": "Complete your first quiz", "icon": "🎯", "unlocked": True},
        {"id": 2, "name": "Week Warrior", "description": "7 day study streak", "icon": "🔥", "unlocked": True},
        {"id": 3, "name": "Quick Learner", "description": "Score 100% on a quiz", "icon": "⚡", "unlocked": True},
        {"id": 4, "name": "Dedicated Student", "description": "Study for 10 hours total", "icon": "📚", "unlocked": True},
        {"id": 5, "name": "Knowledge Seeker", "description": "Complete 20 flashcard sets", "icon": "🧠", "unlocked": False},
        {"id": 6, "name": "Master Mind", "description": "Master 5 different topics", "icon": "👑", "unlocked": False},
    ],
    "subjects": [
        {"name": "Law & Policy", "progress": 75, "color": "bg-blue-500"},
        {"name": "Physics", "progress": 60, "color": "bg-purple-500"},
        {"name": "Mathematics", "progress": 85, "color": "bg-green-500"},
        {"name": "Biology", "progress": 45, "color": "bg-pink-500"},
        {"name": "Economics", "progress": 55, "color": "bg-yellow-500"},
    ],
    "milestones": [
        {"title": "Completed GDPR Module", "date": "2 days ago", "icon": "trophy", "color": "text-yellow-500"},
        {"title": "Reached Level 5", "date": "5 days ago", "icon": "star", "color": "text-purple-500"},
        {"title": "10 Day Streak Achieved", "date": "1 week ago", "icon": "zap", "color": "text-orange-500"},
    ],
    "next_level": {
        "next_level": "Level 6",
        "current_xp": 450,
        "target_xp": 500,
        "remaining_xp": 50,
        "percentage": 90.0,
    },
}

POPULAR_TOPICS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "GDPR & Data Privacy",
        "icon": "🔒",
        "category": "Law & Policy",
        "lessons": 12,
        "color": "from-blue-500 to-cyan-500",
    },
    {
        "id": 2,
        "name": "Quantum Physics",
        "icon": "⚛️",
        "category": "Physics",
        "lessons": 15,
        "color": "from-purple-500 to-pink-500",
    },
    {
        "id": 3,
        "name": "Calculus Fundamentals",
        "icon": "📊",
        "category": "Mathematics",
        "lessons": 20,
        "color": "from-green-500 to-teal-500",
    },
    {
        "id": 4,
        "name": "Molecular Biology",
        "icon": "🧬",
        "category": "Biology",
        "lessons": 18,
        "color": "from-pink-500 to-rose-500",
    },
    {
        "id": 5,
        "name": "EU Economic Policy",
        "icon": "💰",
        "category": "Economics",
        "lessons": 14,
        "color": "from-yellow-500 to-orange-500",
    },
    {
        "id": 6,
        "name": "Climate Change",
        "icon": "🌍",
        "category": "Environmental Science",
        "lessons": 16,
        "color": "from-teal-500 to-emerald-500",
    },
]

RECENT_TOPICS: List[Dict[str, Any]] = [
    {"name": "Neural Networks", "progress": 65, "icon": "🤖"},
    {"name": "European History", "progress": 40, "icon": "🏛️"},
    {"name": "Organic Chemistry", "progress": 80, "icon": "⚗️"},
]

TOPIC_DETAILS: Dict[int, Dict[str, Any]] = {
    1: {
        "id": 1,
        "name": "GDPR & Data Privacy",
        "icon": "🔒",
        "description": "Master the fundamentals of data protection in the European Union.",
        "hero_color": "from-blue-500 to-cyan-500",
        "modules": [
            {"title": "Introduction & Overview", "duration": "15 min", "type": "video", "completed": True},
            {"title": "Core Concepts Explained", "duration": "25 min", "type": "reading", "completed": True},
            {"title": "Interactive Examples", "duration": "20 min", "type": "interactive", "completed": False},
            {"title": "Practice Quiz", "duration": "10 min", "type": "quiz", "completed": False},
            {"title": "Deep Dive Discussion", "duration": "30 min", "type": "reading", "completed": False},
        ],
        "eu_connection": (
            "This topic is directly related to EU Regulation 2016/679 and covers key aspects "
            "of data protection within European Union member states."
        ),
        "difficulty": "Intermediate",
        "estimated_time": "3.5 hours",
        "related_topics": ["Cybersecurity Basics", "EU Digital Policy", "Privacy Laws"],
    },
    2: {
        "id": 2,
        "name": "Quantum Physics",
        "icon": "⚛️",
        "description": "Understand superposition, entanglement, and modern applications.",
        "hero_color": "from-purple-500 to-pink-500",
        "modules": [
            {"title": "Atoms to Qubits", "duration": "20 min", "type": "video", "completed": True},
            {"title": "Mathematical Foundations", "duration": "30 min", "type": "reading", "completed": False},
            {"title": "Thought Experiments", "duration": "15 min", "type": "interactive", "completed": False},
        ],
        "eu_connection": "Highlights EU-funded quantum research initiatives and labs.",
        "difficulty": "Advanced",
        "estimated_time": "4 hours",
        "related_topics": ["Quantum Computing", "Particle Physics"],
    },
}

CHAT_SUGGESTIONS = [
    "Explain GDPR in simple terms",
    "How does photosynthesis work?",
    "What is quantum computing?",
    "Help me with calculus derivatives",
]

CHAT_RESPONSES: List[tuple[str, str]] = [
    (
        "gdpr",
        "GDPR (General Data Protection Regulation) is an EU law that protects people's personal data. "
        "Key takeaways: 1) Companies need clear permission to use your information, "
        "2) You can request to see or delete the data collected about you, "
        "3) Breaches must be reported within 72 hours. Want to dive into a specific article?",
    ),
    (
        "photosynthesis",
        "Photosynthesis is how plants turn sunlight, water, and CO₂ into energy. "
        "Chlorophyll captures the light, and the plant produces glucose for fuel plus the oxygen we breathe. "
        "Curious about the chemical equation or the cellular machinery?",
    ),
    (
        "quantum",
        "Quantum computing uses qubits that can be 0 and 1 at the same time, letting the computer explore many "
        "possibilities simultaneously. Think of it as testing every path through a maze in parallel. "
        "Should we talk about real-world applications or the math behind it?",
    ),
    (
        "derivative",
        "A derivative measures the rate of change. If f(x) = x², the derivative is 2x, meaning the slope of the curve "
        "at any point x equals 2x. Want practice problems or a visual explanation?",
    ),
]

DEFAULT_CHAT_RESPONSE = (
    "Great question! I can help break this down. Could you share a bit more context "
    "or the specific angle you're curious about? I can explain it with text, visuals, or audio—whatever fits your style."
)


def get_dashboard_summary() -> Dict[str, Any]:
    return deepcopy(DASHBOARD_SUMMARY)


def get_learning_feed() -> Dict[str, Any]:
    return {"tags": list(FEED_TAGS), "videos": deepcopy(LEARNING_VIDEOS)}


def generate_quiz_plan(
    topic: str | None = None,
    difficulty: str | None = None,
    question_count: int | None = None,
) -> Dict[str, Any]:
    topic_lower = (topic or "").lower()
    difficulty_lower = (difficulty or "").lower()
    chosen_quiz = QUIZ_LIBRARY[0]

    for quiz in QUIZ_LIBRARY:
        matches_topic = not topic_lower or topic_lower in quiz["topic"].lower() or topic_lower in quiz["subject"].lower()
        matches_difficulty = not difficulty_lower or quiz["difficulty"].lower() == difficulty_lower
        if matches_topic and matches_difficulty:
            chosen_quiz = quiz
            break

    questions = deepcopy(chosen_quiz["questions"])
    if question_count is not None:
        count = max(1, min(question_count, len(questions)))
        questions = questions[:count]

    return {
        "title": chosen_quiz["title"],
        "subject": chosen_quiz["subject"],
        "difficulty": chosen_quiz["difficulty"],
        "questions": questions,
    }


def get_flashcard_deck(topic: str | None = None) -> Dict[str, Any]:
    if topic:
        topic_lower = topic.lower()
        for deck in FLASHCARD_DECKS:
            if topic_lower in deck["topic"].lower():
                return {"topic": deck["title"], "cards": deepcopy(deck["cards"])}
    default_deck = FLASHCARD_DECKS[0]
    return {"topic": default_deck["title"], "cards": deepcopy(default_deck["cards"])}


def generate_chat_response(message: str) -> Dict[str, Any]:
    normalized = message.lower()
    for keyword, response in CHAT_RESPONSES:
        if keyword in normalized:
            return {"reply": response, "suggestions": CHAT_SUGGESTIONS}
    return {"reply": DEFAULT_CHAT_RESPONSE, "suggestions": CHAT_SUGGESTIONS}


def get_progress_overview() -> Dict[str, Any]:
    return deepcopy(PROGRESS_OVERVIEW)


def list_topics(query: str | None = None) -> Dict[str, Any]:
    if not query:
        return {"popular": deepcopy(POPULAR_TOPICS), "recent": deepcopy(RECENT_TOPICS)}

    query_lower = query.lower()
    popular = [
        topic
        for topic in POPULAR_TOPICS
        if query_lower in topic["name"].lower() or query_lower in topic["category"].lower()
    ]
    recent = [topic for topic in RECENT_TOPICS if query_lower in topic["name"].lower()]
    return {"popular": deepcopy(popular), "recent": deepcopy(recent)}


def get_topic_detail(topic_id: int) -> Dict[str, Any]:
    try:
        topic = TOPIC_DETAILS[topic_id]
    except KeyError as exc:
        raise ValueError(f"Topic {topic_id} was not found.") from exc

    modules = topic["modules"]
    total = len(modules)
    completed = sum(1 for module in modules if module["completed"])
    payload = deepcopy(topic)
    payload["total_modules"] = total
    payload["completed_modules"] = completed
    return payload
