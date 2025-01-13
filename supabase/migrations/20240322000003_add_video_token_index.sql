-- Check if video_token column exists, if not add it
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'candidates' 
    AND column_name = 'video_token'
  ) THEN
    ALTER TABLE public.candidates ADD COLUMN video_token text;
  END IF;
END $$;

-- Create an index for faster token lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS candidates_video_token_idx 
ON public.candidates(video_token);

-- Add RLS policy to allow reading candidates by video_token
CREATE POLICY IF NOT EXISTS "Allow reading candidates by video_token" 
ON public.candidates
FOR SELECT
TO public
USING (video_token IS NOT NULL AND video_token = current_setting('request.jwt.claims')::json->>'video_token');