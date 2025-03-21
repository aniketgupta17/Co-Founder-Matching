from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class OpenAIModelArgs(BaseSettings):
    model: str = Field(alias="OPENAI_LLM_MODEL_NAME")
    temperature: float = Field(alias="OPENAI_LLM_TEMP")
    top_p: float = Field(alias="OPENAI_LLM_TOP_P")
    stream: bool = False
    # TODO more model args if needed

    model_config = SettingsConfigDict(extra="ignore", case_sensitive=True)


class OpenAILLMConfig(BaseSettings):
    api_key: str = Field(alias="OPENAI_API_KEY")
    model_args: OpenAIModelArgs = Field(default_factory=OpenAIModelArgs)

    model_config = SettingsConfigDict(extra="ignore", case_sensitive=True)
