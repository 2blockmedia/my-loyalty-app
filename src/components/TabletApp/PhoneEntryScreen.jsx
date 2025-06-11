import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';
import PhoneInput from '../shared/PhoneInput';

const PhoneEntryScreen = () => {
  const { findCustomerByPhone, error, loading, currentCustomer, setCurrentCustomer, setError } = useAppContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  // Format phone number for display
  const formatPhoneDisplay = (num) => {
    const digits = num.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  const isTestOrInvalidNumber = (digits) => {
    if (digits.length !== 10) return true;
    if (/^(\d)\1{9}$/.test(digits)) return true; // all same digit
    if (digits === '1234567890') return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const digits = phoneNumber.replace(/\D/g, '');
    if (isTestOrInvalidNumber(digits)) {
      setError('Please enter a valid, real 10-digit phone number');
      return;
    }

    // Format phone number to standardized format
    const formattedPhone = digits;

    try {
      const result = await findCustomerByPhone(formattedPhone);
      console.log('Phone entered:', formattedPhone);
      console.log('Result found:', result);

      if (result) {
        setCurrentCustomer(result);
        navigate('/tablet/confirmation');
      } else {
        setCurrentCustomer({
          id: null,
          firstName: '',
          lastName: '',
          phoneNumber: formattedPhone,
          email: '',
          birthDate: '',
          totalPoints: 0,
          availablePoints: 0,
          lifetimePoints: 0,
          visitCount: 0,
          smsOptIn: false,
          emailOptIn: false,
        });

        setTimeout(() => {
          navigate('/tablet/register');
        }, 100);
      }
    } catch (err) {
      console.error('Error during phone check:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    setPhoneNumber('');
    setError(null);
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-3xl font-bold mb-8">Enter Your Phone Number</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-8">
          <PhoneInput
            value={formatPhoneDisplay(phoneNumber)}
            onChange={val => {
              // Only allow digits, max 10
              const digits = val.replace(/\D/g, '').slice(0, 10);
              setPhoneNumber(digits);
              setError(null);
            }}
            placeholder="(555) 123-4567"
            disabled={loading}
          />
          {phoneNumber && (
            <div className="mt-2 text-center text-lg font-mono text-gray-700">
              {formatPhoneDisplay(phoneNumber)}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            primary
            loading={loading}
            disabled={loading || !phoneNumber}
          >
            {loading ? 'Checking...' : 'Continue'}
          </Button>

          <Button 
            type="button" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-8 text-sm text-gray-500">
        <p className="text-center">
          Your phone number will be used to identify your rewards account.
          <br />
          We respect your privacy and will never share your information.
        </p>
      </div>
    </div>
  );
};

export default PhoneEntryScreen;
