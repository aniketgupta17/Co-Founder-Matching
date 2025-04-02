from typing import Any, Dict

from core.models.vector_db_models import IndexRecord


class PCIndexRecord(IndexRecord):

    def dump_for_upsert(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "values": self.vector,
            "metadata": self.metadata.model_dump(),
        }
