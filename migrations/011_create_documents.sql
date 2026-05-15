-- ============================================================
-- 011_create_documents.sql
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM (
      'offer_letter', 'appointment_letter', 'experience_letter',
      'payslip_pdf', 'id_proof', 'address_proof', 'educational_certificate', 'other'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS documents (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id  UUID          NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    doc_type     document_type NOT NULL,
    title        VARCHAR(200)  NOT NULL,
    file_path    TEXT          NOT NULL,   -- relative path or cloud URL
    file_size    INTEGER,                  -- bytes
    mime_type    VARCHAR(100),
    uploaded_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
    is_verified  BOOLEAN       NOT NULL DEFAULT FALSE,
    verified_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
    verified_at  TIMESTAMPTZ,
    notes        TEXT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- FK + filter indexes
CREATE INDEX IF NOT EXISTS idx_documents_employee_id ON documents (employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type    ON documents (doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_verified_by ON documents (verified_by);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_documents'
  ) THEN
    CREATE TRIGGER set_updated_at_documents
      BEFORE UPDATE ON documents
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
