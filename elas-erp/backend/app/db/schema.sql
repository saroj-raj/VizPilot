-- Elas ERP Multi-Tenant Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    domain TEXT, -- e.g., "Retail", "Technology"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'finance')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'finance')),
    invited_by UUID REFERENCES public.users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(business_id, email, status)
);

-- =====================================================
-- UPLOADED_FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    domain TEXT,
    intent TEXT,
    parsed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- DASHBOARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    layout JSONB DEFAULT '{}'::jsonb,
    filters JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT_LOGS TABLE (for tracking changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_business_id ON public.users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_invitations_business_id ON public.invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_business_id ON public.uploaded_files(business_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_business_id ON public.dashboards(business_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON public.audit_logs(business_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only see their own business
CREATE POLICY "Users can view their own business"
    ON public.businesses FOR SELECT
    USING (id IN (
        SELECT business_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can update their business"
    ON public.businesses FOR UPDATE
    USING (id IN (
        SELECT business_id FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users: Can view users in same business
CREATE POLICY "Users can view same business users"
    ON public.users FOR SELECT
    USING (business_id IN (
        SELECT business_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admins and managers can invite users"
    ON public.users FOR INSERT
    WITH CHECK (business_id IN (
        SELECT business_id FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- Invitations: Business-scoped access
CREATE POLICY "Users can view invitations in their business"
    ON public.invitations FOR SELECT
    USING (business_id IN (
        SELECT business_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins and managers can create invitations"
    ON public.invitations FOR INSERT
    WITH CHECK (business_id IN (
        SELECT business_id FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- Uploaded Files: Business-scoped with role-based access
CREATE POLICY "Users can view files in their business"
    ON public.uploaded_files FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM public.users WHERE id = auth.uid()
        )
        AND (
            -- Admins, managers, finance see all files
            (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'manager', 'finance')
            OR 
            -- Employees only see their own files
            user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload files"
    ON public.uploaded_files FOR INSERT
    WITH CHECK (business_id IN (
        SELECT business_id FROM public.users WHERE id = auth.uid()
    ));

-- Dashboards: Business-scoped access
CREATE POLICY "Users can view dashboards in their business"
    ON public.dashboards FOR SELECT
    USING (business_id IN (
        SELECT business_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create their own dashboards"
    ON public.dashboards FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own dashboards"
    ON public.dashboards FOR UPDATE
    USING (user_id = auth.uid());

-- Audit Logs: Business-scoped read-only
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (business_id IN (
        SELECT business_id FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON public.dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be called from application code
    -- Just a placeholder for future automation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Create a test business
-- INSERT INTO public.businesses (name, industry, size, domain)
-- VALUES ('Italian Restaurant', 'Food & Beverage', '11-50 employees', 'Restaurant');

COMMENT ON TABLE public.businesses IS 'Stores business/organization information';
COMMENT ON TABLE public.users IS 'Extends Supabase auth.users with business and role info';
COMMENT ON TABLE public.invitations IS 'Team member invitation system with token-based accept';
COMMENT ON TABLE public.uploaded_files IS 'Tracks all uploaded files with business isolation';
COMMENT ON TABLE public.dashboards IS 'User-specific dashboard configurations';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all important actions';
