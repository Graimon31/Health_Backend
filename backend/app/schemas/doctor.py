from datetime import datetime

from pydantic import BaseModel


class PatientListItem(BaseModel):
    id: int
    full_name: str
    email: str
    last_measurement_at: datetime | None = None
