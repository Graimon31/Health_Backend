from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from app.api import deps
from app.schemas.mobile import ProfileImport, ImportResponse
from app.models.patient import Patient, Profile, UnitSystem
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def merge_lists(server_list, client_list):
    # Simple merge: unique by name, case-insensitive
    if not server_list: server_list = []
    if not client_list: client_list = []

    merged = {item.get('name', '').lower(): item for item in server_list}

    for item in client_list:
        name = item.get('name', '').lower()
        if name:
             merged[name] = item # Client wins or just overwrite? Requirement says "union by name, no duplicates"
             # Usually "no duplicates" means if it exists, keep one.
             # Let's say if exists in both, we keep the one from server or client?
             # "merge-rules: ... union by name, no duplicates (case insensitive)"
             # Let's assume we just ensure uniqueness.

    return list(merged.values())

@router.post("/profile/import", response_model=ImportResponse)
async def import_profile(
    profile_data: ProfileImport,
    db: Session = Depends(deps.get_db),
    # Open endpoint or protected? Usually imports from mobile might need auth or just user_id check.
    # Requirement says "POST /api/v1/mobile/profile/import accepts exactly that JSON"
    # Assuming it's authenticated via some mechanism or we just trust the externalUserId if it's a "sync" endpoint.
    # For now, let's keep it open or require a token if the mobile app sends one.
    # But usually mobile app has a user token. Let's assume the user is authenticated?
    # Or maybe this endpoint is called by the app with a token.
    # Let's add deps.get_current_user but it might fail if mobile app doesn't login first.
    # The requirement "Auth ... POST /auth/login" implies mobile might login?
    # Or maybe "Identifier: external_user_id in DB = userId from mobile DataStore" suggests we map them.
    # Let's assume for now we need a valid token.
    current_user: Any = Depends(deps.get_current_user)
):
    # Find patient
    result = await db.execute(select(Patient).where(Patient.external_user_id == profile_data.userId))
    patient = result.scalars().first()

    if not patient:
        # Auto-create patient if not exists? Or error?
        # Requirement: "POST /patients/link — link patient by externalUserId"
        # So maybe import only works if linked?
        # Let's assume we create if not exists for smooth onboarding, or error.
        # "Import profile: ... accepts ... JSON"
        # Let's return 404 if not found, encouraging linking first.
        # Or better: auto-create a stub patient.
        new_patient = Patient(external_user_id=profile_data.userId)
        new_patient.profile = Profile()
        db.add(new_patient)
        await db.commit()
        await db.refresh(new_patient)
        patient = new_patient

    profile = patient.profile
    if not profile:
        profile = Profile(patient_id=patient.id)
        patient.profile = profile

    changes = {"added": [], "updated": [], "skipped": []}

    # Merge Logic
    # 1. Lists
    profile.conditions = merge_lists(profile.conditions, profile_data.conditions)
    profile.allergies = merge_lists(profile.allergies, profile_data.allergies)
    profile.medications = merge_lists(profile.medications, profile_data.medications)

    # 2. Consent (Server wins)
    # Actually requirement says "consentAccepted, consentVersion, consentTimestamp — server-wins"
    # So we DO NOT update these from client if they are set on server?
    # Or we only update if server is empty?
    # "Server wins" usually means if conflict, keep server.
    # If server is None, take client? Let's assume yes.
    if not profile.consent_accepted and profile_data.consentAccepted:
        profile.consent_accepted = profile_data.consentAccepted
        profile.consent_version = profile_data.consentVersion
        if profile_data.consentTimestamp:
             profile.consent_timestamp = datetime.fromtimestamp(profile_data.consentTimestamp / 1000.0)

    # 3. Last-write-wins by updated_at
    # Mobile sends updatedAt in ms
    client_ts = profile_data.updatedAt
    server_ts = profile.updated_at.timestamp() * 1000 if profile.updated_at else 0

    if client_ts and client_ts > server_ts:
        # Client is newer, update fields
        profile.units = UnitSystem(profile_data.units) if profile_data.units else profile.units
        profile.resting_hr = profile_data.restingHr
        profile.bp_baseline_sys = profile_data.bpBaselineSys
        profile.bp_baseline_dia = profile_data.bpBaselineDia
        profile.hr_high = profile_data.hrHigh
        profile.bp_sys_high = profile_data.bpSysHigh
        profile.bp_dia_high = profile_data.bpDiaHigh
        profile.emergency_name = profile_data.emergencyName
        profile.emergency_phone = profile_data.emergencyPhone
        profile.doctor_name = profile_data.doctorName
        profile.doctor_phone = profile_data.doctorPhone
        profile.ble_device_name = profile_data.bleDeviceName
        profile.ble_device_address = profile_data.bleDeviceAddress
        profile.share_with_doctor = profile_data.shareWithDoctor
        changes["updated"].append("Simple fields updated from client")
    else:
        changes["skipped"].append("Server is newer or equal")

    await db.commit()
    await db.refresh(profile)

    # Prepare response (camelCase)
    merged_profile = {
        "userId": patient.external_user_id,
        "units": profile.units.value if profile.units else "METRIC",
        "conditions": profile.conditions,
        "allergies": profile.allergies,
        "medications": profile.medications,
        "restingHr": profile.resting_hr,
        "bpBaselineSys": profile.bp_baseline_sys,
        "bpBaselineDia": profile.bp_baseline_dia,
        "hrHigh": profile.hr_high,
        "bpSysHigh": profile.bp_sys_high,
        "bpDiaHigh": profile.bp_dia_high,
        "emergencyName": profile.emergency_name,
        "emergencyPhone": profile.emergency_phone,
        "doctorName": profile.doctor_name,
        "doctorPhone": profile.doctor_phone,
        "bleDeviceName": profile.ble_device_name,
        "bleDeviceAddress": profile.ble_device_address,
        "shareWithDoctor": profile.share_with_doctor,
        "consentAccepted": profile.consent_accepted,
        "consentVersion": profile.consent_version,
        "consentTimestamp": int(profile.consent_timestamp.timestamp() * 1000) if profile.consent_timestamp else None,
        "updatedAt": int(profile.updated_at.timestamp() * 1000) if profile.updated_at else None,
    }

    return {"mergedProfile": merged_profile, "changes": changes}

