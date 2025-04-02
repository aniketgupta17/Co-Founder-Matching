from abc import ABC, abstractmethod
from typing import Any, List, TypeVar

from pydantic import BaseModel
from pydantic_settings import BaseSettings

VectorDBConfig = TypeVar("VectorDBConfig", bound=BaseSettings)
VectorDBRecord = TypeVar("VectorDBRecord", bound=BaseModel)


class VectorDB(ABC):
    """
    Abstract Vector DB class to be implemented.

    """

    @abstractmethod
    def __init__(self, config: VectorDBConfig):
        pass

    @abstractmethod
    def upsert_record(self, record: VectorDBRecord, *args, **kwargs) -> Any:
        """
        Upsert index record.

        """
        pass

    @abstractmethod
    def upsert_records(self, records: List[VectorDBRecord], *args, **kwargs) -> Any:
        """
        Upsert index records.

        """
        pass

    @abstractmethod
    def delete_record_by_id(self, id: str, *args, **kwargs) -> Any:
        """
        Delete index record by id.

        """
        pass

    @abstractmethod
    def delete_records_by_id(self, ids: List[str], *args, **kwargs) -> Any:
        """
        Delete index records by id.

        """
        pass

    @abstractmethod
    def delete_records(self, *args, **kwargs) -> Any:
        """
        General delete records (i.e by filter)

        """
        pass

    @abstractmethod
    def clear(self) -> Any:
        """
        Clear index.

        """
        pass

    @abstractmethod
    def query(self, *args, **kwargs) -> Any:
        """
        General index search.

        """
        pass
