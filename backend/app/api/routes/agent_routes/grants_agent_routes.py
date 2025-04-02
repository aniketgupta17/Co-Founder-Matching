from fastapi import APIRouter
from pipelines.models.grants_agent_models import GrantsIndexRecord

grants_agent_router = APIRouter(prefix="/agents/grants")


@grants_agent_router.post("/create")
def create_grant(grant: GrantsIndexRecord):
    pass
