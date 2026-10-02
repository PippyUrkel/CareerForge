import React from 'react';
import { Link } from 'react-router';
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
  Grid,
  SimpleGrid,
  Divider,
  Progress,
  Anchor,
  Badge,
  Flex
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

export default function AnalyticsRoute() {
  const weeklyStudyHours = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 4.0 },
    { day: 'Wed', hours: 2.5 },
    { day: 'Thu', hours: 5.0 },
    { day: 'Fri', hours: 3.0 },
    { day: 'Sat', hours: 2.0 },
    { day: 'Sun', hours: 2.0 }
  ];

  const maxHours = Math.max(...weeklyStudyHours.map(d => d.hours));

  const skillDomains = [
    { domain: 'AI & LLM Architecture', percentage: 78, color: 'grape' },
    { domain: 'Backend Engineering & Systems', percentage: 92, color: 'green' },
    { domain: 'Vector Databases & Storage', percentage: 65, color: 'teal' },
    { domain: 'MLOps & Tracing', percentage: 48, color: 'orange' }
  ];

  const recentMilestones = [
    { title: 'Completed Module: Asynchronous FastApi Internals', date: 'Yesterday', category: 'Backend' },
    { title: 'Synthesized Course: Vector Search with HNSW', date: '3 days ago', category: 'Curriculum' },
    { title: 'Matched Top Job: Senior LLM Infrastructure Engineer (94%)', date: '5 days ago', category: 'Career' },
    { title: 'Passed Assessment: Python Memory Profiling', date: '1 week ago', category: 'Verification' }
  ];

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <PlatformHeader />

      <Container size="xl" py="xl">
        <Stack gap="xl">
          <WipFeatureBanner
            title="Talent Analytics & Telemetry Dashboard"
            category="Telemetry & Growth"
            description="Real-time telemetry tracking your educational velocity, competency acquisition curves, market readiness indices, and verified assessment milestones."
            plannedServices={[
              "Learning Velocity Aggregator",
              "Skill Graph Vectorizer",
              "Market Readiness Predictor",
              "Telemetry Time-Series Service"
            ]}
          />

          {/* Top 4 KPI Metrics Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <Paper shadow="sm" p="lg" withBorder radius="sm">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Learning Velocity</Text>
                <Group align="baseline" gap="xs">
                  <Text size="xl" fw={700} c="#1b4d3e" style={{ fontSize: 24 }}>22.0h</Text>
                  <Text size="sm" fw={700} c="green.7">+18% vs last week</Text>
                </Group>
                <Text size="xs" c="dimmed" tt="uppercase">7 study sessions recorded</Text>
              </Stack>
            </Paper>

            <Paper shadow="sm" p="lg" withBorder radius="sm">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Acquired Skills</Text>
                <Group align="baseline" gap="xs">
                  <Text size="xl" fw={700} c="blue.7" style={{ fontSize: 24 }}>18 Skills</Text>
                  <Text size="sm" fw={700} c="green.7">+4 new this month</Text>
                </Group>
                <Text size="xs" c="dimmed" tt="uppercase">100% verified by benchmarks</Text>
              </Stack>
            </Paper>

            <Paper shadow="sm" p="lg" withBorder radius="sm">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Market Readiness Index</Text>
                <Group align="baseline" gap="xs">
                  <Text size="xl" fw={700} c="teal.7" style={{ fontSize: 24 }}>92%</Text>
                  <Text size="sm" fw={700} c="green.7">Top Tier Fit</Text>
                </Group>
                <Text size="xs" c="dimmed" tt="uppercase">Target: Senior AI Systems Eng</Text>
              </Stack>
            </Paper>

            <Paper shadow="sm" p="lg" withBorder radius="sm">
              <Stack gap="xs">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Courses Synthesized</Text>
                <Group align="baseline" gap="xs">
                  <Text size="xl" fw={700} c="orange.7" style={{ fontSize: 24 }}>10 Tracks</Text>
                  <Text size="sm" c="dimmed">in database</Text>
                </Group>
                <Text size="xs" c="dimmed" tt="uppercase">Saved in careerforge.db</Text>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Charts & Analytics Visual Grid */}
          <Grid>
            {/* Left: Weekly Study Distribution (Visual Chart) */}
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <Paper shadow="sm" p="xl" withBorder radius="sm" style={{ height: '100%' }}>
                <Stack gap="lg" style={{ height: '100%' }}>
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Title order={5} tt="uppercase">Weekly Study Hours Distribution</Title>
                      <Text size="sm" c="dimmed" mt={4}>
                        Hours spent watching synthesized lectures and completing modules.
                      </Text>
                    </Box>
                    <Badge variant="light" color="gray" radius="sm">
                      Last 7 Days
                    </Badge>
                  </Group>
                  
                  <Divider />

                  <Flex align="flex-end" justify="space-between" gap="md" style={{ height: 200 }} pt="md">
                    {weeklyStudyHours.map((item) => {
                      const heightPercent = Math.round((item.hours / maxHours) * 100);
                      return (
                        <Stack key={item.day} gap="sm" align="center" style={{ flex: 1 }}>
                          <Text size="xs" fw={700} c="dimmed">{item.hours}h</Text>
                          <Box
                            w="100%"
                            h={140}
                            bg="gray.1"
                            style={{
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'flex-end',
                              padding: 4,
                              border: '1px solid #e9ecef'
                            }}
                          >
                            <Box
                              w="100%"
                              bg="#1b4d3e"
                              style={{
                                height: `${heightPercent}%`,
                                borderRadius: 2,
                                transition: 'height 0.5s ease'
                              }}
                            />
                          </Box>
                          <Text size="xs" fw={700} c="dimmed" tt="uppercase">{item.day}</Text>
                        </Stack>
                      );
                    })}
                  </Flex>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Right: Domain Distribution & Skill Balance */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <Paper shadow="sm" p="xl" withBorder radius="sm" style={{ height: '100%' }}>
                <Stack gap="lg">
                  <Box>
                    <Title order={5} tt="uppercase">Domain Competency Balance</Title>
                    <Text size="sm" c="dimmed" mt={4}>
                      Knowledge distribution across technical disciplines.
                    </Text>
                  </Box>
                  
                  <Divider />

                  <Stack gap="md">
                    {skillDomains.map((domain) => (
                      <Box key={domain.domain}>
                        <Group justify="space-between" mb={8}>
                          <Text size="sm" fw={700} tt="uppercase">{domain.domain}</Text>
                          <Text size="sm" fw={700} c="dimmed">{domain.percentage}%</Text>
                        </Group>
                        <Progress 
                          value={domain.percentage} 
                          color={domain.color} 
                          size="md" 
                          radius="sm" 
                        />
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Recent Platform Milestones Feed */}
          <Paper shadow="sm" p="xl" withBorder radius="sm">
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Title order={5} tt="uppercase">Recent Milestone Timeline</Title>
                <Anchor component={Link} to="/generator" color="#1b4d3e" fw={700} size="sm">
                  <Group gap="xs">
                    Synthesize New Module <IconArrowRight size={16} />
                  </Group>
                </Anchor>
              </Group>

              <Divider />

              <Stack gap={0} style={{ divideY: '1px solid #e9ecef' }}>
                {recentMilestones.map((item, idx) => (
                  <Box key={idx} py="md" style={{ borderBottom: idx < recentMilestones.length - 1 ? '1px solid #e9ecef' : 'none' }}>
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm">
                        <Box w={8} h={8} bg="#1b4d3e" style={{ borderRadius: '50%' }} />
                        <Text size="sm" fw={700} tt="uppercase" truncate>{item.title}</Text>
                      </Group>
                      
                      <Group gap="xs">
                        <Badge variant="outline" color="gray" size="sm" radius="sm">
                          {item.category}
                        </Badge>
                        <Text size="sm" c="dimmed">{item.date}</Text>
                      </Group>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
