import React from "react";
import { Link } from "react-router";
import {
  Box,
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  SimpleGrid,
  Stack,
  Divider,
  ThemeIcon,
  Flex,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBrain,
  IconChartBar,
  IconCode,
  IconDeviceLaptop,
  IconBriefcase,
  IconStethoscope,
  IconPalette,
  IconBuildingBank,
  IconMicrophone,
  IconCamera,
  IconRocket,
  IconSchool,
  IconTargetArrow,
  IconTrendingUp,
  IconUsers,
  IconSparkles,
  IconRoute,
  IconChartDots3,
} from "@tabler/icons-react";
import { PlatformHeader } from "../components/PlatformHeader";
import { ImagePathEffect } from "../components/ImagePathEffect";

/* ──────────────────────────────────────────────────────────────
   Career icon data – each icon is an easily-replaceable <img>
   or Tabler icon. To swap for your own PNGs later, change the
   `icon` field to null and set `imageSrc` to your PNG path.
   ────────────────────────────────────────────────────────────── */
interface CareerIcon {
  /** Tabler icon component – set to null when using imageSrc */
  icon: React.ComponentType<{ size?: number | string; stroke?: number; style?: React.CSSProperties }> | null;
  /** Path to a PNG/SVG you want instead of the Tabler icon */
  imageSrc?: string;
  label: string;
  color: string;
  bg: string;
  size: number;
}

const careerIcons: CareerIcon[] = [
  { icon: IconDeviceLaptop, label: "Software Dev", color: "#1b4d3e", bg: "#e8f5f0", size: 48 },
  { icon: IconBrain, label: "AI / ML", color: "#2d6a4f", bg: "#e8f5f0", size: 50 },
  { icon: IconStethoscope, label: "Healthcare", color: "#d20f39", bg: "#fce4ec", size: 46 },
  { icon: IconPalette, label: "Design", color: "#7c3aed", bg: "#f3e8ff", size: 46 },
  { icon: IconBuildingBank, label: "Finance", color: "#d97706", bg: "#fff8e1", size: 46 },
  { icon: IconCode, label: "Engineering", color: "#1b4d3e", bg: "#e8f5f0", size: 46 },
  { icon: IconChartBar, label: "Data Science", color: "#048ba8", bg: "#e0f7fa", size: 46 },
  { icon: IconRocket, label: "Startups", color: "#7c3aed", bg: "#f3e8ff", size: 46 },
  { icon: IconBriefcase, label: "Business", color: "#2d6a4f", bg: "#e8f5f0", size: 46 },
  { icon: IconMicrophone, label: "Media", color: "#e64553", bg: "#fce4ec", size: 44 },
  { icon: IconCamera, label: "Photography", color: "#048ba8", bg: "#e0f7fa", size: 44 },
  { icon: IconSchool, label: "Education", color: "#d97706", bg: "#fff8e1", size: 46 },
];

const platformFeatures = [
  {
    title: "AI Course Generator & Studio",
    path: "/generator",
    category: "Core Engine",
    description:
      "Synthesize structured multi-module courses with multi-signal video ranking, taxonomy generation, and database persistence.",
    status: "Active",
    isWip: false,
    icon: IconSparkles,
    ctaText: "Launch Studio",
  },
  {
    title: "AI Skill Gap Analysis",
    path: "/skills",
    category: "Talent Intelligence",
    description:
      "Deconstruct your competency profile against live industry job taxonomies and generate targeted modules to bridge deficiencies.",
    status: "Preview",
    isWip: true,
    icon: IconTargetArrow,
    ctaText: "Explore Matrix",
  },
  {
    title: "Career Path Recommendations",
    path: "/careers",
    category: "Career Forecasting",
    description:
      "Explore progression ladders, salary benchmarks, and milestone roadmaps for IC, management, and executive technical tracks.",
    status: "Preview",
    isWip: true,
    icon: IconRoute,
    ctaText: "View Trajectories",
  },
  {
    title: "Personalized Learning Paths",
    path: "/learning-paths",
    category: "Curriculum Roadmaps",
    description:
      "Multi-course milestone roadmaps scheduled around your weekly hours commitment with dynamic completion estimation.",
    status: "Preview",
    isWip: true,
    icon: IconTrendingUp,
    ctaText: "View Roadmaps",
  },
  {
    title: "AI Job Matching & Ranking",
    path: "/jobs/matching",
    category: "Semantic Matching",
    description:
      "Dense vector cosine similarity and cross-encoder re-ranking matching your verified skills against global postings.",
    status: "Preview",
    isWip: true,
    icon: IconUsers,
    ctaText: "View Matches",
  },
  {
    title: "Job Aggregator & Multi-Source Feed",
    path: "/jobs",
    category: "Market Ingestion",
    description:
      "Unified aggregator collecting live tech job opportunities from LinkedIn, Indeed, RemoteOK, and developer boards.",
    status: "Preview",
    isWip: true,
    icon: IconBriefcase,
    ctaText: "Browse Index",
  },
  {
    title: "Analytics & Talent Dashboard",
    path: "/analytics",
    category: "Telemetry & Growth",
    description:
      "Track study velocity, competency acquisition curves, market readiness indices, and verified assessment milestones.",
    status: "Preview",
    isWip: true,
    icon: IconChartDots3,
    ctaText: "Open Dashboard",
  },
];

