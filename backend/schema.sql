-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Programs table (optional, for metadata, but we'll use it to seed the basic programs)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL UNIQUE, -- 'strength', 'weight_loss', 'cardio'
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Create Progress Records table with strict multi-tenant isolation
CREATE TABLE IF NOT EXISTS progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_type VARCHAR(50) NOT NULL,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- The most critical part for data isolation and upserts
  UNIQUE(user_id, program_type, program_id, metric_name)
);

-- Insert predefined programs
INSERT INTO programs (id, type, name, description)
VALUES 
  (gen_random_uuid(), 'strength', 'Strength Training', 'Build muscle and increase raw power.'),
  (gen_random_uuid(), 'weight_loss', 'Weight Loss', 'Burn fat and improve cardiovascular health.'),
  (gen_random_uuid(), 'cardio', 'Cardio Transformation', 'Enhance endurance and stamina.')
ON CONFLICT (type) DO NOTHING;
