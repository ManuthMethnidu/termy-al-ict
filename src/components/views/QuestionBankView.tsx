import React, { useState, useEffect } from 'react';
import { McqQuestion } from '../../types';
import {
  fetchDuolingoCourse,
  fetchSubjectWise,
  fetchAllQuizzes,
  fetchMasterBank,
  adaptRawQuestion,
  DuolingoCourseData,
  SubjectWiseData,
  QuizItem,
  MasterQuestionBankData,
} from '../../lib/questionBankLoader';
import { LatexRenderer } from '../common/LatexRenderer';

export type QBankSection = 'duolingo' | 'subjects' | 'quizzes' | 'master';

interface QuestionBankViewProps {
  onStartDrill: (questions: McqQuestion[]) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  onStartDrill,
}) => {
  const [activeSection, setActiveSection] = useState<QBankSection>('duolingo');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data states
  const [duoData, setDuoData] = useState<DuolingoCourseData | null>(null);
  const [subjectData, setSubjectData] = useState<SubjectWiseData | null>(null);
  const [quizzesData, setQuizzesData] = useState<QuizItem[] | null>(null);
  const [masterData, setMasterData] = useState<MasterQuestionBankData | null>(null);

  // Section 1 state: selected unit
  const [selectedUnitId, setSelectedUnitId] = useState<number>(1);

  // Section 3 state: quiz search
  const [quizSearch, setQuizSearch] = useState<string>('');

  // Section 4 state: master bank search & filter
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>('all');

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      try {
        const [duo, subjects, quizzes, master] = await Promise.all([
          fetchDuolingoCourse(),
          fetchSubjectWise(),
          fetchAllQuizzes(),
          fetchMasterBank(),
        ]);
        setDuoData(duo);
        setSubjectData(subjects);
        setQuizzesData(quizzes);
        setMasterData(master);
      } catch (err) {
        console.error('Error loading question bank data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-text-muted">
          Loading 2,636 Sri Lankan A/L ICT questions...
        </span>
      </div>
    );
  }

  // Section 1 Handler: Start Lesson Drill
  const handleStartLesson = (lesson: any) => {
    if (!lesson.questions || lesson.questions.length === 0) return;
    const questions = lesson.questions.map((q: any, i: number) => adaptRawQuestion(q, i));
    onStartDrill(questions);
  };

  // Section 2 Handler: Start Subject Drill
  const handleStartSubject = (subject: any, limit: number = 15) => {
    if (!subject.questions || subject.questions.length === 0) return;
    const shuffled = [...subject.questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);
    const questions = selected.map((q: any, i: number) => adaptRawQuestion(q, i));
    onStartDrill(questions);
  };

  // Section 3 Handler: Start Quiz
  const handleStartQuiz = (quiz: QuizItem) => {
    if (!quiz.questions || quiz.questions.length === 0) return;
    const questions = quiz.questions.map((q: any, i: number) => adaptRawQuestion(q, i));
    onStartDrill(questions);
  };

  // Section 4 Handler: Start Filtered Drill
  const handleStartFilteredMaster = (questionsToDrill: any[]) => {
    if (questionsToDrill.length === 0) return;
    const sliced = questionsToDrill.slice(0, 15);
    const questions = sliced.map((q: any, i: number) => adaptRawQuestion(q, i));
    onStartDrill(questions);
  };

  // Filtered master bank questions
  const filteredMasterQuestions = (masterData?.questions || []).filter((q) => {
    if (selectedSubjectFilter !== 'all' && q.subject !== selectedSubjectFilter) {
      return false;
    }
    if (selectedSeriesFilter !== 'all' && q.series !== selectedSeriesFilter) {
      return false;
    }
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.toLowerCase();
      const inText = q.question?.toLowerCase().includes(kw);
      const inOptions = (q.options || []).some((opt: string) => opt.toLowerCase().includes(kw));
      const inExpl = q.explanation?.toLowerCase().includes(kw);
      return inText || inOptions || inExpl;
    }
    return true;
  });

  const allSubjects = Array.from(new Set((masterData?.questions || []).map((q) => q.subject))).filter(Boolean);
  const allSeries = Array.from(new Set((masterData?.questions || []).map((q) => q.series))).filter(Boolean);

  const selectedUnit = duoData?.units.find((u) => u.unit_id === selectedUnitId) || duoData?.units[0];

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-8 pb-24 md:pb-12 select-none">
      {/* Question Bank Hero Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
          <span className="material-symbols-outlined text-base">inventory_2</span>
          <span>A/L ICT Question Bank • 2,636 Verified MCQs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
          Explore Question Bank Sections
        </h1>
        <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
          Four distinct ways to revise syllabus MCQs: progress unit-by-unit along the course path, target specific subject modules, test yourself on 265 timed quiz series, or search the complete 2,636 question bank.
        </p>
      </div>

      {/* 4 Sections Tab Selector Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-surface-container border border-card-border/60 shadow-md">
        <button
          onClick={() => setActiveSection('duolingo')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeSection === 'duolingo'
              ? 'bg-primary text-on-primary-fixed shadow-[0_3px_0_#46a302]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-lg">route</span>
          <span className="truncate">1. Syllabus Course</span>
        </button>

        <button
          onClick={() => setActiveSection('subjects')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeSection === 'subjects'
              ? 'bg-secondary text-on-secondary shadow-[0_3px_0_#1899d6]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-lg">library_books</span>
          <span className="truncate">2. Subject Modules</span>
        </button>

        <button
          onClick={() => setActiveSection('quizzes')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeSection === 'quizzes'
              ? 'bg-lightning-gold text-on-tertiary-fixed shadow-[0_3px_0_#ddad00]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-lg">timer</span>
          <span className="truncate">3. 265 Series Quizzes</span>
        </button>

        <button
          onClick={() => setActiveSection('master')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeSection === 'master'
              ? 'bg-purple-500 text-white shadow-[0_3px_0_#7e22ce]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-lg">manage_search</span>
          <span className="truncate">4. Master Q-Bank (2.6K)</span>
        </button>
      </div>

      {/* SECTION 1: DUOLINGO SYLLABUS COURSE */}
      {activeSection === 'duolingo' && duoData && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card-dark border border-card-border shadow-md">
            <div>
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                Section 1 • Course Curriculum
              </span>
              <h2 className="text-xl font-extrabold text-on-surface mt-0.5">
                12 Syllabus Units • 200+ Interactive Lessons
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Bite-sized micro-lessons (~12 questions each) aligned with the Sri Lankan G.C.E. A/L ICT Syllabus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-text-muted">
                {duoData.units.length} Units • {duoData.meta.total_questions} Questions
              </span>
            </div>
          </div>

          {/* Unit Selector Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {duoData.units.map((unit) => (
              <button
                key={unit.unit_id}
                onClick={() => setSelectedUnitId(unit.unit_id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  selectedUnitId === unit.unit_id
                    ? 'bg-primary text-on-primary-fixed border border-primary shadow'
                    : 'bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface border border-card-border'
                }`}
              >
                Unit {unit.unit_id}: {unit.title.split(' ')[0]}... ({unit.lessons.length})
              </button>
            ))}
          </div>

          {/* Selected Unit Lessons Grid */}
          {selectedUnit && (
            <div className="p-6 rounded-2xl bg-surface-container border border-card-border flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border pb-4">
                <div>
                  <span className="text-xs font-mono text-primary font-bold">
                    UNIT {selectedUnit.unit_id}
                  </span>
                  <h3 className="text-lg font-bold text-on-surface">{selectedUnit.title}</h3>
                </div>
                <div className="text-xs text-text-muted font-mono">
                  {selectedUnit.lessons.length} Lessons • {selectedUnit.total_questions} MCQs
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedUnit.lessons.map((lesson) => (
                  <div
                    key={lesson.lesson_id}
                    className="p-4 rounded-xl bg-card-dark border border-card-border hover:border-primary/50 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 text-xs text-text-muted font-mono">
                        <span>Lesson {lesson.lesson_id}</span>
                        <span className="text-primary font-bold">{lesson.questions.length} Qs</span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {lesson.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleStartLesson(lesson)}
                      className="w-full py-2 bg-surface-container hover:bg-primary hover:text-on-primary-fixed text-primary text-xs uppercase font-extrabold tracking-wider rounded-lg border border-card-border transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      <span>Start Lesson</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SUBJECT-WISE MODULES */}
      {activeSection === 'subjects' && subjectData && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-secondary tracking-wider">
                Section 2 • Topic Mastery Modules
              </span>
              <h2 className="text-xl font-extrabold text-on-surface mt-0.5">
                12 Subject Deep-Dives
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Target high-yield syllabus areas: Number Systems, Boolean Logic, Python Algorithms, Databases, and Networking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectData.subjects.map((subj, idx) => {
              const count = subj.questions?.length || subj.count || 0;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-secondary/60 transition-all flex flex-col justify-between gap-5 group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-secondary">
                        {count} MCQs
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-on-surface group-hover:text-secondary transition-colors">
                      {subj.name}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStartSubject(subj, 15)}
                      className="w-full py-2.5 bg-secondary text-on-secondary font-bold text-xs uppercase tracking-wider rounded-xl btn-pressable-secondary flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      <span>Drill 15 Questions</span>
                    </button>
                    <button
                      onClick={() => handleStartSubject(subj, count)}
                      className="w-full py-1.5 bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface text-xs font-bold rounded-lg transition-colors text-center"
                    >
                      Full Topic Test ({count} Qs)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: 265 QUIZ SERIES */}
      {activeSection === 'quizzes' && quizzesData && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-lightning-gold tracking-wider">
                Section 3 • Past Paper & Series Quizzes
              </span>
              <h2 className="text-xl font-extrabold text-on-surface mt-0.5">
                265 Structured Mock Papers
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Full-length past paper mock series ready for timed exam simulation.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Quiz # (e.g. 42)..."
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface focus:outline-none focus:border-lightning-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {quizzesData
              .filter((q) => !quizSearch || q.quiz_number.toString().includes(quizSearch.trim()))
              .slice(0, 50)
              .map((quiz) => (
                <div
                  key={quiz.quiz_number}
                  onClick={() => handleStartQuiz(quiz)}
                  className="p-4 rounded-xl bg-card-dark border border-card-border hover:border-lightning-gold/60 cursor-pointer transition-all hover:bg-surface-variant group flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-lightning-gold font-extrabold">
                      Quiz #{quiz.quiz_number}
                    </span>
                    <span className="text-text-muted">{quiz.questions.length} Qs</span>
                  </div>
                  <span className="text-[11px] text-text-muted truncate">
                    {quiz.series}
                  </span>
                  <div className="text-[11px] font-bold text-lightning-gold flex items-center gap-1 group-hover:underline">
                    <span>Start Quiz</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              ))}
          </div>
          {quizzesData.length > 50 && !quizSearch && (
            <div className="text-center text-xs text-text-muted font-mono">
              Showing first 50 of 265 quizzes. Use search bar to jump to any quiz number.
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: MASTER QUESTION BANK & SEARCH */}
      {activeSection === 'master' && masterData && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">
                  Section 4 • Master Question Repository
                </span>
                <h2 className="text-xl font-extrabold text-on-surface mt-0.5">
                  2,636 Questions with Live Search & Filters
                </h2>
              </div>
              <button
                onClick={() => handleStartFilteredMaster(filteredMasterQuestions)}
                disabled={filteredMasterQuestions.length === 0}
                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-xs uppercase font-extrabold tracking-wider rounded-xl shadow-md transition-all self-start sm:self-auto"
              >
                Drill {Math.min(15, filteredMasterQuestions.length)} Filtered Qs →
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search concepts, terms, keywords (e.g. 'XOR', 'subnet', 'Python')..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface focus:outline-none focus:border-purple-400"
              />

              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface focus:outline-none focus:border-purple-400"
              >
                <option value="all">All Subjects (12 Topics)</option>
                {allSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedSeriesFilter}
                onChange={(e) => setSelectedSeriesFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface focus:outline-none focus:border-purple-400"
              >
                <option value="all">All Series</option>
                {allSeries.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-text-muted font-mono">
              Found {filteredMasterQuestions.length} matching questions.
            </div>
          </div>

          {/* Questions list preview */}
          <div className="flex flex-col gap-3">
            {filteredMasterQuestions.slice(0, 20).map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-xl bg-card-dark border border-card-border flex flex-col gap-2 hover:border-card-border/80 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-mono text-[10px] font-bold">
                      {q.id}
                    </span>
                    <span className="text-xs text-text-muted font-bold truncate">
                      {q.subject}
                    </span>
                  </div>
                  <span className="text-[10px] text-lightning-gold font-mono font-bold">
                    {q.series}
                  </span>
                </div>

                <p className="text-sm font-bold text-on-surface leading-snug">
                  <LatexRenderer content={q.question} />
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-xs">
                  {(q.options || []).map((opt: string, optIdx: number) => {
                    const isCorrect = optIdx === q.correct_answer_index;
                    return (
                      <div
                        key={optIdx}
                        className={`px-3 py-1.5 rounded-lg font-mono border ${
                          isCorrect
                            ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                            : 'bg-surface-container-lowest border-card-border/30 text-text-muted'
                        }`}
                      >
                        <span className="mr-2 font-bold">{optIdx + 1}.</span>
                        <LatexRenderer content={opt} />
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-2 pt-2 border-t border-card-border/30 text-xs text-text-muted">
                    <span className="text-primary font-bold mr-1">Explanation:</span>
                    <LatexRenderer content={q.explanation} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredMasterQuestions.length > 20 && (
            <div className="p-4 rounded-xl bg-surface-container text-center text-xs text-text-muted font-mono">
              Showing 20 of {filteredMasterQuestions.length} questions. Click "Drill Filtered Qs" above to start a live interactive practice session with Termy!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
