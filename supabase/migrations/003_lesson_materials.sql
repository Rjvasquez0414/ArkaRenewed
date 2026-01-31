-- Add supplementary materials columns to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS supplementary_video_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
-- attachments format: [{ "name": "Diapositivas.pdf", "url": "https://...", "type": "pdf" }, ...]

-- Create storage bucket for lesson files
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-files', 'lesson-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read lesson files
CREATE POLICY "Public read lesson files" ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-files');

-- Allow admins to upload/delete lesson files
CREATE POLICY "Admins manage lesson files" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-files'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Admins delete lesson files" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson-files'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );
