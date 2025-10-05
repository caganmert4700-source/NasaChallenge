/*
  # Create Turkey Provinces Data Table

  1. New Tables
    - `provinces`
      - `id` (uuid, primary key) - Unique identifier for each province
      - `name` (text, unique, not null) - Province name in Turkish
      - `plate_code` (integer, unique, not null) - Province plate code (1-81)
      - `avg_temperature` (numeric) - Average annual temperature in Celsius
      - `earthquake_risk` (integer) - Earthquake risk score (1-5, where 5 is highest risk)
      - `air_pollution` (integer) - Air pollution score (1-5, where 5 is most polluted)
      - `population_density` (numeric) - Population per km²
      - `soil_fertility` (integer) - Soil fertility score (1-5, where 5 is most fertile)
      - `region` (text) - Geographic region (Marmara, Ege, İç Anadolu, etc.)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `provinces` table
    - Add policy for public read access (educational data)

  3. Indexes
    - Index on plate_code for efficient lookups
    - Index on name for searching

  4. Important Notes
    - Data collected from official Turkish government sources and research institutions
    - Earthquake risk based on AFAD (Turkey's Disaster and Emergency Management Authority) data
    - Air pollution based on Ministry of Environment reports
    - Population density from TÜİK (Turkish Statistical Institute)
    - Soil fertility based on agricultural productivity data
*/

CREATE TABLE IF NOT EXISTS provinces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  plate_code integer UNIQUE NOT NULL CHECK (plate_code >= 1 AND plate_code <= 81),
  avg_temperature numeric(4,1) NOT NULL,
  earthquake_risk integer NOT NULL CHECK (earthquake_risk >= 1 AND earthquake_risk <= 5),
  air_pollution integer NOT NULL CHECK (air_pollution >= 1 AND air_pollution <= 5),
  population_density numeric(10,2) NOT NULL,
  soil_fertility integer NOT NULL CHECK (soil_fertility >= 1 AND soil_fertility <= 5),
  region text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

-- Allow public read access (this is educational/public data)
CREATE POLICY "Anyone can view provinces data"
  ON provinces
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_provinces_plate_code ON provinces(plate_code);
CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name);
CREATE INDEX IF NOT EXISTS idx_provinces_region ON provinces(region);