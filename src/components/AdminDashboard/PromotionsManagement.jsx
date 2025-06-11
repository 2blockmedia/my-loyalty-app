import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';
import { mockCampaigns, mockSegments } from '../../data/mockData';

const PromotionsManagement = () => {
  const { error, setError } = useAppContext();
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [segments, setSegments] = useState(mockSegments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'SMS',
    segmentId: '',
    messageTemplate: '',
    scheduledDate: '',
    rewardId: ''
  });
  const [previewMessage, setPreviewMessage] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Apply sorting to campaigns
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    
    // Handle dates
    if (typeof valA === 'string' && (valA.includes('T') || valA.includes('-'))) {
      valA = new Date(valA || '1900-01-01').getTime();
      valB = new Date(valB || '1900-01-01').getTime();
    }
    
    // Handle strings
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
    }
    if (typeof valB === 'string') {
      valB = valB.toLowerCase();
    }
    
    // Sort order
    if (sortOrder === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });
  
  // Handle sort toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Create new campaign
  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setCampaignForm({
      name: '',
      description: '',
      type: 'SMS',
      segmentId: segments[0]?.id || '',
      messageTemplate: '',
      scheduledDate: '',
      rewardId: ''
    });
    setPreviewMessage('');
    setIsModalOpen(true);
  };

  // Handle campaign selection for editing
  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignForm({
      name: campaign.name || '',
      description: campaign.description || '',
      type: campaign.type || 'SMS',
      segmentId: campaign.segmentId || '',
      messageTemplate: campaign.messageTemplate || '',
      scheduledDate: campaign.scheduledDate ? campaign.scheduledDate.split('T')[0] : '',
      rewardId: campaign.rewardId || ''
    });
    updatePreviewMessage(campaign.messageTemplate);
    setIsModalOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Update preview message when message template changes
    if (name === 'messageTemplate') {
      updatePreviewMessage(value);
    }
  };

  // Update message preview with customer sample data
  const updatePreviewMessage = (template) => {
    if (!template) {
      setPreviewMessage('');
      return;
    }

    // Sample customer data for preview
    const sampleData = {
      firstName: 'John',
      lastName: 'Doe',
      points: 120
    };
    
    // Simple template replacement
    let preview = template;
    Object.keys(sampleData).forEach(key => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), sampleData[key]);
    });
    
    setPreviewMessage(preview);
  };

  // Handle campaign submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!campaignForm.name.trim()) {
      setError('Campaign name is required');
      return;
    }
    
    if (!campaignForm.messageTemplate.trim()) {
      setError('Message template is required');
      return;
    }
    
    if (!campaignForm.segmentId) {
      setError('Please select a customer segment');
      return;
    }
    
    if (selectedCampaign) {
      // Update existing campaign
      setCampaigns(prev => prev.map(c => {
        if (c.id === selectedCampaign.id) {
          return {
            ...c,
            name: campaignForm.name,
            description: campaignForm.description,
            type: campaignForm.type,
            segmentId: campaignForm.segmentId,
            messageTemplate: campaignForm.messageTemplate,
            scheduledDate: campaignForm.scheduledDate ? new Date(campaignForm.scheduledDate).toISOString() : null,
            rewardId: campaignForm.rewardId || null,
            status: campaignForm.scheduledDate && new Date(campaignForm.scheduledDate) > new Date() ? 'SCHEDULED' : 'DRAFT',
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      }));
    } else {
      // Create new campaign
      const segment = segments.find(s => s.id === campaignForm.segmentId);
      
      const newCampaign = {
        id: `campaign_${Date.now()}`,
        businessId: 'business_1',
        name: campaignForm.name,
        description: campaignForm.description,
        type: campaignForm.type,
        segmentId: campaignForm.segmentId,
        messageTemplate: campaignForm.messageTemplate,
        status: campaignForm.scheduledDate && new Date(campaignForm.scheduledDate) > new Date() ? 'SCHEDULED' : 'DRAFT',
        scheduledDate: campaignForm.scheduledDate ? new Date(campaignForm.scheduledDate).toISOString() : null,
        recipientCount: segment?.customerCount || 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        rewardId: campaignForm.rewardId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCampaigns(prev => [...prev, newCampaign]);
    }
    
    setIsModalOpen(false);
    setError(null);
  };

  // Handle sending or canceling a campaign
  const handleCampaignAction = (campaign, action) => {
    if (action === 'send') {
      if (!window.confirm(`Are you sure you want to send this campaign to ${campaign.recipientCount} recipients now?`)) {
        return;
      }
      
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaign.id) {
          return {
            ...c,
            status: 'SENDING',
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      }));
      
      // Simulate campaign sending
      setTimeout(() => {
        setCampaigns(prev => prev.map(c => {
          if (c.id === campaign.id) {
            return {
              ...c,
              status: 'COMPLETED',
              sentCount: c.recipientCount,
              deliveredCount: Math.floor(c.recipientCount * 0.95), // simulate ~95% delivery rate
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        }));
      }, 2000);
    } else if (action === 'cancel') {
      if (!window.confirm('Are you sure you want to cancel this scheduled campaign?')) {
        return;
      }
      
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaign.id) {
          return {
            ...c,
            status: 'CANCELLED',
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      }));
    } else if (action === 'delete') {
      if (!window.confirm('Are you sure you want to delete this campaign?')) {
        return;
      }
      
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get campaign status badge class
  const getCampaignStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'SENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Promotions & Campaigns</h1>
        <div className="mt-2 sm:mt-0">
          <Button primary onClick={handleCreateCampaign}>
            Create Campaign
          </Button>
        </div>
      </div>
      
      {/* Campaigns list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Campaigns</h2>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg p-1.5"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="scheduledDate">Schedule Date</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="recipientCount">Audience Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Campaign
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('scheduledDate')}
                >
                  Schedule
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('recipientCount')}
                >
                  Audience
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Results
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedCampaigns.length > 0 ? (
                sortedCampaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.type === 'SMS' ? (
                            <span className="inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              SMS
                            </span>
                          ) : (
                            <span className="inline-flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCampaignStatusClass(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.scheduledDate ? formatDate(campaign.scheduledDate) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.recipientCount} recipients
                      <div className="text-xs">
                        {segments.find(s => s.id === campaign.segmentId)?.name || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {campaign.sentCount > 0 ? (
                        <div>
                          <div>Sent: {campaign.sentCount}</div>
                          <div className="text-xs text-gray-500">
                            Delivered: {campaign.deliveredCount} 
                            ({Math.round((campaign.deliveredCount / campaign.sentCount) * 100)}%)
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleSelectCampaign(campaign)}
                        >
                          Edit
                        </button>
                        
                        {campaign.status === 'DRAFT' && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleCampaignAction(campaign, 'send')}
                          >
                            Send Now
                          </button>
                        )}
                        
                        {campaign.status === 'SCHEDULED' && (
                          <button 
                            className="text-amber-600 hover:text-amber-900"
                            onClick={() => handleCampaignAction(campaign, 'cancel')}
                          >
                            Cancel
                          </button>
                        )}
                        
                        {(campaign.status === 'DRAFT' || campaign.status === 'CANCELLED') && (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleCampaignAction(campaign, 'delete')}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No campaigns created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={campaignForm.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Summer Promotion, Loyalty Reminder, etc."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={campaignForm.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Briefly describe the purpose of this campaign"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Message Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={campaignForm.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="SMS">SMS Message</option>
                      <option value="EMAIL" disabled>Email (Coming Soon)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="segmentId" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Segment *
                    </label>
                    <select
                      id="segmentId"
                      name="segmentId"
                      value={campaignForm.segmentId}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a segment</option>
                      {segments.map(segment => (
                        <option key={segment.id} value={segment.id}>
                          {segment.name} ({segment.customerCount} customers)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                      Message Template *
                    </label>
                    <textarea
                      id="messageTemplate"
                      name="messageTemplate"
                      value={campaignForm.messageTemplate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Hello {{firstName}}, thank you for being our loyal customer!"
                      rows="4"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use {'{{firstName}}'}, {'{{lastName}}'}, and {'{{points}}'} as placeholders for personalization.

                    </p>
                  </div>
                  
                  {previewMessage && (
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Message Preview:</h4>
                      <p className="text-sm">{previewMessage}</p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={campaignForm.scheduledDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank to save as draft.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="rewardId" className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Reward (Optional)
                    </label>
                    <select
                      id="rewardId"
                      name="rewardId"
                      value={campaignForm.rewardId || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No linked reward</option>
                      <option value="reward_001">Free Coffee</option>
                      <option value="reward_002">50% Off Pastry</option>
                      <option value="reward_004">Summer Special: Iced Drink</option>
                    </select>
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">
                    {error}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <div className="space-x-2">
                  {!campaignForm.scheduledDate && (
                    <Button
                      type="submit"
                    >
                      Save as Draft
                    </Button>
                  )}
                  <Button type="submit" primary>
                    {campaignForm.scheduledDate ? 'Schedule Campaign' : 'Save & Send Now'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsManagement;