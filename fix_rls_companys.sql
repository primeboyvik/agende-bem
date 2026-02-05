-- Explictly drop potential conflicting policies
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."companys";
DROP POLICY IF EXISTS "Public Select" ON "public"."companys";

-- Re-create explicit policies
CREATE POLICY "Public Select"
ON "public"."companys"
FOR SELECT
TO public
USING (true);

-- Ensure RLS is enabled
ALTER TABLE "public"."companys" ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'companys';
