import React, { useState } from 'react';
import { Modal, TextInput, Select, NumberInput, Button, Group, Stack, Text, ThemeIcon, Divider, SegmentedControl, Grid, Paper, Box } from '@mantine/core';
import { IconStar, IconX } from '@tabler/icons-react';
import { GenerationPipeline } from './GenerationPipeline';

export interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isGenerating?: boolean;
}

export function GenerationModal({
  isOpen,
  onClose,
  onSubmit,
  isGenerating = false
}: GenerationModalProps) {
  const [courseTitle, setCourseTitle] = useState('Python Fundamentals');
  const [topic, setTopic] = useState('Python Programming');
  const [difficulty, setDifficulty] = useState('beginner');
  const [targetAudience, setTargetAudience] = useState('undergraduate students');
  const [targetModules, setTargetModules] = useState<number | string>(6);
  const [videosPerModule, setVideosPerModule] = useState<number | string>(3);
  const [durationSeconds, setDurationSeconds] = useState<number | string>(600);
  const [preset, setPreset] = useState<string>('standard');

  const applyPreset = (val: string) => {
    setPreset(val);
    if (val === 'crash') {
      setTargetModules(3);
      setVideosPerModule(2);
      setDurationSeconds(300);
    } else if (val === 'standard') {
      setTargetModules(6);
      setVideosPerModule(3);
      setDurationSeconds(600);
    } else if (val === 'deep') {
      setTargetModules(9);
      setVideosPerModule(4);
      setDurationSeconds(900);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('course_title', courseTitle);
    formData.append('topic', topic);
    formData.append('difficulty', difficulty);
    formData.append('target_audience', targetAudience);
    formData.append('target_modules', targetModules.toString());
    formData.append('videos_per_module', videosPerModule.toString());
    formData.append('target_duration_seconds', durationSeconds.toString());
    onSubmit(formData);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      size="lg"
      radius="sm"
    >
      {isGenerating ? (
        <GenerationPipeline />
      ) : (
        <Box p="md">
          {/* Header */}
          <Group justify="space-between" align="flex-start" mb="md">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="sm" color="#1b4d3e">
                <IconStar size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700} tt="uppercase" size="sm">
                  AI Curriculum Generator
                </Text>
                <Text size="xs" c="dimmed">
                  Define course taxonomy and video sourcing constraints
                </Text>
              </div>
            </Group>
            <Button
              variant="subtle"
              color="gray"
              px={8}
              onClick={onClose}
              aria-label="Close modal"
            >
              <IconX size={20} />
            </Button>
          </Group>

          <Divider mb="md" />

          {/* Quick Presets */}
          <Paper withBorder p="sm" radius="sm" mb="md" bg="gray.0">
            <Group justify="space-between">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" ff="monospace">
                Scope Presets:
              </Text>
              <SegmentedControl
                size="xs"
                radius="sm"
                value={preset}
                onChange={applyPreset}
                data={[
                  { label: 'Quick (3 Mod)', value: 'crash' },
                  { label: 'Standard (6 Mod)', value: 'standard' },
                  { label: 'Masterclass (9 Mod)', value: 'deep' }
                ]}
                color="#1b4d3e"
              />
            </Group>
          </Paper>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <TextInput
                label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Course Title</Text>}
                name="course_title"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.currentTarget.value)}
                placeholder="e.g., Python Fundamentals"
                radius="sm"
              />

              <TextInput
                label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Topic & Domain Area</Text>}
                name="topic"
                required
                value={topic}
                onChange={(e) => setTopic(e.currentTarget.value)}
                placeholder="e.g., Python Programming"
                radius="sm"
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Difficulty Level</Text>}
                    name="difficulty"
                    value={difficulty}
                    onChange={(val) => setDifficulty(val || 'beginner')}
                    data={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' },
                      { value: 'expert', label: 'Expert' }
                    ]}
                    radius="sm"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Target Audience</Text>}
                    name="target_audience"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.currentTarget.value)}
                    placeholder="e.g., undergraduate students"
                    radius="sm"
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Modules Count</Text>}
                    name="target_modules"
                    min={1}
                    max={20}
                    value={targetModules}
                    onChange={(val) => setTargetModules(val)}
                    radius="sm"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Videos / Module</Text>}
                    name="videos_per_module"
                    min={1}
                    max={10}
                    value={videosPerModule}
                    onChange={(val) => setVideosPerModule(val)}
                    radius="sm"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <NumberInput
                    label={<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>Duration (s)</Text>}
                    name="target_duration_seconds"
                    min={30}
                    value={durationSeconds}
                    onChange={(val) => setDurationSeconds(val)}
                    radius="sm"
                  />
                </Grid.Col>
              </Grid>
            </Stack>

            <Divider my="md" />

            <Group justify="flex-end" gap="sm">
              <Button variant="subtle" color="gray" onClick={onClose} radius="sm">
                <Text size="xs" fw={700} tt="uppercase">Cancel</Text>
              </Button>
              <Button type="submit" color="#1b4d3e" radius="sm">
                <Text size="xs" fw={700} tt="uppercase">Generate Curriculum</Text>
              </Button>
            </Group>
          </form>
        </Box>
      )}
    </Modal>
  );
}
