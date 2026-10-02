import React, { useState } from 'react';
import { Link } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';
import { Box, Button, Group, Stack, Grid, Text, Title, Badge, Container, Flex, Divider, ThemeIcon, Paper } from '@mantine/core';
import { IconTarget, IconArrowRight } from '@tabler/icons-react';

export interface CareerTrack {
  id: string;
  title: string;
  category: string;
  timeline: string;
  salaryRange: string;
  demandGrowth: string;
  difficulty: 'Moderate' | 'High' | 'Aggressive';
  milestones: string[];
  keyCompetencies: string[];
}

export default function CareerPathsRoute() {
  const [activeTrackId, setActiveTrackId] = useState<string>('ai-architect');

  const tracks: CareerTrack[] = [
    {
      id: 'ai-architect',
      title: 'Principal AI Systems Architect',
      category: 'Individual Contributor Track',
      timeline: '18 – 24 Months',
      salaryRange: '$220k – $310k',
      demandGrowth: '+42% YoY Market Demand',
      difficulty: 'Aggressive',
      milestones: [
        "Master distributed vector index clustering & high-throughput inference serving.",
        "Author end-to-end evaluation harnesses (RAG Triad & automated red-teaming).",
        "Lead production deployment of multi-agent LLM systems with latency budgets."
      ],
      keyCompetencies: [
        "Vector Architecture",
        "MLOps & Tracing",
        "Cost/Token Optimization",
        "System Reliability"
      ]
    },
    {
      id: 'staff-eng',
      title: 'Staff Backend Infrastructure Engineer',
      category: 'System Architecture Track',
      timeline: '12 – 18 Months',
      salaryRange: '$190k – $260k',
      demandGrowth: '+28% YoY Market Demand',
      difficulty: 'High',
      milestones: [
        "Migrate monolith micro-services into event-driven streaming pipelines.",
        "Implement zero-trust OAuth2 / OIDC authentication fabric across services.",
        "Establish automated chaos engineering & high-availability benchmarks."
      ],
      keyCompetencies: [
        "Distributed Systems",
        "Kafka / Event Streams",
        "PostgreSQL Internals",
        "Kubernetes & Terraform"
      ]
    },
    {
      id: 'ai-product-lead',
      title: 'AI Engineering Team Lead',
      category: 'Leadership & Management Track',
      timeline: '24 – 36 Months',
      salaryRange: '$210k – $280k',
      demandGrowth: '+35% YoY Market Demand',
      difficulty: 'Moderate',
      milestones: [
        "Lead cross-functional agile sprints bridging ML research and product engineering.",
        "Establish AI safety, compliance, and hallucination reduction roadmaps.",
        "Architect technical hiring rubrics and mentor senior IC engineers."
      ],
      keyCompetencies: [
        "Technical Strategy",
        "AI Governance",
        "Sprint Velocity",
        "Cross-Team Execution"
      ]
    }
  ];

  const activeTrack = tracks.find(t => t.id === activeTrackId) || tracks[0];

  return (
    <Box bg="gray.0" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PlatformHeader />

      <Container size="xl" py="xl" style={{ flex: 1, width: '100%' }}>
        <Stack gap="xl">
          <WipFeatureBanner
            title="Career Path & Trajectory Recommendations"
            category="Career Forecasting"
            description="Synthesizes market compensation benchmarks, career transition patterns, and milestone progression ladders tailored to your current technical foundation."
            plannedServices={[
              "Career Horizon Model",
              "Compensation Aggregator",
              "Transition Milestone Planner",
              "Adjacent Role Recommender"
            ]}
          />

          {/* Current State vs Horizon Summary */}
          <Paper p="lg" shadow="sm" radius="sm" withBorder>
            <Stack gap="md">
              <Flex justify="space-between" align="center" wrap="wrap" gap="sm" style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '12px' }}>
                <Box>
                  <Text size="xs" fw={700} tt="uppercase" style={{ color: '#1b4d3e' }}>Current Career Benchmark</Text>
                  <Title order={2} size="h4" tt="uppercase" mt={4}>Software Engineer (AI / Backend Focus)</Title>
                </Box>
                <Group gap="xs">
                  <Text size="xs" c="dimmed" tt="uppercase">Estimated Market Horizon:</Text>
                  <Badge color="#1b4d3e" variant="light" radius="sm" size="md">12 to 36 Months</Badge>
                </Group>
              </Flex>

              {/* Track Selection Tabs */}
              <Grid>
                {tracks.map((track) => {
                  const isSelected = track.id === activeTrackId;
                  return (
                    <Grid.Col span={{ base: 12, md: 4 }} key={track.id}>
                      <Paper
                        p="md"
                        radius="sm"
                        withBorder
                        onClick={() => setActiveTrackId(track.id)}
                        style={{
                          cursor: 'pointer',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          backgroundColor: isSelected ? 'rgba(27, 77, 62, 0.05)' : 'transparent',
                          borderColor: isSelected ? '#1b4d3e' : '#e9ecef',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box>
                          <Text size="xs" fw={700} c="dimmed" tt="uppercase">{track.category}</Text>
                          <Title order={3} size="h6" tt="uppercase" mt={4} lh={1.2}>{track.title}</Title>
                        </Box>
                        <Group justify="space-between" mt="md" pt="sm" style={{ borderTop: '1px solid #e9ecef' }}>
                          <Text size="xs" fw={700}>{track.timeline}</Text>
                          <Text size="xs" fw={700} c="teal">{track.demandGrowth}</Text>
                        </Group>
                      </Paper>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Stack>
          </Paper>

          {/* Active Track Deep Dive */}
          <Grid>
            {/* Left: Progression Ladder & Milestones */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Paper p="lg" shadow="sm" radius="sm" withBorder h="100%">
                <Stack gap="lg">
                  <Flex justify="space-between" align="center" style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '12px' }}>
                    <Box>
                      <Title order={3} size="h5" tt="uppercase">Milestone Progression Ladder</Title>
                      <Text size="sm" c="dimmed" mt={2}>Actionable stepping stones for reaching {activeTrack.title}.</Text>
                    </Box>
                    <Badge variant="light" color="gray" radius="sm">3 Key Phases</Badge>
                  </Flex>

                  <Stack gap="md">
                    {activeTrack.milestones.map((milestone, idx) => (
                      <Paper key={idx} p="md" radius="sm" bg="gray.0" withBorder style={{ borderLeft: '4px solid #1b4d3e' }}>
                        <Flex gap="md" align="flex-start">
                          <ThemeIcon size="md" color="#1b4d3e" radius="sm">
                            <Text size="xs" fw={700}>{idx + 1}</Text>
                          </ThemeIcon>
                          <Box style={{ flex: 1 }}>
                            <Flex justify="space-between" align="center">
                              <Text size="sm" fw={700} tt="uppercase">Phase {idx + 1} Milestone</Text>
                              <Text size="xs" fw={700} c="dimmed" tt="uppercase">Month {idx * 6} – {(idx + 1) * 6}</Text>
                            </Flex>
                            <Text size="sm" c="dimmed" mt={4}>{milestone}</Text>
                          </Box>
                        </Flex>
                      </Paper>
                    ))}
                  </Stack>

                  {/* Core Competencies Tagged */}
                  <Box pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
                    <Text size="xs" fw={700} tt="uppercase" mb="xs">Core Architectural Competencies</Text>
                    <Group gap="xs">
                      {activeTrack.keyCompetencies.map((comp) => (
                        <Badge key={comp} color="#1b4d3e" variant="light" radius="sm" size="sm">{comp}</Badge>
                      ))}
                    </Group>
                  </Box>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Right: Market Compensation & Next Steps */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Paper p="lg" shadow="sm" radius="sm" withBorder h="100%">
                <Stack gap="xl">
                  <Title order={3} size="h5" tt="uppercase">Market Compensation Index</Title>

                  <Paper p="md" bg="gray.0" withBorder radius="sm">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed">Salary Range (Target Band)</Text>
                    <Title order={2} size="h3" mt={4}>{activeTrack.salaryRange}</Title>
                    <Text size="xs" fw={700} tt="uppercase" c="teal" mt={4}>Top 15th percentile benchmark</Text>
                  </Paper>

                  <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid #e9ecef' }}>
                    <Flex justify="space-between">
                      <Text size="sm" c="dimmed" tt="uppercase">Role Transition Difficulty</Text>
                      <Text size="sm" fw={700} tt="uppercase">{activeTrack.difficulty}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text size="sm" c="dimmed" tt="uppercase">Target Time to Transition</Text>
                      <Text size="sm" fw={700} tt="uppercase">{activeTrack.timeline}</Text>
                    </Flex>
                  </Stack>

                  <Box mt="lg">
                    <Button
                      component={Link}
                      to="/skills"
                      color="#1b4d3e"
                      fullWidth
                      radius="sm"
                      size="md"
                      styles={{ root: { textTransform: 'uppercase', fontWeight: 700 } }}
                    >
                      Analyze Skill Gaps for this Role
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
