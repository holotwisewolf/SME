-- Migration: Initial Schema for Spotify Music Explorer
-- Description: Creates all tables, relationships, RLS policies, and indexes

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================
CREATE TYPE item_type AS ENUM ('track', 'album', 'playlist');
CREATE TYPE tag_type AS ENUM ('premade', 'custom');
CREATE TYPE activity_type AS ENUM ('rating', 'comment', 'tag', 'favorite');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_user_id TEXT,
  rating_privacy_default BOOLEAN DEFAULT TRUE, -- true = public, false = private
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TAGS TABLE
-- =====================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type tag_type NOT NULL DEFAULT 'custom',
  description TEXT,
  color TEXT, -- hex color for UI
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for premade tags
  usage_count INTEGER DEFAULT 0, -- denormalized for performance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, type) -- Prevent duplicate tag names within same type
);

-- =====================================================
-- PLAYLISTS TABLE
-- =====================================================
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT, -- hex color for UI
  is_public BOOLEAN DEFAULT FALSE,
  spotify_playlist_id TEXT, -- For Phase 2: track exported playlists
  track_count INTEGER DEFAULT 0, -- denormalized
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLAYLIST ITEMS TABLE
-- =====================================================
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  spotify_album_id TEXT, -- Optional: track which album it's from
  position INTEGER NOT NULL, -- For ordering
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, spotify_track_id) -- Prevent duplicate tracks in same playlist
);

-- =====================================================
-- RATINGS TABLE
-- =====================================================
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- Spotify ID for track/album OR UUID for playlist
  item_type item_type NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type) -- One rating per user per item
);

-- =====================================================
-- ITEM TAGS TABLE (Junction)
-- =====================================================
CREATE TABLE item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL, -- Spotify ID for track/album OR UUID for playlist
  item_type item_type NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Who added the tag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, item_type, tag_id, user_id) -- Prevent duplicate tags per user per item
);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  spotify_album_id TEXT, -- Optional: which album
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spotify_track_id) -- One favorite per track per user
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- Spotify ID for track/album OR UUID for playlist
  item_type item_type NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 2000),
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY LOG TABLE (Optional - for trending calculations)
-- =====================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type item_type NOT NULL,
  activity_type activity_type NOT NULL,
  metadata JSONB, -- Store additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER PREFERENCES TABLE (For recommendation engine)
-- =====================================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_genres TEXT[], -- Array of genres
  favorite_artists TEXT[], -- Array of Spotify artist IDs
  preference_vector JSONB, -- Store complex preference data for graph algorithm
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_spotify_user_id ON profiles(spotify_user_id);

-- Playlists
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_public ON playlists(is_public);
CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);

-- Playlist Items
CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_spotify_track_id ON playlist_items(spotify_track_id);
CREATE INDEX idx_playlist_items_position ON playlist_items(playlist_id, position);

-- Ratings
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_item ON ratings(item_id, item_type);
CREATE INDEX idx_ratings_is_public ON ratings(is_public);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_ratings_rating ON ratings(rating); -- For filtering by rating threshold

-- Item Tags
CREATE INDEX idx_item_tags_item ON item_tags(item_id, item_type);
CREATE INDEX idx_item_tags_tag_id ON item_tags(tag_id);
CREATE INDEX idx_item_tags_user_id ON item_tags(user_id);
CREATE INDEX idx_item_tags_created_at ON item_tags(created_at DESC);

-- Tags
CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX idx_tags_name ON tags(name);

-- Favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_spotify_track_id ON favorites(spotify_track_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- Comments
CREATE INDEX idx_comments_item ON comments(item_id, item_type);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);

-- Activity Log
CREATE INDEX idx_activity_log_item ON activity_log(item_id, item_type);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_activity_type ON activity_log(activity_type);

