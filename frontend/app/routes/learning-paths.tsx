import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';
import { Box, Button, Group, Stack, Grid, Text, Title, Badge, Container, Flex, Divider, ThemeIcon, Paper, Slider } from '@mantine/core';
import { IconCheck, IconChevronRight, IconPlayerPlay } from '@tabler/icons-react';

export interface MilestoneItem {
  id: string;
  title: string;
  duration: string;
  moduleCount: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  description: string;
  skillsAcquired: string[];
}

export default function LearningPathsRoute() {
  const navigate = useNavigate();
  const [weeklyHours, setWeeklyHours] = useState<number>(8);

  const milestones: MilestoneItem[] = [
    {
      id: 'm1',
      title: 'Phase 1: Advanced Python Asynchronous Architecture',
      duration: '3 Weeks',
      moduleCount: 4,
      status: 'completed',
      description: 'Master async/await event loops, concurrency primitives, thread pools, and high-performance FastAPI backends.',
      skillsAcquired: ['Asyncio', 'FastAPI', 'Pydantic v2', 'Concurrency']
    },
    {
      id: 'm2',
      title: 'Phase 2: Vector Databases & Dense Embeddings',
      duration: '4 Weeks',
      moduleCount: 5,
      status: 'in_progress',
      description: 'Implement semantic vector search, HNSW indexing, cross-encoder re-ranking, and ChromaDB/Milvus clusters.',
      skillsAcquired: ['ChromaDB', 'HNSW', 'Cosine Cosine', 'Dense Retrieval']
    },
    {
      id: 'm3',
      title: 'Phase 3: LLM Multi-Agent Orchestration & Tool Calling',
      duration: '5 Weeks',
      moduleCount: 5,
      status: 'upcoming',
      description: 'Architect deterministic state machines, subagent delegation, memory compaction, and structured JSON outputs.',
      skillsAcquired: ['LangGraph', 'Agentic Patterns', 'Tool Calling', 'Token Optimization']
    },
    {
      id: 'm4',
      title: 'Phase 4: Production Evaluation, Tracing & MLOps',
      duration: '4 Weeks',
      moduleCount: 3,
      status: 'upcoming',
      description: 'Deploy LangSmith tracing, automated hallucination benchmarks, red-teaming harnesses, and Dockerized inference.',
      skillsAcquired: ['LangSmith', 'RAG Triad', 'MLOps', 'Docker Deployment']
    }
  ];

  const getStatusProps = (status: string) => {
    if (status === 'completed') return { color: 'teal', label: 'completed', borderColor: '#20c997' };
    if (status === 'in_progress') return { color: '#1b4d3e', label: 'in progress', borderColor: '#1b4d3e' };
    return { color: 'gray', label: 'upcoming', borderColor: '#e9ecef' };
  };

  return (
    <Box bg="gray.0" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PlatformHeader />

      <Container size="xl" py="xl" style={{ flex: 1, width: '100%' }}>
        <Stack gap="xl">
          <WipFeatureBanner
            title="Personalized Learning Paths & Roadmaps"
            category="Curriculum Roadmaps"
            description="Builds goal-driven, multi-course learning roadmaps scheduled across your weekly availability. Seamlessly combines AI-synthesized course tracks into sequential mastery milestones."
            plannedServices={[
              "Curriculum Multi-Track Planner",
              "Weekly Study Pacing Engine",
              "Milestone Dependency Resolver",
              "Mastery Assessment Evaluator"
            ]}
          />

          {/* Pathway Header & Pacing Control Bar */}
          <Paper p="lg" shadow="sm" radius="sm" withBorder>
            <Stack gap="md">
              <Flex justify="space-between" align="center" wrap="wrap" gap="sm" style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '12px' }}>
                <Box>
                  <Text size="xs" fw={700} tt="uppercase" style={{ color: '#1b4d3e' }}>Active Pathway Roadmap</Text>
                  <Title order={2} size="h4" tt="uppercase" mt={4}>Production AI & Distributed LLM Systems Masterpath</Title>
                </Box>
                <Badge color="teal" variant="light" radius="sm" size="lg" styles={{ root: { textTransform: 'uppercase' } }}>
                  42% Overall Pathway Completion
                </Badge>
              </Flex>

              {/* Schedule Pacing & Time-to-Goal Controls */}
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Paper p="md" bg="gray.0" withBorder radius="sm">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Weekly Study Commitment</Text>
                    <Group align="center">
                      <Slider
                        value={weeklyHours}
                        onChange={setWeeklyHours}
                        min={4}
                        max={20}
                        color="#1b4d3e"
                        style={{ flex: 1 }}
                        radius="sm"
                      />
                      <Text fw={700} size="md">{weeklyHours}h / wk</Text>
                    </Group>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Paper p="md" bg="gray.0" withBorder radius="sm">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Target Completion Date</Text>
                    <Text fw={700} size="md">Nov 14, 2026 (~{Math.round(96 / weeklyHours)} weeks)</Text>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Paper p="md" bg="gray.0" withBorder radius="sm">
                    <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Total Curriculum Depth</Text>
                    <Text fw={700} size="md">4 Phases • 17 Modules • 51 Streams</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          {/* Milestone Sequence Roadmap */}
          <Stack gap="lg">
            <Flex justify="space-between" align="center" style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>
              <Title order={3} size="h5" tt="uppercase">Sequential Pathway Milestones</Title>
              <Text size="xs" c="dimmed" tt="uppercase">Step-by-step progression</Text>
            </Flex>

            <Stack gap="md">
              {milestones.map((ms, index) => {
                const statusProps = getStatusProps(ms.status);
                return (
                  <Paper
                    key={ms.id}
                    p="lg"
                    shadow="sm"
                    radius="sm"
                    withBorder
                    style={{
                      borderLeft: ms.status !== 'upcoming' ? `4px solid ${statusProps.borderColor}` : '1px solid #e9ecef'
                    }}
                  >
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap="md">
                      <Flex gap="md" align="flex-start" style={{ flex: 1 }}>
                        <ThemeIcon
                          size="lg"
                          radius="sm"
                          color={ms.status === 'completed' ? 'teal' : ms.status === 'in_progress' ? '#1b4d3e' : 'gray.3'}
                          variant={ms.status === 'upcoming' ? 'outline' : 'filled'}
                        >
                          {ms.status === 'completed' ? <IconCheck size={16} stroke={3} /> : <Text size="sm" fw={700} c={ms.status === 'upcoming' ? 'dimmed' : 'white'}>{index + 1}</Text>}
                        </ThemeIcon>

                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group gap="sm" wrap="wrap">
                            <Title order={4} size="h6" tt="uppercase">{ms.title}</Title>
                            <Badge
                              color={statusProps.color}
                              variant={ms.status === 'upcoming' ? 'outline' : 'light'}
                              radius="sm"
                              size="sm"
                            >
                              {statusProps.label}
                            </Badge>
                            <Text size="xs" c="dimmed">({ms.duration})</Text>
                          </Group>

                          <Text size="sm" c="dimmed" maw={800}>{ms.description}</Text>

                          <Group gap="xs" mt={4}>
                            {ms.skillsAcquired.map((skill) => (
                              <Badge key={skill} color="gray" variant="outline" radius="sm" size="xs">{skill}</Badge>
                            ))}
                          </Group>
                        </Stack>
                      </Flex>

                      <Box>
                        <Button
                          rightSection={ms.status === 'in_progress' ? <IconPlayerPlay size={16} /> : <IconChevronRight size={16} />}
                          variant={ms.status === 'in_progress' ? 'filled' : 'outline'}
                          color={ms.status === 'in_progress' ? '#1b4d3e' : 'gray'}
                          radius="sm"
                          size="sm"
                          onClick={() => navigate('/generator')}
                          styles={{ root: { textTransform: 'uppercase', fontWeight: 700 } }}
                        >
                          {ms.status === 'in_progress' ? 'Resume in Studio' : 'Open in Studio'}
                        </Button>
                      </Box>
                    </Flex>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
