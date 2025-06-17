/*
  # Dashboard & Analytics Features Migration

  1. New Tables
    - `user_analytics` - Track user activity and statistics
    - `meal_plans` - Weekly meal planning system
    - `shopping_lists` - Generated shopping lists
    - `content_reports` - Content moderation system
    - `platform_analytics` - Platform-wide statistics
    - `recipe_views` - Track recipe view counts
    - `user_preferences` - User dietary preferences and settings

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Admin-only access for moderation tools

  3. Indexes
    - Performance indexes for analytics queries
    - Date-based indexes for time-series data
*/

-- User Analytics Table
CREATE TABLE IF NOT EXISTS user_analytics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  recipes_created INTEGER DEFAULT 0,
  recipes_liked INTEGER DEFAULT 0,
  recipes_bookmarked INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_recipe_views INTEGER DEFAULT 0,
  avg_recipe_rating DECIMAL(3,2) DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Recipe Views Table
CREATE TABLE IF NOT EXISTS recipe_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id TEXT NOT NULL,
  user_id TEXT,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (recipe_id) REFERENCES "Recipe"(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Meal Plans Table
CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Meal Plan Items Table
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES "Recipe"(id) ON DELETE CASCADE
);

-- Shopping Lists Table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  meal_plan_id TEXT,
  name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE SET NULL
);

-- Shopping List Items Table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT,
  category TEXT DEFAULT 'other',
  is_purchased BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);

-- Content Reports Table
CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('recipe', 'comment', 'user')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  moderator_id TEXT,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (reporter_id) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (moderator_id) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Platform Analytics Table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_recipes INTEGER DEFAULT 0,
  new_recipes INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  dietary_restrictions TEXT[] DEFAULT '{}',
  favorite_cuisines TEXT[] DEFAULT '{}',
  cooking_skill_level TEXT DEFAULT 'beginner' CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_meal_types TEXT[] DEFAULT '{}',
  max_cooking_time INTEGER DEFAULT 60,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own analytics" ON user_analytics FOR SELECT TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own analytics" ON user_analytics FOR UPDATE TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "Users can read own meal plans" ON meal_plans FOR ALL TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY "Users can read own meal plan items" ON meal_plan_items FOR ALL TO authenticated USING (
  meal_plan_id IN (SELECT id FROM meal_plans WHERE user_id = auth.uid()::text)
);

CREATE POLICY "Users can read own shopping lists" ON shopping_lists FOR ALL TO authenticated USING (auth.uid()::text = user_id);
CREATE POLICY "Users can read own shopping list items" ON shopping_list_items FOR ALL TO authenticated USING (
  shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = auth.uid()::text)
);

CREATE POLICY "Users can create content reports" ON content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = reporter_id);
CREATE POLICY "Users can read own reports" ON content_reports FOR SELECT TO authenticated USING (auth.uid()::text = reporter_id);

CREATE POLICY "Users can read own preferences" ON user_preferences FOR ALL TO authenticated USING (auth.uid()::text = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_recipe_id ON recipe_views(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_viewed_at ON recipe_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week_start ON meal_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date);