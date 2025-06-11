import { useState } from 'react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Rewards</h1>
        <Button primary onClick={() => setIsModalOpen(true)}>Create New Reward</Button>
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
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Reward Name"
              value={rewardForm.name}
              onChange={e => setRewardForm({ ...rewardForm, name: e.target.value })}
            />
            <textarea
              className="border rounded px-3 py-2 w-full"
              placeholder="Description"
              value={rewardForm.description}
              onChange={e => setRewardForm({ ...rewardForm, description: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 w-full"
              type="number"
              placeholder="Points Cost"
              value={rewardForm.pointsCost}
              onChange={e => setRewardForm({ ...rewardForm, pointsCost: Number(e.target.value) })}
            />
            {/* Add more fields as needed */}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              primary
              onClick={async () => {
                setFormLoading(true);
                if (selectedReward) {
                  // Edit existing reward
                  const { error } = await supabase
                    .from('rewards')
                    .update(rewardForm)
                    .eq('id', selectedReward.id);
                  setFormLoading(false);
                  if (!error) {
                    const { data: updatedRewards } = await supabase.from('rewards').select('*');
                    setRewards(updatedRewards);
                    setIsModalOpen(false);
                  } else {
                    setError(error.message || 'Failed to update reward.');
                  }
                } else {
                  // Create new reward
                  // Convert empty date strings to null
                  const cleanForm = { ...rewardForm };
                  if (!cleanForm.startDate) cleanForm.startDate = null;
                  if (!cleanForm.endDate) cleanForm.endDate = null;
                  const { error } = await supabase
                    .from('rewards')
                    .insert([cleanForm]);
                  setFormLoading(false);
                  if (!error) {
                    const { data: updatedRewards } = await supabase.from('rewards').select('*');
                    setRewards(updatedRewards);
                    setIsModalOpen(false);
                  } else {
                    setError(error.message || 'Failed to create reward.');
                  }
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
  </div>
  );
};

export default RewardsSettings;
