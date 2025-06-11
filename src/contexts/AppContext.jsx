import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem('currentCustomer');
    if (cached) {
      try {
        setCurrentCustomer(JSON.parse(cached));
      } catch (e) {
        console.error('Error parsing cached customer:', e);
        localStorage.removeItem('currentCustomer');
      }
    }
    // Fetch business settings from Supabase on app load
    const fetchBusiness = async () => {
      try {
        const { data, error } = await supabase
          .from('business')
          .select('*')
          .maybeSingle();
        if (error) {
          console.error('Error loading business settings:', error.message || error);
          setBusiness({ id: 'error', settings: {}, error: error.message || error });
        } else if (data) {
          // Log the fetched business object for debugging
          console.log('Fetched business from Supabase:', data);
          // Ensure settings property exists
          if (!data.settings) {
            data.settings = {};
          }
          setBusiness(data);
        } else {
          // No business found, fallback to mock
          console.warn('No business row found in Supabase. Using mock business.');
          setBusiness({ id: 'mock', settings: { fallback: true } });
        }
      } catch (err) {
        console.error('Unexpected error loading business settings:', err);
        setBusiness({ id: 'error', settings: {}, error: err.message || 'Unknown error' });
      }
    };
    fetchBusiness();

    // Fetch rewards from Supabase on app load
    const fetchRewards = async () => {
      try {
        const { data, error } = await supabase
          .from('rewards')
          .select('*');
        console.log('Fetched rewards from Supabase:', data);
        if (error) {
          console.error('Error loading rewards:', error.message || error);
        } else if (data) {
          setRewards(data);
        }
      } catch (err) {
        console.error('Unexpected error loading rewards:', err);
      }
    };
    fetchRewards();

    // Fetch customers from Supabase on app load
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*');
        if (error) {
          console.error('Error loading customers:', error.message || error);
        } else if (data) {
          setCustomers(data);
        }
      } catch (err) {
        console.error('Unexpected error loading customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  const findCustomerByPhone = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phoneNumber', phone)
        .maybeSingle();

      if (error) {
        console.error('Supabase lookup error:', error.message || error);
        setError(`Supabase error: ${error.message || 'Unknown error'}`);
      }

      if (data) {
        setCurrentCustomer(data);
        localStorage.setItem('currentCustomer', JSON.stringify(data));
      }

      return data || null;
    } catch (err) {
      console.error('Unexpected error in findCustomerByPhone:', err);
      setError(`Unexpected error: ${err.message || 'Something went wrong'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      // Check if customer with this phone number already exists
      const { data: existing, error: findError } = await supabase
        .from('customers')
        .select('*')
        .eq('phoneNumber', customerData.phoneNumber)
        .maybeSingle();

      if (findError) {
        setError(`Supabase error: ${findError.message || 'Error checking existing customer'}`);
        setLoading(false);
        return;
      }

      if (existing) {
        // Customer already exists, set as current
        setCurrentCustomer(existing);
        localStorage.setItem('currentCustomer', JSON.stringify(existing));
        setLoading(false);
        return;
      }

      const cleanData = {
        ...customerData,
        birthDate: customerData.birthDate === '' ? null : customerData.birthDate,
        availablePoints: 0,
        lifetimePoints: 0,
        visitCount: 0,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        console.error('Error registering customer:', error.message || error);
        setError(`Supabase error: ${error.message || 'Error registering customer'}`);
        return;
      }

      setCurrentCustomer(data);
      localStorage.setItem('currentCustomer', JSON.stringify(data));
    } catch (err) {
      console.error('Unexpected error in registerCustomer:', err);
      setError(`Unexpected error: ${err.message || 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  };

  const addPointsToCustomer = async (customerId, points) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current values for the customer
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (fetchError || !customer) {
        setError('Could not find customer to add points.');
        return;
      }

      const updatedFields = {
        availablePoints: (customer.availablePoints || 0) + points,
        lifetimePoints: (customer.lifetimePoints || 0) + points,
        visitCount: (customer.visitCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };

      const { data: updated, error: updateError } = await supabase
        .from('customers')
        .update(updatedFields)
        .eq('id', customerId)
        .select()
        .single();

      if (updateError) {
        setError('Failed to update customer points.');
        return;
      }

      // Update local state for customers list
      setCustomers(prev =>
        prev.map(c => (c.id === customerId ? { ...c, ...updatedFields } : c))
      );

      // If this is the current customer, update context and localStorage
      if (currentCustomer && currentCustomer.id === customerId) {
        const newCurrent = { ...currentCustomer, ...updatedFields };
        setCurrentCustomer(newCurrent);
        localStorage.setItem('currentCustomer', JSON.stringify(newCurrent));
      }
    } catch (err) {
      setError('Unexpected error while adding points.');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = (customerId, rewardId) => {
    console.log('Redeeming reward for', customerId, rewardId);
  };

  const resetCurrentCustomer = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('currentCustomer');
  };

  const contextValue = {
    business,
    setBusiness,
    customers,
    setCustomers,
    rewards,
    setRewards,
    campaigns,
    setCampaigns,
    segments,
    setSegments,
    currentCustomer,
    setCurrentCustomer,
    loading,
    setLoading,
    error,
    setError,
    findCustomerByPhone,
    registerCustomer,
    addPointsToCustomer,
    redeemReward,
    resetCurrentCustomer,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
