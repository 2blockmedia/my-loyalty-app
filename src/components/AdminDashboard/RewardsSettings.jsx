import { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';
import { supabase } from '../../lib/supabaseClient';

const RewardsSettings = () => {
  const { rewards, setRewards, business, setBusiness, error, setError } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    pointsCost: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    redemptionLimit: null,
    requiresApproval: false,
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiIdea, setAiIdea] = useState('');
  const aiModalRef = useRef();

  if (!business || !business.settings) {
    return <div className="p-6 text-gray-600">Loading business settings...</div>;
  }

  const handleDeactivate = async (reward) => {
    if (!reward.id) {
      setError('Reward ID is missing.');
      return;
    }
    setFormLoading(true);
    const { error } = await supabase
      .from('rewards')
      .update({ isActive: false })
      .eq('id', reward.id);
    setFormLoading(false);
    if (error) {
      setError(error.message || 'Failed to deactivate reward.');
    } else {
      // Re-fetch rewards from Supabase to ensure state is in sync
      const { data: updatedRewards, error: fetchError } = await supabase
        .from('rewards')
        .select('*');
      if (!fetchError && updatedRewards) {
        setRewards(updatedRewards);
      }
      setSuccessMsg('Reward deactivated.');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  const handleDelete = async (reward) => {
    if (!window.confirm(`Delete reward "${reward.name}"? This cannot be undone.`)) return;
    console.log('Attempting to delete reward:', reward, 'ID:', reward.id, 'Type:', typeof reward.id);
    setFormLoading(true);
    // Check for redemptions first
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('redemptions')
      .select('id')
      .eq('reward_id', reward.id);
    if (redemptionsError) {
      setFormLoading(false);
      setError('Could not check redemptions: ' + redemptionsError.message);
      return;
    }
    if (redemptions && redemptions.length > 0) {
      setFormLoading(false);
      setError('Cannot delete this reward because it has redemptions. Deactivate it instead.');
      return;
    }
    // Proceed with delete
    const { data: deleteData, error: deleteError } = await supabase
      .from('rewards')
      .delete()
      .eq('id', reward.id);
    setFormLoading(false);
    console.log('Delete result:', deleteData, 'Error:', deleteError);
    if (deleteError) {
      setError(deleteError.message || 'Failed to delete reward.');
      console.error('Supabase delete error:', deleteError, 'Reward ID:', reward.id, 'Type:', typeof reward.id);
    } else {
      // Re-fetch rewards from Supabase
      const { data: updatedRewards, error: fetchError } = await supabase
        .from('rewards')
        .select('*');
      console.log('Rewards after delete:', updatedRewards, 'Fetch error:', fetchError);
      if (!fetchError && updatedRewards) {
        setRewards(updatedRewards);
        console.log('Reward deleted and rewards re-fetched.');
      } else if (fetchError) {
        setError(fetchError.message || 'Failed to fetch updated rewards.');
        console.error('Supabase fetch error after delete:', fetchError);
      }
      setSuccessMsg('Reward deleted.');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  const handleEditReward = (reward) => {
    setSelectedReward(reward);
    setRewardForm({
      name: reward.name || '',
      description: reward.description || '',
      pointsCost: reward.pointsCost || 0,
      isActive: reward.isActive ?? true,
      startDate: reward.startDate || '',
      endDate: reward.endDate || '',
      redemptionLimit: reward.redemptionLimit || null,
      requiresApproval: reward.requiresApproval ?? false,
    });
    setIsModalOpen(true);
  };

  const handleAIGenerateReward = async () => {
    setAiLoading(true);
    setAiError('');
    setAiIdea('');
    try {
      // Replace this with your actual AI API call
      // Example: const response = await fetch('/api/ai-reward-idea');
      // const data = await response.json();
      // setAiIdea(data.idea);

      // Demo/mock idea:
      await new Promise(r => setTimeout(r, 1200));
      setAiIdea("Buy 5 drinks, get a free pastry! Encourage repeat visits by rewarding loyal customers with a tasty treat after multiple purchases.");
    } catch (e) {
      setAiError('Failed to generate idea. Please try again.');
    }
    setAiLoading(false);
  };

  const handleUseAIIdea = () => {
    setRewardForm({
      ...rewardForm,
      name: 'Free Pastry After 5 Drinks',
      description: aiIdea,
      pointsCost: 50,
      isActive: true,
    });
    setIsModalOpen(true);
    setAiIdea('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Rewards</h1>
        <div className="flex gap-2">
          <Button primary onClick={() => setIsModalOpen(true)}>Create New Reward</Button>
          <Button
            onClick={() => aiModalRef.current.showModal()}
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
              animate-ai-glow-btn
            `}
            style={{ minWidth: 170, boxShadow: '0 0 16px 2px #818cf8, 0 2px 4px rgba(0,0,0,0.08)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {/* Animated AI icon (sparkle/brain style) */}
              <svg className="w-5 h-5 animate-ai-glow-icon text-white" fill="none" viewBox="0 0 24 24">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
              </svg>
              AI Reward Idea
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search rewards..."
          className="border border-gray-300 rounded px-3 py-2 w-60"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border px-2 py-2 rounded">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border px-2 py-2 rounded">
          <option value="name">Sort: Name (A-Z)</option>
          <option value="pointsCost">Sort: Points</option>
        </select>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
            className="mr-2"
          />
          Show inactive rewards
        </label>
      </div>

      {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {[...rewards]
          .filter(r => {
            // Show all if showInactive is true
            if (showInactive) return true;
            if (statusFilter === 'active') return r.isActive;
            if (statusFilter === 'inactive') return !r.isActive;
            return r.isActive;
          })
          .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
          .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : a.pointsCost - b.pointsCost)
          .map(reward => (
            <div
              key={reward.id}
              className={`bg-white rounded shadow p-4 border ${!reward.isActive ? 'opacity-60' : ''}`}
              title="Click to edit"
            >
              <div className="flex items-center mb-1">
                <h3 className="font-semibold text-lg mr-2">{reward.name}</h3>
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${reward.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                  title={reward.isActive ? 'Active' : 'Inactive'}
                ></span>
                {/* Custom slider toggle */}
                <button
                  type="button"
                  aria-label={reward.isActive ? 'Deactivate' : 'Activate'}
                  disabled={formLoading}
                  onClick={async () => {
                    console.log("Reward ID:", reward.id, "Type:", typeof reward.id);
                    setFormLoading(true);
                    // Use the correct column name as in Supabase: isActive
                    const { error } = await supabase
                      .from('rewards')
                      .update({ isActive: !reward.isActive })
                      .eq('id', reward.id);
                    setFormLoading(false);
                    if (error) {
                      setError(error.message || 'Failed to update reward status.');
                      console.error('Supabase update error:', error, 'Reward ID:', reward.id, 'Type:', typeof reward.id);
                    } else {
                      const { data: updatedRewards, error: fetchError } = await supabase.from('rewards').select('*');
                      if (fetchError) {
                        setError(fetchError.message || 'Failed to fetch updated rewards.');
                        console.error('Supabase fetch error:', fetchError);
                      } else {
                        setRewards(updatedRewards);
                      }
                    }
                  }}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    reward.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ minWidth: 40 }}
                >
                  <span
                    className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${
                      reward.isActive ? 'translate-x-4' : ''
                    }`}
                  ></span>
                </button>
                <span className="ml-2 text-xs">{reward.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-gray-600">{reward.description}</p>
              <p className="text-blue-600 font-bold">{reward.pointsCost} Points</p>

              <div className="flex space-x-2 mt-3">
                <Button
                  onClick={() => handleEditReward(reward)}
                  size="sm"
                >
                  Edit
                </Button>
                {reward.isActive && (
                  <Button
                    onClick={() => handleDeactivate(reward)}
                    size="sm"
                    disabled={formLoading}
                  >
                    Deactivate
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(reward)}
                  className="bg-red-600 text-white hover:bg-red-700 border-none rounded px-4 py-2 text-sm font-medium transition-colors duration-150"
                  style={{
                    opacity: formLoading ? 0.6 : 1,
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                  }}
                  disabled={formLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    {/* Modal for editing/creating reward */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">{selectedReward ? 'Edit Reward' : 'Create Reward'}</h2>
          {/* Example form fields, you can expand as needed */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Name
              <input
                className="border rounded px-3 py-2 w-full mt-1"
                placeholder="Reward Name"
                value={rewardForm.name}
                onChange={e => setRewardForm({ ...rewardForm, name: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Description
              <textarea
                className="border rounded px-3 py-2 w-full mt-1"
                placeholder="Description"
                value={rewardForm.description}
                onChange={e => setRewardForm({ ...rewardForm, description: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Required
              <input
                className="border rounded px-3 py-2 w-full mt-1"
                type="number"
                placeholder="Points Cost"
                value={rewardForm.pointsCost}
                onChange={e => setRewardForm({ ...rewardForm, pointsCost: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-medium text-gray-700">Active</span>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  rewardForm.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
                onClick={() => setRewardForm({ ...rewardForm, isActive: !rewardForm.isActive })}
                aria-pressed={rewardForm.isActive}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    rewardForm.isActive ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="ml-2 text-xs">{rewardForm.isActive ? 'Active' : 'Inactive'}</span>
            </label>
            {/* Add more fields as needed */}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              primary
              onClick={async () => {
                setFormLoading(true);
                // Convert empty date strings to null
                const cleanForm = { ...rewardForm };
                if (!cleanForm.startDate) cleanForm.startDate = null;
                if (!cleanForm.endDate) cleanForm.endDate = null;

                let error;
                if (selectedReward) {
                  // Edit existing reward
                  ({ error } = await supabase
                    .from('rewards')
                    .update(cleanForm)
                    .eq('id', selectedReward.id));
                } else {
                  // Create new reward
                  ({ error } = await supabase
                    .from('rewards')
                    .insert([cleanForm]));
                }

                setFormLoading(false);

                if (!error) {
                  const { data: updatedRewards } = await supabase.from('rewards').select('*');
                  setRewards(updatedRewards);
                  setIsModalOpen(false); // <-- CLOSE MODAL ON SUCCESS
                  setSelectedReward(null);
                  setSuccessMsg(selectedReward ? 'Reward updated.' : 'Reward created.');
                  setTimeout(() => setSuccessMsg(''), 1500);
                } else {
                  setError(error.message || 'Failed to save reward.');
                }
              }}
              disabled={formLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* AI Modal */}
    <dialog ref={aiModalRef} className="rounded-lg p-0 w-full max-w-lg">
      <form method="dialog" className="bg-white rounded-lg p-6">
        <h2 className="text-lg font-bold mb-2">AI Reward Idea Generator</h2>
        <p className="mb-4 text-gray-600">Let AI suggest a creative, effective reward for your business.</p>
        <Button
          onClick={handleAIGenerateReward}
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
          {/* Animated brain icon */}
          <svg
            className={`w-5 h-5 ${aiLoading ? 'animate-spin-fast' : 'animate-brain-gradient'} brain-gradient`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient id="brainGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1">
                  <animate attributeName="stop-color" values="#6366f1;#a21caf;#6366f1" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="1" stopColor="#a21caf">
                  <animate attributeName="stop-color" values="#a21caf;#6366f1;#a21caf" dur="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path
              d="M9 3a3 3 0 0 0-3 3v1.5A2.5 2.5 0 0 0 3 10v1a2.5 2.5 0 0 0 2 2.45V15a3 3 0 0 0 3 3h1m2-15a3 3 0 0 1 3 3v1.5A2.5 2.5 0 0 1 21 10v1a2.5 2.5 0 0 1-2 2.45V15a3 3 0 0 1-3 3h-1"
              stroke="url(#brainGradient)"
              fill="none"
            />
            <circle cx="9" cy="10" r="1" fill="url(#brainGradient)" />
            <circle cx="15" cy="10" r="1" fill="url(#brainGradient)" />
          </svg>
          {aiLoading ? 'Generating...' : 'Generate Reward Idea'}
        </Button>
        {aiError && <div className="text-red-600 mb-2">{aiError}</div>}
        {aiIdea && (
          <div className="bg-gray-100 rounded p-3 mb-3">
            <div className="mb-2 text-gray-800">{aiIdea}</div>
            <Button onClick={handleUseAIIdea} className="mt-1" type="button">
              Use This Idea
            </Button>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="button" onClick={() => aiModalRef.current.close()}>Close</Button>
        </div>
      </form>
    </dialog>
  </div>
  );
};

export default RewardsSettings;

<style>
{`
  @keyframes ai-glow {
    0%, 100% { filter: blur(0px) brightness(1); }
    50% { filter: blur(2px) brightness(1.3); }
  }
  .animate-ai-glow {
    animation: ai-glow 2s infinite;
  }
  @keyframes ai-glow-icon {
    0%, 100% { filter: drop-shadow(0 0 0px #a5b4fc); }
    50% { filter: drop-shadow(0 0 8px #818cf8); }
  }
  .animate-ai-glow-icon {
    animation: ai-glow-icon 1.5s infinite;
  }
  @keyframes brain-gradient {
    0%,100% { filter: drop-shadow(0 0 0px #6366f1);}
    50% { filter: drop-shadow(0 0 8px #a21caf);}
  }
  .animate-brain-gradient {
    animation: brain-gradient 2s infinite;
  }
  .animate-spin-fast {
    animation: spin 0.7s linear infinite;
  }
  @keyframes ai-glow-btn {
    0%,100% { box-shadow: 0 0 16px 2px #818cf8, 0 2px 4px rgba(0,0,0,0.08);}
    50% { box-shadow: 0 0 32px 8px #a21caf, 0 2px 4px rgba(0,0,0,0.08);}
  }
  .animate-ai-glow-btn {
    animation: ai-glow-btn 2s infinite;
  }
`}
</style>
