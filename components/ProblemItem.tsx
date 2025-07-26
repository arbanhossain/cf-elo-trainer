
import React, { useState } from 'react';
import { Problem, Attempt } from '../types';
import SubmitAttemptForm from './SubmitAttemptForm';
import { getHint } from '../services/geminiService';
import { HiOutlineLink as LinkIcon, HiOutlineCheckCircle as CheckCircleIcon, HiOutlineXCircle as XCircleIcon, HiOutlineSparkles as SparklesIcon, HiOutlineRefresh as LoadingIcon } from 'react-icons/hi';

interface ProblemItemProps {
    problem: Problem;
    submitAttempt?: (problem: Problem, attemptsCount: number, isSuccessful: boolean) => Promise<void>;
    attemptInfo?: Attempt;
    isHistoryItem: boolean;
}

const Tag: React.FC<{ tag: string }> = ({ tag }) => (
    <span className="bg-gray-700 text-cyan-300 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full">
        {tag}
    </span>
);

const ProblemItem: React.FC<ProblemItemProps> = ({ problem, submitAttempt, attemptInfo, isHistoryItem }) => {
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);

    const handleGetHint = async () => {
        setIsHintLoading(true);
        setHint(null);
        try {
            const hintText = await getHint(problem);
            setHint(hintText);
        } catch (error) {
            console.error("Failed to get hint:", error);
            setHint("Sorry, could not fetch a hint at this time.");
        } finally {
            setIsHintLoading(false);
        }
    };

    const ELO_COLORS: { [key: number]: string } = {
        1800: 'text-orange-400', 1600: 'text-violet-400', 1400: 'text-blue-400', 
        1200: 'text-cyan-400', 1000: 'text-green-400', 800: 'text-gray-400'
    };
    const ratingColor = Object.entries(ELO_COLORS).find(([rating]) => problem.rating >= parseInt(rating))?.[1] ?? 'text-red-400';

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-cyan-500/10 hover:border-gray-600 border border-transparent relative">
            {problem.isOutOfCategory && (
                <div className="absolute top-2 right-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-bold" title="This problem is outside your selected tags.">
                    !
                </div>
            )}
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <a href={problem.link} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors flex items-center gap-2">
                            {problem.name}
                            <LinkIcon className="h-4 w-4 opacity-70" />
                        </a>
                    </div>
                    <p className={`font-mono font-bold text-sm ${ratingColor}`}>{problem.rating} ELO</p>
                </div>
                 {isHistoryItem && attemptInfo && (
                    <div className={`flex items-center gap-2 text-lg font-bold ${attemptInfo.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {attemptInfo.status === 'SOLVED' ? <CheckCircleIcon className="h-6 w-6"/> : <XCircleIcon className="h-6 w-6"/>}
                        <span>{attemptInfo.eloChange >= 0 ? '+' : ''}{Math.round(attemptInfo.eloChange)}</span>
                    </div>
                )}
            </div>
            <div className="mt-3 flex flex-wrap items-center">
                {problem.tags.slice(0, 4).map(tag => <Tag key={tag} tag={tag} />)}
            </div>

            {!isHistoryItem && (
                 <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => setShowSubmitForm(!showSubmitForm)} 
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                        >
                            {showSubmitForm ? 'Cancel' : 'Log Attempt'}
                        </button>
                        <button 
                            onClick={handleGetHint} 
                            disabled={isHintLoading}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isHintLoading ? <LoadingIcon className="h-4 w-4 animate-spin"/> : <SparklesIcon className="h-4 w-4" />}
                            Get Hint
                        </button>
                    </div>

                    {isHintLoading && <p className="mt-2 text-sm text-gray-400 animate-pulse">Thinking of a hint...</p>}
                    {hint && <div className="mt-3 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300 italic">{hint}</div>}

                    {showSubmitForm && submitAttempt && (
                        <div className="mt-4 animate-[fadeIn_0.3s_ease-out]">
                            <SubmitAttemptForm problem={problem} onSubmit={(...args) => {
                                submitAttempt(...args);
                                setShowSubmitForm(false);
                            }} />
                        </div>
                    )}
                </div>
            )}
            
            {isHistoryItem && attemptInfo && (
                <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
                    <p>Attempted on {attemptInfo.completedAt.toLocaleDateString()} with {attemptInfo.attemptsCount} attempt(s).</p>
                </div>
            )}
        </div>
    );
};

export default ProblemItem;
