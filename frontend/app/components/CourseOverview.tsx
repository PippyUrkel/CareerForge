import React, { useState, useEffect } from 'react';
import { Tabs, Paper, Group, Stack, Grid, Text, Title, Badge, TextInput, Textarea, Button, Divider, ActionIcon, SimpleGrid, Box, Anchor, ThemeIcon } from '@mantine/core';
import { IconStar, IconCheck, IconPlus, IconTrash, IconChevronUp, IconMessage, IconExternalLink, IconClock, IconSearch, IconBulb, IconCode, IconNotebook, IconMessages } from '@tabler/icons-react';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  videoUrl?: string;
}

export interface CourseMeta {
  title?: string;
  topic?: string;
  difficulty?: string;
  targetAudience?: string;
}

export interface CourseOverviewProps {
  activeVideo: Video | null;
  courseMeta: CourseMeta;
  totalLectures: number;
}

interface NoteItem {
  id: string;
  timestamp: string;
  text: string;
  lessonTitle: string;
  createdAt: string;
}

interface QuestionItem {
  id: string;
  author: string;
  title: string;
  body: string;
  votes: number;
  replies: number;
  lessonTitle: string;
  hasUpvoted?: boolean;
}

export function CourseOverview({ activeVideo, courseMeta, totalLectures }: CourseOverviewProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('careerforge_notes');
      return saved ? JSON.parse(saved) : [
        {
          id: 'note-1',
          timestamp: '02:15',
          text: 'Core architecture overview: separation between data modeling and view logic is crucial.',
          lessonTitle: activeVideo?.title || 'Course Introduction',
          createdAt: 'Just now'
        }
      ];
    } catch {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTimestamp, setNewNoteTimestamp] = useState('01:30');

  useEffect(() => {
    try {
      localStorage.setItem('careerforge_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      timestamp: newNoteTimestamp || '00:00',
      text: newNoteText.trim(),
      lessonTitle: activeVideo?.title || 'General Note',
      createdAt: 'Just now'
    };
    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q-1',
      author: 'Alex Morgan',
      title: 'How does parameter passing behave across scope boundaries?',
      body: 'In section 2, the instructor mentions mutable versus immutable arguments. Can someone clarify reference passing?',
      votes: 14,
      replies: 3,
      lessonTitle: 'Variables & Scope'
    },
    {
      id: 'q-2',
      author: 'David Chen',
      title: 'Recommended project structures for large modular applications?',
      body: 'What are the recommended package hierarchies when separating business logic from utility handlers?',
      votes: 9,
      replies: 2,
      lessonTitle: 'Modular Components'
    }
  ]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionBody, setNewQuestionBody] = useState('');
  const [showAskForm, setShowAskForm] = useState(false);

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) return;
    const newQuestion: QuestionItem = {
      id: `q-${Date.now()}`,
      author: 'You',
      title: newQuestionTitle.trim(),
      body: newQuestionBody.trim() || 'No additional details provided.',
      votes: 1,
      replies: 0,
      lessonTitle: activeVideo?.title || 'General Discussion',
      hasUpvoted: true
    };
    setQuestions([newQuestion, ...questions]);
    setNewQuestionTitle('');
    setNewQuestionBody('');
    setShowAskForm(false);
  };

  const handleVote = (id: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const hasUpvoted = q.hasUpvoted;
        return {
          ...q,
          votes: hasUpvoted ? q.votes - 1 : q.votes + 1,
          hasUpvoted: !hasUpvoted
        };
      }
      return q;
    }));
  };

  const getDifficultyColor = (difficulty?: string) => {
    const diff = difficulty?.toLowerCase() || 'beginner';
    if (diff === 'intermediate') return 'blue';
    if (diff === 'advanced') return 'orange';
    if (diff === 'expert') return 'red';
    return 'teal';
  };

  return (
    <Box bg="#f8f9fa" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Tabs 
        value={activeTab} 
        onChange={(val) => val && setActiveTab(val)}
        color="#1b4d3e"
        styles={{
          root: { backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #e9ecef' },
          list: { paddingLeft: 16, paddingRight: 16, borderBottom: 'none' },
          tab: { fontWeight: 500, fontSize: 14, padding: '14px 4px', marginRight: 24 }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconBulb size={16} />}>Curriculum Overview</Tabs.Tab>
          <Tabs.Tab value="notes" leftSection={<IconNotebook size={16} />}>Study Notes ({notes.length})</Tabs.Tab>
          <Tabs.Tab value="qa" leftSection={<IconMessages size={16} />}>Discussion & Q&A ({questions.length})</Tabs.Tab>
          <Tabs.Tab value="resources" leftSection={<IconCode size={16} />}>Resources & Reference</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box p="md" style={{ flex: 1 }}>
        {activeTab === 'overview' && (
          <Stack gap="lg">
            <Paper p="xl" radius="sm" withBorder shadow="xs">
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <Badge color="#1b4d3e" variant="light" size="sm" radius="sm" leftSection={<IconBulb size={10} />}>
                      AI Synthesized Curriculum
                    </Badge>
                    {courseMeta.difficulty && (
                      <Badge color={getDifficultyColor(courseMeta.difficulty)} variant="outline" size="sm" radius="sm">
                        {courseMeta.difficulty} Level
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs">
                    <Text fw={700} ff="monospace" size="sm">{totalLectures}</Text>
                    <Text size="xs" c="dimmed" tt="uppercase" ff="monospace">Sequential Modules</Text>
                  </Group>
                </Group>

                <Box>
                  <Title order={1} size="h2" tt="uppercase" style={{ letterSpacing: '-0.5px' }}>
                    {courseMeta.title || (activeVideo ? activeVideo.title : "Python Fundamentals")}
                  </Title>
                  <Text size="sm" c="dimmed" mt="xs" maw={800}>
                    Comprehensive educational pathway structured around {courseMeta.topic || "modern programming practices"}. Designed specifically for {courseMeta.targetAudience || "developers"} with step-by-step video sequencing and multi-signal ranking.
                  </Text>
                </Box>

                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mt="md">
                  {[
                    { label: 'Domain Area', value: courseMeta.topic || "Programming" },
                    { label: 'Target Audience', value: courseMeta.targetAudience || "All Learners" },
                    { label: 'Delivery Mode', value: 'Self-Paced Stream' },
                    { label: 'Ranking Engine', value: 'Multi-Signal Dense', color: '#1b4d3e' }
                  ].map((stat, i) => (
                    <Paper key={i} p="sm" radius="sm" bg="#f8f9fa" withBorder>
                      <Text size={10} ff="monospace" tt="uppercase" c="dimmed" fw={700}>{stat.label}</Text>
                      <Text size="sm" fw={600} mt={4} truncate c={stat.color || 'black'}>{stat.value}</Text>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>

            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Stack gap="lg">
                  <Paper p="xl" radius="sm" withBorder shadow="xs">
                    <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '1px solid #e9ecef' }}>
                      <Text fw={700} tt="uppercase" size="sm">Core Learning Competencies</Text>
                      <Text size={11} ff="monospace" fw={700} c="dimmed" tt="uppercase">4 Key Modules</Text>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      {[
                        { title: 'Syntax & Foundations', desc: 'Variables, types, control structures, and functional patterns.' },
                        { title: 'Data Collections', desc: 'Sequences, mappings, comprehensions, and memory optimization.' },
                        { title: 'Modular Architecture', desc: 'Package management, reusable components, and API integration.' },
                        { title: 'Testing & Verification', desc: 'Unit testing, validation routines, and real-world project deployment.' }
                      ].map((comp, i) => (
                        <Group key={i} p="sm" bg="#f8f9fa" wrap="nowrap" align="flex-start" style={{ border: '1px solid #e9ecef', borderLeft: '2px solid #2b8a3e' }}>
                          <ThemeIcon color="green" variant="light" size="sm" radius="sm" mt={2}>
                            <IconCheck size={12} />
                          </ThemeIcon>
                          <Box>
                            <Text size="xs" fw={700} tt="uppercase" mb={2}>{comp.title}</Text>
                            <Text size="xs" c="dimmed">{comp.desc}</Text>
                          </Box>
                        </Group>
                      ))}
                    </SimpleGrid>
                  </Paper>

                  <Paper p="xl" radius="sm" withBorder shadow="xs">
                    <Text fw={700} tt="uppercase" size="sm" mb="sm">Requirements & Target Environment</Text>
                    <Stack gap="xs" pl="md" style={{ listStyleType: 'disc' }} component="ul">
                      <Text size="xs" c="dimmed" component="li">Basic familiarity with general computing concepts and terminal navigation.</Text>
                      <Text size="xs" c="dimmed" component="li">No prior specialized domain knowledge required for beginner track modules.</Text>
                      <Text size="xs" c="dimmed" component="li">Code editor or web browser equipped to execute interactive code walk-throughs.</Text>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="lg">
                  {activeVideo && (
                    <Paper p="lg" radius="sm" withBorder shadow="xs">
                      <Group justify="space-between" mb="sm">
                        <Badge color="#1b4d3e" variant="light" radius="sm" size="xs" ff="monospace">
                          Active Lesson
                        </Badge>
                        <Text size="xs" ff="monospace" c="dimmed" fw={500}>{activeVideo.duration}</Text>
                      </Group>
                      <Text size="sm" fw={700} mb="sm">{activeVideo.title}</Text>
                      <Divider mb="sm" />
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed">Instructor: <Text component="span" fw={600} c="black">{activeVideo.author || "Curated Educator"}</Text></Text>
                        <Text size="xs" c="dimmed">Status: <Text component="span" fw={500} c="green">Ready to Stream</Text></Text>
                      </Stack>
                    </Paper>
                  )}

                  <Paper p="lg" radius="sm" withBorder shadow="xs">
                    <Group wrap="nowrap" gap="sm" mb="sm">
                      <ThemeIcon size={40} color="#1b4d3e" radius="sm">
                        <Text fw={700} size="sm">{activeVideo?.author ? activeVideo.author.charAt(0).toUpperCase() : 'C'}</Text>
                      </ThemeIcon>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={700} truncate>{activeVideo?.author || "CareerForge Curated Instructor"}</Text>
                        <Text size={11} ff="monospace" c="dimmed" tt="uppercase">Educational Content Lead</Text>
                      </Box>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Lectures are sourced from verified high-ranking educational repositories and structured by AI taxonomy analysis.
                    </Text>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        )}

        {activeTab === 'notes' && (
          <Stack gap="lg">
            <Paper p="xl" radius="sm" withBorder shadow="xs">
              <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '1px solid #e9ecef' }}>
                <Box>
                  <Text fw={700} tt="uppercase" size="sm">Interactive Lesson Notepad</Text>
                  <Text size="xs" c="dimmed" mt={4}>Take notes timestamped to the active video lesson.</Text>
                </Box>
                <Group gap="xs">
                  <Text size="xs" ff="monospace" c="dimmed" tt="uppercase">Timestamp:</Text>
                  <TextInput 
                    value={newNoteTimestamp} 
                    onChange={(e) => setNewNoteTimestamp(e.currentTarget.value)} 
                    placeholder="01:30" 
                    size="xs" 
                    radius="sm" 
                    w={64} 
                    ff="monospace"
                    styles={{ input: { textAlign: 'center' } }}
                  />
                </Group>
              </Group>

              <form onSubmit={handleAddNote}>
                <Stack gap="sm">
                  <Textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.currentTarget.value)}
                    placeholder={`Write your key insights, code snippets, or thoughts for "${activeVideo?.title || 'this lesson'}"...`}
                    minRows={3}
                    radius="sm"
                    ff="monospace"
                    size="sm"
                  />
                  <Group justify="space-between">
                    <Text size={11} c="dimmed">Notes are saved locally in your browser workspace.</Text>
                    <Button 
                      type="submit" 
                      color="#1b4d3e" 
                      radius="sm" 
                      size="xs" 
                      tt="uppercase" 
                      leftSection={<IconPlus size={14} />}
                    >
                      Save Note
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>

            <Stack gap="sm">
              <Group justify="space-between" pb="xs" style={{ borderBottom: '1px solid #e9ecef' }}>
                <Text size="xs" ff="monospace" fw={700} tt="uppercase" c="dimmed">Saved Notes ({notes.length})</Text>
                {notes.length > 0 && (
                  <Anchor component="button" size="xs" c="red" ff="monospace" tt="uppercase" fw={700} onClick={() => { if(confirm('Clear all notes?')) setNotes([]); }}>
                    Clear All
                  </Anchor>
                )}
              </Group>

              {notes.length === 0 ? (
                <Paper p="xl" radius="sm" withBorder ta="center" bg="white">
                  <Text fw={700} size="sm" tt="uppercase">No notes recorded yet</Text>
                  <Text size="xs" c="dimmed" mt={8}>Type your observations above to keep a personal study journal.</Text>
                </Paper>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                  {notes.map(note => (
                    <Paper key={note.id} p="md" radius="sm" withBorder shadow="xs" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Stack gap="xs" mb="md">
                        <Group justify="space-between">
                          <Badge color="#1b4d3e" variant="light" radius="sm" size="sm" ff="monospace">{note.timestamp}</Badge>
                          <Text size={11} ff="monospace" c="dimmed">{note.createdAt}</Text>
                        </Group>
                        <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>{note.text}</Text>
                      </Stack>
                      <Group justify="space-between" pt="sm" style={{ borderTop: '1px solid #e9ecef' }}>
                        <Text size={11} ff="monospace" c="dimmed" fw={500} truncate maw={200}>{note.lessonTitle}</Text>
                        <Anchor component="button" size={11} ff="monospace" c="red" fw={700} tt="uppercase" onClick={() => handleDeleteNote(note.id)}>
                          Delete
                        </Anchor>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          </Stack>
        )}

        {activeTab === 'qa' && (
          <Stack gap="lg">
            <Paper p="md" radius="sm" withBorder shadow="xs">
              <Group justify="space-between" gap="sm">
                <TextInput
                  placeholder="Search course discussion and student questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  size="sm"
                  radius="sm"
                  ff="monospace"
                  style={{ flex: 1 }}
                />
                <Button 
                  color="#1b4d3e" 
                  radius="sm" 
                  tt="uppercase" 
                  leftSection={<IconPlus size={14} />}
                  onClick={() => setShowAskForm(!showAskForm)}
                >
                  Ask a Question
                </Button>
              </Group>
            </Paper>

            {showAskForm && (
              <Paper p="lg" radius="sm" withBorder shadow="xs" style={{ borderColor: '#1b4d3e' }}>
                <form onSubmit={handlePostQuestion}>
                  <Stack gap="sm">
                    <Text size="sm" fw={700} tt="uppercase">Post a Question for this Curriculum</Text>
                    <TextInput
                      required
                      placeholder="Summarize your question or technical blocker..."
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.currentTarget.value)}
                      radius="sm"
                    />
                    <Textarea
                      placeholder="Provide context, code snippets, or what you've tried..."
                      value={newQuestionBody}
                      onChange={(e) => setNewQuestionBody(e.currentTarget.value)}
                      minRows={3}
                      radius="sm"
                      ff="monospace"
                    />
                    <Group justify="flex-end" gap="sm">
                      <Button variant="subtle" color="gray" radius="sm" size="xs" ff="monospace" tt="uppercase" onClick={() => setShowAskForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" color="#1b4d3e" radius="sm" size="xs" tt="uppercase">
                        Publish Question
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Paper>
            )}

            <Stack gap="sm">
              {questions
                .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.body.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(q => (
                  <Paper key={q.id} p="lg" radius="sm" withBorder shadow="xs">
                    <Group wrap="nowrap" align="flex-start" justify="space-between" gap="md">
                      <Stack gap="xs" style={{ minWidth: 0, flex: 1 }}>
                        <Group gap="xs" align="center">
                          <Text size="xs" fw={700} ff="monospace">{q.author}</Text>
                          <Text size="xs" c="dimmed">•</Text>
                          <Text size="xs" fw={600} ff="monospace" c="#1b4d3e">{q.lessonTitle}</Text>
                        </Group>
                        <Text size="sm" fw={700}>{q.title}</Text>
                        <Text size="xs" c="dimmed">{q.body}</Text>
                      </Stack>
                      <Button
                        variant={q.hasUpvoted ? "light" : "default"}
                        color={q.hasUpvoted ? "#1b4d3e" : "gray"}
                        p="xs"
                        h="auto"
                        radius="sm"
                        onClick={() => handleVote(q.id)}
                        style={{ flexDirection: 'column' }}
                      >
                        <IconChevronUp size={16} />
                        <Text size="xs" ff="monospace" fw={700} mt={4}>{q.votes}</Text>
                      </Button>
                    </Group>
                    <Group justify="space-between" pt="sm" mt="md" style={{ borderTop: '1px solid #e9ecef' }}>
                      <Group gap="xs">
                        <IconMessage size={14} color="gray" />
                        <Text size="xs" ff="monospace" c="dimmed">{q.replies} Community Responses</Text>
                      </Group>
                      <Anchor component="button" size="xs" c="#1b4d3e" fw={700} tt="uppercase">
                        Reply
                      </Anchor>
                    </Group>
                  </Paper>
                ))}
            </Stack>
          </Stack>
        )}

        {activeTab === 'resources' && (
          <Stack gap="lg">
            <Paper p="xl" radius="sm" withBorder shadow="xs">
              <Box mb="md" pb="sm" style={{ borderBottom: '1px solid #e9ecef' }}>
                <Text fw={700} tt="uppercase" size="sm">Verified Course References</Text>
                <Text size="xs" c="dimmed" mt={4}>Download syllabus cheatsheets, starter code repositories, and documentation.</Text>
              </Box>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                <Paper 
                  component="a" 
                  href="https://docs.python.org/3/" 
                  target="_blank" 
                  rel="noreferrer" 
                  p="md" 
                  radius="sm" 
                  withBorder 
                  bg="#f8f9fa" 
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={4}>
                      <Text size="xs" fw={700} tt="uppercase" c="#1b4d3e">Official Language Documentation & Standard Library</Text>
                      <Text size={11} c="dimmed">Comprehensive syntax references, built-in functions, and official runtime specs.</Text>
                    </Stack>
                    <IconExternalLink size={16} color="gray" />
                  </Group>
                </Paper>

                <Paper p="md" radius="sm" withBorder bg="#f8f9fa">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={4}>
                      <Text size="xs" fw={700} tt="uppercase">Curriculum Cheatsheet & Code Starter</Text>
                      <Text size={11} c="dimmed">Bundled Markdown summary containing code recipes and module exercises.</Text>
                    </Stack>
                    <Badge color="teal" variant="light" size="xs" radius="sm" ff="monospace">
                      Included
                    </Badge>
                  </Group>
                </Paper>
              </SimpleGrid>
            </Paper>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
