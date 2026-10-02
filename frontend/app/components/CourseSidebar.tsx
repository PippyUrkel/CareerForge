import React, { useState, useMemo } from 'react';
import { Box, TextInput, SegmentedControl, Progress, Accordion, Group, Text, Stack, Badge, Button, ActionIcon, Paper, Checkbox } from '@mantine/core';
import { IconSearch, IconBook, IconPlayerPlay, IconCheck, IconX, IconChevronDown } from '@tabler/icons-react';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  videos: Video[];
}

export interface CourseSidebarProps {
  modules: Module[];
  activeVideoId?: string;
  onVideoSelect: (video: Video) => void;
  onOpenGenerator: () => void;
  onOpenLibrary?: () => void;
}

export function CourseSidebar({ 
  modules, 
  activeVideoId, 
  onVideoSelect, 
  onOpenGenerator,
  onOpenLibrary
}: CourseSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'remaining' | 'completed'>('all');

  const [expandedModules, setExpandedModules] = useState<string[]>(() => modules.map(m => m.id));
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({});

  const toggleComplete = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const totalVideos = modules.reduce((acc, m) => acc + m.videos.length, 0);
  const totalCompleted = Object.values(completedVideos).filter(Boolean).length;
  const progressPercent = totalVideos > 0 ? Math.round((totalCompleted / totalVideos) * 100) : 0;

  const filteredModules = useMemo(() => {
    return modules.map(m => {
      const filteredVideos = m.videos.filter(v => {
        const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isCompleted = !!completedVideos[v.id];

        if (!matchesSearch) return false;
        if (statusFilter === 'completed') return isCompleted;
        if (statusFilter === 'remaining') return !isCompleted;
        return true;
      });
      return { ...m, videos: filteredVideos };
    }).filter(m => m.videos.length > 0 || searchQuery === '');
  }, [modules, searchQuery, statusFilter, completedVideos]);

  if (modules.length === 0) {
    return (
      <Stack h="100%" bg="white" gap={0}>
        <Box p="md" style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}>
          <Text fw={700} size="xs" tt="uppercase" ff="monospace">Curriculum Syllabus</Text>
        </Box>
        <Stack flex={1} align="center" justify="center" p="xl" gap="md" style={{ textAlign: 'center' }}>
          <ActionIcon size="xl" radius="sm" variant="default" color="#1b4d3e">
            <IconBook size={24} />
          </ActionIcon>
          <Box>
            <Text fw={700} size="xs" tt="uppercase" ff="monospace">No curriculum selected</Text>
            <Text size="xs" c="dimmed" mt={4} maw={240}>
              Open a stored course from the database or generate a new AI curriculum.
            </Text>
          </Box>
          <Group gap="sm" mt="xs">
            {onOpenLibrary && (
              <Button variant="default" radius="sm" size="xs" tt="uppercase" ff="monospace" onClick={onOpenLibrary}>
                Browse Library
              </Button>
            )}
            <Button color="#1b4d3e" radius="sm" size="xs" tt="uppercase" lts={1} onClick={onOpenGenerator}>
              Generate Curriculum
            </Button>
          </Group>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack h="100%" bg="white" gap={0}>
      <Stack p="md" gap="sm" style={{ borderBottom: '1px solid #e9ecef', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white' }}>
        <Group justify="space-between">
          <Group gap="xs">
            <IconBook size={16} color="#1b4d3e" />
            <Text fw={600} size="sm">Course Curriculum</Text>
          </Group>
          <Button 
            variant="transparent" 
            size="xs" 
            p={0} 
            color="#1b4d3e"
            onClick={() => {
              if (expandedModules.length === modules.length) {
                setExpandedModules([]);
              } else {
                setExpandedModules(modules.map(m => m.id));
              }
            }}
          >
            {expandedModules.length === modules.length ? 'Collapse all' : 'Expand all'}
          </Button>
        </Group>

        <Paper p="xs" radius="sm" bg="#f8f9fa" withBorder>
          <Group justify="space-between" mb={4}>
            <Text size={10} ff="monospace" tt="uppercase" fw={700} c="dimmed">
              {totalCompleted} of {totalVideos} lectures completed
            </Text>
            <Text size={10} fw={700}>{progressPercent}%</Text>
          </Group>
          <Progress value={progressPercent} color="#1b4d3e" size="sm" radius="sm" />
        </Paper>

        <TextInput
          placeholder="Search lectures & topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={14} />}
          rightSection={
            searchQuery ? (
              <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setSearchQuery('')}>
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          size="xs"
          radius="sm"
          ff="monospace"
        />

        <SegmentedControl
          data={[
            { label: `All (${totalVideos})`, value: 'all' },
            { label: `Remaining (${totalVideos - totalCompleted})`, value: 'remaining' },
            { label: `Completed (${totalCompleted})`, value: 'completed' },
          ]}
          value={statusFilter}
          onChange={(val: string) => setStatusFilter(val as any)}
          size="xs"
          radius="sm"
          color="#1b4d3e"
          fullWidth
          styles={{ label: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase' } }}
        />
      </Stack>

      <Box style={{ flex: 1, overflowY: 'auto' }}>
        {filteredModules.length === 0 ? (
          <Box p="xl" ta="center">
            <Text size="xs" fw={700} tt="uppercase" ff="monospace">No matching lectures found</Text>
            <Text size="xs" c="dimmed" ff="monospace" mt={4}>Try searching for a different keyword or reset filters.</Text>
          </Box>
        ) : (
          <Accordion 
            multiple 
            value={expandedModules} 
            onChange={setExpandedModules}
            variant="separated"
            radius={0}
            styles={{
              item: { border: 'none', borderBottom: '1px solid #e9ecef', backgroundColor: 'transparent' },
              control: { backgroundColor: '#f8f9fa', '&:hover': { backgroundColor: '#f1f3f5' } },
              content: { padding: 0 }
            }}
          >
            {filteredModules.map((module, mIndex) => {
              const completedCount = module.videos.filter(v => completedVideos[v.id]).length;
              return (
                <Accordion.Item key={module.id} value={module.id}>
                  <Accordion.Control>
                    <Box>
                      <Text size={10} ff="monospace" fw={700} tt="uppercase" c="dimmed" lts={1}>
                        Module {mIndex + 1}
                      </Text>
                      <Text size="sm" fw={700} tt="uppercase" mt={2} lineClamp={1}>
                        {module.title}
                      </Text>
                      <Group gap="xs" mt={4}>
                        <Text size={10} ff="monospace" c="dimmed">{completedCount}/{module.videos.length} completed</Text>
                        <Text size={10} c="dimmed">•</Text>
                        <Text size={10} ff="monospace" c="dimmed">{module.videos.length * 5} min</Text>
                      </Group>
                    </Box>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap={0} style={{ borderTop: '1px solid #e9ecef' }}>
                      {module.videos.map((video, vIndex) => {
                        const isActive = activeVideoId === video.id;
                        const isChecked = !!completedVideos[video.id];

                        return (
                          <Box
                            key={video.id}
                            onClick={() => onVideoSelect(video)}
                            style={{ 
                              cursor: 'pointer',
                              borderLeft: `2px solid ${isActive ? '#1b4d3e' : 'transparent'}`,
                              backgroundColor: isActive ? 'rgba(27, 77, 62, 0.05)' : isChecked ? '#f8f9fa' : 'white',
                              borderBottom: '1px solid #f1f3f5'
                            }}
                            p="sm"
                          >
                            <Group wrap="nowrap" align="flex-start" gap="sm">
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => toggleComplete(video.id, e as any)}
                                onClick={(e) => e.stopPropagation()}
                                color="#1b4d3e"
                                radius="sm"
                                size="xs"
                                mt={2}
                              />
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text size="xs" fw={isActive ? 700 : 500} td={isChecked ? 'line-through' : 'none'} c={isChecked ? 'dimmed' : 'black'} lineClamp={2}>
                                  {vIndex + 1}. {video.title}
                                </Text>
                                <Group gap="xs" mt={4}>
                                  <Group gap={4}>
                                    <IconPlayerPlay size={12} color="gray" />
                                    <Text size={10} ff="monospace" c="dimmed">{video.duration}</Text>
                                  </Group>
                                  {isActive && (
                                    <Badge color="#1b4d3e" variant="light" size="xs" radius="sm">Active</Badge>
                                  )}
                                </Group>
                              </Box>
                              <Badge variant="outline" color="gray" radius="sm" size="xs" ff="monospace" lts={1}>
                                Stream
                              </Badge>
                            </Group>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        )}
      </Box>
    </Stack>
  );
}
