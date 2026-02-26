from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class ProfileImport(BaseModel):
    # Matches mobile app export format (camelCase)
    userId: str
    units: Optional[str] = "METRIC"
    conditions: List[Dict[str, Any]] = []
    allergies: List[Dict[str, Any]] = []
    medications: List[Dict[str, Any]] = []
    restingHr: Optional[int] = None
    bpBaselineSys: Optional[int] = None
    bpBaselineDia: Optional[int] = None
    hrHigh: Optional[int] = None
    bpSysHigh: Optional[int] = None
    bpDiaHigh: Optional[int] = None
    emergencyName: Optional[str] = None
    emergencyPhone: Optional[str] = None
    doctorName: Optional[str] = None
    doctorPhone: Optional[str] = None
    bleDeviceName: Optional[str] = None
    bleDeviceAddress: Optional[str] = None
    shareWithDoctor: bool = False
    consentAccepted: bool = False
    consentVersion: Optional[str] = None
    consentTimestamp: Optional[int] = None # Timestamp in ms from mobile
    updatedAt: Optional[int] = None # Timestamp in ms

    model_config = ConfigDict(populate_by_name=True)

class ImportResponse(BaseModel):
    mergedProfile: Dict[str, Any]
    changes: Dict[str, List[str]]
