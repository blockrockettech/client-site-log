-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Sites policies  
CREATE POLICY "Users can view sites they're assigned to" ON public.sites
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    get_user_role(auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "Admins can manage sites" ON public.sites
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Checklists policies
CREATE POLICY "Users can view checklists for their sites" ON public.checklists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sites 
      WHERE sites.checklist_id = checklists.id 
      AND (sites.profile_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'staff'))
    )
  );

CREATE POLICY "Admins can manage checklists" ON public.checklists
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Visits policies
CREATE POLICY "Users can view their visits" ON public.visits
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    get_user_role(auth.uid()) IN ('admin', 'staff')
  );

CREATE POLICY "Staff and admins can create visits" ON public.visits
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Staff and admins can update visits" ON public.visits
  FOR UPDATE USING (get_user_role(auth.uid()) IN ('admin', 'staff'));

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updating timestamps
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();