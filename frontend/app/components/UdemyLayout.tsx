import React, { type ReactNode } from 'react';
import { Link } from 'react-router';
import { Box, Flex, Text, Button, Badge, ActionIcon, Anchor, Divider, Group, Stack } from '@mantine/core';
import { IconStack2, IconDatabase, IconPlus, IconChevronDown } from '@tabler/icons-react';

export interface StudioLayoutProps {
  courseTitle: string;
  onOpenGenerator: () => void;
  onOpenLibrary?: () => void;
  savedCoursesCount?: number;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
}

export function StudioLayout({ 
  courseTitle, 
  onOpenGenerator, 
  onOpenLibrary,
  savedCoursesCount = 0,
  mainContent, 
  sidebarContent 
}: StudioLayoutProps) {
  return (
    <Flex direction="column" h="100vh" bg="#f8f9fa" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Flex 
        h={56} 
        bg="white" 
        style={{ borderBottom: '1px solid #e9ecef', zIndex: 20, flexShrink: 0 }}
        align="center" 
        justify="space-between" 
        px="md"
      >
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Anchor component={Link} to="/" underline="never" c="black">
            <Group gap="xs" wrap="nowrap">
              <ActionIcon size="md" radius="sm" color="#1b4d3e" variant="filled">
                <IconStack2 size={16} />
              </ActionIcon>
              <Text fw={700} size="sm" tt="uppercase" lts={0.5}>
                CareerForge
              </Text>
              <Badge variant="outline" color="gray" radius="sm" size="xs" display={{ base: 'none', md: 'flex' }}>
                Studio
              </Badge>
            </Group>
          </Anchor>

          <Divider orientation="vertical" display={{ base: 'none', md: 'block' }} />

          <Group gap="xs" wrap="nowrap" display={{ base: 'none', sm: 'flex' }} style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" tt="uppercase" ff="monospace">Curriculum</Text>
            <Text size="xs" c="gray.4">/</Text>
            {onOpenLibrary ? (
              <Anchor component="button" onClick={onOpenLibrary} underline="never" c="black">
                <Group gap={4} wrap="nowrap">
                  <Text fw={600} size="sm" truncate style={{ maxWidth: 300 }}>
                    {courseTitle || "Course Curriculum"}
                  </Text>
                  <IconChevronDown size={14} color="gray" />
                </Group>
              </Anchor>
            ) : (
              <Text fw={600} size="sm" truncate style={{ maxWidth: 300 }}>
                {courseTitle || "Course Curriculum"}
              </Text>
            )}
          </Group>
        </Group>

        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          {onOpenLibrary && (
            <Button 
              variant="default" 
              size="xs" 
              radius="sm" 
              onClick={onOpenLibrary}
              leftSection={<IconDatabase size={14} color="#1b4d3e" />}
              rightSection={
                savedCoursesCount > 0 && (
                  <Badge color="#1b4d3e" variant="light" size="xs" radius="sm">
                    {savedCoursesCount}
                  </Badge>
                )
              }
            >
              Library
            </Button>
          )}

          <Button 
            variant="filled" 
            color="#1b4d3e"
            size="xs" 
            radius="sm" 
            onClick={onOpenGenerator}
            leftSection={<IconPlus size={14} />}
            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            New Course
          </Button>
        </Group>
      </Flex>

      <Flex style={{ flex: 1, overflow: 'hidden' }} direction={{ base: 'column', lg: 'row' }}>
        <Box style={{ flex: 1, overflowY: 'auto', position: 'relative' }} bg="#f8f9fa">
          {mainContent}
        </Box>
        <Box 
          w={{ base: '100%', lg: 380, xl: 420 }} 
          bg="white" 
          style={{ borderLeft: '1px solid #e9ecef', flexShrink: 0, overflowY: 'auto' }}
        >
          {sidebarContent}
        </Box>
      </Flex>
    </Flex>
  );
}

export const UdemyLayout = StudioLayout;
export type UdemyLayoutProps = StudioLayoutProps;
