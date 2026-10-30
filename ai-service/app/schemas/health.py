from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional


class HealthResponse(BaseModel):
    status: str = Field(default="ok", example="ok")
    service: str = Field(default="ai-service", example="ai-service")
    version: str = Field(default="1.0.0", example="1.0.0")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = Field(default=None)
