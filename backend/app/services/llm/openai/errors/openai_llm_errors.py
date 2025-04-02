from core.errors import LLMError


class OpenAILLMError(LLMError):
    pass


class OpenAILLMClientError(OpenAILLMError):
    pass


class OpenAILLMCallError(OpenAILLMError):
    pass
