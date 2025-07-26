
import React, { useState } from 'react';
import { useCodeforcesData } from './hooks/useCodeforcesData';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { HiOutlineRefresh as LoadingIcon } from 'react-icons/hi';

type Page = 'dashboard' | 'settings';

import { useEffect } from 'react';
import * as codeforcesService from './services/codeforcesService';
import { Problem } from './types';

const App: React.FC = () => {
  const { user, recommendations, history, isLoading, error, submitAttempt, reset, updateUser, preferredTags, setPreferredTags } = useCodeforcesData();
  const [page, setPage] = useState<Page>('dashboard');
  const [allProblems, setAllProblems] = useState<Problem[]>([]);

  useEffect(() => {
    codeforcesService.getProblemset().then(setAllProblems);
  }, []);

  const handleReset = async () => {
    await reset();
    setPage('dashboard');
  };

  const handleUpdateUser = async (username: string, cfHandle: string, elo?: number) => {
    if (updateUser) {
      try {
        await updateUser(username, cfHandle, elo);
        setPage('dashboard');
      } catch (e) {
        // Error is already set in the hook, just need to prevent navigation
        console.error("Update failed:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header user={user} onNavigateToSettings={() => setPage('settings')} />
      <main className="container mx-auto p-4 md:p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <LoadingIcon className="h-12 w-12 animate-spin text-cyan-400" />
             <p className="ml-4 text-xl text-gray-300">Loading your ELO profile...</p>
          </div>
        ) : error && page !== 'settings' ? (
          <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        ) : user ? (
          page === 'dashboard' ? (
            <Dashboard
              user={user}
              recommendations={recommendations}
              history={history}
              submitAttempt={submitAttempt}
              preferredTags={preferredTags}
              setPreferredTags={setPreferredTags}
              allProblems={allProblems}
            />
          ) : (
            <Settings 
              user={user}
              onUpdateUser={handleUpdateUser}
              onReset={handleReset} 
              onNavigateBack={() => setPage('dashboard')}
              error={error}
            />
          )
        ) : (
            <div className="text-center text-gray-400">Could not load user data.</div>
        )}
      </main>
    </div>
  );
};

export default App;
