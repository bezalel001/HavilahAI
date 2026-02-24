from datetime import datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_chat_tutor_service, get_current_active_user
from app.db.session import get_db
from app.models.chat import ChatMessage, ChatRole, ChatSession
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionCreateRequest,
    ChatSessionCreateResponse,
    ChatSessionMessage,
    ChatSessionMessageCreateRequest,
    ChatSessionResponse,
)
from app.services.ai_client import AIServiceError
from app.services.chat_tutor import ChatTutorService
from app.services.demo_content import CHAT_SUGGESTIONS


router = APIRouter()


@router.post(
    "/message",
    response_model=ChatMessageResponse,
    summary="Ask the AI tutor a question",
)
async def chat_with_tutor(
    payload: ChatMessageRequest,
    tutor_service: ChatTutorService = Depends(get_chat_tutor_service),
) -> ChatMessageResponse:
    try:
        reply = await tutor_service.generate_reply(
            [
                {"role": "user", "content": payload.message},
            ]
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return ChatMessageResponse(reply=reply, suggestions=CHAT_SUGGESTIONS)


@router.post(
    "/sessions",
    response_model=ChatSessionCreateResponse,
    summary="Create a new chat session",
)
def create_chat_session(
    payload: ChatSessionCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ChatSessionCreateResponse:
    session = ChatSession(title=payload.title, user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return ChatSessionCreateResponse(session_id=session.id, title=session.title)


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionResponse,
    summary="Get chat session history",
)
def get_chat_session(
    session_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ChatSessionResponse:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    payload = [
        ChatSessionMessage(
            id=item.id,
            role=item.role.value if hasattr(item.role, "value") else str(item.role),
            content=item.content,
            created_at=item.created_at or datetime.utcnow(),
        )
        for item in messages
    ]
    return ChatSessionResponse(session_id=session_id, messages=payload)


@router.post(
    "/sessions/{session_id}/messages",
    response_model=ChatSessionResponse,
    summary="Post a message to a chat session",
)
async def post_chat_message(
    session_id: UUID,
    payload: ChatSessionMessageCreateRequest,
    current_user: User = Depends(get_current_active_user),
    tutor_service: ChatTutorService = Depends(get_chat_tutor_service),
    db: Session = Depends(get_db),
) -> ChatSessionResponse:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")

    user_message = ChatMessage(
        session_id=session_id,
        role=ChatRole.user,
        content=payload.content,
    )
    db.add(user_message)

    db.flush()
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    chat_history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in reversed(history)
    ]
    try:
        ai_reply = await tutor_service.generate_reply(chat_history)
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    assistant_message = ChatMessage(
        session_id=session_id,
        role=ChatRole.assistant,
        content=ai_reply,
    )
    db.add(assistant_message)
    db.commit()

    messages = [
        ChatSessionMessage(
            id=user_message.id,
            role=user_message.role.value,
            content=user_message.content,
            created_at=user_message.created_at or datetime.utcnow(),
        ),
        ChatSessionMessage(
            id=assistant_message.id,
            role=assistant_message.role.value,
            content=assistant_message.content,
            created_at=assistant_message.created_at or datetime.utcnow(),
        ),
    ]
    return ChatSessionResponse(session_id=session_id, messages=messages)
