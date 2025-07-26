
import React, { useState } from 'react';
import { Problem } from '../types';

interface SubmitAttemptFormProps {
    problem: Problem;
    onSubmit: (problem: Problem, attemptsCount: number, isSuccessful: boolean) => void;
}

const SubmitAttemptForm: React.FC<SubmitAttemptFormProps> = ({ problem, onSubmit }) => {
    const [attempts, setAttempts] = useState<number>(1);

    const handleSubmit = (isSuccessful: boolean) => {
        if (isSuccessful && (attempts < 1 || attempts > 5)) {
             alert("Please enter a number of attempts between 1 and 5 for a successful solve.");
             return;
        }
        // For failures, any attempt count is implicitly >5 or a give-up. We'll normalize to 6.
        const attemptsCount = isSuccessful ? attempts : 6;
        onSubmit(problem, attemptsCount, isSuccessful);
    };

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-gray-200">Log your attempt for "{problem.name}"</h4>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                    <label htmlFor={`attempts-${problem.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                        Attempts (1-5)
                    </label>
                    <input
                        type="number"
                        id={`attempts-${problem.id}`}
                        name="attempts"
                        min="1"
                        max="5"
                        value={attempts}
                        onChange={(e) => setAttempts(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                        className="bg-gray-900 border border-gray-600 text-white sm:text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                    />
                </div>
                <div className="flex-grow flex items-end gap-2 w-full sm:w-auto pt-4 sm:pt-0 self-end">
                    <button 
                        onClick={() => handleSubmit(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
                    >
                        Solved!
                    </button>
                    <button 
                        onClick={() => handleSubmit(false)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
                    >
                        Failed / Gave Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmitAttemptForm;
