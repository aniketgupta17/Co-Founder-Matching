from fastapi import APIRouter
from typing import List, TypeVar
from pydantic import BaseModel

matching_agent_router = APIRouter(prefix="/agents/matching")

ProfileType = TypeVar("ProfileType", bound=BaseModel)


@matching_agent_router
def add_profile(profile: ProfileType):
    raise NotImplementedError()


@matching_agent_router.get("/profile_search")
def profile_search(profile: ProfileType) -> List[ProfileType]:
    raise NotImplementedError()