export function Welcome() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--cf-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PlatformHeader />

      <Container size="xl" py="xl" style={{ flex: 1 }}>
        <Stack gap="xl">
          {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
          <Paper
            shadow="sm"
            p={{ base: "lg", sm: "xl" }}
            radius="sm"
            style={{ overflow: "hidden", position: "relative" }}
          >
            {/* Career Icons Path Effect */}
            <ImagePathEffect
              items={careerIcons}
              containerHeight={280}
              trailPattern="follow"
              triggerDistance={25}
              maxTrailImages={6}
              fadeDelay={1200}
            />

            {/* Hero Text */}
            <Stack gap="xs" align="center" ta="center" maw={700} mx="auto">
              <Badge
                variant="light"
                color="green"
                size="sm"
                radius="sm"
                leftSection={
                  <Box
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#2d6a4f",
                    }}
                  />
                }
              >
                CareerForge — Autonomous Talent & Learning Ecosystem
              </Badge>

              <Title
                order={1}
                fw={800}
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                  lineHeight: 1.15,
                  color: "var(--cf-text)",
                }}
                className="fade-slide-in"
              >
                Your AI-Powered Career Compass
              </Title>

              <Text
                size="sm"
                c="dimmed"
                maw={560}
                className="fade-slide-in"
                style={{ "--delay": "0.15s" } as React.CSSProperties}
              >
                An architectural talent platform combining automated video
                course generation, real-time competency gap analysis, dense
                vector job matching, and career trajectory forecasting.
              </Text>

              <Group gap="sm" mt="md">
                <Button
                  component={Link}
                  to="/generator"
                  size="sm"
                  color="forest"
                  rightSection={<IconArrowRight size={16} />}
                  radius="sm"
                >
                  Launch Course Studio
                </Button>
                <Button
                  component={Link}
                  to="/skills"
                  variant="default"
                  size="sm"
                  radius="sm"
                >
                  Skill Gap Matrix
                </Button>
                <Button
                  component={Link}
                  to="/jobs/matching"
                  variant="subtle"
                  size="sm"
                  color="gray"
                  radius="sm"
                >
                  AI Job Matches
                </Button>
              </Group>
            </Stack>
          </Paper>

          {/* ═══════════════════════ FEATURE GRID ═══════════════════════ */}
          <Box>
            <Flex justify="space-between" align="center" mb="md">
              <Title order={3} fw={700} c="var(--cf-text)">
                Platform Modules
              </Title>
              <Badge variant="light" color="gray" size="sm">
                7 Core Subsystems
              </Badge>
            </Flex>

            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
              spacing="md"
            >
              {platformFeatures.map((feat) => {
                const FeatureIcon = feat.icon;
                return (
                  <Paper
                    key={feat.path}
                    component={Link}
                    to={feat.path}
                    shadow="xs"
                    p="lg"
                    radius="sm"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition:
                        "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
                      border: "1px solid var(--cf-border)",
                      cursor: "pointer",
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          borderColor: "#1b4d3e",
                          boxShadow:
                            "0 4px 12px rgba(27, 77, 62, 0.1)",
                          transform: "translateY(-2px)",
                        },
                      },
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Group gap={8}>
                          <ThemeIcon
                            variant="light"
                            color={feat.isWip ? "gray" : "forest"}
                            size="sm"
                            radius="sm"
                          >
                            <FeatureIcon size={14} />
                          </ThemeIcon>
                          <Text size="xs" c="dimmed" fw={600}>
                            {feat.category}
                          </Text>
                        </Group>
                        <Badge
                          size="xs"
                          variant="light"
                          color={feat.isWip ? "orange" : "green"}
                          radius="sm"
                        >
                          {feat.status}
                        </Badge>
                      </Group>

                      <Text fw={700} size="sm" c="var(--cf-text)">
                        {feat.title}
                      </Text>

                      <Text size="xs" c="dimmed" lh={1.5}>
                        {feat.description}
                      </Text>
                    </Stack>

                    <Divider my="sm" />

                    <Group justify="space-between">
                      <Text size="xs" fw={600} c="#1b4d3e">
                        {feat.ctaText}
                      </Text>
                      <IconArrowRight size={14} style={{ color: "#1b4d3e" }} />
                    </Group>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
