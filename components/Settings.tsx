import React, { useState } from 'react';
import { User } from '../types';

interface SettingsProps {
  user: User;
  onUpdateUser: (username: string, cfHandle: string, elo?: number, allowManualSubmit?: boolean, generateEloFromHistory?: boolean) => Promise<void>;
  onReset: () => void;
  onNavigateBack: () => void;
  error: string | null;
  onImportData?: (jsonData: string) => Promise<void>;
  onExportData?: () => string;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onReset, onNavigateBack, error, onImportData, onExportData }) => {
  const [username, setUsername] = useState(user.username);
  const [cfHandle, setCfHandle] = useState(user.cfHandle || '');
  const [elo, setElo] = useState(user.currentElo);
  const [allowManualSubmit, setAllowManualSubmit] = useState(user.allowManualSubmit || false);
  const [generateEloFromHistory, setGenerateEloFromHistory] = useState(user.generateEloFromHistory || false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setLocalError(null);
    try {
      await onUpdateUser(username, cfHandle, elo, allowManualSubmit, generateEloFromHistory);
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

  const handleUnlink = async () => {
    setIsSaving(true);
    setLocalError(null);
    try {
      await onUpdateUser(username, '', elo, allowManualSubmit);
      setCfHandle('');
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

  const handleExport = () => {
    if (onExportData) {
      const data = onExportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cf_elo_data.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportData) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          await onImportData(content);
          alert('Data imported successfully!');
        } catch (err) {
          alert('Failed to import data: Invalid format.');
        }
      };
      reader.readAsText(file);
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
            <label htmlFor="elo" className="block text-sm font-medium text-gray-400">ELO Rating</label>
            <input
              type="number"
              id="elo"
              value={elo}
              onChange={(e) => setElo(parseInt(e.target.value, 10))}
              disabled={!!cfHandle}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
            />
            {cfHandle && <p className="mt-2 text-xs text-gray-500">ELO is synced from Codeforces.</p>}
          </div>
          <div>
            <label htmlFor="cfHandle" className="block text-sm font-medium text-gray-400">Codeforces Handle (optional)</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="cfHandle"
                value={cfHandle}
                onChange={(e) => setCfHandle(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              />
              {user.cfHandle && (
                <button
                  onClick={handleUnlink}
                  className="mt-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Unlink
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Link your Codeforces account to sync your rating and submission history.</p>
          </div>
          {cfHandle && (
            <>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generateEloFromHistory"
                    checked={generateEloFromHistory}
                    onChange={(e) => setGenerateEloFromHistory(e.target.checked)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded bg-gray-700"
                  />
                  <label htmlFor="generateEloFromHistory" className="ml-2 block text-sm text-gray-400">
                    Generate ELO from past solved problems
                  </label>
                </div>
                {generateEloFromHistory && (
                  <p className="ml-6 text-xs text-yellow-500">
                    (Your current Codeforces ELO rating will be ignored)
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowManualSubmit"
                  checked={allowManualSubmit}
                  onChange={(e) => setAllowManualSubmit(e.target.checked)}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded bg-gray-700"
                />
                <label htmlFor="allowManualSubmit" className="ml-2 block text-sm text-gray-400">
                  Allow manual submission of attempts (this won't sync back to Codeforces)
                </label>
              </div>
            </>
          )}
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

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Data Management</h3>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Export Data
          </button>
          <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 cursor-pointer">
            Import Data
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
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
