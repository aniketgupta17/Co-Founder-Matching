from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class PineconeDeploymentSettings(BaseSettings):
    api_key: str = Field(alias="PINECONE_API_KEY")
    index_name: str = Field(alias="PINECONE_INDEX_NAME")
    region: str = Field(alias="PINECONE_REGION")
    cloud: str = Field(alias="PINECONE_CLOUD")
    vector_type: str = Field(alias="PINECONE_VECTOR_TYPE")
    dimension: int = Field(alias="PINECONE_DIMENSION")

    model_config = SettingsConfigDict(
        env_file="infra/.env", extra="ignore", case_sensitive=True
    )


class DeploymentSettings(BaseSettings):
    pinecone_settings: PineconeDeploymentSettings = Field(
        default=PineconeDeploymentSettings()
    )
