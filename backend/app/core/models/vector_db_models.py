from pydantic import BaseModel
from enum import Enum
from typing import List, Dict, Any


class Agent(str, Enum):
    """Chatbot Agents"""

    VENTURES = "ventures"
    EVENTS = "events"
    GRANTS = "grants"


class RecordMeta(BaseModel):
    agent: Agent


class IndexRecord(BaseModel):
    id: str
    vector: List[float]
    metadata: RecordMeta


class IndexQuery(BaseModel):
    query_text: str
    filters: Dict[str, Any]
    top_k: int = 10
