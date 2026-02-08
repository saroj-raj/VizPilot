from pydantic import BaseModel


class Document(BaseModel):
    id: int
    name: str
    text: str

