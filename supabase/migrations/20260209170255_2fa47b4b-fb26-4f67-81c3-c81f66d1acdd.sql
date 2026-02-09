
-- Registros: permitir todos os admins verem todos os registros
DROP POLICY "Admins can view all registros" ON registros;
CREATE POLICY "Admins can view all registros" ON registros
  FOR SELECT USING (has_any_admin_role(auth.uid()));

-- Certificates: permitir todos os admins verem todos os certificados  
DROP POLICY "Admins can view all certificates" ON certificates;
CREATE POLICY "Admins can view all certificates" ON certificates
  FOR SELECT USING (has_any_admin_role(auth.uid()));
