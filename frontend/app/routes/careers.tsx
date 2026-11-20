
import React, { useState } from 'react';
import { PlatformHeader } from '../components/PlatformHeader';
import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBrain,
  IconCheck,
  IconRefresh,
  IconTarget,
} from '@tabler/icons-react';

import {
  recommendEscoCareers,
  fetchEscoSkillGap,
  type EscoCareerRecommendation,
} from '../services/skills';

export default function CareerPathsRoute() {
  const [skillsInput, setSkillsInput] = useState(
    'Python, SQL, Data analysis, Machine learning, Power BI, Statistical analysis'
  );

  const [recommendations, setRecommendations] = useState<
    EscoCareerRecommendation[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedCareer, setSelectedCareer] =
    useState<EscoCareerRecommendation | null>(null);

  const [gapData, setGapData] = useState<any>(null);
  const [gapLoading, setGapLoading] = useState(false);

  const handleRecommend = async () => {
    const skills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      setError('Please enter at least one skill.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSelectedCareer(null);
      setGapData(null);

      const result = await recommendEscoCareers(skills, 12);
      setRecommendations(result.recommendations || []);

      if (!result.recommendations?.length) {
        setError('No matching careers found. Try adding more skills.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to generate career recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGap = async (career: EscoCareerRecommendation) => {
    try {
      setSelectedCareer(career);
      setGapLoading(true);
      setGapData(null);
      setError('');

      const skills = skillsInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const result = await fetchEscoSkillGap(career.occupation_uri, skills);
      setGapData(result);
    } catch (err: any) {
      setError(err.message || 'Unable to load skill-gap analysis.');
    } finally {
      setGapLoading(false);
    }
  };

  return (
    <Box bg="gray.0" style={{ minHeight: '100vh' }}>
      <PlatformHeader />

      <Container size="xl" py="xl">
        <Stack gap="xl">

          <Box>
            <Badge color="teal" variant="light" mb="sm">
              AI-POWERED CAREER INTELLIGENCE
            </Badge>
            <Title order={1}>Career Recommendations</Title>
            <Text c="dimmed" mt="xs">
              Discover career opportunities based on your existing skills
              using the European Skills, Competences, Qualifications and
              Occupations (ESCO) classification.
            </Text>
          </Box>

          <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs">
                <IconBrain size={22} color="#1b4d3e" />
                <Title order={3}>Your Skill Profile</Title>
              </Group>

              <Text size="sm" c="dimmed">
                Enter your skills separated by commas. You can edit the
                sample skills below.
              </Text>

              <TextInput
                label="Skills"
                placeholder="Python, SQL, Data analysis..."
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.currentTarget.value)}
                size="md"
              />

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Separate individual skills using commas.
                </Text>

                <Button
                  color="teal"
                  leftSection={<IconTarget size={17} />}
                  onClick={handleRecommend}
                  loading={loading}
                >
                  Find My Careers
                </Button>
              </Group>
            </Stack>
          </Paper>

          {error && (
            <Alert
              color="red"
              icon={<IconAlertCircle size={18} />}
              title="Notice"
            >
              {error}
            </Alert>
          )}

          {loading && (
            <Paper p="xl" withBorder radius="md">
              <Stack align="center" gap="sm">
                <Loader color="teal" size="lg" />
                <Text fw={600}>Analysing your skills...</Text>
                <Text size="sm" c="dimmed">
                  Comparing your profile against ESCO occupations.
                  The first request may take a little longer.
                </Text>
              </Stack>
            </Paper>
          )}

          {recommendations.length > 0 && !loading && (
            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Title order={2}>Recommended Careers</Title>
                  <Text size="sm" c="dimmed">
                    {recommendations.length} career matches identified
                  </Text>
                </Box>

                <Button
                  variant="light"
                  color="teal"
                  leftSection={<IconRefresh size={16} />}
                  onClick={handleRecommend}
                >
                  Refresh
                </Button>
              </Group>

              <Grid>
                {recommendations.map((career, index) => (
                  <Grid.Col span={{ base: 12, md: 6 }} key={career.occupation_uri}>
                    <Paper
                      p="lg"
                      radius="md"
                      withBorder
                      style={{
                        height: '100%',
                        borderColor:
                          selectedCareer?.occupation_uri === career.occupation_uri
                            ? '#1b4d3e'
                            : undefined,
                      }}
                    >
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                          <Badge color="teal" variant="light">
                            Career #{index + 1}
                          </Badge>
                          <Text fw={800} size="xl" c="teal">
                            {career.match_score}%
                          </Text>
                        </Group>

                        <Title order={3}>{career.title}</Title>

                        <Text size="sm" c="dimmed" lineClamp={3}>
                          {career.description}
                        </Text>

                        <Box>
                          <Group justify="space-between" mb={5}>
                            <Text size="xs" fw={600}>
                              Overall career match
                            </Text>
                            <Text size="xs" fw={700}>
                              {career.match_score}%
                            </Text>
                          </Group>
                          <Progress
                            value={Math.min(100, Math.max(0, career.match_score))}
                            color="teal"
                            size="lg"
                            radius="xl"
                          />
                        </Box>

                        <Divider />

                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Matched skills
                          </Text>
                          <Badge color="green">
                            {career.matched_skills.length}
                          </Badge>
                        </Group>

                        <Group gap={6}>
                          {career.matched_skills.slice(0, 5).map((skill) => (
                            <Badge key={skill.uri} color="green" variant="light">
                              {skill.label}
                            </Badge>
                          ))}
                          {career.matched_skills.length > 5 && (
                            <Badge color="gray">
                              +{career.matched_skills.length - 5} more
                            </Badge>
                          )}
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Skills to develop
                          </Text>
                          <Badge color="orange">
                            {career.missing_skills.length}
                          </Badge>
                        </Group>

                        <Button
                          fullWidth
                          color="teal"
                          variant={
                            selectedCareer?.occupation_uri === career.occupation_uri
                              ? 'filled'
                              : 'light'
                          }
                          onClick={() => handleSkillGap(career)}
                        >
                          Analyse Skill Gap
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          )}

          {gapLoading && (
            <Paper p="xl" withBorder radius="md">
              <Group justify="center">
                <Loader color="teal" />
                <Text>Generating skill-gap analysis...</Text>
              </Group>
            </Paper>
          )}

          {gapData && selectedCareer && !gapLoading && (
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="lg">
                <Box>
                  <Badge color="teal" mb="xs">
                    SKILL GAP ANALYSIS
                  </Badge>
                  <Title order={2}>{gapData.occupation_title}</Title>
                  <Text size="sm" c="dimmed">
                    Compare your mapped skills with the requirements
                    of this occupation.
                  </Text>
                </Box>

                <Paper p="md" bg="gray.0" radius="md">
                  <Text size="sm" fw={600}>
                    ESCO Skill Coverage
                  </Text>
                  <Title order={1} c="teal" my="xs">
                    {gapData.coverage_percentage}%
                  </Title>
                  <Progress
                    value={Math.min(
                      100,
                      Math.max(0, gapData.coverage_percentage)
                    )}
                    color="teal"
                    size="xl"
                  />
                </Paper>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="sm">
                      <Group>
                        <IconCheck color="green" />
                        <Title order={4}>Matched Skills</Title>
                      </Group>

                      {gapData.possessed_skills.length > 0 ? (
                        gapData.possessed_skills.map((skill: any) => (
                          <Paper key={skill.uri} p="sm" withBorder radius="sm">
                            <Group justify="space-between">
                              <Text size="sm" fw={600}>
                                {skill.label}
                              </Text>
                              <Badge color="green">
                                {skill.importance}
                              </Badge>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Text size="sm" c="dimmed">
                          No matched skills found.
                        </Text>
                      )}
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="sm">
                      <Group>
                        <IconTarget color="orange" />
                        <Title order={4}>Skills to Develop</Title>
                      </Group>

                      {gapData.missing_skills.length > 0 ? (
                        gapData.missing_skills.slice(0, 20).map((skill: any) => (
                          <Paper key={skill.uri} p="sm" withBorder radius="sm">
                            <Group justify="space-between">
                              <Text size="sm" fw={600}>
                                {skill.label}
                              </Text>
                              <Badge color="orange">
                                {skill.importance}
                              </Badge>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Text size="sm" c="dimmed">
                          No missing skills identified.
                        </Text>
                      )}
                    </Stack>
                  </Grid.Col>
                </Grid>

                <Alert color="blue" title="How to interpret this result">
                  {gapData.note}
                </Alert>
              </Stack>
            </Paper>
          )}

          {!recommendations.length && !loading && !error && (
            <Paper p="xl" radius="md" withBorder>
              <Stack align="center" gap="sm">
                <IconBrain size={40} color="#1b4d3e" />
                <Title order={3}>Discover Your Career Opportunities</Title>
                <Text size="sm" c="dimmed" ta="center">
                  Enter your skills and click Find My Careers to generate
                  recommendations from the ESCO occupation catalogue.
                </Text>
              </Stack>
            </Paper>
          )}

        </Stack>
      </Container>
    </Box>
  );
}
