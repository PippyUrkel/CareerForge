import React, { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/dashboard";
import { Link, useNavigate } from "react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Box,
  Card,
  ActionIcon,
  Tooltip,
  Alert,
  Flex,
  Anchor,
} from "@mantine/core";
import {
  IconUser,
  IconTarget,
  IconBriefcase,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
  IconFileText,
  IconSparkles,
  IconCheck,
  IconClock,
  IconBook,
  IconExternalLink,
  IconAlertCircle,
  IconStack2,
} from "@tabler/icons-react";
import { PlatformHeader } from "../components/PlatformHeader";
import { useAuth } from "../context/AuthContext";
import {
  listUserCourses,
  deleteUserCourse,
  getFileViewUrl,
  type AppwriteCourseDocument,
} from "../services/appwrite";
import { AuthModal } from "../components/AuthModal";
import { OnboardingModal } from "../components/OnboardingModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CareerForge | User Dashboard & Course History" },
    { name: "description", content: "Manage your personalized curriculum roadmaps and career profile." },
  ];
}

export default function DashboardPage() {
  const { user, profile, isLoading, logout, openAuthModal, openOnboardingModal } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<AppwriteCourseDocument[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Parse skills safely
  const strongSkills: string[] = React.useMemo(() => {
    if (!profile?.strongSkills) return [];
    try {
      return JSON.parse(profile.strongSkills);
    } catch {
      return [];
    }
  }, [profile?.strongSkills]);

  const developingSkills: string[] = React.useMemo(() => {
    if (!profile?.developingSkills) return [];
    try {
      return JSON.parse(profile.developingSkills);
    } catch {
      return [];
    }
  }, [profile?.developingSkills]);

  const weakSkills: string[] = React.useMemo(() => {
    if (!profile?.weakSkills) return [];
    try {
      return JSON.parse(profile.weakSkills);
    } catch {
      return [];
    }
  }, [profile?.weakSkills]);

  // Fetch courses belonging to the current authenticated user
  const fetchCourses = useCallback(async (userId: string) => {
    setIsLoadingCourses(true);
    try {
      const userCourses = await listUserCourses(userId);
      setCourses(userCourses);
    } catch (err) {
      console.warn("Error fetching user courses:", err);
    } finally {
      setIsLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses(user.$id);
    }
  }, [user, fetchCourses]);

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this course from your library?")) return;
    setDeletingId(docId);
    try {
      await deleteUserCourse(docId);
      setCourses((prev) => prev.filter((c) => c.$id !== docId));
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "var(--cf-bg)" }}>
        <PlatformHeader />
        <Container size="xl" py="xl">
          <Paper p="xl" radius="sm" style={{ backgroundColor: "#fff", border: "1px solid var(--cf-border)" }}>
            <Text size="sm" c="dimmed">Loading your CareerForge profile and courses...</Text>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box style={{ minHeight: "100vh", backgroundColor: "var(--cf-bg)" }}>
        <PlatformHeader />
        <Container size="sm" py={60}>
          <Paper p="xl" radius="sm" shadow="xs" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)" }}>
            <Stack gap="md" align="center" ta="center">
              <ThemeIcon size={52} radius="sm" color="forest" variant="light">
                <IconUser size={28} />
              </ThemeIcon>
              <Title order={2} fw={700} c="var(--cf-text)">
                Sign In Required
              </Title>
              <Text size="sm" c="dimmed" maw={440}>
                Please sign in to access your saved curricula, track ongoing courses, and view your personal
                career assessment records.
              </Text>
              <Group gap="sm" mt="xs">
                <Button color="forest" size="sm" onClick={() => openAuthModal("login")}>
                  Sign In
                </Button>
                <Button variant="default" size="sm" onClick={() => openAuthModal("signup")}>
                  Create Account
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
        <AuthModal />
        <OnboardingModal />
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "var(--cf-bg)", display: "flex", flexDirection: "column" }}>
      <PlatformHeader savedCoursesCount={courses.length} />

      <Container size="xl" py="xl" style={{ flex: 1, width: "100%" }}>
        <Stack gap="xl">
          {/* ═══════════════════════ USER WELCOME CARD ═══════════════════════ */}
          <Paper p="xl" radius="sm" shadow="xs" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)" }}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap="md">
              <Group gap="md">
                <Box
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 10,
                    backgroundColor: "#1b4d3e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {(profile?.name || user.name || "U").charAt(0).toUpperCase()}
                </Box>
                <Stack gap={3}>
                  <Group gap="xs">
                    <Title order={2} fw={700} size="h3" c="var(--cf-text)">
                      {profile?.name || user.name || "CareerForge Learner"}
                    </Title>
                    {profile?.onboardingCompleted ? (
                      <Badge color="forest" variant="light" size="sm" leftSection={<IconCheck size={12} />}>
                        Onboarded
                      </Badge>
                    ) : (
                      <Badge color="orange" variant="light" size="sm">
                        Pending Onboarding
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {user.email} · Appwrite User ID: <code style={{ fontSize: 11 }}>{user.$id}</code>
                  </Text>
                </Stack>
              </Group>

              <Group gap="sm">
                {!profile?.onboardingCompleted && (
                  <Button color="orange" variant="light" size="xs" onClick={openOnboardingModal}>
                    Complete Onboarding
                  </Button>
                )}
                <Button
                  component={Link}
                  to="/generator"
                  color="forest"
                  size="xs"
                  rightSection={<IconPlus size={14} />}
                >
                  Generate Course
                </Button>
                <Button variant="default" size="xs" onClick={logout}>
                  Sign Out
                </Button>
              </Group>
            </Flex>
          </Paper>

          {/* ═══════════════════════ PROFILE & STATUS CARDS ═══════════════════════ */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {/* Card 1: Target Career Track */}
            <Paper p="lg" radius="sm" shadow="xs" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)" }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="sm" color="forest" variant="light">
                    <IconTarget size={18} />
                  </ThemeIcon>
                  <Badge variant="outline" color="gray" size="xs">
                    Career Profile
                  </Badge>
                </Group>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  Target Role
                </Text>
                <Text fw={700} size="sm" c="var(--cf-text)">
                  {profile?.targetRole || "General Technical Practitioner"}
                </Text>
                <Text size="xs" c="dimmed">
                  Track: <strong>{profile?.targetCareer || "Software & Web Engineering"}</strong>
                </Text>
                <Text size="xs" c="dimmed">
                  Experience: <strong>{profile?.experienceLevel || "Intermediate"}</strong>
                </Text>
              </Stack>
            </Paper>

            {/* Card 2: Assessment Status */}
            <Paper p="lg" radius="sm" shadow="xs" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)" }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="sm" color="forest" variant="light">
                    <IconSparkles size={18} />
                  </ThemeIcon>
                  <Badge color={profile?.assessmentStatus === "completed" ? "teal" : "orange"} variant="light" size="xs">
                    {profile?.assessmentStatus === "completed" ? "Benchmarked" : "Diagnostic Ready"}
                  </Badge>
                </Group>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  Skill Gap Scoring
                </Text>
                <Text fw={700} size="sm" c="var(--cf-text)">
                  {profile?.assessmentStatus === "completed"
                    ? "Evaluated & Benchmarked"
                    : "Pending Skill Evaluation"}
                </Text>
                <Text size="xs" c="dimmed" lh={1.5}>
                  {profile?.assessmentStatus === "completed"
                    ? `Verified: ${strongSkills.length} strong, ${developingSkills.length} developing, ${weakSkills.length} gaps.`
                    : "Calibrated foundational profile ready for automated MCQ evaluation and ESCO/O*NET gap analysis."}
                </Text>
                <Anchor
                  component={Link}
                  to="/skills"
                  size="xs"
                  fw={700}
                  c="forest"
                  mt={4}
                >
                  {profile?.assessmentStatus === "completed"
                    ? "Open Competency Matrix →"
                    : "Launch Skill Assessment →"}
                </Anchor>
              </Stack>
            </Paper>

            {/* Card 3: Skills & Credentials */}
            <Paper p="lg" radius="sm" shadow="xs" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)" }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="sm" color="forest" variant="light">
                    <IconFileText size={18} />
                  </ThemeIcon>
                  <Badge variant="outline" color="gray" size="xs">
                    Competencies
                  </Badge>
                </Group>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  Verified Skills ({strongSkills.length})
                </Text>
                <Group gap={4} wrap="wrap">
                  {strongSkills.length > 0 ? (
                    strongSkills.slice(0, 6).map((skill) => (
                      <Badge key={skill} size="xs" color="forest" variant="light">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <Text size="xs" c="dimmed">No skills evaluated yet.</Text>
                  )}
                  {strongSkills.length > 6 && (
                    <Badge size="xs" color="gray" variant="subtle">
                      +{strongSkills.length - 6} more
                    </Badge>
                  )}
                </Group>
                {weakSkills.length > 0 && (
                  <Text size="11px" c="dimmed">
                    Gaps to Bridge: <Text span c="red" fw={600}>{weakSkills.slice(0, 3).join(", ")}</Text>
                  </Text>
                )}
                <Divider my={4} style={{ borderColor: "rgba(0,0,0,0.06)" }} />
                {profile?.resumeFileId ? (
                  <Group gap={6}>
                    <IconCheck size={14} color="#2d6a4f" />
                    <Anchor
                      href={getFileViewUrl(profile.resumeFileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="xs"
                      c="forest"
                      underline="hover"
                    >
                      View Uploaded Resume
                    </Anchor>
                  </Group>
                ) : (
                  <Text size="xs" c="dimmed">No resume uploaded.</Text>
                )}
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* ═══════════════════════ GENERATED & SAVED COURSES ═══════════════════════ */}
          <Box>
            <Group justify="space-between" mb="md">
              <Stack gap={2}>
                <Title order={3} fw={700} size="h4" c="var(--cf-text)">
                  Your Saved Curricula ({courses.length})
                </Title>
                <Text size="xs" c="dimmed">
                  Courses synthesized for your account and stored in Appwrite database.
                </Text>
              </Stack>

              <Button
                component={Link}
                to="/generator"
                color="forest"
                size="xs"
                leftSection={<IconPlus size={14} />}
              >
                Synthesize New Course
              </Button>
            </Group>

            {isLoadingCourses ? (
              <Paper p="xl" radius="sm" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)" }}>
                <Text size="sm" c="dimmed">Loading your saved courses...</Text>
              </Paper>
            ) : courses.length === 0 ? (
              <Paper p="xl" radius="sm" shadow="xs" style={{ backgroundColor: "#ffffff", border: "1px solid var(--cf-border)", textAlign: "center" }}>
                <Stack gap="sm" align="center" py="lg">
                  <ThemeIcon size={46} radius="sm" color="forest" variant="light">
                    <IconBook size={24} />
                  </ThemeIcon>
                  <Title order={4} fw={700} c="var(--cf-text)">
                    No Courses Generated Yet
                  </Title>
                  <Text size="xs" c="dimmed" maw={460}>
                    Use the Course Studio to synthesize your first customized technical course with multi-signal
                    video ranking and structured taxonomy.
                  </Text>
                  <Button
                    component={Link}
                    to="/generator"
                    color="forest"
                    size="sm"
                    mt="xs"
                    rightSection={<IconSparkles size={14} />}
                  >
                    Open Course Studio
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {courses.map((course) => {
                  let moduleCount = 0;
                  let videoCount = 0;
                  try {
                    const parsedModules = JSON.parse(course.modules || "[]");
                    moduleCount = parsedModules.length;
                    videoCount = parsedModules.reduce((acc: number, m: any) => acc + (m.videos?.length || 0), 0);
                  } catch {
                    // ignore
                  }

                  const createdDate = course.$createdAt
                    ? new Date(course.$createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <Card
                      key={course.$id}
                      p="md"
                      radius="sm"
                      shadow="xs"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid var(--cf-border)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Badge color="forest" variant="light" size="xs">
                            {course.difficulty || "Beginner"}
                          </Badge>
                          <Group gap={4}>
                            <Tooltip label="Delete Course" withArrow position="top">
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color="red"
                                loading={deletingId === course.$id}
                                onClick={() => handleDelete(course.$id)}
                                aria-label="Delete course"
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        <div>
                          <Text fw={700} size="sm" c="var(--cf-text)" lineClamp={2}>
                            {course.title}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                            {course.description || course.topic}
                          </Text>
                        </div>
                      </Stack>

                      <Box mt="md" pt="xs" style={{ borderTop: "1px solid var(--cf-border)" }}>
                        <Group justify="space-between" align="center">
                          <Group gap={8}>
                            <Text size="xs" c="dimmed">
                              <strong>{moduleCount}</strong> modules
                            </Text>
                            <Text size="xs" c="dimmed">
                              · <strong>{videoCount}</strong> videos
                            </Text>
                          </Group>
                          <Button
                            component={Link}
                            to={`/generator?courseId=${course.courseId}`}
                            size="xs"
                            color="forest"
                            variant="light"
                            rightSection={<IconPlayerPlay size={12} />}
                          >
                            Open Studio
                          </Button>
                        </Group>
                      </Box>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Auth and Onboarding Modals */}
      <AuthModal />
      <OnboardingModal />
    </Box>
  );
}
