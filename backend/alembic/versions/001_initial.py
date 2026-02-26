"""initial

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'DOCTOR', name='userrole'), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Doctors
    op.create_table('doctors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('specialty', sa.String(), nullable=True),
        sa.Column('office_phone', sa.String(), nullable=True),
        sa.Column('photo_url', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_doctors_id'), 'doctors', ['id'], unique=False)

    # Patients
    op.create_table('patients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_user_id', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('sex', sa.Enum('MALE', 'FEMALE', 'OTHER', name='sex'), nullable=True),
        sa.Column('height_cm', sa.Integer(), nullable=True),
        sa.Column('weight_kg', sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column('contact_phone', sa.String(), nullable=True),
        sa.Column('doctor_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patients_external_user_id'), 'patients', ['external_user_id'], unique=True)
    op.create_index(op.f('ix_patients_id'), 'patients', ['id'], unique=False)

    # Profiles
    op.create_table('profiles',
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('units', sa.Enum('METRIC', 'IMPERIAL', name='unitsystem'), nullable=True),
        sa.Column('conditions', sa.JSON(), nullable=True),
        sa.Column('allergies', sa.JSON(), nullable=True),
        sa.Column('medications', sa.JSON(), nullable=True),
        sa.Column('resting_hr', sa.Integer(), nullable=True),
        sa.Column('bp_baseline_sys', sa.Integer(), nullable=True),
        sa.Column('bp_baseline_dia', sa.Integer(), nullable=True),
        sa.Column('hr_high', sa.Integer(), nullable=True),
        sa.Column('bp_sys_high', sa.Integer(), nullable=True),
        sa.Column('bp_dia_high', sa.Integer(), nullable=True),
        sa.Column('emergency_name', sa.String(), nullable=True),
        sa.Column('emergency_phone', sa.String(), nullable=True),
        sa.Column('doctor_name', sa.String(), nullable=True),
        sa.Column('doctor_phone', sa.String(), nullable=True),
        sa.Column('ble_device_name', sa.String(), nullable=True),
        sa.Column('ble_device_address', sa.String(), nullable=True),
        sa.Column('share_with_doctor', sa.Boolean(), nullable=True),
        sa.Column('consent_accepted', sa.Boolean(), nullable=True),
        sa.Column('consent_version', sa.String(), nullable=True),
        sa.Column('consent_timestamp', sa.DateTime(timezone=True), nullable=True),
        sa.Column('schema_version', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('patient_id')
    )

    # FAQ
    op.create_table('faq_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('question', sa.String(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('updated_at', sa.Date(), nullable=True),
        sa.Column('helpful_count', sa.Integer(), nullable=True),
        sa.Column('not_helpful_count', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_faq_items_id'), 'faq_items', ['id'], unique=False)

    # Chat Threads
    op.create_table('chat_threads',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_message_ts', sa.DateTime(timezone=True), nullable=True),
        sa.Column('unread_for_doctor', sa.Integer(), nullable=True),
        sa.Column('unread_for_patient', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_chat_threads_pair', 'chat_threads', ['patient_id', 'doctor_id'], unique=True)

    # Chat Messages
    op.create_table('chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('from_id', sa.String(), nullable=False),
        sa.Column('from_role', sa.Enum('DOCTOR', 'PATIENT', name='chatrole'), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('ts', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('status', sa.Enum('QUEUED', 'SENT', 'DELIVERED', 'READ', name='messagestatus'), nullable=True),
        sa.ForeignKeyConstraint(['thread_id'], ['chat_threads.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Measurements
    op.create_table('measurements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('ts', sa.DateTime(timezone=True), nullable=False),
        sa.Column('heart_rate', sa.Integer(), nullable=True),
        sa.Column('bp_systolic', sa.Integer(), nullable=True),
        sa.Column('bp_diastolic', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_measurements_patient_ts', 'measurements', ['patient_id', 'ts'], unique=True)
    op.create_index(op.f('ix_measurements_id'), 'measurements', ['id'], unique=False)

    # Alerts
    op.create_table('alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('kind', sa.Enum('HR_HIGH', 'BP_HIGH', 'TREND_UP', 'MANUAL', name='alerttype'), nullable=False),
        sa.Column('severity', sa.Enum('INFO', 'WARN', 'CRITICAL', name='alertseverity'), nullable=False),
        sa.Column('text', sa.String(), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)

def downgrade() -> None:
    # Drop in reverse order
    op.drop_index(op.f('ix_alerts_id'), table_name='alerts')
    op.drop_table('alerts')

    op.drop_index(op.f('ix_measurements_id'), table_name='measurements')
    op.drop_index('ix_measurements_patient_ts', table_name='measurements')
    op.drop_table('measurements')

    op.drop_table('chat_messages')

    op.drop_index('ix_chat_threads_pair', table_name='chat_threads')
    op.drop_table('chat_threads')

    op.drop_index(op.f('ix_faq_items_id'), table_name='faq_items')
    op.drop_table('faq_items')

    op.drop_table('profiles')

    op.drop_index(op.f('ix_patients_id'), table_name='patients')
    op.drop_index(op.f('ix_patients_external_user_id'), table_name='patients')
    op.drop_table('patients')

    op.drop_index(op.f('ix_doctors_id'), table_name='doctors')
    op.drop_table('doctors')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    op.execute('DROP TYPE IF EXISTS userrole')
    op.execute('DROP TYPE IF EXISTS sex')
    op.execute('DROP TYPE IF EXISTS unitsystem')
    op.execute('DROP TYPE IF EXISTS chatrole')
    op.execute('DROP TYPE IF EXISTS messagestatus')
    op.execute('DROP TYPE IF EXISTS alerttype')
    op.execute('DROP TYPE IF EXISTS alertseverity')
