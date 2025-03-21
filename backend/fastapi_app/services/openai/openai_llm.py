import logging
from typing import Optional, List, Any, Type

from core.interfaces import LLM, ResponseModelType
from openai import OpenAI

from .config import OpenAILLMConfig, OpenAIModelArgs
from .errors import OpenAILLMClientError, OpenAILLMCallError


class OpenAILLM(LLM):
    def __init__(self, config: OpenAILLMConfig):
        self.model_args = config.model_args

        self.client = self._setup_client(config)

    def _setup_client(self, config: OpenAILLMConfig) -> OpenAI:
        """Setup OpenAI client.

        Args:
            config (OpenAILLMConfig): OpenAI config model

        Raises:
            OpenAILLMClientError: if client setup fails

        Returns:
            OpenAI: OpenAI client
        """
        try:
            return OpenAI(api_key=config)

        except Exception as e:
            logging.error("OpenAI client setup error", exc_info=True)
            raise OpenAILLMClientError("Failed to setup OpenAI client") from e

    def call(
        self,
        messages: List[Any],
        model_args: Optional[OpenAIModelArgs] = None,
    ) -> str:
        """Non-streaming OpenAI chat completion call.

        Args:
            messages (List[Any]): chat completion messages
            model_args (Optional[OpenAILLMConfig], optional): custom model args

        Raises:
            OpenAILLMCallError: if chat completion call fails

        Returns:
            str: response message content
        """
        try:
            args = model_args or self.model_args

            response = self.client.chat.completions.create(
                messages=messages,
                model=args.model,
                temperature=args.temperature,
                top_p=args.top_p,
                stream=False,
            )

            return response.choices[0].message.content

        except Exception as e:
            logging.error("OpenAI non-streaming call error", exc_info=True)
            raise OpenAILLMCallError("OpenAI non-streaming call error") from e

    def stream_call(
        self,
        messages: List[Any],
        model_args: Optional[OpenAILLMConfig] = None,
    ):
        """Streaming OpenAI chat completion call.

        Args:
            messages (List[Any]): chat completion messages
            model_args (Optional[OpenAILLMConfig], optional): custom model args

        Raises:
            OpenAILLMCallError: if chat completion call fails

        Yields:
            str: response message content chunks
        """
        try:
            args = model_args or self.model_args

            response = self.client.chat.completions.create(
                messages=messages,
                model=args.model,
                temperature=args.temperature,
                top_p=args.top_p,
                stream=True,
            )

            # Yield generated response chunks
            for chunk in response:
                if chunk.choices:
                    yield chunk.choices[0].delta.get("content", "")

        except Exception as e:
            logging.error("OpenAI streaming call error", exc_info=True)
            raise OpenAILLMCallError("OpenAI streaming call error") from e

    def structured_call(
        self,
        messages: List[Any],
        response_model: Type[ResponseModelType],
        model_args: Optional[OpenAILLMConfig] = None,
    ) -> ResponseModelType:
        """Structured OpenAI chat completion call.

        Args:
            messages (List[Any]): chat completion messages
            response_model (Type[ResponseModelType]): structured response model
            model_args (Optional[OpenAILLMConfig], optional): custom model args

        Raises:
            OpenAILLMCallError: if chat completion call fails

        Returns:
            ResponseModelType: response message parsed structure
        """
        try:
            args = model_args or self.model_args

            response = self.client.beta.chat.completions.parse(
                messages=messages,
                model=args.model,
                temperature=args.temperature,
                top_p=args.top_p,
                response_format=response_model,
            )

            return response.choices[0].message.parsed

        except Exception as e:
            logging.error("OpenAI structured call error", exc_info=True)
            raise OpenAILLMCallError("OpenAI structured call error") from e
