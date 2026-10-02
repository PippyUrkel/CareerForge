import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';
import { Box, Button, Group, Stack, Grid, Text, Title, Badge, Progress, Container, Flex, Divider, ThemeIcon, Paper, Select, SimpleGrid } from '@mantine/core';
import { IconUpload, IconArrowRight, IconTarget } from '@tabler/icons-react';

export interface SkillGapItem {
  name: string;
  category: string;
  currentLevel: number; // 0-100%
  requiredLevel: number; // 0-100%
  status: 'matched' | 'developing' | 'missing';
  marketDemand: 'High' | 'Very High' | 'Critical';
}

export default function SkillsGapAnalysisRoute() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>('Senior AI Systems Engineer');
  const [experienceLevel, setExperienceLevel] = useState<string | null>('Mid-Level (3-5 yrs)');

  const skills: SkillGapItem[] = [
    {
      name: "Vector Databases & Dense Retrieval",
      category: "AI Infrastructure",
      currentLevel: 35,
      requiredLevel: 85,
      status: 'missing',
      marketDemand: 'Critical'
    },
    {
      name: "LLM Orchestration (LangChain / LlamaIndex)",
      category: "AI Engineering",
      currentLevel: 55,
      requiredLevel: 90,
      status: 'developing',
      marketDemand: 'Very High'
    },
    {
      name: "Python Asynchronous Systems (FastAPI)",
      category: "Backend Architecture",
      currentLevel: 92,
      requiredLevel: 80,
      status: 'matched',
      marketDemand: 'High'
    },
    {
      name: "Distributed Tracing & Evaluation (LangSmith)",
      category: "MLOps",
      currentLevel: 20,
      requiredLevel: 75,
      status: 'missing',
      marketDemand: 'Very High'
    },
    {
      name: "SQL & Relational Schema Design",
      category: "Data Engineering",
      currentLevel: 88,
      requiredLevel: 70,
      status: 'matched',
      marketDemand: 'High'
    },
    {
      name: "Fine-Tuning & Quantization (LoRA / QLoRA)",
      category: "Model Optimization",
      currentLevel: 45,
      requiredLevel: 80,
      status: 'developing',
      marketDemand: 'Critical'
    }
  ];

  const overallFitPercent = 64;
  const matchedCount = skills.filter(s => s.status === 'matched').length;
  const developingCount = skills.filter(s => s.status === 'developing').length;
  const missingCount = skills.filter(s => s.status === 'missing').length;

  const handleGenerateForSkill = (skillName: string) => {
    navigate(`/generator?topic=${encodeURIComponent(skillName)}&title=${encodeURIComponent(`Mastering ${skillName}`)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'teal';
      case 'developing': return 'yellow';
      case 'missing': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box bg="gray.0" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PlatformHeader />

      <Container size="xl" py="xl" style={{ flex: 1, width: '100%' }}>
        <Stack gap="lg">
          <WipFeatureBanner
            title="AI Skill Gap Analysis & Matrix"
            category="Talent Intelligence Engine"
            description="Deconstruct your technical competency profile against real-time market role benchmarks. CareerForge isolates competency deltas and automatically synthesizes targeted curriculum bridges."
            plannedServices={[
              "Semantic Resume Parser",
              "Market Skill Vector Extractor",
              "Competency Delta Scorer",
              "Auto-Course Generator Bridge"
            ]}
          />

          {/* Role & Profile Selector Bar */}
          <Paper p="md" shadow="sm" radius="sm" withBorder>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'flex-end' }}
              justify="space-between"
              gap="md"
            >
              <Group grow style={{ flex: 1 }}>
                <Select
                  label="Target Role Benchmark"
                  value={selectedRole}
                  onChange={setSelectedRole}
                  data={['Senior AI Systems Engineer', 'Full-Stack Python Architect', 'Cloud Infrastructure Lead', 'Data Science & ML Specialist']}
                  size="sm"
                  styles={{ label: { textTransform: 'uppercase', fontWeight: 700, fontSize: '0.75rem', marginBottom: 4 } }}
                />
                <Select
                  label="Current Experience Level"
                  value={experienceLevel}
                  onChange={setExperienceLevel}
                  data={['Junior (1-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)']}
                  size="sm"
                  styles={{ label: { textTransform: 'uppercase', fontWeight: 700, fontSize: '0.75rem', marginBottom: 4 } }}
                />
              </Group>

              <Button
                leftSection={<IconUpload size={16} />}
                variant="outline"
                color="gray"
                size="sm"
                radius="sm"
                styles={{ root: { textTransform: 'uppercase', fontWeight: 700 } }}
              >
                Upload Resume (PDF)
              </Button>
            </Flex>
          </Paper>

          {/* Competency Overview Metric Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <Paper p="md" shadow="sm" radius="sm" withBorder>
              <Stack gap="xs">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">Market Role Alignment</Text>
                <Group align="baseline" gap="xs">
                  <Title order={2} style={{ color: '#1b4d3e' }}>{overallFitPercent}%</Title>
                  <Text size="xs" c="teal" fw={700}>+8% this month</Text>
                </Group>
                <Progress value={overallFitPercent} color="#1b4d3e" size="sm" radius="sm" mt="xs" />
              </Stack>
            </Paper>

            <Paper p="md" shadow="sm" radius="sm" withBorder>
              <Stack gap="xs">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">Verified Proficiencies</Text>
                <Group align="baseline" gap="xs">
                  <Title order={2} c="teal">{matchedCount}</Title>
                  <Text size="xs" c="dimmed">of {skills.length} skills</Text>
                </Group>
                <Text size="xs" c="teal" fw={700} tt="uppercase">Ready for deployment</Text>
              </Stack>
            </Paper>

            <Paper p="md" shadow="sm" radius="sm" withBorder>
              <Stack gap="xs">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">Developing Skills</Text>
                <Group align="baseline" gap="xs">
                  <Title order={2} c="yellow.7">{developingCount}</Title>
                  <Text size="xs" c="dimmed">in progress</Text>
                </Group>
                <Text size="xs" c="yellow.7" fw={700} tt="uppercase">~2 weeks to mastery</Text>
              </Stack>
            </Paper>

            <Paper p="md" shadow="sm" radius="sm" withBorder>
              <Stack gap="xs">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">Critical Skill Gaps</Text>
                <Group align="baseline" gap="xs">
                  <Title order={2} c="red">{missingCount}</Title>
                  <Text size="xs" c="dimmed">unacquired</Text>
                </Group>
                <Text size="xs" c="red" fw={700} tt="uppercase">High priority for target role</Text>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Detailed Competency Matrix Table */}
          <Paper shadow="sm" radius="sm" withBorder style={{ overflow: 'hidden' }}>
            <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Title order={3} size="h5" tt="uppercase">Competency Delta Breakdown</Title>
                  <Text size="sm" c="dimmed" mt={2}>
                    Comparison of your current proficiency vs market requirements for {selectedRole}.
                  </Text>
                </Box>
                <Badge variant="light" color="gray" radius="sm">
                  {skills.length} Tracked Competencies
                </Badge>
              </Flex>
            </Box>

            <Stack gap={0}>
              {skills.map((skill, index) => (
                <Box
                  key={skill.name}
                  p="md"
                  style={{
                    borderBottom: index < skills.length - 1 ? '1px solid #e9ecef' : 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    align={{ base: 'stretch', sm: 'center' }}
                    justify="space-between"
                    gap="md"
                  >
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text size="sm" fw={700} tt="uppercase">{skill.name}</Text>
                        <Badge variant="outline" color="gray" radius="sm" size="sm">{skill.category}</Badge>
                        <Badge variant="light" color={getStatusColor(skill.status)} radius="sm" size="sm">
                          {skill.status}
                        </Badge>
                      </Group>

                      <Box w="100%" maw={400}>
                        <Group justify="space-between" mb={4}>
                          <Text size="xs" c="dimmed">Current: <Text span fw={700} c="dark">{skill.currentLevel}%</Text></Text>
                          <Text size="xs" c="dimmed">Target: <Text span fw={700} c="dark">{skill.requiredLevel}%</Text></Text>
                        </Group>
                        <Progress
                          value={skill.currentLevel}
                          color={getStatusColor(skill.status)}
                          size="sm"
                          radius="sm"
                        />
                      </Box>
                    </Stack>

                    <Group gap="xl">
                      <Box display={{ base: 'none', md: 'block' }} ta="right">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">Market Demand</Text>
                        <Text size="sm" fw={700}>{skill.marketDemand}</Text>
                      </Box>

                      {skill.status !== 'matched' ? (
                        <Button
                          rightSection={<IconArrowRight size={16} />}
                          color="#1b4d3e"
                          radius="sm"
                          size="sm"
                          styles={{ root: { textTransform: 'uppercase', fontWeight: 700 } }}
                          onClick={() => handleGenerateForSkill(skill.name)}
                        >
                          Synthesize Course
                        </Button>
                      ) : (
                        <Badge variant="light" color="teal" radius="sm" size="lg" styles={{ root: { textTransform: 'uppercase' } }}>
                          Competency Verified
                        </Badge>
                      )}
                    </Group>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
