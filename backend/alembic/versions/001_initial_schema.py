"""001_initial_schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-09-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('workspace_name', sa.String(length=100), nullable=False, server_default='Vault Production'),
        sa.Column('cluster_name', sa.String(length=100), nullable=False, server_default='vault-cluster-primary'),
        sa.Column('avatar_url', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Storage Nodes
    op.create_table(
        'storage_nodes',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('endpoint', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='online'),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('capacity_bytes', sa.BigInteger(), nullable=False, server_default='1000000000000'),
        sa.Column('used_bytes', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('free_bytes', sa.BigInteger(), nullable=False, server_default='1000000000000'),
        sa.Column('load', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('object_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_heartbeat', sa.DateTime(timezone=True), nullable=False),
        sa.Column('rack', sa.String(length=50), nullable=False, server_default='rack-01'),
        sa.Column('region', sa.String(length=50), nullable=False, server_default='us-east-1'),
        sa.Column('ip', sa.String(length=50), nullable=False, server_default='127.0.0.1'),
        sa.Column('cpu_usage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('memory_usage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('disk_usage', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('network_ingress_mbps', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('network_egress_mbps', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('integrity_errors', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('active_repairs', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_storage_nodes_status'), 'storage_nodes', ['status'], unique=False)

    # Objects
    op.create_table(
        'objects',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('object_key', sa.String(length=255), nullable=False),
        sa.Column('size', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('logical_size', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('physical_size', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('content_type', sa.String(length=100), nullable=False, server_default='application/octet-stream'),
        sa.Column('mime_type', sa.String(length=100), nullable=False, server_default='application/octet-stream'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='uploading'),
        sa.Column('data_shards', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('parity_shards', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('chunk_size', sa.Integer(), nullable=False, server_default='67108864'),
        sa.Column('checksum', sa.String(length=64), nullable=False, server_default=''),
        sa.Column('bucket', sa.String(length=100), nullable=False, server_default='vault-prod-east1'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_objects_name'), 'objects', ['name'], unique=False)
    op.create_index(op.f('ix_objects_object_key'), 'objects', ['object_key'], unique=True)
    op.create_index(op.f('ix_objects_status'), 'objects', ['status'], unique=False)
    op.create_index(op.f('ix_objects_user_id'), 'objects', ['user_id'], unique=False)

    # Object Versions
    op.create_table(
        'object_versions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('object_id', sa.String(length=64), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('size', sa.BigInteger(), nullable=False),
        sa.Column('physical_size', sa.BigInteger(), nullable=False),
        sa.Column('checksum', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['object_id'], ['objects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_object_versions_object_id'), 'object_versions', ['object_id'], unique=False)

    # Shards
    op.create_table(
        'shards',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('object_id', sa.String(length=64), nullable=False),
        sa.Column('node_id', sa.String(length=64), nullable=False),
        sa.Column('shard_index', sa.Integer(), nullable=False),
        sa.Column('shard_type', sa.String(length=20), nullable=False),
        sa.Column('label', sa.String(length=20), nullable=False),
        sa.Column('size', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('checksum', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='healthy'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['node_id'], ['storage_nodes.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['object_id'], ['objects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('object_id', 'shard_index', name='uq_object_shard_index')
    )
    op.create_index(op.f('ix_shards_node_id'), 'shards', ['node_id'], unique=False)
    op.create_index(op.f('ix_shards_object_id'), 'shards', ['object_id'], unique=False)
    op.create_index(op.f('ix_shards_status'), 'shards', ['status'], unique=False)

    # Repair Tasks
    op.create_table(
        'repair_tasks',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('object_id', sa.String(length=64), nullable=False),
        sa.Column('object_name', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('missing_shard_id', sa.String(length=64), nullable=False),
        sa.Column('shard_index', sa.Integer(), nullable=False),
        sa.Column('shard_label', sa.String(length=20), nullable=False, server_default=''),
        sa.Column('shard_type', sa.String(length=20), nullable=False, server_default='data'),
        sa.Column('source_nodes', sa.Text(), nullable=False, server_default='[]'),
        sa.Column('destination_node_id', sa.String(length=64), nullable=False),
        sa.Column('destination_node_name', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='queued'),
        sa.Column('progress', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('reason', sa.String(length=255), nullable=False, server_default='Node failure or corruption detected'),
        sa.Column('bytes_total', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('bytes_transferred', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['object_id'], ['objects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_repair_tasks_object_id'), 'repair_tasks', ['object_id'], unique=False)
    op.create_index(op.f('ix_repair_tasks_status'), 'repair_tasks', ['status'], unique=False)

    # Activity Events
    op.create_table(
        'activity_events',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='info'),
        sa.Column('target_id', sa.String(length=64), nullable=True),
        sa.Column('metadata_json', sa.Text(), nullable=False, server_default='{}'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_events_target_id'), 'activity_events', ['target_id'], unique=False)
    op.create_index(op.f('ix_activity_events_timestamp'), 'activity_events', ['timestamp'], unique=False)
    op.create_index(op.f('ix_activity_events_type'), 'activity_events', ['type'], unique=False)
    op.create_index(op.f('ix_activity_events_user_id'), 'activity_events', ['user_id'], unique=False)

    # System Events
    op.create_table(
        'system_events',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('payload_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_system_events_category'), 'system_events', ['category'], unique=False)
    op.create_index(op.f('ix_system_events_created_at'), 'system_events', ['created_at'], unique=False)
    op.create_index(op.f('ix_system_events_name'), 'system_events', ['name'], unique=False)

    # Upload Sessions
    op.create_table(
        'upload_sessions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('object_name', sa.String(length=255), nullable=False),
        sa.Column('object_key', sa.String(length=255), nullable=False),
        sa.Column('content_type', sa.String(length=100), nullable=False, server_default='application/octet-stream'),
        sa.Column('size', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('data_shards', sa.Integer(), nullable=False, server_default='4'),
        sa.Column('parity_shards', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('chunk_size', sa.Integer(), nullable=False, server_default='67108864'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='initiated'),
        sa.Column('parts_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('idempotency_key', sa.String(length=128), nullable=False, server_default=''),
        sa.Column('temp_storage_path', sa.Text(), nullable=False, server_default=''),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_upload_sessions_idempotency_key'), 'upload_sessions', ['idempotency_key'], unique=False)
    op.create_index(op.f('ix_upload_sessions_status'), 'upload_sessions', ['status'], unique=False)
    op.create_index(op.f('ix_upload_sessions_user_id'), 'upload_sessions', ['user_id'], unique=False)

    # Integrity Checks
    op.create_table(
        'integrity_checks',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('object_id', sa.String(length=64), nullable=False),
        sa.Column('shard_id', sa.String(length=64), nullable=False),
        sa.Column('node_id', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('checksum_expected', sa.String(length=64), nullable=False),
        sa.Column('checksum_actual', sa.String(length=64), nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['node_id'], ['storage_nodes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['object_id'], ['objects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['shard_id'], ['shards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_integrity_checks_checked_at'), 'integrity_checks', ['checked_at'], unique=False)
    op.create_index(op.f('ix_integrity_checks_node_id'), 'integrity_checks', ['node_id'], unique=False)
    op.create_index(op.f('ix_integrity_checks_object_id'), 'integrity_checks', ['object_id'], unique=False)
    op.create_index(op.f('ix_integrity_checks_shard_id'), 'integrity_checks', ['shard_id'], unique=False)


def downgrade() -> None:
    op.drop_table('integrity_checks')
    op.drop_table('upload_sessions')
    op.drop_table('system_events')
    op.drop_table('activity_events')
    op.drop_table('repair_tasks')
    op.drop_table('shards')
    op.drop_table('object_versions')
    op.drop_table('objects')
    op.drop_table('storage_nodes')
    op.drop_table('users')
