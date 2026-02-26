from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.api import deps
from app.models.chat import ChatThread, ChatMessage, ChatRole, MessageStatus
from app.schemas.chat import ChatThread as ChatThreadSchema, ChatMessage as ChatMessageSchema, ChatThreadCreate
from app.models.user import User
from app.core.socket_manager import manager
from app.core import security
from jose import jwt, JWTError
from app.core.config import settings
from app.models.patient import Patient
from app.db.session import AsyncSessionLocal

router = APIRouter()

# REST Endpoints

@router.get("/threads", response_model=List[ChatThreadSchema])
async def read_threads(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # If doctor, show their threads? Or all? Requirement doesn't specify deeply.
    # Assuming doctor sees threads where they are assigned or all if Admin.
    # Let's show all for now or filter by doctor_id if current_user has a doctor profile.
    if current_user.role == "DOCTOR" and current_user.doctor:
         result = await db.execute(select(ChatThread).where(ChatThread.doctor_id == current_user.doctor.id))
    else:
         result = await db.execute(select(ChatThread))

    threads = result.scalars().all()
    return threads

@router.post("/threads", response_model=ChatThreadSchema)
async def create_thread(
    thread_in: ChatThreadCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Check if exists
    result = await db.execute(select(ChatThread).where(
        ChatThread.patient_id == thread_in.patient_id,
        ChatThread.doctor_id == thread_in.doctor_id
    ))
    existing = result.scalars().first()
    if existing:
        return existing

    new_thread = ChatThread(**thread_in.model_dump())
    db.add(new_thread)
    await db.commit()
    await db.refresh(new_thread)
    return new_thread

@router.get("/messages", response_model=List[ChatMessageSchema])
async def read_messages(
    threadId: UUID,
    since: Optional[datetime] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    query = select(ChatMessage).where(ChatMessage.thread_id == threadId).order_by(ChatMessage.ts.asc())
    if since:
        query = query.where(ChatMessage.ts > since)

    result = await db.execute(query)
    messages = result.scalars().all()
    return messages

@router.post("/ack")
async def ack_messages(
    messageIds: List[UUID],
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Mark as READ
    # Efficient update?
    # For now iterate
    for mid in messageIds:
         result = await db.execute(select(ChatMessage).where(ChatMessage.id == mid))
         msg = result.scalars().first()
         if msg and msg.status != MessageStatus.READ:
             msg.status = MessageStatus.READ
    await db.commit()
    return {"status": "ok"}


# WebSocket Endpoint

@router.websocket("/ws/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    threadId: str = Query(...),
    token: Optional[str] = Query(None) # Usually in Authorization header, but WS standard headers are tricky in browser JS sometimes, query param is easier.
):
    # Auth check
    # Need to validate token manually here
    # Or expect "Authorization: Bearer ..." in headers (but JS WebSocket API doesn't support custom headers easily without protocols)
    # Let's check query param 'token' or header 'sec-websocket-protocol' (sometimes used)

    # Check headers first?
    # auth_header = websocket.headers.get('Authorization')
    # ...

    # Fallback to query param
    if not token:
        await websocket.close(code=4003)
        return

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            await websocket.close(code=4003)
            return
    except JWTError:
        await websocket.close(code=4003)
        return

    # Find user (optional, just to know WHO is connecting)
    # In a real app we would check if user belongs to thread.

    await manager.connect(websocket, threadId)

    try:
        while True:
            data = await websocket.receive_json()
            # Handle incoming messages
            msg_type = data.get("type")

            if msg_type == "message":
                # Save to DB
                # This requires a DB session. We can use `async with AsyncSessionLocal() as session:`

                async with AsyncSessionLocal() as session:
                    # Construct message
                    # sender? "from" field in JSON? Or derive from token?
                    # "from": "<userId>" in JSON

                    new_msg = ChatMessage(
                        thread_id=UUID(threadId),
                        from_id=data.get("from"),
                        from_role=ChatRole(data.get("fromRole", "DOCTOR")), # Default to DOCTOR if not specified? Or PATIENT?
                        text=data.get("text"),
                        status=MessageStatus.SENT
                    )
                    session.add(new_msg)
                    await session.commit()
                    await session.refresh(new_msg)

                    # Update thread stats
                    result = await session.execute(select(ChatThread).where(ChatThread.id == UUID(threadId)))
                    thread = result.scalars().first()
                    if thread:
                        thread.last_message_ts = new_msg.ts
                        if new_msg.from_role == ChatRole.PATIENT:
                            thread.unread_for_doctor += 1
                        else:
                            thread.unread_for_patient += 1
                        await session.commit()

                    # Broadcast with ID and TS
                    response = {
                        "type": "message",
                        "id": str(new_msg.id),
                        "threadId": threadId,
                        "from": new_msg.from_id,
                        "fromRole": new_msg.from_role.value,
                        "text": new_msg.text,
                        "ts": int(new_msg.ts.timestamp() * 1000)
                    }
                    await manager.broadcast(response, threadId)

                    # Send Delivered status back to sender?
                    # Or broadcast delivered to everyone?
                    ack = {
                        "type": "delivered",
                        "messageId": str(new_msg.id),
                        "ts": int(datetime.utcnow().timestamp() * 1000)
                    }
                    await manager.broadcast(ack, threadId)

            elif msg_type == "typing":
                await manager.broadcast(data, threadId)

            elif msg_type == "read":
                 # Mark as read in DB
                 messageId = data.get("messageId")
                 if messageId:
                     async with AsyncSessionLocal() as session:
                         result = await session.execute(select(ChatMessage).where(ChatMessage.id == UUID(messageId)))
                         msg = result.scalars().first()
                         if msg:
                             msg.status = MessageStatus.READ
                             await session.commit()

                 await manager.broadcast(data, threadId)

    except WebSocketDisconnect:
        manager.disconnect(websocket, threadId)
