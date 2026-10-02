import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  Box,
  Group,
  Text,
  Badge,
  Button,
  UnstyledButton,
  Divider,
  Anchor,
  Menu,
  ActionIcon,
  Avatar,
} from '@mantine/core';
import {
  IconStack2,
  IconDatabase,
  IconPlus,
  IconUser,
  IconLayoutDashboard,
  IconLogout,
  IconSparkles,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

export interface PlatformHeaderProps {
  onOpenGenerator?: () => void;
  onOpenLibrary?: () => void;
  savedCoursesCount?: number;
}

/**
 * PlatformHeader provides architectural global navigation across all CareerForge modules.
 * Features crisp geometric framing, sharp structural tabs, and technical monospaced metadata.
 */
export function PlatformHeader({ 
  onOpenGenerator, 
  onOpenLibrary, 
  savedCoursesCount 
}: PlatformHeaderProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, profile, logout, openAuthModal } = useAuth();

  const navItems = [
    { path: '/generator', label: 'Course Studio', isWip: false },
    { path: '/skills', label: 'Skill Gap Analysis', isWip: true },
    { path: '/careers', label: 'Career Paths', isWip: true },
    { path: '/learning-paths', label: 'Learning Paths', isWip: true },
    { path: '/jobs', label: 'Job Aggregator', isWip: true },
    { path: '/jobs/matching', label: 'Job Matching', isWip: true },
    { path: '/analytics', label: 'Analytics', isWip: true },
  ];

  if (user) {
    navItems.unshift({ path: '/dashboard', label: 'Dashboard', isWip: false });
  }

  return (
    <Box 
      component="header" 
      h={56} 
      bg="white" 
      pos="sticky" 
      top={0} 
      style={{ 
        zIndex: 30, 
        borderBottom: '1px solid var(--mantine-color-gray-3)' 
      }}
      px={{ base: 'md', sm: 'xl', lg: 40 }}
      display="flex"
    >
      <Group justify="space-between" h="100%" w="100%" wrap="nowrap">
        {/* Left: Brand & Navigation */}
        <Group wrap="nowrap" flex={1} h="100%" gap="lg">
          {/* Brand */}
          <Anchor component={Link} to="/" underline="never" c="black">
            <Group gap="sm" wrap="nowrap">
              <Box 
                bg="#1b4d3e" 
                w={28} 
                h={28} 
                c="white"
                style={{ 
                  borderRadius: 'var(--mantine-radius-sm)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: 'var(--mantine-shadow-xs)'
                }}
              >
                <IconStack2 size={16} stroke={2.5} />
              </Box>
              <Text fw={700} size="sm" tt="uppercase" lts={-0.5}>
                CareerForge
              </Text>
            </Group>
          </Anchor>

          <Divider orientation="vertical" h={16} display={{ base: 'none', lg: 'block' }} />

          {/* Navigation Items */}
          <Group 
            component="nav" 
            gap={4} 
            h="100%" 
            wrap="nowrap" 
            display={{ base: 'none', md: 'flex' }}
            style={{ overflowX: 'auto' }}
          >
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path) && (item.path !== '/jobs' || currentPath === '/jobs'));
              return (
                <UnstyledButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  h="100%"
                  px="sm"
                  display="inline-flex"
                  style={{
                    alignItems: 'center',
                    borderBottom: isActive ? '2px solid #1b4d3e' : '2px solid transparent',
                    color: isActive ? '#1b4d3e' : 'var(--mantine-color-gray-6)',
                    backgroundColor: isActive ? 'var(--mantine-color-gray-0)' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                    if (!isActive) e.currentTarget.style.color = 'var(--mantine-color-dark-8)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    if (!isActive) e.currentTarget.style.color = 'var(--mantine-color-gray-6)';
                  }}
                >
                  <Group gap={6} wrap="nowrap">
                    <Text size="xs" fw={isActive ? 700 : 500}>{item.label}</Text>
                    {item.isWip && (
                      <Badge 
                        size="xs" 
                        variant="light" 
                        color="orange" 
                        radius="sm"
                        style={{ fontSize: 9, padding: '0 4px', height: 16 }}
                      >
                        WIP
                      </Badge>
                    )}
                  </Group>
                </UnstyledButton>
              );
            })}
          </Group>
        </Group>

        {/* Right: Actions */}
        <Group gap="sm" wrap="nowrap">
          {onOpenLibrary && (
            <Button
              variant="default"
              size="xs"
              radius="sm"
              leftSection={<IconDatabase size={14} color="#1b4d3e" />}
              onClick={onOpenLibrary}
              rightSection={
                savedCoursesCount !== undefined && savedCoursesCount > 0 ? (
                  <Badge size="xs" color="#1b4d3e" radius="sm" variant="light" h={18} px={4}>
                    {savedCoursesCount}
                  </Badge>
                ) : undefined
              }
            >
              Library
            </Button>
          )}

          {onOpenGenerator ? (
            <Button
              size="xs"
              radius="sm"
              color="#1b4d3e"
              onClick={onOpenGenerator}
              leftSection={<IconPlus size={14} />}
            >
              New Course
            </Button>
          ) : (
            <Button
              component={Link}
              to="/generator"
              size="xs"
              radius="sm"
              color="#1b4d3e"
            >
              Course Studio
            </Button>
          )}

          {/* User Auth Section */}
          {user ? (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid var(--cf-border)',
                    backgroundColor: 'var(--cf-surface)',
                  }}
                >
                  <Avatar size={24} radius="sm" color="forest">
                    {(profile?.name || user.name || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="xs" fw={700} c="var(--cf-text)" visibleFrom="sm" maw={110} truncate>
                    {profile?.name || user.name || 'Account'}
                  </Text>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>
                  <Text size="xs" fw={700} c="var(--cf-text)">
                    {profile?.name || user.name}
                  </Text>
                  <Text size="10px" c="dimmed" truncate>
                    {user.email}
                  </Text>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  component={Link}
                  to="/dashboard"
                  leftSection={<IconLayoutDashboard size={14} />}
                >
                  User Dashboard
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  to="/generator"
                  leftSection={<IconSparkles size={14} />}
                >
                  Course Studio
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={logout}
                >
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap={6} wrap="nowrap">
              <Button
                variant="subtle"
                size="xs"
                radius="sm"
                color="gray"
                onClick={() => openAuthModal("login")}
              >
                Sign In
              </Button>
              <Button
                color="forest"
                size="xs"
                radius="sm"
                onClick={() => openAuthModal("signup")}
              >
                Get Started
              </Button>
            </Group>
          )}
        </Group>
      </Group>
    </Box>
  );
}
