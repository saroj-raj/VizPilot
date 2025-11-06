from fastapi import APIRouter

router = APIRouter()


@router.get("/team")
def get_teams():
    return {"teams": []}

