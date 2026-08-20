"""Abstract base class for LLM providers."""

from __future__ import annotations

import abc
from typing import Any, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class LLMProvider(abc.ABC):
    """Abstract LLM provider interface.

    All LLM providers must implement this interface so the pipeline
    remains decoupled from any specific SDK (OpenAI, Anthropic, etc.).
    """

    @abc.abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_model: type[T],
        *,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> T:
        """Generate a structured response validated against a Pydantic model.

        Args:
            prompt: The user prompt.
            response_model: Pydantic model class to validate the output.
            system_prompt: Optional system prompt.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens in the response.

        Returns:
            A validated instance of `response_model`.

        Raises:
            LLMError: If the LLM call fails or output cannot be parsed.
        """
        ...

    @abc.abstractmethod
    async def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """Generate a plain-text response.

        Args:
            prompt: The user prompt.
            system_prompt: Optional system prompt.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens in the response.

        Returns:
            The generated text.
        """
        ...


class LLMError(Exception):
    """Raised when an LLM call fails."""

    def __init__(self, message: str, *, cause: Exception | None = None) -> None:
        super().__init__(message)
        self.cause = cause
