import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';
import { supabase } from '../../lib/supabaseClient';

const PointsConfirmationScreen = () => {
  const {
    currentCustomer,
    setCurrentCustomer,
    setCustomers,
    setRewards,
    rewards,
  } = useAppContext();

  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pointLoading, setPointLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(null);
  const [pointInput, setPointInput] = useState('');
  const [undoLoading, setUndoLoading] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!currentCustomer) {
      const cached = localStorage.getItem('currentCustomer');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            // Rehydration logic can go here
          }
        } catch (err) {
          console.error('Error parsing cached customer');
        }
      }
    }
  }, [currentCustomer]);

  useEffect(() => {
    let timer;
    if (successMsg) {
      setCountdown(15);
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setSuccessMsg('');
            navigate('/tablet');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [successMsg, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!successMsg) navigate('/tablet');
    }, 30000);
    return () => clearTimeout(timer);
  }, [navigate, successMsg]);

  const eligibleRewards = (rewards || []).filter(
    (r) => r.isActive && r.pointsCost <= (currentCustomer?.availablePoints || 0)
  );

  const handleKeypad = (val) => {
    if (val === 'clear') {
      setPointInput('');
    } else if (val === 'del') {
      setPointInput(pointInput.slice(0, -1));
    } else if (val === 'enter') {
      // handled on submit
    } else {
      if (pointInput.length < 3) {
        const newVal = (pointInput + val).replace(/^0+/, '') || '0';
        if (parseInt(newVal, 10) <= 999) setPointInput(newVal);
      }
    }
  };

  const handleSubmitPoints = async () => {
    if (!pointInput || isNaN(pointInput) || parseInt(pointInput, 10) <= 0) return;
    if (!currentCustomer || !currentCustomer.id) {
      console.error('⚠️ No current customer selected or ID missing.');
      setErrorMsg('Something went wrong. Please try again.');
      return;
    }

    setPointLoading(true);
    setErrorMsg('');
    const add = parseInt(pointInput, 10);

    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          availablePoints: (currentCustomer.availablePoints || 0) + add,
          lifetimePoints: (currentCustomer.lifetimePoints || 0) + add,
        })
        .eq('id', currentCustomer.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating customer points:', error);
        throw error;
      }

      const { error: checkinError } = await supabase.from('checkins').insert([
        { customer_id: currentCustomer.id },
      ]);

      if (checkinError) {
        console.error('❌ Error inserting check-in:', checkinError);
      } else {
        console.log('✅ Check-in saved for customer:', currentCustomer.id);
      }

      const { data: freshCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', currentCustomer.id)
        .single();

      setCurrentCustomer(freshCustomer || data);

      setCustomers &&
        setCustomers((prev) =>
          prev.map((c) => (c.id === data.id ? (freshCustomer || data) : c))
        );

      const { data: freshRewards } = await supabase.from('rewards').select('*');
      setRewards && setRewards(freshRewards || []);

      setSuccessMsg(`You earned ${add} Point${add === 1 ? '' : 's'}!`);
      setPointInput('');
    } catch (err) {
      console.error('❌ General error during check-in:', err);
      setErrorMsg('Failed to add points.');
    } finally {
      setPointLoading(false);
    }
  };

  const handleUndoPoints = async () => {
    if (!window.confirm("Are you sure you want to reset this customer’s points?")) return;
    setUndoLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ availablePoints: 0 })
        .eq('id', currentCustomer.id)
        .select()
        .single();
      if (error) throw error;
      setCurrentCustomer(data);
      setSuccessMsg('Points reset to 0.');
      setCustomers && setCustomers((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    } catch (err) {
      setErrorMsg('Failed to reset points.');
    } finally {
      setUndoLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    setRedeemLoading(reward.id);
    setErrorMsg('');
    try {
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
          availablePoints: (currentCustomer.availablePoints || 0) - reward.pointsCost,
        })
        .eq('id', currentCustomer.id)
        .select()
        .single();
      if (updateError) throw updateError;

      await supabase.from('redemptions').insert([
        {
          customerId: currentCustomer.id,
          rewardId: reward.id,
          pointsUsed: reward.pointsCost,
          redeemedAt: new Date().toISOString(),
        },
      ]);

      setCurrentCustomer(updatedCustomer);
      setSuccessMsg(`Enjoy your ${reward.name}!`);
      setCustomers &&
        setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    } catch (err) {
      setErrorMsg('Failed to redeem reward.');
    } finally {
      setRedeemLoading(null);
    }
  };

  if (!currentCustomer) {
    navigate('/tablet');
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row w-screen h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <h1 className="text-4xl font-bold mb-4">Welcome, {currentCustomer.firstName || 'Customer'}!</h1>
        <p className="text-gray-700 mb-6">
          Thanks for checking in. Earn points and redeem rewards every visit!
        </p>
        <div className="mb-6">
          <div className="text-sm text-gray-500">Available Points</div>
          <div className="text-3xl font-bold text-indigo-700">{currentCustomer.availablePoints ?? 0}</div>
        </div>
        <div className="mb-6">
          <div className="text-sm text-gray-500">Lifetime Points</div>
          <div className="text-3xl font-bold text-green-600">{currentCustomer.lifetimePoints ?? 0}</div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Eligible Rewards</h2>
          {eligibleRewards.length === 0 ? (
            <div className="text-gray-500">Keep earning to unlock rewards!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleRewards.map((reward) => (
                <div key={reward.id} className="border p-4 rounded shadow-sm">
                  <div className="font-semibold text-indigo-700 mb-1">{reward.name}</div>
                  <div className="text-gray-600 mb-2">{reward.description}</div>
                  <div className="text-sm text-gray-500 mb-1">Cost: {reward.pointsCost} pts</div>
                  <Button
                    onClick={() => handleRedeem(reward)}
                    loading={redeemLoading === reward.id}
                    disabled={redeemLoading === reward.id || !!successMsg}
                  >
                    Redeem
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {successMsg && (
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
            <p className="font-semibold">{successMsg}</p>
            <p className="text-sm">Returning to home in {countdown} second{countdown !== 1 ? 's' : ''}…</p>
            <Button className="mt-2" onClick={() => { setCurrentCustomer(null); setSuccessMsg(''); navigate('/tablet'); }}>
              Done / Next Customer
            </Button>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{errorMsg}</div>
        )}

        <input
          type="text"
          inputMode="numeric"
          value={pointInput}
          onChange={(e) => setPointInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          placeholder="Enter points"
          className="w-full text-4xl text-center border-b-2 border-indigo-400 mb-6 py-2 bg-transparent"
          disabled={pointLoading || !!successMsg}
        />

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button
              key={n}
              onClick={() => handleKeypad(String(n))}
              disabled={pointLoading || !!successMsg}
              className="bg-white border rounded h-16 text-xl font-bold"
            >
              {n}
            </button>
          ))}
          <button onClick={() => handleKeypad('clear')} className="bg-yellow-100 border rounded h-16 font-semibold">Clear</button>
          <button onClick={() => handleKeypad('0')} className="bg-white border rounded h-16 text-xl font-bold">0</button>
          <button onClick={handleSubmitPoints} className="bg-green-100 border rounded h-16 font-semibold">Enter</button>
        </div>

        <Button
          className="mb-2 w-full"
          onClick={handleSubmitPoints}
          disabled={pointLoading || !!successMsg || !pointInput || isNaN(pointInput) || parseInt(pointInput, 10) <= 0}
          loading={pointLoading}
        >
          Submit Points
        </Button>
        <Button
          className="w-full"
          onClick={handleUndoPoints}
          disabled={undoLoading || !!successMsg}
          loading={undoLoading}
          variant="secondary"
        >
          Undo/Reset Points
        </Button>
      </div>
    </div>
  );
};

export default PointsConfirmationScreen;
