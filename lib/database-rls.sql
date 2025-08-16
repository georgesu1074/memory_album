-- Row Level Security Policies for Memory Album

-- Enable RLS on all tables
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_embeddings ENABLE ROW LEVEL SECURITY;

-- Weddings table policies
-- Public can read active weddings
CREATE POLICY "Public can view active weddings" ON weddings
  FOR SELECT
  USING (is_active = true);

-- Only service role can insert/update/delete weddings
CREATE POLICY "Service role manages weddings" ON weddings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Wedding guests table policies
-- Public can view guest list for active weddings
CREATE POLICY "Public can view wedding guests" ON wedding_guests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = wedding_guests.wedding_id
      AND weddings.is_active = true
    )
  );

-- Only service role can manage guests
CREATE POLICY "Service role manages guests" ON wedding_guests
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Memories table policies
-- Public can read memories from active weddings
CREATE POLICY "Public can view memories from active weddings" ON memories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = memories.wedding_id
      AND weddings.is_active = true
    )
  );

-- Public can insert memories to active weddings (with rate limiting handled in app)
CREATE POLICY "Public can create memories for active weddings" ON memories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = memories.wedding_id
      AND weddings.is_active = true
    )
  );

-- Service role can do everything
CREATE POLICY "Service role manages memories" ON memories
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Memory photos policies
-- Public can view photos for accessible memories
CREATE POLICY "Public can view memory photos" ON memory_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memories
      JOIN weddings ON weddings.id = memories.wedding_id
      WHERE memories.id = memory_photos.memory_id
      AND weddings.is_active = true
    )
  );

-- Public can insert photos for their memories
CREATE POLICY "Public can add photos to memories" ON memory_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories
      JOIN weddings ON weddings.id = memories.wedding_id
      WHERE memories.id = memory_photos.memory_id
      AND weddings.is_active = true
    )
  );

-- Service role manages all photos
CREATE POLICY "Service role manages photos" ON memory_photos
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Memory groups policies
-- Public can view groups from active weddings
CREATE POLICY "Public can view memory groups" ON memory_groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = memory_groups.wedding_id
      AND weddings.is_active = true
    )
  );

-- Only service role can manage groups (AI creates these)
CREATE POLICY "Service role manages groups" ON memory_groups
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Memory embeddings policies
-- Only service role can access embeddings
CREATE POLICY "Service role manages embeddings" ON memory_embeddings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');