-- ============================================================
-- Enable Row-Level Security (RLS) & Add Policies for Supabase
-- Project: roof-top (ogdinpwwiwzanfziisez)
-- Fixes: rls_disabled_in_public security vulnerability alert
-- ============================================================

-- 1. Enable Row-Level Security on all public tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rainfall_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_irradiance_annual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_irradiance_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidies ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if re-running (avoids duplicate policy errors)
DROP POLICY IF EXISTS "Allow public read access on locations" ON public.locations;
DROP POLICY IF EXISTS "Allow public read access on rainfall_data" ON public.rainfall_data;
DROP POLICY IF EXISTS "Allow public read access on solar_irradiance_annual" ON public.solar_irradiance_annual;
DROP POLICY IF EXISTS "Allow public read access on solar_irradiance_monthly" ON public.solar_irradiance_monthly;
DROP POLICY IF EXISTS "Allow public read access on subsidies" ON public.subsidies;

-- 3. Create SELECT policies allowing read-only access for anon/public queries
-- (Write/Edit/Delete actions are restricted to database owner / service role)
CREATE POLICY "Allow public read access on locations"
  ON public.locations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on rainfall_data"
  ON public.rainfall_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on solar_irradiance_annual"
  ON public.solar_irradiance_annual FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on solar_irradiance_monthly"
  ON public.solar_irradiance_monthly FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on subsidies"
  ON public.subsidies FOR SELECT
  TO public
  USING (true);
