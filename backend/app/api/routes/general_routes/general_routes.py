from fastapi import APIRouter

general_routes = APIRouter("/general")


@general_routes.get("/search")
def search_index(req):
    pass
