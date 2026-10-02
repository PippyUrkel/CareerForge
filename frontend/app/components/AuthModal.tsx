import React, { useState } from "react";
import {
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Group,
  Anchor,
  Alert,
  Divider,
  Box,
  Badge,
} from "@mantine/core";
import { IconAlertCircle, IconLock, IconMail, IconUser, IconStack2 } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signUp,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(authModalMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode whenever modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        await signUp(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={isAuthModalOpen}
      onClose={closeAuthModal}
      size="sm"
      radius="md"
      centered
      withCloseButton
      title={
        <Group gap="xs">
          <Box
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              backgroundColor: "#1b4d3e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <IconStack2 size={16} stroke={2.5} />
          </Box>
          <Text fw={700} size="sm" c="var(--cf-text)">
            {mode === "login" ? "Sign in to CareerForge" : "Create CareerForge Account"}
          </Text>
        </Group>
      }
      styles={{
        header: { borderBottom: "1px solid var(--cf-border)", padding: "14px 18px" },
        body: { padding: "20px 18px" },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              radius="sm"
              styles={{ message: { fontSize: "12px" } }}
            >
              {error}
            </Alert>
          )}

          {mode === "signup" && (
            <TextInput
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              leftSection={<IconUser size={16} color="var(--cf-text-muted)" />}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
              size="sm"
              radius="sm"
            />
          )}

          <TextInput
            label="Email Address"
            placeholder="you@example.com"
            leftSection={<IconMail size={16} color="var(--cf-text-muted)" />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            size="sm"
            radius="sm"
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            leftSection={<IconLock size={16} color="var(--cf-text-muted)" />}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            size="sm"
            radius="sm"
            description={mode === "signup" ? "Must be at least 8 characters" : undefined}
          />

          <Button
            type="submit"
            color="forest"
            size="sm"
            radius="sm"
            fullWidth
            loading={isSubmitting}
            mt="xs"
          >
            {mode === "login" ? "Sign In" : "Create Account & Continue"}
          </Button>

          <Divider my={4} style={{ borderColor: "rgba(0,0,0,0.06)" }} />

          <Group justify="center" gap={6}>
            <Text size="xs" c="dimmed">
              {mode === "login" ? "Don't have an account?" : "Already registered?"}
            </Text>
            <Anchor
              component="button"
              type="button"
              size="xs"
              c="forest"
              fw={700}
              onClick={() => {
                setError(null);
                setMode(mode === "login" ? "signup" : "login");
              }}
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
