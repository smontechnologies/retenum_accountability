-- Append-only enforcement (FR-HIS-02, AUD-02, TD-09, AC-HIS-1).
-- Any UPDATE or DELETE on these tables fails, for every role including the application.
CREATE OR REPLACE FUNCTION retenum_reject_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'append-only table %: % is not allowed', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER engagement_events_append_only
  BEFORE UPDATE OR DELETE ON engagement_events
  FOR EACH ROW EXECUTE FUNCTION retenum_reject_mutation();
--> statement-breakpoint
CREATE TRIGGER engagement_events_no_truncate
  BEFORE TRUNCATE ON engagement_events
  FOR EACH STATEMENT EXECUTE FUNCTION retenum_reject_mutation();
--> statement-breakpoint
CREATE TRIGGER security_audit_log_append_only
  BEFORE UPDATE OR DELETE ON security_audit_log
  FOR EACH ROW EXECUTE FUNCTION retenum_reject_mutation();
--> statement-breakpoint
CREATE TRIGGER security_audit_log_no_truncate
  BEFORE TRUNCATE ON security_audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION retenum_reject_mutation();
