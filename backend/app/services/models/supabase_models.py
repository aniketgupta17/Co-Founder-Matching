from pydantic import BaseModel
from typing import List, Optional


class CreateChat(BaseModel):
    created_at: str
    user_ids: List[str]
    name: Optional[str] = None
    is_ai: Optional[bool] = False

    def dump_insert_chat(self) -> List[dict]:
        return {
            "created_at": self.created_at,
            "name": self.name,
            "is_group": len(self.user_ids) > 2,
            "is_ai": False,
        }

    def dump_insert_members(self, chat_id: int) -> List[dict]:
        if not self.user_ids and len(self.user_ids) > 1:
            raise ValueError("Must have at least 2 users")

        return [
            {"created_at": self.created_at, "user_id": user_id, "chat_id": chat_id}
            for user_id in self.user_ids
        ]
