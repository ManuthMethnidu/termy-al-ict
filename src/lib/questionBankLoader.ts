import { McqQuestion } from '../types';

export interface DuolingoLesson {
  lesson_id: number;
  title: string;
  questions: any[];
}

export interface DuolingoUnit {
  unit_id: number;
  title: string;
  total_questions: number;
  lessons: DuolingoLesson[];
}

export interface DuolingoCourseData {
  meta: any;
  course: string;
  units: DuolingoUnit[];
}

export interface SubjectWiseItem {
  name: string;
  count?: number;
  questions: any[];
}

export interface SubjectWiseData {
  meta: any;
  subjects: SubjectWiseItem[];
}

export interface QuizItem {
  quiz_number: number;
  series: string;
  questions: any[];
}

export interface MasterQuestionBankData {
  meta: any;
  questions: any[];
}

let cachedCourse: DuolingoCourseData | null = null;
let cachedSubjects: SubjectWiseData | null = null;
let cachedQuizzes: QuizItem[] | null = null;
let cachedMaster: MasterQuestionBankData | null = null;

export function adaptRawQuestion(raw: any, index?: number): McqQuestion {
  return {
    id: raw.id || `q_${index || Math.floor(Math.random() * 100000)}`,
    unit: raw.unit_id || 1,
    unitTitle: raw.subject || 'A/L ICT Module',
    question: raw.question,
    isQuestionLatex: raw.question?.includes('$') || raw.question?.includes('\\'),
    options: (raw.options || []).map((opt: string, idx: number) => ({
      id: idx + 1,
      text: opt,
      isLatex: opt.includes('$') || opt.includes('\\') || opt.includes('•') || opt.includes('⊕'),
    })),
    correctOption: typeof raw.correct_answer_index === 'number' ? raw.correct_answer_index + 1 : 1,
    explanation: raw.explanation || 'Verified with official G.C.E. A/L marking scheme.',
    difficulty: 'medium',
    topic: raw.subject || 'General ICT',
    pastPaperYear: raw.series?.includes('20') ? parseInt(raw.series.match(/\d{4}/)?.[0] || '2024', 10) : undefined,
    pastPaperNumber: raw.id ? parseInt(raw.id.replace(/\D/g, '').slice(-2), 10) : undefined,
  };
}

export async function fetchDuolingoCourse(): Promise<DuolingoCourseData> {
  if (cachedCourse) return cachedCourse;
  const res = await fetch('/q_bank/ict_duolingo_course.json');
  if (!res.ok) throw new Error('Failed to load ict_duolingo_course.json');
  cachedCourse = await res.json();
  return cachedCourse!;
}

export async function fetchSubjectWise(): Promise<SubjectWiseData> {
  if (cachedSubjects) return cachedSubjects;
  const res = await fetch('/q_bank/ict_subject_wise.json');
  if (!res.ok) throw new Error('Failed to load ict_subject_wise.json');
  cachedSubjects = await res.json();
  return cachedSubjects!;
}

export async function fetchAllQuizzes(): Promise<QuizItem[]> {
  if (cachedQuizzes) return cachedQuizzes;
  const res = await fetch('/q_bank/all_quizzes_combined_FIXED.json');
  if (!res.ok) throw new Error('Failed to load all_quizzes_combined_FIXED.json');
  cachedQuizzes = await res.json();
  return cachedQuizzes!;
}

export async function fetchMasterBank(): Promise<MasterQuestionBankData> {
  if (cachedMaster) return cachedMaster;
  const res = await fetch('/q_bank/ict_question_bank.json');
  if (!res.ok) throw new Error('Failed to load ict_question_bank.json');
  cachedMaster = await res.json();
  return cachedMaster!;
}
