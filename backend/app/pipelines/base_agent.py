from core.interfaces import VectorDB, LLM


class BaseAgent:
    def __init__(self, vector_db: VectorDB, llm: LLM):
        self.vector_db = vector_db
        self.llm = llm
