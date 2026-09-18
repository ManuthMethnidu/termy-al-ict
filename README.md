# 🐻 Termy A/L ICT — Active Recall & Spaced Repetition Platform

> **A fast-paced, utility-focused revision web app designed for Sri Lankan Advanced Level students to master syllabus MCQs through active recall, spaced repetition, and developer-grade speed.**
> 
> 🔗 **GitHub Repository:** [https://github.com/ManuthMethnidu/termy-al-ict](https://github.com/ManuthMethnidu/termy-al-ict)

---

## 📚 4 Core Question Bank Sections (2,636 MCQs)

1. **🛤️ Section 1: Duolingo Syllabus Course (12 Units & 200+ Lessons)**
   - Powered by `ict_duolingo_course.json`.
   - Complete G.C.E. A/L ICT coverage: Units 1 to 12 broken down into bite-sized lessons (~12 questions each) with interactive lesson roadmap.

2. **📖 Section 2: Subject-Wise Modules (Topic Mastery Drills)**
   - Powered by `ict_subject_wise.json`.
   - Deep-dive into 12 distinct subjects (Number Systems: 371 Qs, Logic Circuits: 328 Qs, Computer Architecture: 337 Qs, Python/PHP: 295 Qs, DBMS: 292 Qs, Operating Systems: 136 Qs, etc.).

3. **⏱️ Section 3: Past Paper & Series Quizzes (265 Mock Exams)**
   - Powered by `all_quizzes_combined_FIXED.json`.
   - 265 organized past paper and exam-series quizzes ready for timed mock drills with real-time scoring.

4. **🧠 Section 4: Master Question Repository & Active Recall (2,636 Qs)**
   - Powered by `ict_question_bank.json`.
   - Instant search across all 2,636 questions with subject & series filters, answer breakdowns, and direct integration with the **SM-2 Spaced Repetition queue**.

Built around a clean, distraction-free terminal interface rather than cluttered ed-tech fluff, **Termy A/L ICT** turns high-volume question pools into focused daily drills.

Guided by **Termy**—an analytical, ice-bear study companion equipped with an orange beanie and focus goggles—students work through curated question sets, receive instant feedback with LaTeX-rendered formulas and truth tables, and **automatically cycle missed questions back into their active queue** until the concepts stick.

---

## 🚀 Key Highlights

1. **Syllabus-Aligned MCQ Drills**
   - Comprehensive question pools covering official National Institute of Education (NIE) modules (Unit 1 to Unit 14).
   - Past paper drills spanning **2015 to 2024** verified against Department of Examinations marking schemes.
   - High-fidelity interactive logic diagrams (e.g. XOR gate circuit vectors, Karnaugh maps, CIDR subnet breakdowns, Python trace blocks).

2. **Spaced Repetition Engine (SM-2 Hybrid)**
   - Intelligently resurfaces tricky and incorrect questions at optimal retention intervals (10 min → 1 day → 3 days → 7+ days).
   - **Queue Recycling**: If a question is missed during a live drill, Termy immediately cycles it back to the end of the session queue so students cannot finish until mastery is achieved.

3. **Termy the Ice-Bear Mascot**
   - An analytical polar bear with an orange ribbed beanie and high-tech focus goggles.
   - Dynamically reacts to drill answers with encouragement, celebratory combo praise, and examiner trap tips.

4. **Zero-Cognitive Drag & Keyboard Speed**
   - High-contrast, minimal dark theme (`#09151a` and `#131f24`) tailored for late-night study sessions.
   - Built-in keyboard shortcuts:
     - `1`, `2`, `3`, `4`: Instant option selection
     - `Enter`: Check answer & proceed to next question
     - `Esc`: Exit drill
   - Responsive design with seamless mobile bottom-tab navigation matching original reference specs.

5. **Gamified Momentum**
   - Daily streak tracking with flame multiplier.
   - XP progression and **Diamond League (Tier V)** leaderboards with authentic Sri Lankan A/L candidates.
   - Daily ICT quests and syllabus milestone badges (e.g. *De Morgan Master*, *Subnet Samurai*).
   - Self-contained Web Audio API synthesizer for tactile chimes, correct answer fanfare, and combo sounds.

---

## 🛠 Tech Stack

- **Framework:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + custom tactile button press systems
- **Typography & Icons:** Nunito Sans, Material Symbols Outlined, Lucide-React
- **Formulas & Math:** KaTeX for LaTeX equations ($F = A \oplus B$, truth tables, and De Morgan laws)
- **Audio:** Web Audio API synthesizer (no external audio assets required)
- **Database / Backend:** Supabase (PostgreSQL) with local fallback storage
- **Animations:** Framer Motion + Canvas Confetti

---

## 📦 Project Structure

```
Termy/
├── source/                        # Archived original reference HTML and token assets
├── supabase/
│   └── schema.sql                 # PostgreSQL schema for Supabase deployment
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx         # Top bar (streaks, diamonds, hearts) & mobile nav
│   │   │   ├── Sidebar.tsx        # Left developer navigation sidebar
│   │   │   └── LatexRenderer.tsx  # Fast KaTeX math & logic formula renderer
│   │   ├── drill/
│   │   │   ├── LiveMcqDrill.tsx   # Live MCQ practice session with keyboard shortcuts
│   │   │   └── QuestionDiagram.tsx# Logic circuit SVGs, K-Maps, and code snippets
│   │   ├── mascot/
│   │   │   └── TermyBear.tsx      # Termy the Ice-Bear vector mascot with beanie & goggles
│   │   └── views/
│   │       ├── LearnView.tsx      # Duolingo-style winding learning roadmap
│   │       ├── PracticeHubView.tsx# Spaced Repetition queue, mistake review & unit drills
│   │       ├── LeaderboardsView.tsx# Diamond League ranking & weekly ICT sprints
│   │       ├── QuestsView.tsx     # Daily ICT sprint quests & syllabus badges
│   │       ├── ShopView.tsx       # Power-up shop (heart refills, streak freezes, Pro pass)
│   │       ├── ProfileView.tsx    # Candidate statistics & unit mastery breakdown
│   │       ├── SettingsView.tsx   # Audio, haptics & target exam year preferences
│   │       ├── GuidebookModal.tsx # Unit 03 Boolean Algebra & Logic Gate cheat sheet
│   │       └── HelpFaqModal.tsx   # FAQs and keyboard cheatsheet
│   ├── data/
│   │   └── syllabusQuestions.ts   # Core A/L ICT MCQs with LaTeX & examiner traps
│   ├── lib/
│   │   ├── sound.ts               # Web Audio API sound effect synthesizer
│   │   ├── spacedRepetition.ts    # SM-2 active recall interval calculator
│   │   ├── supabase.ts            # Supabase Postgres client & sync handlers
│   │   └── utils.ts               # Tailwind class merge helper
│   ├── styles/
│   │   └── index.css              # Custom 3D pressable styles and design tokens
│   ├── types/
│   │   └── index.ts               # Complete TypeScript interface definitions
│   ├── App.tsx                    # Main app state manager
│   └── main.tsx                   # React root entry
├── index.html                     # HTML head with fonts and KaTeX styles
├── tailwind.config.js             # Token-exact color palette from design specs
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### 1. Run Locally

```bash
cd /home/mana/Projects/Termy
npm install
npm run dev
```

Visit the app at `http://localhost:3000`.

### 2. Build for Production

```bash
npm run build
npm run preview
```

### 3. Supabase Integration (Optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard and run the script in `supabase/schema.sql`.
3. Copy your project URL and anon public key into a `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
*(Note: When credentials are not provided, Termy functions seamlessly using client-side persistent storage!)*
