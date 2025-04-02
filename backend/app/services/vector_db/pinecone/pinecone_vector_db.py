import logging
from typing import List

from core.interfaces import VectorDB
from pinecone import Pinecone

from .config import PCVectorDBConfig
from .errors import (
    PCVectorDBClientError,
    PCVectorDBIndexError,
    PCVectorDBOperationError,
)
from .models import PCIndexRecord


class PCVectorDB(VectorDB):
    def __init__(self, config: PCVectorDBConfig):
        self.client = self._setup_client(config.api_key)
        self.index = self._setup_index(config.index_name)

    def _setup_client(self, api_key: str) -> Pinecone:
        """Setup Pinecone client.

        Args:
            api_key (str): pinecone api key

        Raises:
            PCVectorDBClientError: if client setup fails

        Returns:
            Pinecone: pinecone client
        """
        try:
            return Pinecone(api_key=api_key)

        except Exception as e:
            logging.error("Pinecone client setup error", exc_info=True)
            raise PCVectorDBClientError(
                "Pinecone client setup error",
            ) from e

    def _setup_index(self, index_name: str):
        """Connects to pinecone index using index name.

        Args:
            index_name (str): index name

        Raises:
            PCVectorDBClientError: if index connection fails

        Returns:
            Pinecone.Index: pinecone index
        """
        try:
            index = self.client.Index(index_name)
            index.describe_index_stats()

            return index

        except Exception as e:
            logging.error("Pinecone index setup error", exc_info=True)
            raise PCVectorDBIndexError(
                "Pinecone index setup error",
            ) from e

    def upsert_record(self, record: PCIndexRecord):
        """Upsert a single index record.

        Args:
            record (PCIndexRecord): index record model

        Raises:
            PCVectorDBOperationError: if record upsert fails
        """
        try:
            records = [record.dump_for_upsert()]
            self.index.upsert(vectors=records)

        except Exception as e:
            logging.error("Pinecone record upsert error", exc_info=True)
            raise PCVectorDBOperationError(
                "Pinecone record upsert error",
            ) from e

    def upsert_records(self, records: List[PCIndexRecord]):
        """Upsert multiple index records.

        Args:
            records (List[PCIndexRecord]): list of index record models

        Raises:
            PCVectorDBOperationError: if record upsert fails
        """
        try:
            records = [record.dump_for_upsert() for record in records]
            self.index.upsert(vectors=records)

        except Exception as e:
            logging.error("Pinecone record upsert error", exc_info=True)
            raise PCVectorDBOperationError(
                "Pinecone record upsert error",
            ) from e

    def delete_record_by_id(self, id: str):
        try:
            self.index.delete(ids=[id])

        except Exception as e:
            logging.error("Pinecone record delete error", exc_info=True)
            raise PCVectorDBOperationError(
                "Pinecone record delete error",
            ) from e

    def delete_records_by_id(self, ids: List[str]):
        try:
            self.index.delete(ids=ids)

        except Exception as e:
            logging.error("Pinecone record delete error", exc_info=True)
            raise PCVectorDBOperationError(
                "Pinecone record delete error",
            ) from e

    def delete_records(self, *args, **kwargs):
        # TODO delete records by a filter
        raise NotImplementedError()

    def clear(self):
        try:
            self.index.delete(delete_all=True)

        except Exception as e:
            logging.error("Pinecone index clear error", exc_info=True)
            raise PCVectorDBOperationError(
                "Pinecone index clear error",
            ) from e

        return super().clear()

    def query(self, *args, **kwargs):
        # TODO query the index
        raise NotImplementedError()
