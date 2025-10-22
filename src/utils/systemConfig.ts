import { supabase } from '@/integrations/supabase/client';

export interface SystemConfig {
  fld_id: number;
  fld_burks: string | null;
  fld_name1: string;
  fld_name2: string | null;
  fld_stret: string | null;
  fld_pstlc: string | null;
  fld_email: string | null;
  fld_femail: string | null;
  fld_telep: string | null;
  fld_cflag: string | null;
  fld_e1: string | null;
  fld_e2: string | null;
  fld_e3: string | null;
  fld_e4: string | null;
  fld_e5: string | null;
  fld_e6: string | null;
  fld_e7: string | null;
  fld_e8: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Get system configuration data
 */
export const getSystemConfig = async (): Promise<SystemConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('tbl_system_config')
      .select('*')
      .eq('fld_cflag', 'Active')
      .single();

    if (error) {
      console.error('Error fetching system config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching system config:', error);
    return null;
  }
};

/**
 * Get company name from system config
 */
export const getCompanyName = async (): Promise<string> => {
  const config = await getSystemConfig();
  return config?.fld_name1 || 'CleverCoach Nachhilfe';
};

/**
 * Get company email from system config
 */
export const getCompanyEmail = async (): Promise<string> => {
  const config = await getSystemConfig();
  return config?.fld_femail || 'kontakt@clevercoach-nachhilfe.de';
};

/**
 * Get admin email from system config
 */
export const getAdminEmail = async (): Promise<string> => {
  const config = await getSystemConfig();
  return config?.fld_email || 'admin@clevercoach-nachhilfe.de';
};

/**
 * Get company URL from system config (default fallback)
 */
export const getCompanyUrl = async (): Promise<string> => {
  return 'https://clevercoach-nachhilfe.de';
};

/**
 * Get company phone from system config
 */
export const getCompanyPhone = async (): Promise<string> => {
  const config = await getSystemConfig();
  return config?.fld_telep || '';
};

/**
 * Get company address from system config
 */
export const getCompanyAddress = async (): Promise<{
  street: string;
  zip: string;
  phone: string;
}> => {
  const config = await getSystemConfig();
  return {
    street: config?.fld_stret || '',
    zip: config?.fld_pstlc || '',
    phone: config?.fld_telep || ''
  };
};

/**
 * Get company signature from system config
 */
export const getCompanySignature = async (): Promise<{
  greeting: string;
  team: string;
  company: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}> => {
  const config = await getSystemConfig();
  return {
    greeting: config?.fld_e1 || 'Mit freundlichen Grüßen',
    team: config?.fld_e2 || 'CleverCoach Nachhilfe Team',
    company: config?.fld_e3 || 'Tav & Uzun GbR',
    name: config?.fld_e4 || 'CleverCoach Nachhilfe',
    address: config?.fld_e5 || 'Höschenhofweg 31',
    city: config?.fld_e6 || '47249 Duisburg',
    phone: config?.fld_e7 || 'Tel: 0203 39652097',
    email: config?.fld_e8 || 'E-Mail: Kontakt@clevercoach-nachhilfe.de'
  };
};
