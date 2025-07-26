
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Attempt } from '../types';

interface EloChartProps {
    history: Attempt[];
    initialElo: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
                <p className="label text-sm text-gray-300">{`Attempt on: ${data.problem.name}`}</p>
                <p className={`intro font-bold text-lg ${data.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ELO: {Math.round(data.eloAfter)} ({data.eloChange >= 0 ? '+' : ''}{Math.round(data.eloChange)})
                </p>
                <p className="text-xs text-gray-400">Date: {new Date(data.completedAt).toLocaleDateString()}</p>
            </div>
        );
    }

    return null;
};

const EloChart: React.FC<EloChartProps> = ({ history, initialElo }) => {

    if(history.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400 h-64 flex items-center justify-center">
                <p>Your ELO chart will appear here once you log an attempt.</p>
            </div>
        );
    }
    
    // Create a data point for the start, using a time just before the first attempt.
    const chartData = [
        { eloAfter: initialElo, completedAt: new Date(history[history.length-1].completedAt.getTime() - 86400000).toISOString(), problem: {name: 'Starting Point'}, eloChange: 0 }, 
        ...[...history].reverse() // History is sorted descending, so reverse for chronological chart
    ];
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-64 w-full">
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis 
                        dataKey="completedAt" 
                        tickFormatter={(timeStr) => new Date(timeStr).toLocaleDateString()} 
                        stroke="#A0AEC0"
                        fontSize={12}
                        tick={{ fill: '#A0AEC0' }}
                        />
                    <YAxis 
                        domain={['dataMin - 50', 'dataMax + 50']} 
                        stroke="#A0AEC0"
                        fontSize={12}
                        tick={{ fill: '#A0AEC0' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                    <Line type="monotone" dataKey="eloAfter" name="ELO" stroke="#4FD1C5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EloChart;
