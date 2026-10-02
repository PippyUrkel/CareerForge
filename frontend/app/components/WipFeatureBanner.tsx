import React from 'react';
import { Link } from 'react-router';
import { Paper, Group, Badge, Text, Title, Anchor, Stack, Flex, Divider } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export interface WipFeatureBannerProps {
  title: string;
  category: string;
  description: string;
  badgeLabel?: string;
  plannedServices?: string[];
}

export function WipFeatureBanner({
  title,
  category,
  description,
  badgeLabel = 'WIP // SPECIFICATION PREVIEW',
  plannedServices = []
}: WipFeatureBannerProps) {
  return (
    <Paper 
      shadow="sm" 
      radius="sm" 
      p="lg" 
      withBorder 
      style={{ borderLeft: '4px solid #d97706', backgroundColor: '#ffffff' }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <Badge color="orange" variant="light" leftSection={<IconAlertTriangle size={14} />}>
              {badgeLabel}
            </Badge>
            <Badge color="gray" variant="light">
              {category}
            </Badge>
          </Group>
          <Anchor component={Link} to="/generator" size="sm" fw={500} style={{ color: '#1b4d3e' }}>
            Active Course Studio →
          </Anchor>
        </Group>

        <div>
          <Title order={3} size="h4" mb="xs" c="dark.9">
            {title}
          </Title>
          <Text size="sm" c="dimmed" lh={1.5}>
            {description}
          </Text>
        </div>

        {plannedServices.length > 0 && (
          <>
            <Divider />
            <div>
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
                Planned Subsystems
              </Text>
              <Flex gap="xs" wrap="wrap">
                {plannedServices.map((service, index) => (
                  <Badge key={index} variant="outline" color="gray" size="sm" fw="normal">
                    {service}
                  </Badge>
                ))}
              </Flex>
            </div>
          </>
        )}
      </Stack>
    </Paper>
  );
}
