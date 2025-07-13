-- Enable RLS on the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Only edge functions can insert/update/delete
CREATE POLICY "edge_functions_only" ON orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Revoke all default permissions from public users
REVOKE ALL ON orders FROM public;
REVOKE ALL ON orders FROM authenticated;