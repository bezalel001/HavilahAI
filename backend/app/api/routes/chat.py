from fastapi import APIRouter

from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.demo_content import generate_chat_response


router = APIRouter()


@router.post(
    "/message",
    response_model=ChatMessageResponse,
    summary="Ask the AI tutor a question",
)
def chat_with_tutor(payload: ChatMessageRequest) -> ChatMessageResponse:
    return ChatMessageResponse(**generate_chat_response(payload.message))
