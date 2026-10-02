import React, { useState } from "react";
import {
  Modal,
  TextInput,
  Select,
  Textarea,
  Button,
  Stack,
  Text,
  Group,
  Badge,
  FileInput,
  Progress,
  Paper,
  Box,
  SimpleGrid,
  ThemeIcon,
  TagsInput,
} from "@mantine/core";
import {
  IconTarget,
  IconBriefcase,
  IconSchool,
  IconFileText,
  IconSparkles,
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const CAREER_SUGGESTIONS = [
  "Software & Web Engineering",
  "Artificial Intelligence & Machine Learning",
  "Cloud Architecture & DevOps",
  "Data Science & Analytics",
  "Distributed Systems & Backend",
  "Cybersecurity & Infrastructure",
];

const POPULAR_SKILLS = [
  "Python",
  "TypeScript",
  "React",
  "Docker",
  "Kubernetes",
  "SQL",
  "FastAPI",
  "PyTorch",
  "Machine Learning",
  "AWS",
  "System Design",
  "Node.js",
];

export function OnboardingModal() {
  const {
    user,
    profile,
    isOnboardingModalOpen,
    closeOnboardingModal,
    completeOnboarding,
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [targetRole, setTargetRole] = useState(profile?.targetRole || "");
  const [targetCareer, setTargetCareer] = useState(profile?.targetCareer || "Software & Web Engineering");
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || "intermediate");
  const [primaryGoals, setPrimaryGoals] = useState(profile?.primaryGoals || "");
  const [skills, setSkills] = useState<string[]>(
    profile?.strongSkills ? (() => { try { return JSON.parse(profile.strongSkills); } catch { return []; } })() : ["Python", "React"]
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;
  const progressPercent = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        targetRole: targetRole.trim() || "Full Stack Engineer",
        targetCareer,
        experienceLevel,
        strongSkills: skills,
        primaryGoals: primaryGoals.trim(),
        resumeFile: resumeFile || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={isOnboardingModalOpen}
      onClose={closeOnboardingModal}
      size="lg"
      radius="md"
      centered
      closeOnClickOutside={false}
      withCloseButton={false}
      title={
        <Group justify="space-between" w="100%" pr="md">
          <Group gap="xs">
            <ThemeIcon size={28} radius="sm" color="forest" variant="light">
              <IconSparkles size={16} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="sm" c="var(--cf-text)">
                Welcome to CareerForge Onboarding
              </Text>
              <Text size="xs" c="dimmed">
                Phase 1 Calibration · Step {step} of {totalSteps}
              </Text>
            </div>
          </Group>
          <Badge variant="light" color="forest" size="sm">
            {step === 1 ? "Target Role" : step === 2 ? "Goals" : "Skills & Resume"}
          </Badge>
        </Group>
      }
      styles={{
        header: { borderBottom: "1px solid var(--cf-border)", padding: "16px 20px" },
        body: { padding: "20px" },
      }}
    >
      <Stack gap="md">
        <Progress value={progressPercent} color="forest" size="xs" radius="xl" />

        {/* STEP 1: Career Direction & Target Role */}
        {step === 1 && (
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Specify your target technical specialization. This will calibrate future curriculum generation,
              gap analysis, and tailored lecture recommendations.
            </Text>

            <TextInput
              label="Target Role or Title"
              placeholder="e.g. Senior Backend Engineer, AI Researcher, Full Stack Architect"
              leftSection={<IconTarget size={16} color="var(--cf-text-muted)" />}
              value={targetRole}
              onChange={(e) => setTargetRole(e.currentTarget.value)}
              required
              size="sm"
              radius="sm"
            />

            <Select
              label="Career Track / Domain"
              placeholder="Select primary track"
              leftSection={<IconBriefcase size={16} color="var(--cf-text-muted)" />}
              data={CAREER_SUGGESTIONS}
              value={targetCareer}
              onChange={(val) => setTargetCareer(val || "Software & Web Engineering")}
              size="sm"
              radius="sm"
            />

            <Select
              label="Current Experience Level"
              placeholder="Select experience level"
              leftSection={<IconSchool size={16} color="var(--cf-text-muted)" />}
              data={[
                { value: "beginner", label: "Beginner (0 - 1 years) — Foundational" },
                { value: "intermediate", label: "Intermediate (2 - 4 years) — Applied Practitioner" },
                { value: "advanced", label: "Advanced (5+ years) — Senior / Architect" },
                { value: "expert", label: "Expert / Lead — Systems Specialist" },
              ]}
              value={experienceLevel}
              onChange={(val) => setExperienceLevel(val || "intermediate")}
              size="sm"
              radius="sm"
            />
          </Stack>
        )}

        {/* STEP 2: Learning Intentions & Goals */}
        {step === 2 && (
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Define your primary technical learning goals. This guides the automated course pipeline when
              scaffolding topics and pruning prerequisites.
            </Text>

            <Textarea
              label="Primary Learning Goals"
              placeholder="e.g. Master distributed consensus, implement high-throughput event buses in Go, and prepare for Staff Engineer system design interviews."
              minRows={4}
              value={primaryGoals}
              onChange={(e) => setPrimaryGoals(e.currentTarget.value)}
              size="sm"
              radius="sm"
            />

            <Paper p="sm" radius="sm" style={{ backgroundColor: "var(--cf-surface)", border: "1px solid var(--cf-border)" }}>
              <Group gap="xs">
                <IconSparkles size={16} color="#1b4d3e" />
                <Text size="xs" fw={700} c="var(--cf-text)">
                  Autonomous Taxonomy Engine
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mt={4} lh={1.5}>
                CareerForge will synthesize structured syllabi and curate lecture series matching your exact goals
                without manual playlist searching.
              </Text>
            </Paper>
          </Stack>
        )}

        {/* STEP 3: Current Skills & Resume */}
        {step === 3 && (
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              Record your verified skills. You can also optionally upload your technical resume for
              future competency scoring in Part 2.
            </Text>

            <TagsInput
              label="Current Technical Skills"
              description="Type skill and press Enter, or choose from popular tags below"
              placeholder="e.g. Docker, Python, PostgreSQL"
              value={skills}
              onChange={setSkills}
              size="sm"
              radius="sm"
            />

            {/* Quick-add popular skills */}
            <Group gap={6}>
              {POPULAR_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  color="gray"
                  size="xs"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSkills((prev) => [...prev, skill])}
                >
                  + {skill}
                </Badge>
              ))}
            </Group>

            <FileInput
              label="Upload Technical Resume (Optional)"
              description="PDF, DOC, or TXT format (stored in Appwrite Storage)"
              placeholder="Select resume file"
              leftSection={<IconFileText size={16} color="var(--cf-text-muted)" />}
              accept=".pdf,.doc,.docx,.txt"
              value={resumeFile}
              onChange={setResumeFile}
              clearable
              size="sm"
              radius="sm"
            />
          </Stack>
        )}

        {/* Modal Navigation Buttons */}
        <Group justify="space-between" mt="md" pt="xs" style={{ borderTop: "1px solid var(--cf-border)" }}>
          {step > 1 ? (
            <Button
              variant="default"
              size="xs"
              leftSection={<IconArrowLeft size={14} />}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              color="forest"
              size="xs"
              rightSection={<IconArrowRight size={14} />}
              onClick={handleNext}
            >
              Continue
            </Button>
          ) : (
            <Button
              color="forest"
              size="xs"
              rightSection={<IconCheck size={14} />}
              onClick={handleFinish}
              loading={isSubmitting}
            >
              Complete Onboarding & Enter Dashboard
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