@router.get("/profile/export")
async def export_profile(
    externalUserId: str,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
):
    result = await db.execute(select(Patient).where(Patient.external_user_id == externalUserId))
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    profile = patient.profile
    if not profile:
        profile = Profile(patient_id=patient.id) # Should theoretically exist

    return {
        "userId": patient.external_user_id,
        "units": profile.units.value if profile.units else "METRIC",
        "conditions": profile.conditions or [],
        "allergies": profile.allergies or [],
        "medications": profile.medications or [],
        "restingHr": profile.resting_hr,
        "bpBaselineSys": profile.bp_baseline_sys,
        "bpBaselineDia": profile.bp_baseline_dia,
        "hrHigh": profile.hr_high,
        "bpSysHigh": profile.bp_sys_high,
        "bpDiaHigh": profile.bp_dia_high,
        "emergencyName": profile.emergency_name,
        "emergencyPhone": profile.emergency_phone,
        "doctorName": profile.doctor_name,
        "doctorPhone": profile.doctor_phone,
        "bleDeviceName": profile.ble_device_name,
        "bleDeviceAddress": profile.ble_device_address,
        "shareWithDoctor": profile.share_with_doctor,
        "consentAccepted": profile.consent_accepted,
        "consentVersion": profile.consent_version,
        "consentTimestamp": int(profile.consent_timestamp.timestamp() * 1000) if profile.consent_timestamp else None,
        "updatedAt": int(profile.updated_at.timestamp() * 1000) if profile.updated_at else None,
    }
