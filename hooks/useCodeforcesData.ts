
import { useState, useEffect, useCallback } from 'react';
import { User, Problem, Attempt } from '../types';
import * as codeforcesService from '../services/codeforcesService';

export const useCodeforcesData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<Problem[]>([]);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preferredTags, setPreferredTags] = useState<string[]>([]);

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    try {
      const recommendedProblems = await codeforcesService.getRecommendations(user.currentElo, preferredTags);
      const historyProblemIds = new Set(history.map(h => h.problem.id));
      const filteredRecommendations = recommendedProblems.filter(p => !historyProblemIds.has(p.id));
      setRecommendations(filteredRecommendations);
    } catch (e) {
      setError('Failed to load recommendations.');
      console.error(e);
    }
  }, [user, preferredTags, history]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [userData, historyData] = await Promise.all([
        codeforcesService.getInitialUser(),
        codeforcesService.getInitialHistory(),
      ]);
      setUser(userData);
      setHistory(historyData);
    } catch (e) {
      setError('Failed to load data.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

  const submitAttempt = async (problem: Problem, attemptsCount: number, isSuccessful: boolean) => {
    if (!user) return;
    try {
        const { updatedUser, newAttempt } = await codeforcesService.submitAttempt(
            user,
            problem,
            attemptsCount,
            isSuccessful
        );
        
        const newHistory = [...history, newAttempt].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        setUser(updatedUser);
        setHistory(newHistory);
        
        const newRecommendations = await codeforcesService.getRecommendations(updatedUser.currentElo);
        const allAttemptedIds = new Set(newHistory.map(h => h.problem.id));
        setRecommendations(newRecommendations.filter(p => !allAttemptedIds.has(p.id)));

    } catch(e) {
        setError('Failed to submit attempt.');
        console.error(e);
    }
  };

  const reset = async () => {
    await codeforcesService.resetProgress();
    await fetchInitialData();
  };

  const updateUser = async (username: string, cfHandle: string, elo?: number) => {
    try {
      await codeforcesService.updateUser(username, cfHandle, elo);
      await fetchInitialData();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during update.');
      }
      throw e; // Re-throw to be caught in the component
    }
  };

  return { user, recommendations, history, isLoading, error, submitAttempt, reset, updateUser, preferredTags, setPreferredTags };
};
