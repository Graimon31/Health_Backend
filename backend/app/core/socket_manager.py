from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # thread_id -> list of websockets
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, thread_id: str):
        await websocket.accept()
        if thread_id not in self.active_connections:
            self.active_connections[thread_id] = []
        self.active_connections[thread_id].append(websocket)

    def disconnect(self, websocket: WebSocket, thread_id: str):
        if thread_id in self.active_connections:
            if websocket in self.active_connections[thread_id]:
                self.active_connections[thread_id].remove(websocket)
            if not self.active_connections[thread_id]:
                del self.active_connections[thread_id]

    async def broadcast(self, message: dict, thread_id: str):
        if thread_id in self.active_connections:
            for connection in self.active_connections[thread_id]:
                await connection.send_json(message)

manager = ConnectionManager()
