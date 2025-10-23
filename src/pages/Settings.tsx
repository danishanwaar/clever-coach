import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Shield, 
  Database as DatabaseIcon,
  Mail,
  Phone,
  Globe,
  Lock,
  Clock
} from 'lucide-react';

type SystemConfig = Database['public']['Tables']['tbl_system_config']['Row'];
type Country = Database['public']['Tables']['tbl_countries']['Row'];

export default function Settings() {
  const user = useAuthStore(state => state.user);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({});

  // Check if user is admin
  if (user?.fld_rid !== 1) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchSystemConfigs();
    fetchCountries();
  }, []);

  const fetchSystemConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tbl_system_config')
        .select('*')
        .order('fld_id', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching system configs:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_countries')
        .select('*')
        .eq('fld_lflag', 'Active')
        .order('fld_landx50', { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries');
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setEditedConfigs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update the system config record
      const { error } = await supabase
        .from('tbl_system_config')
        .update(editedConfigs)
        .eq('fld_id', 1); // Assuming there's only one config record

      if (error) throw error;

      toast.success('Settings saved successfully');
      setEditedConfigs({});
      fetchSystemConfigs(); // Refresh the data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getConfigValue = (field: string) => {
    if (editedConfigs[field] !== undefined) {
      return editedConfigs[field];
    }
    
    const value = configs[0]?.[field as keyof SystemConfig];
    // Convert number to string for Select components
    return value ? value.toString() : '';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">
              System Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage system configuration and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSystemConfigs}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={saving || Object.keys(editedConfigs).length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      {configs.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Last Updated:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(configs[0].updated_at).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DatabaseIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Config ID:</span>
              <span className="text-sm font-medium text-gray-900">{configs[0].fld_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings Categories */}
      <div className="space-y-6">
        {/* Company Information */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <DatabaseIcon className="h-5 w-5 text-blue-600" />
              </div>
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fld_name1" className="text-sm font-medium text-gray-700">
                  Company Name
                </Label>
                <Input
                  id="fld_name1"
                  value={getConfigValue('fld_name1')}
                  onChange={(e) => handleConfigChange('fld_name1', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fld_name2" className="text-sm font-medium text-gray-700">
                  Legal Name
                </Label>
                <Input
                  id="fld_name2"
                  value={getConfigValue('fld_name2')}
                  onChange={(e) => handleConfigChange('fld_name2', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fld_burks" className="text-sm font-medium text-gray-700">
                  Company Code
                </Label>
                <Input
                  id="fld_burks"
                  value={getConfigValue('fld_burks')}
                  onChange={(e) => handleConfigChange('fld_burks', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fld_cntry" className="text-sm font-medium text-gray-700">
                  Country
                </Label>
                <Select
                  value={getConfigValue('fld_cntry')}
                  onValueChange={(value) => handleConfigChange('fld_cntry', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.fld_id} value={country.fld_id.toString()}>
                        {country.fld_landx50} ({country.fld_landx})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fld_email" className="text-sm font-medium text-gray-700">
                  Admin Email
                </Label>
                <Input
                  id="fld_email"
                  type="email"
                  value={getConfigValue('fld_email')}
                  onChange={(e) => handleConfigChange('fld_email', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fld_femail" className="text-sm font-medium text-gray-700">
                  Contact Email
                </Label>
                <Input
                  id="fld_femail"
                  type="email"
                  value={getConfigValue('fld_femail')}
                  onChange={(e) => handleConfigChange('fld_femail', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="fld_cflag" className="text-sm font-medium text-gray-700">
                System Status
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={getConfigValue('fld_cflag') === 'Active'}
                  onCheckedChange={(checked) => 
                    handleConfigChange('fld_cflag', checked ? 'Active' : 'Inactive')
                  }
                />
                <span className="text-sm text-gray-600">
                  {getConfigValue('fld_cflag') === 'Active' ? 'System Active' : 'System Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {configs.length === 0 && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-12 text-center">
            <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Settings Found</h3>
            <p className="text-gray-600">No system configuration found in the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}