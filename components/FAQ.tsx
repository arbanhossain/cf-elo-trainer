import React from 'react';

interface FAQProps {
  onNavigateBack: () => void;
}

const FAQ: React.FC<FAQProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-4 md:p-8">
      <button onClick={onNavigateBack} className="text-cyan-400 hover:text-cyan-300 mb-8">
        &larr; Back to Dashboard
      </button>
      <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions (FAQ)</h2>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">What is Codeforces ELO Trainer?</h3>
        <p className="text-gray-400 mb-4">
          This application helps you improve your competitive programming skills by providing personalized problem recommendations based on your ELO rating. It simulates an ELO system similar to Codeforces, allowing you to track your progress offline.
        </p>
        <p className="text-gray-400">
          You can log your attempts on problems, and your ELO will adjust based on your performance. You can also link your Codeforces account to synchronize your initial ELO and submission history.
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">How do I use this app?</h3>
        <ul className="list-disc list-inside text-gray-400 space-y-2">
          <li>
            <strong>Initial Setup:</strong> When you first open the app, you'll have a default ELO of 1500. You can change your username and initial ELO in the <span className="text-cyan-400">Settings</span> page.
          </li>
          <li>
            <strong>Link Codeforces (Optional):</strong> In <span className="text-cyan-400">Settings</span>, you can link your Codeforces handle. This will automatically set your initial ELO to your Codeforces rating and import your solved problems as history.
          </li>
          <li>
            <strong>Solve Problems:</strong> The Dashboard will show you recommended problems based on your current ELO. Click on a problem name to go to its Codeforces page.
          </li>
          <li>
            <strong>Log Attempts:</strong> After attempting a problem, click "Log Attempt" on the problem card. Enter the number of attempts you made and whether you successfully solved it. Your ELO will be updated accordingly.
          </li>
          <li>
            <strong>Track Progress:</strong> The Dashboard also displays your ELO history chart and a list of your past attempts.
          </li>
        </ul>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">What is ELO Rating?</h3>
        <p className="text-gray-400">
          ELO rating is a method for calculating the relative skill levels of players in zero-sum games such as chess. In competitive programming, it reflects your proficiency. When you solve a problem, your ELO increases; when you fail, it decreases. The amount of change depends on the problem's difficulty relative to your current ELO and the number of attempts.
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Codeforces Integration</h3>
        <p className="text-gray-400 mb-4">
          Linking your Codeforces account allows the app to fetch your current rating and your past solved problems. This helps in providing more accurate recommendations and a more personalized experience.
        </p>
        <p className="text-gray-400">
          If your Codeforces account is linked, your ELO in this app will be synchronized with your Codeforces rating. You will not be able to manually log attempts or change your ELO directly. To regain manual control, you can "Unlink" your Codeforces account in the Settings.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
