import { useState, useEffect, useRef } from 'react';
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
    rewardId: '',
    scheduleStartDate: '',
    scheduleEndDate: ''
  });
  const [previewMessage, setPreviewMessage] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiIdea, setAiIdea] = useState('');
  const [sendLater, setSendLater] = useState(false);
  const aiModalRef = useRef();
  
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
      rewardId: '',
      scheduleStartDate: '',
      scheduleEndDate: ''
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
      rewardId: campaign.rewardId || '',
      scheduleStartDate: campaign.scheduleStartDate ? campaign.scheduleStartDate.split('T')[0] : '',
      scheduleEndDate: campaign.scheduleEndDate ? campaign.scheduleEndDate.split('T')[0] : ''
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
    
    if (sendLater && (!campaignForm.scheduleStartDate || !campaignForm.scheduleEndDate)) {
      setError('Please select both a start and end date/time for scheduling.');
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
            rewardId: campaignForm.rewardId || null,
            scheduleStartDate: campaignForm.scheduleStartDate ? new Date(campaignForm.scheduleStartDate).toISOString() : null,
            scheduleEndDate: campaignForm.scheduleEndDate ? new Date(campaignForm.scheduleEndDate).toISOString() : null,
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
        rewardId: campaignForm.rewardId || null,
        scheduleStartDate: campaignForm.scheduleStartDate ? new Date(campaignForm.scheduleStartDate).toISOString() : null,
        scheduleEndDate: campaignForm.scheduleEndDate ? new Date(campaignForm.scheduleEndDate).toISOString() : null,
        recipientCount: segment?.customerCount || 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
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

  // AI handler for promotion idea
  const handleAIGeneratePromotion = async () => {
    setAiLoading(true);
    setAiError('');
    setAiIdea('');
    try {
      // Hardcoded idea for now
      await new Promise(r => setTimeout(r, 800));
      setAiIdea(
        "Flash Friday: Offer double loyalty points for all purchases made this Friday only! Encourage customers to visit and boost engagement with a limited-time bonus."
      );
    } catch (e) {
      setAiError('Failed to generate idea. Please try again.');
    }
    setAiLoading(false);
  };

  const handleUseAIPromotion = () => {
    setCampaignForm({
      ...campaignForm,
      name: aiIdea.split('\n')[0] || '',
      description: aiIdea,
      messageTemplate: aiIdea,
    });
    setIsModalOpen(true);
    setAiIdea('');
    aiModalRef.current.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Promotions & Campaigns</h1>
        <div className="mt-2 sm:mt-0 flex gap-2">
          <Button
            className={`
              relative overflow-hidden
              bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600
              text-white font-semibold
              transition-all duration-300
              hover:from-indigo-600 hover:via-blue-700 hover:to-purple-700
              focus:ring-2 focus:ring-indigo-400
              px-4 py-2 rounded
              shadow
              group
            `}
            style={{ minWidth: 170 }}
            onClick={() => aiModalRef.current.showModal()}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 animate-ai-glow-icon text-white" fill="none" viewBox="0 0 24 24">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
              </svg>
              AI Promotion Idea
            </span>
          </Button>
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
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCampaign ? 'Edit Promotion' : 'Create a Promotion'}
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
              <div className="p-6 space-y-6">
                {/* Offer Description */}
                <div>
                  <h4 className="font-semibold text-base mb-1">Create a promotion</h4>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Offer description (include any restrictions)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={campaignForm.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ie. 10% off your next visit"
                    maxLength={50}
                    required
                  />
                  <div className="text-xs text-gray-400 text-right">{campaignForm.name.length}/50</div>
                </div>

                {/* When is this offer valid? */}
                <div>
                  <h4 className="font-semibold text-base mb-1">When is this offer valid?</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="scheduleStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start
                      </label>
                      <input
                        type="date"
                        id="scheduleStartDate"
                        name="scheduleStartDate"
                        value={campaignForm.scheduleStartDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="scheduleEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End
                      </label>
                      <input
                        type="date"
                        id="scheduleEndDate"
                        name="scheduleEndDate"
                        value={campaignForm.scheduleEndDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Can be valid up to 30 days.</div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="font-semibold text-base mb-1">What's the occasion?</h4>
                  <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="messageTemplate"
                    name="messageTemplate"
                    value={campaignForm.messageTemplate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ie. "Celebrate our grand opening!"'
                    maxLength={145}
                    rows={3}
                    required
                  />
                  <div className="text-xs text-gray-400 text-right">{campaignForm.messageTemplate.length}/145</div>
                  <p className="mt-1 text-xs text-gray-500">
                    Text will only be displayed to the customer, not on the POS. Links will be shortened.
                  </p>
                </div>

                {/* Send time */}
                <div>
                  <h4 className="font-semibold text-base mb-1">When would you like to send your promotion?</h4>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center p-2 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="sendTimeOption"
                        checked={!sendLater}
                        onChange={() => setSendLater(false)}
                        className="mr-2"
                      />
                      Send immediately
                    </label>
                    <label className="flex items-center p-2 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="sendTimeOption"
                        checked={sendLater}
                        onChange={() => setSendLater(true)}
                        className="mr-2"
                      />
                      Schedule for later
                    </label>
                  </div>
                  {sendLater && (
                    <div className="mt-3">
                      <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="scheduledDateTime"
                        name="scheduledDateTime"
                        value={campaignForm.scheduledDateTime || ''}
                        onChange={e => setCampaignForm(prev => ({ ...prev, scheduledDateTime: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={sendLater}
                      />
                    </div>
                  )}
                  {/* Heads up warning */}
                  {sendLater && campaignForm.scheduledDateTime && (() => {
                    const hour = campaignForm.scheduledDateTime ? new Date(campaignForm.scheduledDateTime).getHours() : null;
                    return (hour < 9 || hour > 21) ? (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-2 rounded text-yellow-800 text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 mt-0.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0-4h-1m1 8h1m-1 4h1m-4-4h1m-4 0h1m-4 0h1m0-4h1m4-4h1m4 0h1m4 0h1m0 4h1m-4 4h1m-4 0h1m-4 0h1m0-4h1" />
                        </svg>
                        <span>
                          <strong>Heads up!</strong> Your promotion is set to send at an off-hours time. Promotions can be sent from 9 AM to 10 PM. If you send a promotion now, some members may not receive it until 9 AM the following morning.
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {sendLater ? 'Schedule Promotion' : 'Send Now'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* AI Promotion Modal */}
      <dialog ref={aiModalRef} className="rounded-lg p-0 w-full max-w-lg">
        <form method="dialog" className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-bold mb-2">AI Promotion Idea Generator</h2>
          <p className="mb-4 text-gray-600">Let AI suggest a creative, effective promotion for your business.</p>
          <Button
            onClick={handleAIGeneratePromotion}
            disabled={aiLoading}
            className={`
              mb-3 flex items-center gap-2 justify-center
              relative overflow-hidden
              bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600
              text-white font-semibold
              transition-all duration-300
              shadow-lg
              border-0
              px-5 py-2 rounded
              focus:ring-2 focus:ring-indigo-400
              animate-ai-glow-btn
            `}
            style={{
              boxShadow: '0 0 16px 2px #818cf8, 0 2px 4px rgba(0,0,0,0.08)',
            }}
          >
            <svg
              className={`w-5 h-5 ${aiLoading ? 'animate-spin-fast' : 'animate-ai-glow-icon'} text-white`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            </svg>
            {aiLoading ? 'Generating...' : 'Generate Promotion Idea'}
          </Button>
          {aiError && <div className="text-red-600 mb-2">{aiError}</div>}
          {aiIdea && (
            <div className="bg-gray-100 rounded p-3 mb-3">
              <div className="mb-2 text-gray-800">{aiIdea}</div>
              <Button onClick={handleUseAIPromotion} className="mt-1" type="button">
                Use This Idea
              </Button>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="button" onClick={() => aiModalRef.current.close()}>Close</Button>
          </div>
        </form>
      </dialog>

      {/* Add this to your global CSS or in a <style jsx global> block if using styled-jsx: */}
      <style>
      {`
        @keyframes ai-glow-icon {
          0%, 100% { filter: drop-shadow(0 0 0px #a5b4fc); }
          50% { filter: drop-shadow(0 0 8px #818cf8); }
        }
        .animate-ai-glow-icon {
          animation: ai-glow-icon 1.5s infinite;
        }
        @keyframes ai-glow-btn {
          0%,100% { box-shadow: 0 0 16px 2px #818cf8, 0 2px 4px rgba(0,0,0,0.08);}
          50% { box-shadow: 0 0 32px 8px #a21caf, 0 2px 4px rgba(0,0,0,0.08);}
        }
        .animate-ai-glow-btn {
          animation: ai-glow-btn 2s infinite;
        }
        .animate-spin-fast {
          animation: spin 0.7s linear infinite;
        }
      `}
      </style>
    </div>
  );
};

export default PromotionsManagement;