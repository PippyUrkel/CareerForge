import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Progress,
  Container,
  Flex,
  Divider,
  ThemeIcon,
  Paper,
  Select,
  SimpleGrid,
  Radio,
  Alert,
  Loader,
  Card,
  UnstyledButton,
  Modal,
  TextInput,
} from '@mantine/core';
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconAlertCircle,
  IconSparkles,
  IconTarget,
  IconSchool,
  IconClock,
  IconDatabase,
  IconRefresh,
  IconHelpCircle,
  IconPlus,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchOccupations,
  generateAssessment,
  submitAssessment,
  bridgeGapToCourse,
  bridgeComprehensiveToCourse,
  createDynamicOccupation,
  scrapeRoleQuestions,
  type OccupationProfile,
  type GeneratedAssessmentPayload,
  type AssessmentResult,
  type SkillGapItem,
} from '../services/skills';
import { getUserLatestAssessment } from '../services/appwrite';

export default function SkillsGapAnalysisRoute() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Navigation / View state
  const [activeTab, setActiveTab] = useState<'matrix' | 'assessment'>('matrix');

  // Occupations & Benchmarks state
  const [occupations, setOccupations] = useState<OccupationProfile[]>([]);
  const [selectedOccupationId, setSelectedOccupationId] = useState<string>('backend_developer');
  const [isLoadingOccupations, setIsLoadingOccupations] = useState<boolean>(true);

  // Dynamic Custom Role Modal state
  const [customRoleModalOpen, setCustomRoleModalOpen] = useState<boolean>(false);
  const [customRoleTitle, setCustomRoleTitle] = useState<string>('');
  const [customRoleCategory, setCustomRoleCategory] = useState<string>('Software Engineering');
  const [customRoleLevel, setCustomRoleLevel] = useState<string>('intermediate');
  const [isCreatingRole, setIsCreatingRole] = useState<boolean>(false);

  // Assessment Question Provider Selection (Commercial Multi-Source Scraper)
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [isScrapingFresh, setIsScrapingFresh] = useState<boolean>(false);

  // Assessment Quiz runner state
  const [assessmentData, setAssessmentData] = useState<GeneratedAssessmentPayload | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState<boolean>(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Evaluated Assessment & Gap Analysis state
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState<boolean>(false);

  // 1. Load Occupations Catalog on Mount
  useEffect(() => {
    async function loadOccupations() {
      try {
        setIsLoadingOccupations(true);
        const data = await fetchOccupations();
        setOccupations(data);
        if (data.length > 0) {
          // If user profile has targetRole, match it
          const matchingOcc = data.find(
            (o) =>
              profile?.targetRole &&
              (o.title.toLowerCase().includes(profile.targetRole.toLowerCase()) ||
                profile.targetRole.toLowerCase().includes(o.title.toLowerCase()))
          );
          setSelectedOccupationId(matchingOcc ? matchingOcc.occupation_id : data[0].occupation_id);
        }
      } catch (err) {
        console.error('Failed to load occupations:', err);
      } finally {
        setIsLoadingOccupations(false);
      }
    }
    loadOccupations();
  }, [profile?.targetRole]);

  // 2. Load User's Latest Assessment from Appwrite on mount / auth change
  useEffect(() => {
    async function loadLatestUserAssessment() {
      if (!user) return;
      try {
        setIsLoadingResult(true);
        const latestDoc = await getUserLatestAssessment(user.$id);
        if (latestDoc) {
          try {
            const skillsList = typeof latestDoc.skillsSummary === 'string'
              ? JSON.parse(latestDoc.skillsSummary || '[]')
              : (latestDoc.skillsSummary || []);
            const gapList = typeof latestDoc.gapAnalysis === 'string'
              ? JSON.parse(latestDoc.gapAnalysis || '[]')
              : (latestDoc.gapAnalysis || []);

            const matched = gapList.filter((g: any) => g.status === 'matched').length;
            const fitCalc = gapList.length > 0 ? (matched / gapList.length) * 100 : 75.0;

            const res: AssessmentResult = {
              assessment_id: latestDoc.assessmentId,
              user_id: latestDoc.userId,
              target_occupation_id: selectedOccupationId,
              target_occupation_title: latestDoc.targetOccupation,
              overall_score: parseFloat(latestDoc.overallScore) || 0,
              overall_confidence: parseFloat(latestDoc.overallConfidence) || 0,
              overall_fit_percentage: Number(fitCalc.toFixed(1)),
              skills: skillsList,
              strong_skills: skillsList.filter((s: any) => s.classification === 'STRONG').map((s: any) => s.skill_name),
              developing_skills: skillsList.filter((s: any) => s.classification === 'DEVELOPING').map((s: any) => s.skill_name),
              weak_skills: skillsList.filter((s: any) => s.classification === 'WEAK').map((s: any) => s.skill_name),
              insufficient_evidence_skills: skillsList.filter((s: any) => s.classification === 'INSUFFICIENT_EVIDENCE').map((s: any) => s.skill_name),
              gaps: gapList,
              created_at: latestDoc.createdAt || latestDoc.$createdAt,
            };
            setAssessmentResult(res);

            // Synchronize selected occupation if matching occupation is found
            if (occupations.length > 0 && latestDoc.targetOccupation) {
              const matchedOcc = occupations.find(
                (o) => o.title.toLowerCase() === latestDoc.targetOccupation.toLowerCase()
              );
              if (matchedOcc && matchedOcc.occupation_id !== selectedOccupationId) {
                setSelectedOccupationId(matchedOcc.occupation_id);
              }
            }
          } catch (e) {
            console.warn('Could not parse stored assessment:', e);
          }
        }
      } catch (err) {
        console.warn('Failed to load user assessment from Appwrite:', err);
      } finally {
        setIsLoadingResult(false);
      }
    }
    loadLatestUserAssessment();
  }, [user, occupations.length]);

  const activeOccupation = useMemo(() => {
    return occupations.find((o) => o.occupation_id === selectedOccupationId) || occupations[0];
  }, [occupations, selectedOccupationId]);

  // Provider branding styling helper
  const getProviderBadgeProps = (source?: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('mettl')) return { color: 'grape', label: 'Mercer Mettl', variant: 'filled' as const };
    if (s.includes('gorilla')) return { color: 'orange', label: 'TestGorilla', variant: 'filled' as const };
    if (s.includes('hacker')) return { color: 'teal', label: 'HackerRank', variant: 'filled' as const };
    if (s.includes('signal')) return { color: 'blue', label: 'CodeSignal', variant: 'filled' as const };
    if (s.includes('shl')) return { color: 'cyan', label: 'SHL', variant: 'filled' as const };
    return { color: 'forest', label: source || 'Item Bank', variant: 'filled' as const };
  };

  // Create on-the-fly custom role benchmark
  const handleCreateCustomRole = async () => {
    if (!customRoleTitle.trim()) return;
    try {
      setIsCreatingRole(true);
      const newRole = await createDynamicOccupation(
        customRoleTitle.trim(),
        customRoleCategory,
        customRoleLevel
      );
      setOccupations((prev) => [newRole, ...prev.filter((o) => o.occupation_id !== newRole.occupation_id)]);
      setSelectedOccupationId(newRole.occupation_id);
      setCustomRoleModalOpen(false);
      setCustomRoleTitle('');
    } catch (err: any) {
      console.error('Failed to create custom role:', err);
      setSubmitError(err?.message || 'Failed to benchmark custom role');
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Launch Assessment Runner
  const handleStartAssessment = async () => {
    try {
      setIsGeneratingAssessment(true);
      setSubmitError(null);
      const generated = await generateAssessment(selectedOccupationId, selectedProvider, 2);
      setAssessmentData(generated);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setActiveTab('assessment');
    } catch (err: any) {
      console.error('Failed to generate assessment:', err);
      setSubmitError(err?.message || 'Failed to initialize assessment. Verify backend is running.');
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  // Answer selection in assessment
  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Submit Assessment
  const handleSubmitAssessment = async () => {
    if (!assessmentData) return;
    try {
      setIsSubmittingAssessment(true);
      setSubmitError(null);

      const answersPayload = assessmentData.questions.map((q) => ({
        question_id: q.question_id,
        selected_option: userAnswers[q.question_id] || 'a',
        time_spent_seconds: 15.0,
      }));

      const submission = {
        assessment_id: assessmentData.assessment_id,
        user_id: user?.$id || null,
        target_occupation_id: selectedOccupationId,
        answers: answersPayload,
      };

      const result = await submitAssessment(submission);
      setAssessmentResult(result);
      setActiveTab('matrix');
    } catch (err: any) {
      console.error('Failed to submit assessment:', err);
      setSubmitError(err?.message || 'Failed to score assessment.');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // Synthesize Course for a Single Skill Gap (Bridge Requirement)
  const handleSynthesizeCourseForGap = async (gap: SkillGapItem) => {
    if (!assessmentResult) return;
    try {
      const payload = await bridgeGapToCourse(
        gap,
        assessmentResult.target_occupation_title,
        assessmentResult.skills,
        6
      );

      // Navigate to Course Studio with pre-filled state
      const searchParams = new URLSearchParams({
        topic: payload.topic,
        title: payload.course_title,
        difficulty: payload.difficulty,
        target_audience: payload.target_audience,
      });
      navigate(`/generator?${searchParams.toString()}`);
    } catch (err) {
      console.error('Failed to bridge gap to course:', err);
      navigate(`/generator?topic=${encodeURIComponent(gap.skill_name)}&title=${encodeURIComponent(`Mastering ${gap.skill_name}`)}`);
    }
  };

  // Synthesize Multi-Gap Remedial Accelerator Course
  const handleSynthesizeComprehensiveCourse = async () => {
    if (!assessmentResult) return;
    try {
      const payload = await bridgeComprehensiveToCourse(assessmentResult, 6);
      const searchParams = new URLSearchParams({
        topic: payload.topic,
        title: payload.course_title,
        difficulty: payload.difficulty,
        target_audience: payload.target_audience,
      });
      navigate(`/generator?${searchParams.toString()}`);
    } catch (err) {
      console.error('Failed to bridge comprehensive course:', err);
      navigate(`/generator?topic=${encodeURIComponent(activeOccupation?.title || 'Remedial Curriculum')}`);
    }
  };

  // Derived metrics for UI
  const gapsList: SkillGapItem[] = assessmentResult?.gaps || [];
  const matchedCount = gapsList.filter((g) => g.status === 'matched').length;
  const developingCount = gapsList.filter((g) => g.status === 'developing').length;
  const criticalGapCount = gapsList.filter((g) => g.status === 'critical_gap' || g.status === 'insufficient_evidence').length;
  const fitPercent = assessmentResult ? assessmentResult.overall_fit_percentage : 0;

  const currentQuestion = assessmentData?.questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = assessmentData?.questions.length || 0;

  return (
    <Box bg="var(--cf-bg)" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PlatformHeader />

      <Container size="xl" py="xl" style={{ flex: 1, width: '100%' }}>
        <Stack gap="lg">
          {/* Header Bar */}
          <Paper p="lg" shadow="xs" radius="sm" withBorder style={{ backgroundColor: 'white' }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              gap="md"
            >
              <div>
                <Group gap="xs">
                  <ThemeIcon size={26} radius="sm" color="forest" variant="filled">
                    <IconTarget size={16} />
                  </ThemeIcon>
                  <Title order={2} size="h3" fw={800} c="var(--cf-text)">
                    AI Competency Benchmark & Skill Gap Matrix
                  </Title>
                </Group>
                <Text size="xs" c="dimmed" mt={4} maw={680}>
                  Calibrated against <strong>ESCO v1.2</strong> and <strong>O*NET SOC</strong> occupational taxonomy standards.
                  Deterministic scoring and evidence-based confidence evaluation.
                </Text>
              </div>

              {activeTab === 'matrix' && (
                <Group gap="xs" align="flex-end" wrap="wrap">
                  <Select
                    label="Occupation Benchmark"
                    value={selectedOccupationId}
                    onChange={(val) => {
                      if (val) setSelectedOccupationId(val);
                    }}
                    data={occupations.map((o) => ({
                      value: o.occupation_id,
                      label: `${o.title} (${o.category})`,
                    }))}
                    size="xs"
                    radius="sm"
                    searchable
                    styles={{
                      label: { textTransform: 'uppercase', fontWeight: 700, fontSize: '10px', marginBottom: 2 },
                      input: { fontWeight: 600, minWidth: 240 },
                    }}
                    disabled={isLoadingOccupations || isGeneratingAssessment}
                  />

                  <Button
                    variant="light"
                    color="forest"
                    size="xs"
                    radius="sm"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => setCustomRoleModalOpen(true)}
                    disabled={isGeneratingAssessment}
                    title="Benchmark any custom role on the fly"
                  >
                    + Custom Role
                  </Button>

                  <Select
                    label="Question Source Provider"
                    value={selectedProvider}
                    onChange={(val) => {
                      if (val) setSelectedProvider(val);
                    }}
                    data={[
                      { value: 'all', label: 'All Commercial Sources (Blend)' },
                      { value: 'mettl', label: 'Mercer Mettl (Enterprise)' },
                      { value: 'testgorilla', label: 'TestGorilla (Practical)' },
                      { value: 'hackerrank', label: 'HackerRank (Algorithms)' },
                      { value: 'codesignal', label: 'CodeSignal (Diagnostics)' },
                      { value: 'shl', label: 'SHL (Deductive Systems)' },
                    ]}
                    size="xs"
                    radius="sm"
                    styles={{
                      label: { textTransform: 'uppercase', fontWeight: 700, fontSize: '10px', marginBottom: 2 },
                      input: { fontWeight: 600, minWidth: 200 },
                    }}
                    disabled={isLoadingOccupations || isGeneratingAssessment}
                  />

                  <Button
                    color="forest"
                    size="xs"
                    radius="sm"
                    leftSection={<IconSchool size={14} />}
                    onClick={handleStartAssessment}
                    loading={isGeneratingAssessment}
                  >
                    {assessmentResult ? 'Re-assess Competency' : 'Take Skill Assessment'}
                  </Button>
                </Group>
              )}
            </Flex>
          </Paper>

          {/* Custom Role Benchmark Modal */}
          <Modal
            opened={customRoleModalOpen}
            onClose={() => setCustomRoleModalOpen(false)}
            title={<Text fw={700}>Benchmark Custom Role On-the-Fly</Text>}
            radius="sm"
            centered
          >
            <Stack gap="md">
              <Text size="xs" c="dimmed">
                Enter any target role title. CareerForge will dynamically generate the required competency profile,
                calibrated target benchmarks (0-100), ESCO qualification mapping, and commercial assessment batteries on the fly.
              </Text>

              <TextInput
                label="Target Role Title"
                placeholder="e.g. AI Prompt Engineer, Site Reliability Architect, Flutter Lead"
                value={customRoleTitle}
                onChange={(e) => setCustomRoleTitle(e.currentTarget.value)}
                required
                size="sm"
                styles={{ label: { fontWeight: 600, fontSize: '12px' } }}
              />

              <Select
                label="Domain Category"
                value={customRoleCategory}
                onChange={(val) => val && setCustomRoleCategory(val)}
                data={[
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'Frontend Architecture', label: 'Frontend Architecture' },
                  { value: 'Cloud & DevOps', label: 'Cloud & DevOps' },
                  { value: 'Data Engineering', label: 'Data Engineering' },
                  { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
                  { value: 'Security & Compliance', label: 'Security & Compliance' },
                  { value: 'Mobile Engineering', label: 'Mobile Engineering' },
                ]}
                size="sm"
                styles={{ label: { fontWeight: 600, fontSize: '12px' } }}
              />

              <Select
                label="Target Seniority Level"
                value={customRoleLevel}
                onChange={(val) => val && setCustomRoleLevel(val)}
                data={[
                  { value: 'junior', label: 'Junior / Entry-Level (Benchmark ~65%)' },
                  { value: 'intermediate', label: 'Mid-Level (Benchmark ~75%)' },
                  { value: 'senior', label: 'Senior / Staff / Lead (Benchmark ~85%)' },
                ]}
                size="sm"
                styles={{ label: { fontWeight: 600, fontSize: '12px' } }}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="default" size="xs" onClick={() => setCustomRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  color="forest"
                  size="xs"
                  loading={isCreatingRole}
                  disabled={!customRoleTitle.trim()}
                  onClick={handleCreateCustomRole}
                >
                  Benchmark Role
                </Button>
              </Group>
            </Stack>
          </Modal>

          {submitError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="sm" withCloseButton onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              VIEW 1: INTERACTIVE ASSESSMENT QUIZ RUNNER
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'assessment' && currentQuestion && (
            <Paper p="xl" shadow="sm" radius="sm" withBorder style={{ backgroundColor: 'white' }}>
              <Stack gap="lg">
                {/* Commercial Question Bank Provenance & Attribution Disclosure */}
                <Alert
                  icon={<IconHelpCircle size={18} />}
                  title="Commercial Assessment Provenance & Disclosure"
                  color="forest"
                  variant="light"
                  radius="sm"
                  styles={{
                    title: { fontWeight: 700, fontSize: '13px' },
                    message: { fontSize: '12px', lineHeight: 1.5 },
                  }}
                >
                  <Stack gap="xs">
                    <Text size="12px">
                      {assessmentData?.source_disclosure ||
                        `Questions are dynamically selected from commercial assessment item batteries across Mercer Mettl, TestGorilla, HackerRank, CodeSignal, and SHL, calibrated directly to European Commission ESCO v1.2 (code: ${activeOccupation?.esco_code}) and US Dept of Labor O*NET SOC (code: ${activeOccupation?.onet_code}) frameworks. Questions evaluate verified technical competencies across progressive difficulty tiers with deterministic scoring.`}
                    </Text>
                    <Group gap={6} wrap="wrap">
                      <Badge color="grape" variant="filled" size="xs">Mercer Mettl (Scenarios)</Badge>
                      <Badge color="orange" variant="filled" size="xs">TestGorilla (Practical Tests)</Badge>
                      <Badge color="teal" variant="filled" size="xs">HackerRank (Algorithms / Big-O)</Badge>
                      <Badge color="blue" variant="filled" size="xs">CodeSignal (Diagnostics)</Badge>
                      <Badge color="cyan" variant="filled" size="xs">SHL (Deductive Systems)</Badge>
                    </Group>
                  </Stack>
                </Alert>

                {/* Quiz Header & Progress */}
                <Flex justify="space-between" align="center" wrap="wrap" gap="sm">
                  <div>
                    <Group gap="xs" wrap="wrap">
                      <Badge color="forest" variant="light" size="sm" radius="sm">
                        {activeOccupation?.title || 'Technical Assessment'}
                      </Badge>
                      <Badge variant="outline" color="gray" size="sm" radius="sm">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </Badge>
                      <Badge
                        color={currentQuestion.difficulty === 3 ? 'violet' : currentQuestion.difficulty === 2 ? 'orange' : 'teal'}
                        variant="light"
                        size="sm"
                        radius="sm"
                      >
                        {currentQuestion.difficulty === 3 ? 'Advanced (2.0x weight)' : currentQuestion.difficulty === 2 ? 'Intermediate (1.5x weight)' : 'Beginner (1.0x weight)'}
                      </Badge>
                      {/* Branded Commercial Provider Badge */}
                      <Badge
                        color={getProviderBadgeProps(currentQuestion.source).color}
                        variant={getProviderBadgeProps(currentQuestion.source).variant}
                        size="sm"
                        radius="sm"
                        style={{ fontWeight: 700 }}
                      >
                        Platform: {getProviderBadgeProps(currentQuestion.source).label}
                      </Badge>
                      <Badge variant="subtle" color="gray" size="xs" radius="sm">
                        {currentQuestion.source_attribution || `Calibrated to ESCO ${assessmentData?.esco_code} & O*NET ${assessmentData?.onet_code}`}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mt={4}>
                      Skill: <strong>{currentQuestion.skill_name}</strong> · Topic: <code>{currentQuestion.topic_id}</code>
                    </Text>
                  </div>

                  <Group gap="xs">
                    <Button
                      variant="light"
                      color="forest"
                      size="xs"
                      radius="sm"
                      leftSection={<IconSparkles size={14} />}
                      loading={isScrapingFresh}
                      onClick={async () => {
                        try {
                          setIsScrapingFresh(true);
                          const res = await scrapeRoleQuestions(
                            activeOccupation?.title || 'Engineer',
                            currentQuestion.skill_id,
                            currentQuestion.difficulty,
                            currentQuestion.source || 'Mercer Mettl',
                            1
                          );
                          if (res.questions && res.questions.length > 0) {
                            const freshQ = res.questions[0];
                            setAssessmentData((prev) => {
                              if (!prev) return null;
                              const updatedQs = [...prev.questions];
                              updatedQs[currentQuestionIndex] = freshQ;
                              return { ...prev, questions: updatedQs };
                            });
                          }
                        } catch (e: any) {
                          console.warn('Scraping error:', e);
                        } finally {
                          setIsScrapingFresh(false);
                        }
                      }}
                      title="Scrape and synthesize an authentic fresh question on the fly for this skill"
                    >
                      Live Scrape Fresh Item
                    </Button>

                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      radius="sm"
                      onClick={() => setActiveTab('matrix')}
                    >
                      Cancel Assessment
                    </Button>
                  </Group>
                </Flex>

                <Progress
                  value={((currentQuestionIndex + 1) / totalQuestions) * 100}
                  color="forest"
                  size="sm"
                  radius="xl"
                />

                {/* Question Text */}
                <Box
                  p="lg"
                  radius="sm"
                  style={{
                    backgroundColor: 'var(--cf-surface)',
                    border: '1px solid var(--cf-border)',
                  }}
                >
                  <Text fw={700} size="md" c="var(--cf-text)" lh={1.6}>
                    {currentQuestion.question_text}
                  </Text>
                  <Group justify="space-between" align="center" mt="sm" pt="xs" style={{ borderTop: '1px dashed var(--cf-border)' }}>
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        color={getProviderBadgeProps(currentQuestion.source).color}
                        variant="filled"
                      >
                        {getProviderBadgeProps(currentQuestion.source).label}
                      </Badge>
                      {currentQuestion.external_question_id && (
                        <Badge size="xs" variant="outline" color="gray">
                          Item: {currentQuestion.external_question_id}
                        </Badge>
                      )}
                      <Text size="11px" c="dimmed">
                        <strong>Source Battery:</strong> {currentQuestion.source_attribution || `${currentQuestion.source} Question Battery`} · Skill: <strong>{currentQuestion.skill_name}</strong>
                      </Text>
                    </Group>
                    <Text size="11px" c="dimmed">
                      Calibration: <strong>ESCO v1.2</strong> / <strong>O*NET SOC</strong>
                    </Text>
                  </Group>
                </Box>

                {/* Options List */}
                <Stack gap="sm">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = userAnswers[currentQuestion.question_id] === opt.id;
                    return (
                      <UnstyledButton
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.question_id, opt.id)}
                        p="md"
                        style={{
                          borderRadius: 6,
                          border: isSelected ? '2px solid #1b4d3e' : '1px solid var(--cf-border)',
                          backgroundColor: isSelected ? '#e8f5f0' : 'white',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <Box
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #1b4d3e' : '1px solid #ced4da',
                            backgroundColor: isSelected ? '#1b4d3e' : 'transparent',
                            color: isSelected ? 'white' : '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {opt.id}
                        </Box>
                        <Text size="sm" fw={isSelected ? 600 : 400} c="var(--cf-text)">
                          {opt.text}
                        </Text>
                      </UnstyledButton>
                    );
                  })}
                </Stack>

                {/* Navigation Chips */}
                <Divider my="xs" />
                <Group justify="space-between" align="center">
                  <Group gap={6}>
                    {assessmentData?.questions.map((q, idx) => {
                      const isAnswered = Boolean(userAnswers[q.question_id]);
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <Box
                          key={q.question_id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: isCurrent ? '#1b4d3e' : isAnswered ? '#c5e4d8' : '#e9ecef',
                            color: isCurrent ? 'white' : '#212529',
                          }}
                        >
                          {idx + 1}
                        </Box>
                      );
                    })}
                  </Group>

                  <Group gap="xs">
                    <Button
                      variant="default"
                      size="xs"
                      radius="sm"
                      leftSection={<IconArrowLeft size={14} />}
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    >
                      Previous
                    </Button>

                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <Button
                        color="forest"
                        size="xs"
                        radius="sm"
                        rightSection={<IconArrowRight size={14} />}
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        color="forest"
                        size="xs"
                        radius="sm"
                        leftSection={<IconCheck size={14} />}
                        loading={isSubmittingAssessment}
                        onClick={handleSubmitAssessment}
                      >
                        Submit & Evaluate ({answeredCount}/{totalQuestions})
                      </Button>
                    )}
                  </Group>
                </Group>
              </Stack>
            </Paper>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              VIEW 2: COMPETENCY METRIC CARDS & DETAILED MATRIX TABLE
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'matrix' && (
            <>
              {/* Saved Evaluation Active Status Banner */}
              {assessmentResult && (
                <Paper
                  p="md"
                  px="lg"
                  radius="sm"
                  withBorder
                  style={{
                    backgroundColor: '#ffffff',
                    borderLeft: '4px solid #1b4d3e',
                    boxShadow: 'var(--mantine-shadow-xs)',
                  }}
                >
                  <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap="md">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Badge color="forest" variant="light" size="sm" radius="sm">
                          Saved Evaluation Active
                        </Badge>
                        <Text size="sm" fw={700} c="var(--cf-text)">
                          Target Role: {assessmentResult.target_occupation_title}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Persisted in Appwrite · Overall Fit: <strong>{fitPercent.toFixed(0)}%</strong> ({matchedCount} verified proficiencies, {criticalGapCount} skill gaps, confidence: {(assessmentResult.overall_confidence * 100).toFixed(0)}%).
                      </Text>
                    </Stack>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        color="forest"
                        radius="sm"
                        leftSection={<IconRefresh size={14} />}
                        loading={isGeneratingAssessment}
                        onClick={handleStartAssessment}
                      >
                        Retake Assessment
                      </Button>
                    </Group>
                  </Flex>
                </Paper>
              )}

              {/* Unassessed Banner if no results yet */}
              {!assessmentResult && !isLoadingResult && (
                <Paper
                  p="lg"
                  radius="sm"
                  style={{
                    backgroundColor: '#e8f5f0',
                    border: '1px solid #c5e4d8',
                  }}
                >
                  <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap="md">
                    <Group gap="md">
                      <ThemeIcon size={36} radius="sm" color="forest" variant="filled">
                        <IconSparkles size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} size="sm" c="#1b4d3e">
                          No Active Assessment Profile Found
                        </Text>
                        <Text size="xs" c="dimmed">
                          Take a rapid 5-minute technical assessment to determine your verified competency baseline,
                          evidence confidence, and personalized ESCO/O*NET skill gap matrix.
                        </Text>
                      </div>
                    </Group>
                    <Button
                      color="forest"
                      size="sm"
                      radius="sm"
                      leftSection={<IconSchool size={16} />}
                      onClick={handleStartAssessment}
                      loading={isGeneratingAssessment}
                    >
                      Launch Diagnostic
                    </Button>
                  </Flex>
                </Paper>
              )}

              {/* Competency Overview Metric Cards */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <Paper p="md" shadow="xs" radius="sm" withBorder style={{ backgroundColor: 'white' }}>
                  <Stack gap="xs">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                      Role Alignment Fit
                    </Text>
                    <Group align="baseline" gap="xs">
                      <Title order={2} style={{ color: '#1b4d3e' }}>
                        {fitPercent.toFixed(0)}%
                      </Title>
                      <Text size="xs" c={fitPercent >= 70 ? 'teal' : 'orange'} fw={700}>
                        {fitPercent >= 70 ? 'Industry Qualified' : 'Bridge Required'}
                      </Text>
                    </Group>
                    <Progress value={fitPercent} color="forest" size="xs" radius="sm" mt="xs" />
                  </Stack>
                </Paper>

                <Paper p="md" shadow="xs" radius="sm" withBorder style={{ backgroundColor: 'white' }}>
                  <Stack gap="xs">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                      Verified Proficiencies
                    </Text>
                    <Group align="baseline" gap="xs">
                      <Title order={2} c="teal">
                        {matchedCount}
                      </Title>
                      <Text size="xs" c="dimmed">
                        of {gapsList.length || activeOccupation?.required_skills.length || 0} skills
                      </Text>
                    </Group>
                    <Text size="11px" c="teal" fw={700} tt="uppercase">
                      Confidence ≥ 0.70 & Score ≥ 75%
                    </Text>
                  </Stack>
                </Paper>

                <Paper p="md" shadow="xs" radius="sm" withBorder style={{ backgroundColor: 'white' }}>
                  <Stack gap="xs">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                      Developing Competencies
                    </Text>
                    <Group align="baseline" gap="xs">
                      <Title order={2} c="yellow.7">
                        {developingCount}
                      </Title>
                      <Text size="xs" c="dimmed">
                        in progress
                      </Text>
                    </Group>
                    <Text size="11px" c="yellow.7" fw={700} tt="uppercase">
                      Moderate gap (≤ 25%)
                    </Text>
                  </Stack>
                </Paper>

                <Paper p="md" shadow="xs" radius="sm" withBorder style={{ backgroundColor: 'white' }}>
                  <Stack gap="xs">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                      Critical Skill Gaps
                    </Text>
                    <Group align="baseline" gap="xs">
                      <Title order={2} c="red">
                        {criticalGapCount}
                      </Title>
                      <Text size="xs" c="dimmed">
                        unacquired / unverified
                      </Text>
                    </Group>
                    <Text size="11px" c="red" fw={700} tt="uppercase">
                      High priority for role
                    </Text>
                  </Stack>
                </Paper>
              </SimpleGrid>

              {/* Multi-Gap Remedial Bridge Banner if critical gaps exist */}
              {criticalGapCount > 0 && assessmentResult && (
                <Paper
                  p="md"
                  px="lg"
                  radius="sm"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #1b4d3e',
                    boxShadow: 'var(--mantine-shadow-xs)',
                  }}
                >
                  <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap="md">
                    <div>
                      <Group gap="xs">
                        <Badge color="forest" size="xs">
                          Curriculum Accelerator
                        </Badge>
                        <Text size="xs" fw={700} c="var(--cf-text)">
                          Targeted Remedial Curriculum Available
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" mt={2}>
                        CareerForge can assemble a unified multi-module course directly bridging all {criticalGapCount} identified
                        skill gaps for <strong>{assessmentResult.target_occupation_title}</strong>.
                      </Text>
                    </div>

                    <Button
                      color="forest"
                      size="xs"
                      radius="sm"
                      rightSection={<IconArrowRight size={14} />}
                      onClick={handleSynthesizeComprehensiveCourse}
                    >
                      Synthesize Role Accelerator Course
                    </Button>
                  </Flex>
                </Paper>
              )}

              {/* Detailed Competency Matrix Table */}
              <Paper shadow="xs" radius="sm" withBorder style={{ overflow: 'hidden', backgroundColor: 'white' }}>
                <Box p="md" style={{ borderBottom: '1px solid var(--cf-border)' }}>
                  <Flex justify="space-between" align="center">
                    <div>
                      <Title order={3} size="h5" tt="uppercase" fw={700} c="var(--cf-text)">
                        Competency Delta & Evidence Matrix
                      </Title>
                      <Text size="xs" c="dimmed" mt={2}>
                        Current proficiency vs target benchmark for{' '}
                        <strong>{activeOccupation?.title || 'Selected Role'}</strong>.
                        Classifications consider evidence confidence to separate verified gaps from unassessed skills.
                      </Text>
                    </div>
                    <Badge variant="light" color="gray" radius="sm">
                      {gapsList.length || activeOccupation?.required_skills.length || 0} Competencies
                    </Badge>
                  </Flex>
                </Box>

                <Stack gap={0}>
                  {gapsList.length > 0 ? (
                    gapsList.map((item, index) => {
                      const isMatched = item.status === 'matched';
                      const isDeveloping = item.status === 'developing';
                      const isCritical = item.status === 'critical_gap';
                      const isInsufficient = item.status === 'insufficient_evidence';

                      const statusColor = isMatched
                        ? 'teal'
                        : isDeveloping
                        ? 'yellow'
                        : isCritical
                        ? 'red'
                        : 'gray';

                      return (
                        <Box
                          key={item.skill_id}
                          p="md"
                          style={{
                            borderBottom: index < gapsList.length - 1 ? '1px solid var(--cf-border)' : 'none',
                            backgroundColor: 'white',
                          }}
                        >
                          <Flex
                            direction={{ base: 'column', md: 'row' }}
                            align={{ base: 'stretch', md: 'center' }}
                            justify="space-between"
                            gap="md"
                          >
                            <Stack gap="xs" style={{ flex: 1 }}>
                              <Group gap="xs" wrap="wrap">
                                <Text size="sm" fw={700} tt="uppercase" c="var(--cf-text)">
                                  {item.skill_name}
                                </Text>
                                <Badge variant="outline" color="gray" radius="sm" size="xs">
                                  {item.category}
                                </Badge>
                                <Badge variant="light" color={statusColor} radius="sm" size="xs">
                                  {isMatched
                                    ? 'Verified'
                                    : isDeveloping
                                    ? 'Developing'
                                    : isCritical
                                    ? 'Critical Gap'
                                    : 'Insufficient Evidence'}
                                </Badge>
                                <Badge
                                  variant="subtle"
                                  color={item.confidence >= 0.7 ? 'teal' : item.confidence >= 0.5 ? 'blue' : 'gray'}
                                  size="xs"
                                >
                                  Confidence: {(item.confidence * 100).toFixed(0)}%
                                </Badge>
                              </Group>

                              <Box w="100%" maw={420}>
                                <Group justify="space-between" mb={4}>
                                  <Text size="xs" c="dimmed">
                                    Current:{' '}
                                    <Text span fw={700} c="var(--cf-text)">
                                      {item.current_score.toFixed(0)}%
                                    </Text>
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    Target Benchmark:{' '}
                                    <Text span fw={700} c="var(--cf-text)">
                                      {item.required_benchmark}%
                                    </Text>
                                  </Text>
                                </Group>
                                <Progress
                                  value={item.current_score}
                                  color={statusColor}
                                  size="sm"
                                  radius="sm"
                                />
                              </Box>
                            </Stack>

                            <Group gap="xl" wrap="nowrap">
                              <Box display={{ base: 'none', lg: 'block' }} ta="right">
                                <Text size="10px" fw={700} tt="uppercase" c="dimmed">
                                  Market Demand
                                </Text>
                                <Text size="xs" fw={700} c="var(--cf-text)">
                                  {item.market_demand}
                                </Text>
                              </Box>

                              {!isMatched ? (
                                <Button
                                  rightSection={<IconArrowRight size={14} />}
                                  color="forest"
                                  radius="sm"
                                  size="xs"
                                  onClick={() => handleSynthesizeCourseForGap(item)}
                                >
                                  Synthesize Course
                                </Button>
                              ) : (
                                <Badge variant="light" color="teal" radius="sm" size="md">
                                  Competency Verified
                                </Badge>
                              )}
                            </Group>
                          </Flex>
                        </Box>
                      );
                    })
                  ) : (
                    // Default view if no assessment taken yet
                    activeOccupation?.required_skills.map((req, index) => (
                      <Box
                        key={req.skill_id}
                        p="md"
                        style={{
                          borderBottom:
                            index < (activeOccupation?.required_skills.length || 0) - 1
                              ? '1px solid var(--cf-border)'
                              : 'none',
                          backgroundColor: 'white',
                        }}
                      >
                        <Flex
                          direction={{ base: 'column', md: 'row' }}
                          align={{ base: 'stretch', md: 'center' }}
                          justify="space-between"
                          gap="md"
                        >
                          <Stack gap="xs" style={{ flex: 1 }}>
                            <Group gap="xs">
                              <Text size="sm" fw={700} tt="uppercase" c="var(--cf-text)">
                                {req.skill_name}
                              </Text>
                              <Badge variant="outline" color="gray" radius="sm" size="xs">
                                {req.category}
                              </Badge>
                              <Badge variant="light" color="gray" radius="sm" size="xs">
                                Unassessed
                              </Badge>
                            </Group>

                            <Box w="100%" maw={420}>
                              <Group justify="space-between" mb={4}>
                                <Text size="xs" c="dimmed">
                                  Target Benchmark:{' '}
                                  <Text span fw={700} c="var(--cf-text)">
                                    {req.benchmark_level}%
                                  </Text>
                                </Text>
                              </Group>
                              <Progress value={0} color="gray" size="sm" radius="sm" />
                            </Box>
                          </Stack>

                          <Button
                            variant="light"
                            color="forest"
                            radius="sm"
                            size="xs"
                            leftSection={<IconSchool size={14} />}
                            onClick={handleStartAssessment}
                          >
                            Assess Skill
                          </Button>
                        </Flex>
                      </Box>
                    ))
                  )}
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
