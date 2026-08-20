"""OpenAI-compatible LLM provider implementation with support for local endpoints (Ollama)."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, TypeVar

from pydantic import BaseModel, ValidationError

from app.core.config import AppSettings
from app.services.llm.base import LLMError, LLMProvider

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def _extract_json(text: str) -> Any:
    """Extract JSON data from raw LLM output, handling markdown fences and reasoning blocks."""
    # 1. Remove reasoning / thinking tags (e.g. <think>...</think>)
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    # 2. Try direct JSON parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Look for markdown code fence (```json ... ``` or ``` ... ```)
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fence_match:
        fenced_text = fence_match.group(1).strip()
        try:
            return json.loads(fenced_text)
        except json.JSONDecodeError:
            pass

    # 4. Fallback: extract the outermost balanced JSON object {...} or array [...]
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace : last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    first_bracket = cleaned.find("[")
    last_bracket = cleaned.rfind("]")
    if first_bracket != -1 and last_bracket > first_bracket:
        candidate = cleaned[first_bracket : last_bracket + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    raise json.JSONDecodeError("Could not extract valid JSON from LLM output", text, 0)


def _unwrap_root_key(data: Any, model_class: type[BaseModel]) -> Any:
    """Unwrap top-level wrapper keys (e.g., {'_LLMTaxonomyOutput': {...}} or {'response': {...}})."""
    if not isinstance(data, dict):
        return data

    expected_fields = set(model_class.model_fields.keys())
    # If the dict already has expected fields, return as is
    if any(k in data for k in expected_fields):
        return data

    # Check if a single top-level key wraps the actual payload
    for key, val in data.items():
        if isinstance(val, dict) and any(f in val for f in expected_fields):
            logger.info("Unwrapped top-level model key '%s' from LLM output", key)
            return val

    return data


class OpenAIProvider(LLMProvider):
    """LLM provider using the OpenAI SDK (works with Ollama and any OpenAI-compatible API)."""

    def __init__(self, settings: AppSettings) -> None:
        from openai import AsyncOpenAI

        api_key = settings.llm_api_key.strip() or "ollama"

        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=settings.llm_base_url,
            max_retries=settings.llm_max_retries,
            timeout=float(settings.llm_timeout),
        )
        self._model = settings.llm_model
        logger.info(
            "LLM provider initialized with model=%s, base_url=%s",
            self._model,
            settings.llm_base_url,
        )

    async def generate_structured(
        self,
        prompt: str,
        response_model: type[T],
        *,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> T:
        """Generate a structured response validated against a Pydantic model."""
        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # Build clean JSON schema instruction without confusing top-level titles
        schema_dict = response_model.model_json_schema()
        schema_dict.pop("title", None)
        schema_json = json.dumps(schema_dict, indent=2)

        schema_instruction = (
            "You MUST respond with a valid JSON object matching the properties defined below.\n"
            "Do NOT wrap the output in a root object with the schema name. Return the properties directly at the root level.\n"
            "Do NOT include any text, thoughts, or markdown outside the JSON object.\n\n"
            f"JSON Schema:\n```json\n{schema_json}\n```"
        )
        if system_prompt:
            messages[0]["content"] = system_prompt + "\n\n" + schema_instruction
        else:
            messages.insert(0, {"role": "system", "content": schema_instruction})

        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            logger.error("LLM API call failed: %s", exc)
            raise LLMError(f"LLM API call failed: {exc}", cause=exc) from exc

        raw_content = response.choices[0].message.content
        if not raw_content:
            raise LLMError("LLM returned empty content")

        logger.debug("LLM raw response: %s", raw_content[:500])

        try:
            parsed = _extract_json(raw_content)
        except json.JSONDecodeError as exc:
            raise LLMError(
                f"LLM returned invalid JSON: {raw_content[:200]}",
                cause=exc,
            ) from exc

        # Auto-unwrap if the model wrapped the output with its class name
        parsed = _unwrap_root_key(parsed, response_model)

        try:
            return response_model.model_validate(parsed)
        except ValidationError as exc:
            raise LLMError(
                f"LLM output failed Pydantic validation: {exc}",
                cause=exc,
            ) from exc

    async def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """Generate a plain-text response."""
        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        except Exception as exc:
            logger.error("LLM API call failed: %s", exc)
            raise LLMError(f"LLM API call failed: {exc}", cause=exc) from exc

        content = response.choices[0].message.content
        if not content:
            raise LLMError("LLM returned empty content")

        # Strip any thinking tags if present
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        return content
