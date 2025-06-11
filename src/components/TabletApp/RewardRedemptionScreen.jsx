import { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const RewardRedemptionScreen = ({ selectedReward }) => {
  const { currentCustomer, setCustomers, customers } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const redeemReward = async () => {
      console.log('🔥 RewardRedemptionScreen loaded');
      console.log('Customer:', currentCustomer);
      console.log('Reward:', selectedReward);

      if (!currentCustomer?.id || !selectedReward?.id) {
        console.error('Missing customer or reward ID');
        return;
      }

      // Step 1: Record redemption in Supabase
      const { error: insertError } = await supabase
        .from('redemptions')
        .insert([
          {
            customer_id: currentCustomer.id,
            reward_id: selectedReward.id,
          },
        ]);

      if (insertError) {
        console.error('❌ Failed to insert redemption:', insertError.message);
        return;
      }

      // Step 2: Deduct points from customer (in memory & Supabase)
      const updatedAvailable = currentCustomer.availablePoints - selectedReward.pointsCost;

      const { data: updated, error: updateError } = await supabase
        .from('customers')
        .update({ availablePoints: updatedAvailable })
        .eq('id', currentCustomer.id);

      if (updateError) {
        console.error('❌ Failed to update customer points:', updateError.message);
        return;
      }

      // Step 3: Update local state
      const updatedCustomers = customers.map((c) =>
        c.id === currentCustomer.id ? { ...c, availablePoints: updatedAvailable } : c
      );
      setCustomers(updatedCustomers);

      // Step 4: Show confirmation and return
      setTimeout(() => {
        navigate('/tablet');
      }, 12000);
    };

    redeemReward();
  }, []);

  return (
    <div className="confirmation-screen">
      <h2>🎉 Enjoy your {selectedReward?.title}!</h2>
      <p>Returning to home in 12 seconds...</p>
      <button onClick={() => navigate('/tablet')}>Done / Next Customer</button>
    </div>
  );
};

export default RewardRedemptionScreen;
