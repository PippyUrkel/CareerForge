/**
 * Skills, ESCO/O*NET Occupations, Assessments, and Course Personalization Bridge Client API.
 */

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface SkillRequirement {
  skill_id: string;
  skill_name: string;
  importance: "essential" | "optional";
  benchmark_level: number;
  difficulty_target: string;
  recommended_questions: number;
  category: string;
}

export interface OccupationProfile {
  occupation_id: string;
  title: string;
  description: string;
  category: string;
  esco_code: string;
  onet_code: string;
  required_skills: SkillRequirement[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface ClientAssessmentQuestion {
  question_id: string;
  question_text: string;
  options: QuestionOption[];
  skill_id: string;
  skill_name: string;
  topic_id: string;
  difficulty: number;
  weight: number;
  source?: string;
  external_question_id?: string;
  source_attribution?: string;
}

export interface GeneratedAssessmentPayload {
  assessment_id: string;
  occupation_id: string;
  occupation_title: string;
  esco_code: string;
  onet_code: string;
  source_disclosure?: string;
  total_questions: number;
  skills_covered: {
    skill_id: string;
    skill_name: string;
    benchmark_level: number;
    importance: string;
  }[];
  questions: ClientAssessmentQuestion[];
}

export interface AssessmentAnswer {
  question_id: string;
  selected_option: string;
  time_spent_seconds?: number;
}

export interface AssessmentSubmission {
  assessment_id: string;
  user_id?: string | null;
  target_occupation_id: string;
  answers: AssessmentAnswer[];
}

export interface SkillScoreResult {
  skill_id: string;
  skill_name: string;
  category: string;
  score: number;
  confidence: number;
  level: string;
  classification: "STRONG" | "DEVELOPING" | "WEAK" | "INSUFFICIENT_EVIDENCE";
  status_label: string;
  evidence_count: number;
  difficulty_coverage: Record<string, number>;
  topic_coverage: string[];
  raw_evidence?: Record<string, any>;
}

export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  category: string;
  current_score: number;
  required_benchmark: number;
  gap: number;
  confidence: number;
  status: "matched" | "developing" | "critical_gap" | "insufficient_evidence";
  status_label: string;
  importance: string;
  market_demand: string;
}

export interface AssessmentResult {
  assessment_id: string;
  user_id?: string | null;
  target_occupation_id: string;
  target_occupation_title: string;
  overall_score: number;
  overall_confidence: number;
  overall_fit_percentage: number;
  skills: SkillScoreResult[];
  strong_skills: string[];
  developing_skills: string[];
  weak_skills: string[];
  insufficient_evidence_skills: string[];
  gaps: SkillGapItem[];
  created_at: string;
}

/**
 * Fetch supported occupations benchmark profiles.
 */
export async function fetchOccupations(): Promise<OccupationProfile[]> {
  const res = await fetch(`${BACKEND_URL}/api/skills/occupations`);
  if (!res.ok) {
    throw new Error(`Failed to load occupations (${res.status})`);
  }
  return await res.json();
}

/**
 * Fetch a specific occupation profile.
 */
export async function fetchOccupation(occupationId: string): Promise<OccupationProfile> {
  const res = await fetch(`${BACKEND_URL}/api/skills/occupations/${encodeURIComponent(occupationId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load occupation '${occupationId}'`);
  }
  return await res.json();
}

/**
 * Dynamically construct and register a new occupational benchmark profile for any custom role.
 */
export async function createDynamicOccupation(
  title: string,
  category?: string,
  experienceLevel?: string
): Promise<OccupationProfile> {
  const res = await fetch(`${BACKEND_URL}/api/skills/occupations/dynamic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      category: category || "Custom Engineering",
      experience_level: experienceLevel || "intermediate",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to create dynamic role (${res.status})`);
  }
  return await res.json();
}

/**
 * Dynamically scrape or synthesize role-specific assessment questions on the fly.
 */
export async function scrapeRoleQuestions(
  roleTitle: string,
  skillId: string,
  difficulty: number = 2,
  providerName: string = "Mercer Mettl",
  count: number = 2
): Promise<{ questions: any[]; count: number }> {
  const res = await fetch(`${BACKEND_URL}/api/skills/questions/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role_title: roleTitle,
      skill_id: skillId,
      difficulty,
      provider_name: providerName,
      count,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to scrape questions (${res.status})`);
  }
  return await res.json();
}

/**
 * Generate a randomized, multi-skill, multi-difficulty assessment.
 */
export async function generateAssessment(
  occupationId: string,
  provider: string = "all",
  questionsPerSkill: number = 2
): Promise<GeneratedAssessmentPayload> {
  const url = `${BACKEND_URL}/api/skills/assessment/generate?occupation_id=${encodeURIComponent(
    occupationId
  )}&provider=${encodeURIComponent(provider)}&questions_per_skill=${questionsPerSkill}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to generate assessment (${res.status})`);
  }
  return await res.json();
}

/**
 * Submit user assessment answers for deterministic scoring and confidence analysis.
 */
export async function submitAssessment(
  submission: AssessmentSubmission
): Promise<AssessmentResult> {
  const res = await fetch(`${BACKEND_URL}/api/skills/assessment/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to submit assessment (${res.status})`);
  }
  return await res.json();
}

/**
 * Translate a single skill gap into a personalized CourseGenerationRequest payload.
 */
export async function bridgeGapToCourse(
  skillGap: SkillGapItem,
  targetOccupationTitle: string,
  evaluatedSkills: SkillScoreResult[],
  modulesCount: number = 6
): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/skills/bridge-to-course/gap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_gap: skillGap,
      target_occupation_title: targetOccupationTitle,
      evaluated_skills: evaluatedSkills,
      modules_count: modulesCount,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to bridge skill gap to course payload");
  }
  return await res.json();
}

/**
 * Translate an entire assessment report into a multi-gap remedial curriculum payload.
 */
export async function bridgeComprehensiveToCourse(
  assessmentResult: AssessmentResult,
  modulesCount: number = 6
): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/skills/bridge-to-course/comprehensive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assessment_result: assessmentResult,
      modules_count: modulesCount,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to bridge comprehensive assessment to course payload");
  }
  return await res.json();
}
