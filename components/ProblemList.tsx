
import React from 'react';
import { Problem, Attempt } from '../types';
import ProblemItem from './ProblemItem';

interface ProblemListProps {
    problems: Problem[];
    submitAttempt?: (problem: Problem, attemptsCount: number, isSuccessful:boolean) => Promise<void>;
    history?: Attempt[];
    isHistory: boolean;
}

const ProblemList: React.FC<ProblemListProps> = ({ problems, submitAttempt, history, isHistory }) => {
    return (
        <div className="space-y-4">
            {problems.map(problem => {
                const attemptInfo = isHistory ? history?.find(h => h.problem.id === problem.id) : undefined;
                return (
                    <ProblemItem 
                        key={problem.id} 
                        problem={problem} 
                        submitAttempt={submitAttempt}
                        attemptInfo={attemptInfo}
                        isHistoryItem={isHistory}
                    />
                );
            })}
        </div>
    );
};

export default ProblemList;
