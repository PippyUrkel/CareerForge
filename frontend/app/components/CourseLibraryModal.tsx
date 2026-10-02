import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  TextInput,
  SegmentedControl,
  SimpleGrid,
  Paper,
  Badge,
  Group,
  Stack,
  Text,
  Title,
  Button,
  ActionIcon,
  Loader,
  Divider,
  Box,
  Center,
  Code
} from '@mantine/core';
import {
  IconDatabase,
  IconSearch,
  IconPlus,
  IconTrash,
  IconChevronRight,
  IconX,
  IconBook
} from '@tabler/icons-react';

export interface StoredCourseItem {
  id?: number;
  generation_id: string;
  course_title: string;
  topic: string;
  target_audience?: string;
  difficulty?: string;
  module_count: number;
  video_count: number;
  total_duration_seconds: number;
  created_at: string;
  description?: string;
}

export type SavedCourseItem = StoredCourseItem;

export interface CourseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (courseIdOrGenId: string | number) => void;
  onOpenGenerator: () => void;
  courses?: StoredCourseItem[];
  activeCourseId?: number | string | null;
  onDeleteCourse?: (id: string | number) => void;
  isLoading?: boolean;
}

export function CourseLibraryModal({
  isOpen,
  onClose,
  onSelectCourse,
  onOpenGenerator,
  courses: externalCourses,
  activeCourseId,
  onDeleteCourse,
  isLoading: externalIsLoading
}: CourseLibraryModalProps) {
  const [internalCourses, setInternalCourses] = useState<StoredCourseItem[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const courses = externalCourses ?? internalCourses;
  const isLoading = externalIsLoading ?? internalLoading;

  const fetchCourses = async () => {
    if (externalCourses) return;
    setInternalLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/courses');
      if (res.ok) {
        const data = await res.json();
        setInternalCourses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load courses from database:', err);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !externalCourses) {
      fetchCourses();
    }
  }, [isOpen, externalCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.target_audience?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === 'all' ||
        c.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });
  }, [courses, searchQuery, difficultyFilter]);

  const formatDuration = (sec?: number) => {
    if (!sec) return '0 min';
    const mins = Math.round(sec / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} hrs`;
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Recently';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    const diff = (difficulty || '').toLowerCase();
    if (diff === 'beginner') return 'teal';
    if (diff === 'advanced') return 'red';
    return 'blue';
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      withCloseButton={false}
      padding={0}
      radius="sm"
    >
      {/* Modal Top Header */}
      <Group justify="space-between" align="center" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group gap="sm">
          <ActionIcon size="lg" variant="filled" color="#1b4d3e" radius="sm">
            <IconDatabase size={18} />
          </ActionIcon>
          <Stack gap={0}>
            <Group gap="xs">
              <Title order={4} tt="uppercase" c="dark.8">Course Database & Library</Title>
              <Badge variant="outline" color="gray" size="sm" radius="sm">
                {courses.length} Stored
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              Load or switch between AI-synthesized curriculums stored in <Code color="#1b4d3e">careerforge.db</Code>
            </Text>
          </Stack>
        </Group>
        
        <Group gap="sm">
          <Button
            variant="filled"
            color="#1b4d3e"
            size="xs"
            radius="sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              onClose();
              onOpenGenerator();
            }}
            tt="uppercase"
            display={{ base: 'none', sm: 'flex' }}
          >
            New Course
          </Button>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}>
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Search & Filter Controls Bar */}
      <Box p="md" bg="gray.0" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between" align="center">
          <TextInput
            placeholder="Search saved courses by title, topic, or audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon onClick={() => setSearchQuery('')} variant="transparent" c="dimmed">
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            style={{ flex: 1, minWidth: '250px' }}
            radius="sm"
            size="sm"
          />
          <SegmentedControl
            value={difficultyFilter}
            onChange={(val: any) => setDifficultyFilter(val)}
            data={[
              { label: 'ALL TRACKS', value: 'all' },
              { label: 'BEGINNER', value: 'beginner' },
              { label: 'INTERMEDIATE', value: 'intermediate' },
              { label: 'ADVANCED', value: 'advanced' },
            ]}
            color="#1b4d3e"
            radius="sm"
            size="sm"
            styles={{
              label: { fontWeight: 700, fontSize: '11px' }
            }}
          />
        </Group>
      </Box>

      {/* Course Cards Grid */}
      <Box p="md" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {isLoading ? (
          <Center py={40}>
            <Stack align="center" gap="sm">
              <Loader color="#1b4d3e" />
              <Text size="sm" tt="uppercase" c="dimmed" fw={700}>Fetching courses from database...</Text>
            </Stack>
          </Center>
        ) : filteredCourses.length === 0 ? (
          <Center py={40}>
            <Paper withBorder p="xl" radius="sm" bg="gray.0" style={{ textAlign: 'center', maxWidth: '400px' }}>
              <ActionIcon size="xl" variant="outline" color="#1b4d3e" radius="sm" mx="auto" mb="md">
                <IconBook size={24} />
              </ActionIcon>
              <Title order={5} tt="uppercase" mb="xs" c="dark.8">No courses match your query</Title>
              <Text size="xs" c="dimmed" mb="md">
                {searchQuery || difficultyFilter !== 'all'
                  ? 'Try adjusting your search criteria or resetting difficulty filters.'
                  : 'Generate your first AI curriculum to store it in the database.'}
              </Text>
              <Button
                onClick={() => {
                  onClose();
                  onOpenGenerator();
                }}
                color="#1b4d3e"
                radius="sm"
                tt="uppercase"
                size="xs"
              >
                Generate New Course
              </Button>
            </Paper>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {filteredCourses.map((course) => {
              const isActive = course.id === activeCourseId || course.generation_id === activeCourseId;

              return (
                <Paper
                  key={course.id || course.generation_id}
                  withBorder
                  p="md"
                  radius="sm"
                  shadow={isActive ? 'xs' : 'none'}
                  style={{
                    borderColor: isActive ? '#1b4d3e' : undefined,
                    backgroundColor: isActive ? 'rgba(27, 77, 62, 0.03)' : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  <Stack gap="sm">
                    {/* Card Header & Badges */}
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <Badge color={getDifficultyColor(course.difficulty)} variant="outline" radius="sm" size="xs">
                          {course.difficulty || 'beginner'}
                        </Badge>
                        <Badge color="gray" variant="light" radius="sm" size="xs">
                          {course.topic}
                        </Badge>
                      </Group>
                      {isActive && (
                        <Badge color="#1b4d3e" variant="light" radius="sm" size="xs">
                          Active
                        </Badge>
                      )}
                    </Group>
                    
                    {/* Title & Description */}
                    <Box>
                      <Title order={6} tt="uppercase" c={isActive ? '#1b4d3e' : 'dark.8'} lineClamp={2}>
                        {course.course_title}
                      </Title>
                      {course.description && (
                        <Text size="xs" c="dimmed" lineClamp={2} mt={4} style={{ lineHeight: 1.5 }}>
                          {course.description}
                        </Text>
                      )}
                    </Box>
                    
                    {/* Course Metric Pills */}
                    <SimpleGrid cols={3} spacing="xs" mt="xs">
                      <Paper withBorder p={8} radius="sm" bg="gray.0" style={{ textAlign: 'center' }}>
                        <Text size="10px" tt="uppercase" c="dimmed" fw={700}>Modules</Text>
                        <Text fw={700} size="sm" c="dark.8">{course.module_count}</Text>
                      </Paper>
                      <Paper withBorder p={8} radius="sm" bg="gray.0" style={{ textAlign: 'center' }}>
                        <Text size="10px" tt="uppercase" c="dimmed" fw={700}>Lectures</Text>
                        <Text fw={700} size="sm" c="dark.8">{course.video_count}</Text>
                      </Paper>
                      <Paper withBorder p={8} radius="sm" bg="gray.0" style={{ textAlign: 'center' }}>
                        <Text size="10px" tt="uppercase" c="dimmed" fw={700}>Runtime</Text>
                        <Text fw={700} size="sm" c="dark.8">{formatDuration(course.total_duration_seconds)}</Text>
                      </Paper>
                    </SimpleGrid>
                  </Stack>
                  
                  <Divider my="md" />
                  
                  {/* Footer Actions */}
                  <Group justify="space-between" align="center">
                    <Text size="xs" c="dimmed">
                      Created {formatDate(course.created_at)}
                    </Text>
                    <Group gap="xs">
                      {onDeleteCourse && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            if (window.confirm(`Delete course "${course.course_title}" from database?`)) {
                              onDeleteCourse(course.id || course.generation_id);
                            }
                          }}
                          title="Delete course from database"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                      <Button
                        size="xs"
                        radius="sm"
                        variant={isActive ? 'light' : 'filled'}
                        color="#1b4d3e"
                        onClick={() => {
                          onSelectCourse(course.id || course.generation_id);
                          onClose();
                        }}
                        rightSection={!isActive ? <IconChevronRight size={14} /> : null}
                        tt="uppercase"
                      >
                        {isActive ? 'Loaded' : 'Open Course'}
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      {/* Modal Bottom Footer */}
      <Group justify="space-between" align="center" p="md" bg="gray.0" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Text size="xs" c="dimmed">
          Connected to database: <Text span fw={700} c="dark.8">backend/careerforge.db</Text>
        </Text>
        <Button variant="default" size="xs" radius="sm" tt="uppercase" onClick={onClose}>
          Close Library
        </Button>
      </Group>
    </Modal>
  );
}