-- Composite indexes for trending queries
CREATE INDEX idx_ratings_public_item_created ON ratings(item_id, item_type, created_at DESC) WHERE is_public = true;
CREATE INDEX idx_comments_item_created ON comments(item_id, item_type, created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Update playlist track count
CREATE OR REPLACE FUNCTION update_playlist_track_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE playlists SET track_count = track_count + 1 WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE playlists SET track_count = GREATEST(track_count - 1, 0) WHERE id = OLD.playlist_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  act_type activity_type;
BEGIN
  -- Determine activity type based on table
  IF TG_TABLE_NAME = 'ratings' THEN
    act_type := 'rating';
  ELSIF TG_TABLE_NAME = 'comments' THEN
    act_type := 'comment';
  ELSIF TG_TABLE_NAME = 'item_tags' THEN
    act_type := 'tag';
  ELSIF TG_TABLE_NAME = 'favorites' THEN
    act_type := 'favorite';
  END IF;

  -- Insert activity log
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (user_id, item_id, item_type, activity_type, metadata)
    VALUES (
      NEW.user_id,
      COALESCE(NEW.item_id, NEW.spotify_track_id),
      COALESCE(NEW.item_type, 'track'),
      act_type,
      to_jsonb(NEW)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Check Spotify connection status
CREATE OR REPLACE FUNCTION check_spotify_connected()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has Spotify identity
  IF EXISTS (
    SELECT 1 FROM auth.identities 
    WHERE user_id = NEW.id AND provider = 'spotify'
  ) THEN
    NEW.spotify_connected := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update denormalized counts
CREATE TRIGGER update_tag_usage_count_trigger AFTER INSERT OR DELETE ON item_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_playlist_track_count_trigger AFTER INSERT OR DELETE ON playlist_items
  FOR EACH ROW EXECUTE FUNCTION update_playlist_track_count();

-- Create profile on signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Log activities for trending
CREATE TRIGGER log_rating_activity AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_comment_activity AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_tag_activity AFTER INSERT ON item_tags
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_favorite_activity AFTER INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PLAYLISTS POLICIES
CREATE POLICY "Public playlists are viewable by everyone" ON playlists
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- PLAYLIST ITEMS POLICIES
CREATE POLICY "Playlist items viewable if playlist is viewable" ON playlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add items to own playlists" ON playlist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from own playlists" ON playlist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own playlists" ON playlist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- RATINGS POLICIES
CREATE POLICY "Public ratings are viewable by everyone" ON ratings
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON ratings
  FOR DELETE USING (auth.uid() = user_id);

-- ITEM TAGS POLICIES
CREATE POLICY "Item tags are viewable by everyone" ON item_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can create tags" ON item_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON item_tags
  FOR DELETE USING (auth.uid() = user_id);

-- FAVORITES POLICIES
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS POLICIES
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- TAGS POLICIES
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create custom tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND type = 'custom');

CREATE POLICY "Users can update own custom tags" ON tags
  FOR UPDATE USING (auth.uid() = creator_id AND type = 'custom');

CREATE POLICY "Users can delete own custom tags" ON tags
  FOR DELETE USING (auth.uid() = creator_id AND type = 'custom');

-- ACTIVITY LOG POLICIES
CREATE POLICY "Activity log viewable by everyone" ON activity_log
  FOR SELECT USING (true);

-- USER PREFERENCES POLICIES
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA: PRE-MADE TAGS
-- =====================================================
INSERT INTO tags (name, type, description, color) VALUES
  -- Genres
  ('Rock', 'premade', 'Rock music', '#E74C3C'),
  ('Pop', 'premade', 'Pop music', '#3498DB'),
  ('Hip Hop', 'premade', 'Hip Hop & Rap', '#9B59B6'),
  ('Electronic', 'premade', 'Electronic & Dance', '#1ABC9C'),
  ('Jazz', 'premade', 'Jazz music', '#F39C12'),
  ('Classical', 'premade', 'Classical music', '#34495E'),
  ('R&B', 'premade', 'R&B & Soul', '#E67E22'),
  ('Country', 'premade', 'Country music', '#16A085'),
  ('Metal', 'premade', 'Metal music', '#95A5A6'),
  ('Indie', 'premade', 'Indie music', '#2ECC71'),
  
  -- Moods
  ('Energetic', 'premade', 'High energy tracks', '#E74C3C'),
  ('Chill', 'premade', 'Relaxing vibes', '#3498DB'),
  ('Happy', 'premade', 'Feel-good music', '#F1C40F'),
  ('Sad', 'premade', 'Melancholic tracks', '#34495E'),
  ('Angry', 'premade', 'Aggressive energy', '#C0392B'),
  ('Romantic', 'premade', 'Love songs', '#E91E63'),
  ('Motivational', 'premade', 'Pump-up tracks', '#FF5722'),
  ('Nostalgic', 'premade', 'Throwback vibes', '#9C27B0'),
  
  -- Activities
  ('Workout', 'premade', 'Gym & exercise', '#E74C3C'),
  ('Study', 'premade', 'Focus music', '#2196F3'),
  ('Party', 'premade', 'Party anthems', '#FF9800'),
  ('Sleep', 'premade', 'Sleep & rest', '#607D8B'),
  ('Driving', 'premade', 'Road trip music', '#009688'),
  ('Cooking', 'premade', 'Kitchen vibes', '#4CAF50'),
  
  -- Vibes
  ('Summer', 'premade', 'Summer vibes', '#FFC107'),
  ('Winter', 'premade', 'Winter atmosphere', '#03A9F4'),
  ('Night', 'premade', 'Late night music', '#673AB7'),
  ('Morning', 'premade', 'Morning energy', '#FFEB3B'),
  ('Throwback', 'premade', 'Nostalgic classics', '#795548'),
  ('Underrated', 'premade', 'Hidden gems', '#00BCD4')
ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPER VIEWS (Optional - for easier queries)
-- =====================================================

-- View: Global rating statistics per item
CREATE OR REPLACE VIEW global_rating_stats AS
SELECT 
  item_id,
  item_type,
  COUNT(*) as rating_count,
  AVG(rating) as average_rating,
  MAX(created_at) as last_rated_at
FROM ratings
WHERE is_public = true
GROUP BY item_id, item_type;

-- View: Trending items (last 7 days)
CREATE OR REPLACE VIEW trending_items AS
SELECT 
  item_id,
  item_type,
  COUNT(*) as activity_count,
  MAX(created_at) as last_activity_at,
  jsonb_object_agg(activity_type, count) as activity_breakdown
FROM (
  SELECT 
    item_id,
    item_type,
    activity_type,
    created_at,
    COUNT(*) OVER (PARTITION BY item_id, item_type, activity_type) as count
  FROM activity_log
  WHERE created_at >= NOW() - INTERVAL '7 days'
) sub
GROUP BY item_id, item_type;

-- View: User statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.id as user_id,
  p.username,
  COUNT(DISTINCT r.id) as total_ratings,
  COUNT(DISTINCT c.id) as total_comments,
  COUNT(DISTINCT it.id) as total_tags,
  COUNT(DISTINCT f.id) as total_favorites,
  COUNT(DISTINCT pl.id) as total_playlists
FROM profiles p
LEFT JOIN ratings r ON p.id = r.user_id
LEFT JOIN comments c ON p.id = c.user_id
LEFT JOIN item_tags it ON p.id = it.user_id
LEFT JOIN favorites f ON p.id = f.user_id
LEFT JOIN playlists pl ON p.id = pl.user_id
GROUP BY p.id, p.username;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant access to functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;