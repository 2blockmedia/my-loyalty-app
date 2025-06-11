import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabaseClient';
import Button from '../shared/Button';

const CustomerDatabase = () => {
  const { customers, setCustomers, error, setError } = useAppContext();
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastVisitDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    birthDate: '',
    smsOptIn: false,
    emailOptIn: false
  });

  // 🔄 Fetch customers from Supabase on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to fetch customers');
      } else {
        setCustomers(data);
      }
    };
    fetchCustomers();
  }, [setCustomers, setError]);

  // ✅ Continue with original search and sort logic
  useEffect(() => {
    let result = [...customers];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.firstName.toLowerCase().includes(lowerSearch) || 
        customer.lastName.toLowerCase().includes(lowerSearch) || 
        customer.phoneNumber.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(lowerSearch))
      );
    }
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'lastVisitDate' || sortBy === 'createdAt') {
        valA = new Date(valA || '1900-01-01').getTime();
        valB = new Date(valB || '1900-01-01').getTime();
      }
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    setFilteredCustomers(result);
  }, [customers, searchTerm, sortBy, sortOrder]);

  // ⏩ Continue using rest of your existing code for rendering, sorting, modals, etc.
  // Paste that JSX from your original component after this logic.

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomerForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle create new customer
  const handleCreateCustomer = () => {
    setEditMode(false);
    setSelectedCustomer(null);
    setCustomerForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      birthDate: '',
      smsOptIn: false,
      emailOptIn: false
    });
    setIsModalOpen(true);
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setCustomerForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phoneNumber: customer.phoneNumber || '',
      email: customer.email || '',
      birthDate: customer.birthDate || '',
      smsOptIn: customer.smsOptIn || false,
      emailOptIn: customer.emailOptIn || false,
      availablePoints: typeof customer.availablePoints === 'number' ? customer.availablePoints : 0
    });
    setIsModalOpen(true);
  };

  // Handle reward points
  const handleRewardPoints = async (customer, points) => {
    const { data, error } = await supabase
      .from('customers')
      .update({ availablePoints: (customer.availablePoints || 0) + points })
      .eq('id', customer.id)
      .select()
      .single();
    if (!error && data) {
      setCustomers((prev) => prev.map(c => c.id === customer.id ? data : c));
    } else {
      setError(error?.message || 'Failed to add points');
    }
  };

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editMode && selectedCustomer) {
      // Update existing customer
      // Only send valid fields, and filter out undefined/null
      const updateFields = {};
      [
        'firstName',
        'lastName',
        'phoneNumber',
        'email',
        'birthDate',
        'smsOptIn',
        'emailOptIn',
        'availablePoints'
      ].forEach((key) => {
        if (
          typeof customerForm[key] !== 'undefined' &&
          customerForm[key] !== null &&
          customerForm[key] !== ''
        ) {
          updateFields[key] =
            key === 'availablePoints' ? Number(customerForm[key]) : customerForm[key];
        }
      });
      const { data, error } = await supabase
        .from('customers')
        .update(updateFields)
        .eq('id', selectedCustomer.id)
        .select()
        .single();
      if (!error && data) {
        setCustomers((prev) => prev.map(c => c.id === data.id ? data : c));
        setIsModalOpen(false);
        setEditMode(false);
        setSelectedCustomer(null);
        setCustomerForm({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          birthDate: '',
          smsOptIn: false,
          emailOptIn: false,
          availablePoints: 0
        });
      } else {
        setError(error?.message || 'Failed to update customer');
      }
    } else {
      // Create new customer
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerForm }])
        .select()
        .single();
      if (!error && data) {
        setCustomers((prev) => [data, ...prev]);
        setIsModalOpen(false);
        setCustomerForm({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          birthDate: '',
          smsOptIn: false,
          emailOptIn: false,
          availablePoints: 0
        });
      } else {
        setError(error?.message || 'Failed to create customer');
      }
    }
  };

  // Format phone number for display
  const formatPhoneDisplay = (num) => {
    const digits = (num || '').replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  // Summary stats
  const now = new Date();
  const totalMembers = customers.length;
  const newMembers = customers.filter(c => {
    const created = new Date(c.createdAt);
    return (now - created) / (1000 * 60 * 60 * 24) <= 30;
  }).length;
  const vipMembers = customers.filter(c => c.isVIP).length || 3; // hardcoded fallback

  // Search/filter state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = filteredCustomers.filter(c => {
    if (search.length >= 3) {
      const s = search.toLowerCase();
      if (!(
        (c.firstName && c.firstName.toLowerCase().includes(s)) ||
        (c.lastName && c.lastName.toLowerCase().includes(s)) ||
        (c.phoneNumber && c.phoneNumber.includes(s)) ||
        (c.notes && c.notes.toLowerCase().includes(s))
      )) return false;
    }
    if (filter === 'active') return c.status === 'ACTIVE';
    if (filter === 'inactive') return c.status === 'INACTIVE';
    if (filter === 'opted-in') return c.smsOptIn || c.emailOptIn;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{totalMembers.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Total Members</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{newMembers.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">New Members (30d)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="text-3xl font-bold">{vipMembers.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">VIP Members</div>
        </div>
      </div>
      {/* Search Bar + Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone number, or notes (minimum 3 characters required)"
            className="w-full md:w-96 border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="opted-in">Opted-in Only</option>
          </select>
          <a
            href="#"
            className="ml-4 text-blue-600 hover:underline text-sm"
            onClick={e => {
              e.preventDefault();
              // Download CSV logic (reuse from reports)
              const csvRows = [
                ['Name', 'Phone', 'Channel', 'Status', 'Points', 'Last Visit', 'Member Since', 'Tagged'],
                ...filtered.map(c => [
                  `${c.firstName} ${c.lastName}`.trim(),
                  formatPhoneDisplay(c.phoneNumber),
                  c.smsOptIn ? 'SMS' : c.emailOptIn ? 'Push' : 'Never opted in',
                  c.status || 'Active',
                  c.availablePoints ?? 0,
                  c.lastVisit ? new Date(c.lastVisit).toLocaleString() : '',
                  c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
                  c.isVIP ? 'VIP' : ''
                ])
              ];
              const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `members_${filtered.length}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Download members ({filtered.length} results)
          </a>
          <Button primary onClick={handleCreateCustomer} className="ml-2">
            + Add Member
          </Button>
        </div>
      </div>
      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Customer Name</th>
              <th className="px-4 py-2 text-left">Phone Number</th>
              <th className="px-4 py-2 text-left">Channel</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Current Points</th>
              <th className="px-4 py-2 text-left">Last Visit</th>
              <th className="px-4 py-2 text-left">Member Since</th>
              <th className="px-4 py-2 text-left">Tagged</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr
                key={customer.id}
                className="border-t hover:bg-blue-50 cursor-pointer"
                onClick={e => {
                  if (e.target.tagName !== 'BUTTON') handleEditCustomer(customer);
                }}
                title="Click to edit"
              >
                <td className="px-4 py-2">{`${customer.firstName} ${customer.lastName}`.trim()}</td>
                <td className="px-4 py-2">{formatPhoneDisplay(customer.phoneNumber)}</td>
                <td className="px-4 py-2">{customer.smsOptIn ? 'SMS' : customer.emailOptIn ? 'Push' : 'Never opted in'}</td>
                <td className="px-4 py-2">{customer.status || 'Active'}</td>
                <td className="px-4 py-2">{customer.availablePoints ?? 0}</td>
                <td className="px-4 py-2">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleString() : ''}</td>
                <td className="px-4 py-2">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''}</td>
                <td className="px-4 py-2">
                  <span className={customer.isVIP ? 'text-yellow-500 font-bold' : 'text-gray-400'}>
                    {customer.isVIP ? '★' : '—'}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <Button
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleRewardPoints(customer, 1); }}
                  >
                    +1 Point
                  </Button>
                  <Button
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleEditCustomer(customer); }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for creating a new customer */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Customer' : 'Create Customer'}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={customerForm.firstName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={customerForm.lastName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formatPhoneDisplay(customerForm.phoneNumber)}
                  onChange={e => {
                    // Only allow digits, max 10
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setCustomerForm(prev => ({ ...prev, phoneNumber: digits }));
                  }}
                  className="w-full border border-gray-300 rounded p-2 font-mono"
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerForm.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Birthday</label>
                <input
                  type="date"
                  name="birthDate"
                  value={customerForm.birthDate}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Available Points</label>
                <input
                  type="number"
                  name="availablePoints"
                  value={customerForm.availablePoints ?? 0}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded p-2"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="smsOptIn"
                  checked={customerForm.smsOptIn}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                <label className="text-sm">SMS Opt-In</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emailOptIn"
                  checked={customerForm.emailOptIn}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                <label className="text-sm">Email Opt-In</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" primary>
                  {editMode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDatabase;
