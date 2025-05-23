import logging

from pinecone import Pinecone, ServerlessSpec

from .deployment_settings import DeploymentSettings
from .errors import DeploymentError

logging.basicConfig(level=logging.INFO)


class BackendDeployment:
    def __init__(self, settings: DeploymentSettings):
        self.pinecone_settings = settings.pinecone_settings

    def _create_index(self) -> None:
        """Create a pinecone index.

        Raises:
            DeploymentError: if index creation fails
        """
        try:
            # Create Pinecone client
            logging.info("Connecting to Pinecone client")
            pc = Pinecone(api_key=self.pinecone_settings.api_key)

            # Create index if not exists
            if not pc.has_index(self.pinecone_settings.index_name):
                logging.info(f"Creating index: {self.pinecone_settings.index_name}")
                pc.create_index(
                    name=self.pinecone_settings.index_name,
                    vector_type=self.pinecone_settings.vector_type,
                    dimension=self.pinecone_settings.dimension,
                    spec=ServerlessSpec(
                        cloud=self.pinecone_settings.cloud,
                        region=self.pinecone_settings.region,
                    ),
                )
            else:
                logging.info(
                    f"Index with name {self.pinecone_settings.index_name} already exists"
                )

            # Check index statistics
            index = pc.Index(self.pinecone_settings.index_name)
            index_stats = index.describe_index_stats()
            index_records = index_stats["total_vector_count"]

            if index_records > 0:
                logging.warning(f"Index already contains {index_records} records")

            logging.info(f"Index stats:\n{index_stats}")

            return

        except Exception as e:
            logging.error("Index creation error", exc_info=True)
            raise DeploymentError(f"Index creation error: {e}") from e

    def deploy(self):
        """Deploys resources for backend."""
        self._create_index()


def main():
    deployment_settings = DeploymentSettings()
    backend = BackendDeployment(deployment_settings)
    backend.deploy()


if __name__ == "__main__":
    main()
