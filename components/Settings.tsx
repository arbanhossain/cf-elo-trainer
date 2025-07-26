import React, { useState } from 'react';
import { User } from '../types';

interface SettingsProps {
  user: User;
  onUpdateUser: (username: string, cfHandle: string) => Promise<void>;
  onReset: () => void;
  onNavigateBack: () => void;
  error: string | null;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onReset, onNavigateBack, error }) => {
  const [username, setUsername] = useState(user.username);
  const [cfHandle, setCfHandle] = useState(user.cfHandle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setLocalError(null);
    try {
      await onUpdateUser(username, cfHandle);
    } catch (e) {
      if (e instanceof Error) {
        setLocalError(e.message);
      } else {
        setLocalError('An unknown error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      onReset();
    }
  };

  return (
    <div className="p-4 md:p-8">
      <button onClick={onNavigateBack} className="text-cyan-400 hover:text-cyan-300 mb-8">
        &larr; Back to Dashboard
      </button>
      <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">User Profile</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="cfHandle" className="block text-sm font-medium text-gray-400">Codeforces Handle (optional)</label>
            <input
              type="text"
              id="cfHandle"
              value={cfHandle}
              onChange={(e) => setCfHandle(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
            <p className="mt-2 text-xs text-gray-500">Link your Codeforces account to sync your rating and submission history.</p>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {(error || localError) && (
            <p className="text-red-400 mt-4">{error || localError}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Reset Progress</h3>
        <p className="text-gray-400 mb-4">
          This will permanently delete your ELO rating and all submission history.
        </p>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Reset My Progress
        </button>
      </div>
    </div>
  );
};

export default Settings;
