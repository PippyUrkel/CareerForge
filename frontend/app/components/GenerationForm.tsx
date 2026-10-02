import React from 'react';
import { Paper, TextInput, Select, NumberInput, Button, Stack, Grid, Text, Group } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

interface GenerationFormProps {
  onSubmit: (formData: FormData) => void;
  isGenerating: boolean;
}

export function GenerationForm({ onSubmit, isGenerating }: GenerationFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  return (
    <Paper p="xl" shadow="sm" radius="sm" withBorder bg="white">
      <Group mb="lg" pb="sm" style={{ borderBottom: '1px solid #eee' }}>
        <IconSparkles size={20} color="#1b4d3e" />
        <Text size="lg" fw={700} c="#1b4d3e">
          Course Configuration
        </Text>
      </Group>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            name="course_title"
            label="Course Title"
            required
            placeholder="e.g., Python Fundamentals"
            defaultValue="Python Fundamentals"
          />

          <TextInput
            name="topic"
            label="Topic & Skills"
            required
            placeholder="e.g., Python Programming"
            defaultValue="Python Programming"
          />

          <Select
            name="difficulty"
            label="Difficulty"
            defaultValue="beginner"
            data={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ]}
          />

          <TextInput
            name="target_audience"
            label="Target Audience"
            required
            placeholder="e.g., undergraduate students"
            defaultValue="undergraduate students"
          />

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                name="target_modules"
                label="Target Modules"
                min={1}
                max={20}
                defaultValue={6}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                name="videos_per_module"
                label="Videos / Module"
                min={1}
                max={10}
                defaultValue={3}
              />
            </Grid.Col>
          </Grid>

          <NumberInput
            name="target_duration_seconds"
            label="Target Duration (sec)"
            min={30}
            defaultValue={600}
          />

          <Button
            type="submit"
            loading={isGenerating}
            fullWidth
            mt="md"
            leftSection={<IconSparkles size={16} />}
            style={{ backgroundColor: '#1b4d3e' }}
            radius="sm"
          >
            {isGenerating ? "Generating Curriculum..." : "Generate AI Course"}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
