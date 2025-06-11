import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';

const RegistrationScreen = () => {
  const { currentCustomer, registerCustomer, loading, error } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    smsOptIn: true,
    emailOptIn: false,
  });

  const [justRegistered, setJustRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim()) {
      alert('Please enter your first name');
      return;
    }

    if (currentCustomer?.phoneNumber) {
      const customerData = {
        ...form,
        phoneNumber: currentCustomer.phoneNumber,
      };

      await registerCustomer(customerData);
      setJustRegistered(true);
    } else {
      navigate('/phone');
    }
  };

  const handleSkip = async () => {
    if (currentCustomer?.phoneNumber) {
      await registerCustomer({
        firstName: 'Customer',
        phoneNumber: currentCustomer.phoneNumber,
        smsOptIn: false,
        emailOptIn: false
      });
      setJustRegistered(true);
    } else {
      navigate('/phone');
    }
  };

  // ✅ Redirect when currentCustomer is ready
  useEffect(() => {
    if (justRegistered && currentCustomer?.id) {
      navigate('/tablet/confirmation');
    }
  }, [justRegistered, currentCustomer, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-3xl font-bold mb-2">Complete Your Registration</h1>
      <p className="text-gray-600 mb-6">Join our rewards program to start earning points!</p>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your first name"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name (Optional)
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your last name"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Birthday (Optional)
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">For birthday rewards</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="smsOptIn"
              name="smsOptIn"
              checked={form.smsOptIn}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="smsOptIn" className="ml-2 block text-sm text-gray-700">
              I want to receive SMS updates about rewards and promotions
            </label>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailOptIn"
              name="emailOptIn"
              checked={form.emailOptIn}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading || !form.email}
            />
            <label htmlFor="emailOptIn" className="ml-2 block text-sm text-gray-700">
              I want to receive email updates about rewards and promotions
            </label>
          </div>
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
            disabled={loading || !form.firstName.trim()}
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>

          <Button
            type="button"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip for Now
          </Button>
        </div>
      </form>

      <div className="mt-6 text-xs text-gray-500 text-center">
        By registering, you agree to our Terms of Service and Privacy Policy.
        <br />
        You can opt out of communications at any time.
      </div>
    </div>
  );
};

export default RegistrationScreen;
