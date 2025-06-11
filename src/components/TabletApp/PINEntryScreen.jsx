import { useState } from 'react';

const PINEntryScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Enter a 4-digit PIN');
      return;
    }
    if (onUnlock) {
      onUnlock(pin);
      setPin('');
      setError('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow p-8 max-w-xs w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Staff PIN Required</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full p-3 border border-gray-300 rounded text-center text-2xl tracking-widest"
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            autoFocus
          />
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded p-3 font-bold hover:bg-blue-700 transition"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default PINEntryScreen;
