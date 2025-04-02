from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class PCVectorDBConfig(BaseSettings):
    api_key: str = Field(alias="PINECONE_API_KEY")
    index_name: str = Field(alias="PINECONE_INDEX_NAME")

    model_config = SettingsConfigDict(extra="ignore", case_sensitive=True)
