
import React, { useMemo } from 'react';
import { User, Problem, Attempt } from '../types';
import ProblemList from './ProblemList';
import EloChart from './EloChart';

interface DashboardProps {
    user: User;
    recommendations: Problem[];
    history: Attempt[];
    submitAttempt: (problem: Problem, attemptsCount: number, isSuccessful: boolean) => Promise<void>;
    preferredTags: string[];
    setPreferredTags: (tags: string[]) => void;
    allProblems: Problem[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, recommendations, history, submitAttempt, preferredTags, setPreferredTags, allProblems }) => {
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        allProblems.forEach(p => p.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [allProblems]);

    const handleTagClick = (tag: string) => {
        setPreferredTags(
            preferredTags.includes(tag)
                ? preferredTags.filter(t => t !== tag)
                : [...preferredTags, tag]
        );
    };

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <section>
                        <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-gray-700 text-gray-200">
                           Recommended Problems
                        </h2>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Filter by Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                            preferredTags.includes(tag)
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {recommendations.length > 0 ? (
                           <ProblemList problems={recommendations} submitAttempt={submitAttempt} isHistory={false} />
                        ) : (
                           <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
                              <p className="text-lg font-semibold">Great job!</p>
                              <p>You've attempted all available recommendations for your current ELO.</p>
                              <p>Check back later for more!</p>
                           </div>
                        )}
                    </section>
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <section>
                        <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-gray-700 text-gray-200">
                           ELO History
                        </h2>
                        <EloChart history={history} initialElo={1500} />
                    </section>
                </div>
            </div>

             <section>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-gray-700 text-gray-200">
                   Attempt History
                </h2>
                 {history.length > 0 ? (
                    <ProblemList problems={history.map(h => h.problem)} history={history} isHistory={true} />
                 ) : (
                    <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
                        <p>You haven't attempted any problems yet. Go solve one!</p>
                    </div>
                 )}
            </section>
        </div>
    );
};

export default Dashboard;
