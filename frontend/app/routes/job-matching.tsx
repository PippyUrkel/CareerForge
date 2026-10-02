import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';
import {
  Box,
  Container,
  Paper,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Button,
  Grid,
  Divider,
  Progress,
  Flex
} from '@mantine/core';
import { IconCheck, IconArrowRight, IconAlertCircle } from '@tabler/icons-react';

export interface RankedJobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  matchScore: number; // 0-100
  cosineSimilarity: number;
  keywordScore: number;
  experienceScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export default function JobMatchingRoute() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState('m1');

  const rankedJobs: RankedJobMatch[] = [
    {
      id: 'm1',
      title: 'Senior LLM Infrastructure Engineer',
      company: 'Anthropic Ecosystem Partner',
      location: 'San Francisco, CA / Remote',
      salary: '$190k – $250k',
      source: 'YCombinator',
      matchScore: 94,
      cosineSimilarity: 0.96,
      keywordScore: 0.91,
      experienceScore: 0.95,
      matchedKeywords: ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Concurrency'],
      missingKeywords: ['vLLM Distributed Serving']
    },
    {
      id: 'm2',
      title: 'AI Systems Architect (RAG & Agentic Workflows)',
      company: 'Enterprise AI Labs',
      location: 'New York, NY',
      salary: '$210k – $280k',
      source: 'LinkedIn',
      matchScore: 88,
      cosineSimilarity: 0.89,
      keywordScore: 0.85,
      experienceScore: 0.90,
      matchedKeywords: ['FastAPI', 'ChromaDB', 'SQL', 'System Architecture'],
      missingKeywords: ['LangGraph State Machines', 'LangSmith Evaluation']
    },
    {
      id: 'm3',
      title: 'Distributed Systems & ML Platform Engineer',
      company: 'Autonomous Data Systems',
      location: 'Remote (US/EU)',
      salary: '$180k – $230k',
      source: 'RemoteOK',
      matchScore: 82,
      cosineSimilarity: 0.83,
      keywordScore: 0.79,
      experienceScore: 0.84,
      matchedKeywords: ['Python', 'Docker', 'Kafka', 'REST APIs'],
      missingKeywords: ['Rust Interop', 'Milvus Cluster Deployment']
    }
  ];

  const activeJob = rankedJobs.find(j => j.id === selectedJobId) || rankedJobs[0];

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <PlatformHeader />

      <Container size="xl" py="xl">
        <Stack gap="xl">
          <WipFeatureBanner
            title="AI Job Matching & Multi-Signal Ranking"
            category="Semantic Matching"
            description="Performs dense vector cosine matching, cross-encoder re-ranking, and qualification overlap analysis between your verified competencies and aggregated job postings."
            plannedServices={[
              "Candidate Vector Projector",
              "Multi-Signal Job Ranker",
              "Cross-Encoder Re-scoring Model",
              "Targeted Course Bridge"
            ]}
          />

          <Paper shadow="sm" p="lg" withBorder radius="sm">
            <Group justify="space-between" align="center">
              <Group>
                <Flex
                  align="center"
                  justify="center"
                  w={40}
                  h={40}
                  bg="#1b4d3e"
                  c="white"
                  style={{ borderRadius: 4, fontWeight: 700 }}
                >
                  94%
                </Flex>
                <Box>
                  <Title order={5} tt="uppercase">
                    Top Candidate Match Score
                  </Title>
                  <Text size="sm" c="dimmed">
                    Calculated against 1,240 live tech job descriptions across 4 aggregated sources.
                  </Text>
                </Box>
              </Group>

              <Button
                component={Link}
                to="/skills"
                variant="default"
                radius="sm"
                tt="uppercase"
              >
                View Skill Gap Matrix
              </Button>
            </Group>
          </Paper>

          <Grid>
            {/* Left: Ranked Job Cards */}
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <Stack gap="md">
                <Group justify="space-between" pb="xs">
                  <Text size="sm" fw={700} tt="uppercase">
                    Ranked Listings ({rankedJobs.length})
                  </Text>
                  <Text size="sm" c="dimmed" tt="uppercase">
                    Sorted by Dense Cosine Fit
                  </Text>
                </Group>
                <Divider />

                {rankedJobs.map((job) => {
                  const isSelected = job.id === selectedJobId;
                  return (
                    <Paper
                      key={job.id}
                      p="lg"
                      shadow={isSelected ? 'md' : 'sm'}
                      withBorder
                      radius="sm"
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? '#1b4d3e' : undefined,
                        borderLeftWidth: isSelected ? 4 : 1,
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Box>
                            <Text size="sm" fw={700} color="#1b4d3e" tt="uppercase">
                              {job.company}
                            </Text>
                            <Title order={5} mt={4}>{job.title}</Title>
                            <Text size="sm" c="dimmed" mt={4}>
                              {job.location} • {job.source}
                            </Text>
                          </Box>
                          
                          <Stack gap={0} align="flex-end">
                            <Text size="xl" fw={800} color="#1b4d3e">
                              {job.matchScore}%
                            </Text>
                            <Text size="xs" fw={700} c="green.8" tt="uppercase">
                              Strong Fit
                            </Text>
                          </Stack>
                        </Group>

                        <Divider />

                        <Group justify="space-between">
                          <Text size="sm" fw={700} c="green.8">
                            {job.salary}
                          </Text>
                          <Text size="xs" c="dimmed" tt="uppercase">
                            {job.missingKeywords.length === 0 ? 'All skills matched' : `${job.missingKeywords.length} gap identified`}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Grid.Col>

            {/* Right: Detailed Match Deconstruction & Course Bridge */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <Box style={{ position: 'sticky', top: 80 }}>
                <Paper shadow="sm" p="xl" withBorder radius="sm">
                  <Stack gap="lg">
                    <Group justify="space-between" align="flex-start">
                      <Box>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                          Match Decomposition
                        </Text>
                        <Title order={5}>{activeJob.title}</Title>
                      </Box>
                      <Badge color="#1b4d3e" variant="light" size="lg" radius="sm">
                        {activeJob.matchScore}% Fit
                      </Badge>
                    </Group>

                    <Divider />

                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed" tt="uppercase">Dense Semantic Cosine Similarity</Text>
                        <Text size="sm" fw={700}>{Math.round(activeJob.cosineSimilarity * 100)}%</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed" tt="uppercase">Keyword & Skill Intersect</Text>
                        <Text size="sm" fw={700}>{Math.round(activeJob.keywordScore * 100)}%</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed" tt="uppercase">Seniority & Domain Experience</Text>
                        <Text size="sm" fw={700}>{Math.round(activeJob.experienceScore * 100)}%</Text>
                      </Group>
                    </Stack>

                    <Divider />

                    <Stack gap="xs">
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                        Verified Qualifications
                      </Text>
                      <Group gap="xs">
                        {activeJob.matchedKeywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="light"
                            color="green"
                            size="sm"
                            leftSection={<IconCheck size={12} />}
                            radius="sm"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>

                    {activeJob.missingKeywords.length > 0 && (
                      <>
                        <Divider />
                        <Stack gap="xs">
                          <Text size="xs" fw={700} c="red.8" tt="uppercase">
                            Missing Competencies
                          </Text>
                          <Stack gap="xs">
                            {activeJob.missingKeywords.map((kw) => (
                              <Paper key={kw} withBorder p="sm" bg="red.0" radius="sm">
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    <IconAlertCircle size={16} color="red" />
                                    <Text size="sm" fw={700} c="red.8">{kw}</Text>
                                  </Group>
                                  <Button
                                    size="xs"
                                    color="#1b4d3e"
                                    radius="sm"
                                    onClick={() => navigate('/generator')}
                                  >
                                    Generate Course
                                  </Button>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Stack>
                      </>
                    )}

                    <Divider />

                    <Button fullWidth size="md" color="#1b4d3e" radius="sm">
                      Submit Direct Application
                    </Button>
                  </Stack>
                </Paper>
              </Box>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
