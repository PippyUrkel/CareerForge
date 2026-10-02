import React from 'react';
import { Box, Paper, Group, Text, Button, ActionIcon, Stack, Badge, Image, AspectRatio } from '@mantine/core';
import { IconPlayerPlay, IconPlus, IconChevronLeft, IconChevronRight, IconCheck } from '@tabler/icons-react';
import type { Video } from './CourseSidebar';

export interface VideoPlayerProps {
  video: Video | null;
  onOpenGenerator: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

export function VideoPlayer({ 
  video, 
  onOpenGenerator,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  isCompleted = false,
  onToggleComplete
}: VideoPlayerProps) {
  if (!video) {
    return (
      <Box style={{ borderBottom: '1px solid #e9ecef' }}>
        <AspectRatio ratio={16 / 9} style={{ backgroundColor: '#f1f3f5' }}>
          <Stack align="center" justify="center" gap="md" p="xl" style={{ textAlign: 'center' }}>
            <ActionIcon size="xl" radius="sm" variant="outline" color="#1b4d3e" style={{ backgroundColor: 'white' }}>
              <IconPlayerPlay size={24} />
            </ActionIcon>
            <Box>
              <Text size="lg" fw={700} tt="uppercase">
                Interactive Learning Canvas
              </Text>
              <Text size="sm" c="dimmed" mt="xs" maw={400} mx="auto">
                Select a lecture from the curriculum sidebar to stream or generate a new customized course track.
              </Text>
            </Box>
            <Button 
              color="#1b4d3e" 
              radius="sm" 
              leftSection={<IconPlus size={16} />} 
              onClick={onOpenGenerator}
              tt="uppercase"
              lts={1}
            >
              Generate Curriculum
            </Button>
          </Stack>
        </AspectRatio>
      </Box>
    );
  }

  const isYouTube = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');
  let embedUrl = video.videoUrl;

  if (isYouTube && video.videoUrl) {
    try {
      const urlObj = new URL(video.videoUrl);
      const vid = urlObj.searchParams.get('v');
      if (vid) {
        embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&modestbranding=1&rel=0`;
      }
    } catch {
      // Keep original URL
    }
  }

  return (
    <Box style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#1a1b1e' }}>
      <AspectRatio ratio={16 / 9} style={{ position: 'relative' }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            style={{ border: 0, width: '100%', height: '100%' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <Box style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <Image 
              src={video.thumbnail} 
              alt={video.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
            />
            <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
            <ActionIcon 
              size={48} 
              radius="sm" 
              variant="filled" 
              color="white" 
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, color: '#1b4d3e' }}
            >
              <IconPlayerPlay size={24} />
            </ActionIcon>
            <Stack gap={4} style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10 }}>
              <Text size="xs" ff="monospace" c="white" tt="uppercase" fw={700} style={{ opacity: 0.8 }}>{video.author}</Text>
              <Text size="sm" fw={700} c="white" tt="uppercase" lineClamp={1}>{video.title}</Text>
            </Stack>
          </Box>
        )}
      </AspectRatio>

      <Group justify="space-between" px="md" py="xs" bg="white" style={{ borderTop: '1px solid #e9ecef' }}>
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Text fw={700} size="xs" tt="uppercase" truncate style={{ maxWidth: 300 }}>
            {video.title}
          </Text>
          <Text c="dimmed" display={{ base: 'none', sm: 'block' }}>•</Text>
          <Text c="dimmed" size="xs" ff="monospace" display={{ base: 'none', sm: 'block' }}>{video.duration}</Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          {onToggleComplete && (
            <Button
              variant={isCompleted ? "light" : "default"}
              color={isCompleted ? "green" : "gray"}
              size="compact-sm"
              radius="sm"
              leftSection={isCompleted ? <IconCheck size={14} /> : <IconCheck size={14} color="transparent" style={{ border: '1px solid currentColor', borderRadius: 2 }} />}
              onClick={onToggleComplete}
              tt="uppercase"
              ff="monospace"
              style={{ fontSize: 10 }}
            >
              {isCompleted ? 'Completed' : 'Mark Done'}
            </Button>
          )}

          {onPrevious && (
            <ActionIcon
              variant="default"
              size="md"
              radius="sm"
              disabled={!hasPrevious}
              onClick={onPrevious}
              title="Previous lesson"
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
          )}

          {onNext && (
            <ActionIcon
              variant="default"
              size="md"
              radius="sm"
              disabled={!hasNext}
              onClick={onNext}
              title="Next lesson"
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Box>
  );
}
