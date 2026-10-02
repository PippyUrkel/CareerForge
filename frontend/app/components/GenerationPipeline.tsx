import React, { useEffect, useState } from 'react';
import { Progress, Loader, ThemeIcon, Stack, Group, Text, Paper, Box } from '@mantine/core';
import { IconCheck, IconLoader2 } from '@tabler/icons-react';

const PIPELINE_STEPS = [
  { id: 'init', label: 'Initializing AI Curriculum Agent', description: 'Setting up model parameters and parsing constraints' },
  { id: 'curriculum', label: 'Synthesizing Course Structure', description: 'Generating comprehensive modules and topic breakdown' },
  { id: 'sourcing', label: 'Curating & Ranking Video Content', description: 'Matching high-relevance educational lectures from library' },
  { id: 'assembling', label: 'Finalizing Course Experience', description: 'Formatting timestamps, metadata, and lecture sequencing' }
];

interface GenerationPipelineProps {
  onComplete?: () => void;
}

export function GenerationPipeline({ onComplete }: GenerationPipelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const totalSteps = PIPELINE_STEPS.length;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < totalSteps - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / totalSteps) * 90));
          return next;
        }
        setProgress(98);
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <Paper p="xl" radius="sm">
      <Stack align="center" mb="xl">
        <ThemeIcon size="xl" radius="sm" color="#1b4d3e" variant="light">
          <IconLoader2 className="mantine-spin" size={24} />
        </ThemeIcon>
        <Stack gap={4} align="center">
          <Text fw={700} tt="uppercase" size="md">
            Synthesizing Curriculum Pipeline
          </Text>
          <Text size="xs" c="dimmed">
            Ranking video candidates and sequencing course lectures
          </Text>
        </Stack>

        <Progress 
          value={progress} 
          w="100%" 
          mt="md" 
          color="#1b4d3e" 
          size="sm" 
          striped 
          animated 
        />
      </Stack>

      <Stack gap="sm">
        {PIPELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <Paper 
              key={step.id} 
              p="sm" 
              withBorder 
              radius="sm"
              style={{
                borderColor: isActive ? '#1b4d3e' : isCompleted ? 'green' : undefined,
                backgroundColor: isActive ? 'rgba(27, 77, 62, 0.05)' : isCompleted ? 'rgba(0, 128, 0, 0.05)' : undefined,
                opacity: !isActive && !isCompleted ? 0.6 : 1
              }}
            >
              <Group wrap="nowrap" align="flex-start">
                <Box mt={2}>
                  {isCompleted ? (
                    <ThemeIcon color="green" size="sm" radius="xl">
                      <IconCheck size={12} stroke={3} />
                    </ThemeIcon>
                  ) : isActive ? (
                    <Loader color="#1b4d3e" size="sm" />
                  ) : (
                    <ThemeIcon color="gray" variant="outline" size="sm" radius="xl">
                      <Text size="xs" fw={700}>{index + 1}</Text>
                    </ThemeIcon>
                  )}
                </Box>

                <Box flex={1}>
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Text 
                      size="sm" 
                      fw={700} 
                      tt="uppercase" 
                      c={isCompleted ? 'dark' : isActive ? '#1b4d3e' : 'dimmed'}
                    >
                      {step.label}
                    </Text>
                    {isActive && (
                      <Text size="xs" fw={700} tt="uppercase" c="#1b4d3e">
                        Processing...
                      </Text>
                    )}
                    {isCompleted && (
                      <Text size="xs" fw={700} tt="uppercase" c="green">
                        Completed
                      </Text>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" mt={2}>
                    {step.description}
                  </Text>
                </Box>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
