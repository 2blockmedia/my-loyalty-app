import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';

const Settings = () => {
  const { business, setBusiness, error, setError } = useAppContext();
  const [form, setForm] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    enableSMS: true,
    enableEmail: true,
    welcomeMessage: '',
    requireStaffPINForRedemption: false,
    staffPIN: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState('business');

  // Load business settings into form
  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || '',
        description: business.description || '',
        contactEmail: business.contactEmail || '',
        contactPhone: business.contactPhone || '',
        address: business.address || '',
        primaryColor: business.primaryColor || '#4F46E5',
        secondaryColor: business.secondaryColor || '#10B981',
        enableSMS: business.settings?.enableSMS ?? true,
        enableEmail: business.settings?.enableEmail ?? true,
        welcomeMessage: business.settings?.welcomeMessage || '',
        requireStaffPINForRedemption: business.settings?.requireStaffPINForRedemption || false,
        staffPIN: business.settings?.staffPIN || ''
      });
    }
  }, [business]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.name.trim()) {
      setError('Business name is required');
      return;
    }
    
    if (form.contactEmail && !validateEmail(form.contactEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (form.requireStaffPINForRedemption && !form.staffPIN) {
      setError('Staff PIN is required when PIN protection is enabled');
      return;
    }
    
    // Update business settings
    setBusiness(prev => ({
      ...prev,
      name: form.name,
      description: form.description,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      address: form.address,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      settings: {
        ...prev.settings,
        enableSMS: form.enableSMS,
        enableEmail: form.enableEmail,
        welcomeMessage: form.welcomeMessage,
        requireStaffPINForRedemption: form.requireStaffPINForRedemption,
        staffPIN: form.staffPIN
      },
      updatedAt: new Date().toISOString()
    }));
    
    setIsEditing(false);
    setError(null);
  };

  // Email validation helper
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <div className="mt-2 sm:mt-0">
          {!isEditing && (
            <Button primary onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          )}
        </div>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setCurrentTab('business')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentTab === 'business'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Business Information
          </button>
          <button
            onClick={() => setCurrentTab('appearance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentTab === 'appearance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setCurrentTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setCurrentTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Business Information Tab */}
          {currentTab === 'business' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border border-gray-300 rounded-lg ${
                      isEditing
                        ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border border-gray-300 rounded-lg ${
                      isEditing
                        ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50'
                    }`}
                  />
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border border-gray-300 rounded-lg ${
                      isEditing
                        ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50'
                    }`}
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border border-gray-300 rounded-lg ${
                      isEditing
                        ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50'
                    }`}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border border-gray-300 rounded-lg ${
                      isEditing
                        ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-gray-50'
                    }`}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Business Logo</h3>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24">
                    {business?.logo_url ? (
                      <div className="relative w-full h-full">
                        <img src={business.logo_url} alt="Business Logo" className="w-full h-full object-contain rounded-lg border border-gray-200" />
                        {isEditing && (
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 text-xs text-gray-600 hover:bg-red-100 hover:text-red-600"
                            onClick={async () => {
                              // Remove from Supabase storage
                              try {
                                const { supabase } = await import('../../lib/supabaseClient');
                                // Extract file path from URL
                                const url = business.logo_url;
                                const match = url.match(/logos\/([^?]+)/);
                                if (match && match[1]) {
                                  await supabase.storage.from('logos').remove([decodeURIComponent(match[1])]);
                                }
                              } catch (e) {}
                              setBusiness(prev => ({ ...prev, logo_url: null }));
                            }}
                            title="Delete Logo"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: business?.primaryColor || '#4F46E5', color: 'white' }}
                      >
                        <span className="text-4xl font-bold">{business?.name?.charAt(0) || 'L'}</span>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        style={{ display: 'none' }}
                        id="logo-upload-input"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
                            setError('Only PNG, JPG, or SVG files are allowed.');
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            setError('File size must be 5MB or less.');
                            return;
                          }
                          // Upload to Supabase storage (bucket: logos)
                          const fileExt = file.name.split('.').pop();
                          const filePath = `business-logos/${Date.now()}.${fileExt}`;
                          const { supabase } = await import('../../lib/supabaseClient');
                          const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file, { upsert: true });
                          if (uploadError) {
                            setError('Failed to upload logo.');
                            return;
                          }
                          // Get public URL
                          const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(filePath);
                          if (!publicUrlData || !publicUrlData.publicUrl) {
                            setError('Failed to get logo URL.');
                            return;
                          }
                          // Update business logoUrl and preview immediately
                          setBusiness(prev => ({ ...prev, logo_url: publicUrlData.publicUrl }));
                          setError(null);
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('logo-upload-input').click()}
                      >
                        Upload Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum file size: 5MB. Recommended size: 512x512px.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance Tab */}
          {currentTab === 'appearance' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={form.primaryColor}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-12 h-10 rounded border ${!isEditing && 'opacity-60'}`}
                    />
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={handleInputChange}
                      name="primaryColor"
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded-lg ${
                        isEditing
                          ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-gray-50'
                      }`}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={form.secondaryColor}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-12 h-10 rounded border ${!isEditing && 'opacity-60'}`}
                    />
                    <input
                      type="text"
                      value={form.secondaryColor}
                      onChange={handleInputChange}
                      name="secondaryColor"
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded-lg ${
                        isEditing
                          ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-gray-50'
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: form.primaryColor, color: 'white' }}
                    >
                      <span className="font-bold text-lg">{form.name ? form.name.charAt(0) : 'L'}</span>
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: form.primaryColor }}>
                        {form.name || 'Your Business'}
                      </div>
                      <div className="text-sm text-gray-500">Loyalty Rewards</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      type="button"
                      style={{ backgroundColor: form.primaryColor, color: 'white' }}
                      className="px-4 py-2 rounded-lg font-medium w-full"
                    >
                      Primary Button
                    </button>
                    
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-medium w-full border"
                      style={{ borderColor: form.primaryColor, color: form.primaryColor }}
                    >
                      Secondary Button
                    </button>
                    
                    <div className="p-3 rounded-lg" style={{ backgroundColor: form.secondaryColor + '20' }}>
                      <span style={{ color: form.secondaryColor }}>Highlight Message Area</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {currentTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSMS"
                    name="enableSMS"
                    checked={form.enableSMS}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableSMS" className="ml-2 block text-sm text-gray-700">
                    Enable SMS notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableEmail"
                    name="enableEmail"
                    checked={form.enableEmail}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableEmail" className="ml-2 block text-sm text-gray-700">
                    Enable email notifications
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  value={form.welcomeMessage}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border border-gray-300 rounded-lg ${
                    isEditing
                      ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-gray-50'
                  }`}
                  rows="3"
                  placeholder="Welcome message for new customers"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This message will be shown to new customers when they first sign up.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Notification Templates</h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-medium">Welcome notification</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Sent when a customer registers for the first time
                    </p>
                    {isEditing && (
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        Edit template
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-medium">Points earned notification</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Sent when customer earns points from a purchase
                    </p>
                    {isEditing && (
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        Edit template
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-medium">Reward redemption notification</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Sent when customer redeems a reward
                    </p>
                    {isEditing && (
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        Edit template
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {currentTab === 'security' && (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireStaffPINForRedemption"
                    name="requireStaffPINForRedemption"
                    checked={form.requireStaffPINForRedemption}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireStaffPINForRedemption" className="ml-2 block text-sm text-gray-700">
                    Require staff PIN for reward redemptions
                  </label>
                </div>
                
                {(isEditing || form.requireStaffPINForRedemption) && (
                  <div className="pl-6">
                    <label htmlFor="staffPIN" className="block text-sm font-medium text-gray-700 mb-1">
                      Staff PIN
                    </label>
                    <input
                      type="password"
                      id="staffPIN"
                      name="staffPIN"
                      value={form.staffPIN}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full max-w-xs p-2 border border-gray-300 rounded-lg ${
                        isEditing
                          ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-gray-50'
                      }`}
                      placeholder="Enter 4-6 digit PIN"
                    />
                    {form.requireStaffPINForRedemption && !form.staffPIN && isEditing && (
                      <p className="mt-1 text-xs text-red-600">
                        A PIN is required when PIN protection is enabled
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Account Security</h3>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Change Admin Password
                      </button>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Two-factor authentication adds an extra layer of security to your account.
                        </p>
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Enable Two-Factor Authentication
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="font-medium">Password & Authentication</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage your admin password and two-factor authentication settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-medium">Privacy Policy</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your privacy policy and terms of service.
                    </p>
                    {isEditing && (
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        Edit Privacy Policy
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-medium">Data Export</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Export all your business and customer data.
                    </p>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                    >
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Form Controls - Only show when editing */}
          {isEditing && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  // Reset form to business settings
                  if (business) {
                    setForm({
                      name: business.name || '',
                      description: business.description || '',
                      contactEmail: business.contactEmail || '',
                      contactPhone: business.contactPhone || '',
                      address: business.address || '',
                      primaryColor: business.primaryColor || '#4F46E5',
                      secondaryColor: business.secondaryColor || '#10B981',
                      enableSMS: business.settings?.enableSMS ?? true,
                      enableEmail: business.settings?.enableEmail ?? true,
                      welcomeMessage: business.settings?.welcomeMessage || '',
                      requireStaffPINForRedemption: business.settings?.requireStaffPINForRedemption || false,
                      staffPIN: business.settings?.staffPIN || ''
                    });
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" primary>
                Save Changes
              </Button>
            </div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="px-6 pb-4">
              <div className="text-red-500 text-sm">
                {error}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;