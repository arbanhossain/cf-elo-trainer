
import React from 'react';
import { User } from '../types';
import { HiOutlineCode as CodeIcon, HiOutlineUserCircle as UserIcon, HiOutlineCog as SettingsIcon } from 'react-icons/hi';

interface HeaderProps {
    user: User | null;
    onNavigateToSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigateToSettings }) => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-700/50">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <CodeIcon className="h-8 w-8 text-cyan-400" />
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        Codeforces ELO Trainer
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    {user && (
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <span className="text-sm text-gray-400">{user.username}</span>
                                <p className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
                                    {Math.round(user.currentElo)} ELO
                                </p>
                            </div>
                            <div className="p-2 bg-gray-700 rounded-full">
                               <UserIcon className="h-6 w-6 text-gray-300" />
                            </div>
                        </div>
                    )}
                    <button onClick={onNavigateToSettings} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                        <SettingsIcon className="h-6 w-6 text-gray-300" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
