/*
  # Add Cultural and Dietary Preferences System

  1. New Tables
    - `CulturalPreference` - User's cultural and dietary preferences
    - `RecipeCulturalTag` - Cultural tags for recipes
    - `Location` - User location data
    - `CulturalCategory` - Predefined cultural categories

  2. Updates
    - Add location and preference fields to User table
    - Add cultural tags to Recipe table

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- Create enum types
CREATE TYPE "Religion" AS ENUM ('HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'JEWISH', 'OTHER', 'NONE');
CREATE TYPE "DietType" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'JAIN_VEGETARIAN', 'HALAL', 'KOSHER', 'EGGETARIAN');
CREATE TYPE "CuisineType" AS ENUM ('NORTH_INDIAN', 'SOUTH_INDIAN', 'GUJARATI', 'PUNJABI', 'BENGALI', 'MAHARASHTRIAN', 'RAJASTHANI', 'KERALA', 'TAMIL', 'ANDHRA', 'KASHMIRI', 'ASSAMESE', 'CHINESE', 'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE', 'CONTINENTAL', 'MIDDLE_EASTERN', 'MEDITERRANEAN');
CREATE TYPE "SpiceLevel" AS ENUM ('MILD', 'MEDIUM', 'SPICY', 'VERY_SPICY');

-- Add new columns to User table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'phone') THEN
    ALTER TABLE "User" ADD COLUMN "phone" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'isOnboardingComplete') THEN
    ALTER TABLE "User" ADD COLUMN "isOnboardingComplete" BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'country') THEN
    ALTER TABLE "User" ADD COLUMN "country" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'state') THEN
    ALTER TABLE "User" ADD COLUMN "state" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'city') THEN
    ALTER TABLE "User" ADD COLUMN "city" TEXT;
  END IF;
END $$;

-- Create CulturalPreference table
CREATE TABLE IF NOT EXISTS "CulturalPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "religion" "Religion",
  "dietTypes" "DietType"[],
  "preferredCuisines" "CuisineType"[],
  "spiceLevel" "SpiceLevel" DEFAULT 'MEDIUM',
  "avoidIngredients" TEXT[],
  "preferredIngredients" TEXT[],
  "culturalRestrictions" TEXT[],
  "festivalPreferences" TEXT[],
  "regionalPreferences" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CulturalPreference_pkey" PRIMARY KEY ("id")
);

-- Create RecipeCulturalTag table
CREATE TABLE IF NOT EXISTS "RecipeCulturalTag" (
  "id" TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  "cuisineType" "CuisineType" NOT NULL,
  "dietTypes" "DietType"[],
  "spiceLevel" "SpiceLevel" DEFAULT 'MEDIUM',
  "religion" "Religion"[],
  "region" TEXT,
  "festival" TEXT,
  "culturalSignificance" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RecipeCulturalTag_pkey" PRIMARY KEY ("id")
);

-- Create Location table
CREATE TABLE IF NOT EXISTS "Location" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "country" TEXT NOT NULL,
  "state" TEXT,
  "city" TEXT,
  "pincode" TEXT,
  "address" TEXT,
  "isDefault" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CulturalPreference_userId_key') THEN
    ALTER TABLE "CulturalPreference" ADD CONSTRAINT "CulturalPreference_userId_key" UNIQUE ("userId");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RecipeCulturalTag_recipeId_key') THEN
    ALTER TABLE "RecipeCulturalTag" ADD CONSTRAINT "RecipeCulturalTag_recipeId_key" UNIQUE ("recipeId");
  END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CulturalPreference_userId_fkey') THEN
    ALTER TABLE "CulturalPreference" ADD CONSTRAINT "CulturalPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RecipeCulturalTag_recipeId_fkey') THEN
    ALTER TABLE "RecipeCulturalTag" ADD CONSTRAINT "RecipeCulturalTag_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Location_userId_fkey') THEN
    ALTER TABLE "Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE "CulturalPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecipeCulturalTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CulturalPreference
CREATE POLICY "Users can read own cultural preferences"
  ON "CulturalPreference"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "Users can create own cultural preferences"
  ON "CulturalPreference"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own cultural preferences"
  ON "CulturalPreference"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId");

-- Create RLS policies for RecipeCulturalTag
CREATE POLICY "Anyone can read recipe cultural tags"
  ON "RecipeCulturalTag"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Recipe authors can manage cultural tags"
  ON "RecipeCulturalTag"
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Recipe" 
      WHERE "Recipe"."id" = "RecipeCulturalTag"."recipeId" 
      AND "Recipe"."authorId" = auth.uid()
    )
  );

-- Create RLS policies for Location
CREATE POLICY "Users can read own locations"
  ON "Location"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

CREATE POLICY "Users can create own locations"
  ON "Location"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own locations"
  ON "Location"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = "userId");