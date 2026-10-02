import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { PlatformHeader } from '../components/PlatformHeader';
import { WipFeatureBanner } from '../components/WipFeatureBanner';
import {
  Box,
  Container,
  Paper,
  TextInput,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  Checkbox,
  SegmentedControl,
  Anchor,
  Title,
  Divider,
} from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';

export interface AggregatedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: 'LinkedIn' | 'Indeed' | 'RemoteOK' | 'YCombinator';
  postedAt: string;
  techStack: string[];
  isRemote: boolean;
}

export default function JobAggregatorRoute() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'LinkedIn' | 'Indeed' | 'RemoteOK' | 'YCombinator'>('All');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const rawJobs: AggregatedJob[] = [
    {
      id: 'j1',
      title: 'Senior LLM Infrastructure Engineer',
      company: 'Anthropic Ecosystem Partner',
      location: 'San Francisco, CA / Remote',
      salary: '$190k – $250k • Equity',
      source: 'YCombinator',
      postedAt: '2 hours ago',
      techStack: ['Python', 'FastAPI', 'vLLM', 'Triton', 'Kubernetes'],
      isRemote: true
    },
    {
      id: 'j2',
      title: 'AI Systems Architect (RAG & Agentic Workflows)',
      company: 'Enterprise AI Labs',
      location: 'New York, NY',
      salary: '$210k – $280k • Equity',
      source: 'LinkedIn',
      postedAt: '5 hours ago',
      techStack: ['LangGraph', 'ChromaDB', 'PostgreSQL', 'FastAPI'],
      isRemote: false
    },
    {
      id: 'j3',
      title: 'Distributed Systems & ML Platform Engineer',
      company: 'Autonomous Data Systems',
      location: 'Remote (US/EU)',
      salary: '$180k – $230k',
      source: 'RemoteOK',
      postedAt: '1 day ago',
      techStack: ['Rust', 'Python', 'Kafka', 'Docker', 'Milvus'],
      isRemote: true
    },
    {
      id: 'j4',
      title: 'Backend Python Engineer (AI Services)',
      company: 'CloudScale Intelligence',
      location: 'Austin, TX / Remote',
      salary: '$160k – $210k',
      source: 'Indeed',
      postedAt: '2 days ago',
      techStack: ['Python', 'FastAPI', 'Redis', 'AWS Lambda', 'OpenAI API'],
      isRemote: true
    }
  ];

  const filteredJobs = useMemo(() => {
    return rawJobs.filter((job) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSource = sourceFilter === 'All' || job.source === sourceFilter;
      const matchRemote = !remoteOnly || job.isRemote;

      return matchSearch && matchSource && matchRemote;
    });
  }, [rawJobs, searchQuery, sourceFilter, remoteOnly]);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <PlatformHeader />

      <Container size="xl" py="xl">
        <Stack gap="xl">
          <WipFeatureBanner
            title="Multi-Source Job Aggregator & Real-Time Index"
            category="Market Intelligence"
            description="Continuously ingests and normalizes technical job listings across global developer boards, API partners, and ATS feeds into a structured search index."
            plannedServices={[
              "Multi-Platform Ingestion Worker",
              "Job Taxonomy Normalizer",
              "Salary Benchmarking Model",
              "ATS Direct Feed Connector"
            ]}
          />

          <Paper shadow="sm" p="lg" withBorder radius="sm">
            <Stack gap="md">
              <TextInput
                placeholder="Search aggregated jobs by role, company, or technology (e.g., PyTorch, Kubernetes, vLLM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                size="md"
              />

              <Group justify="space-between" align="center">
                <Group gap="sm" align="center">
                  <Text size="sm" fw={700} c="dimmed">
                    Aggregated Source:
                  </Text>
                  <SegmentedControl
                    value={sourceFilter}
                    onChange={(val: any) => setSourceFilter(val)}
                    data={['All', 'LinkedIn', 'Indeed', 'RemoteOK', 'YCombinator']}
                    size="sm"
                    color="#1b4d3e"
                  />
                </Group>
                
                <Checkbox
                  label="Remote Postings Only"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.currentTarget.checked)}
                  color="#1b4d3e"
                  fw={700}
                />
              </Group>
            </Stack>
          </Paper>

          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                Showing {filteredJobs.length} Aggregated Postings
              </Text>
              <Anchor component={Link} to="/jobs/matching" color="#1b4d3e" fw={700} size="sm">
                <Group gap="xs">
                  Rank by My AI Match Score <IconArrowRight size={16} />
                </Group>
              </Anchor>
            </Group>
            <Divider />

            {filteredJobs.map((job) => (
              <Paper key={job.id} shadow="sm" p="lg" withBorder radius="sm">
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap="xs">
                      <Group gap="sm">
                        <Text size="sm" fw={700} color="#1b4d3e">
                          {job.company}
                        </Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Text size="sm" c="dimmed">
                          {job.location}
                        </Text>
                        <Badge variant="outline" color="gray" size="sm">
                          {job.source}
                        </Badge>
                      </Group>

                      <Title order={4}>{job.title}</Title>

                      <Text size="sm" fw={700} color="#2d6a4f">
                        {job.salary}
                      </Text>
                    </Stack>

                    <Group gap="sm">
                      <Button
                        component={Link}
                        to="/jobs/matching"
                        variant="light"
                        color="#1b4d3e"
                        radius="sm"
                      >
                        Analyze Match
                      </Button>
                      <Button color="#1b4d3e" radius="sm">
                        Apply Direct
                      </Button>
                    </Group>
                  </Group>

                  <Divider />

                  <Group justify="space-between">
                    <Group gap="xs">
                      {job.techStack.map((tech) => (
                        <Badge key={tech} variant="default" size="sm" fw={600}>
                          {tech}
                        </Badge>
                      ))}
                    </Group>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Indexed {job.postedAt}
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
