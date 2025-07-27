// pages/airbitrage.js

import { useState } from 'react';

export default function Airbitrage() {
  const data = [
    {
      league: "Premier League",
      match: "Arsenal vs Liverpool",
      bet: "Över 2.5 mål",
      bookmaker1: { name: "Bet365", odds: 2.10, url: "https://www.bet365.com" },
      bookmaker2: { name: "Unibet", odds: 2.05, url: "https://www.unibet.com" },
    },
    {
      league: "Champions League",
      match: "Real Madrid vs PSG",
      bet: "1X2 (Real Madrid)",
      bookmaker1: { name: "Betfair", odds: 2.30, url: "https://www.betfair.com" },
      bookmaker2: { name: "Bwin", odds: 2.25, url: "https://www.bwin.com" },
    },
  ];

  const [stake, setStake] = useState(100);

  return (
    <div className="bg-white min-h-screen px-4 py-10 font-sans">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-10">
        Airbitrage-spel
      </h1>

      <div className="max-w-5xl mx-auto space-y-8">
        {data.map((item, i) => {
          const totalOdds = 1 / item.bookmaker1.odds + 1 / item.bookmaker2.odds;
          const profitPercent = (1 - totalOdds) * 100;

          const stake1 = (stake * (1 / item.bookmaker1.odds)) / totalOdds;
          const stake2 = (stake * (1 / item.bookmaker2.odds)) / totalOdds;

          return (
            <div
              key={i}
              className="bg-pink-100 p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {item.match} <span className="text-sm text-gray-500">({item.league})</span>
              </h2>
              <p className="mb-2 text-gray-700">
                🎯 Spel: <strong>{item.bet}</strong>
              </p>
              <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-2">
                <div className="text-sm">
                  📈 {item.bookmaker1.name}: <strong>{item.bookmaker1.odds}</strong>
                  <a
                    href={item.bookmaker1.url}
                    target="_blank"
                    className="ml-2 text-pink-600 underline"
                    rel="noopener noreferrer"
                  >
                    Till spel
                  </a>
                </div>
                <div className="text-sm">
                  📉 {item.bookmaker2.name}: <strong>{item.bookmaker2.odds}</strong>
                  <a
                    href={item.bookmaker2.url}
                    target="_blank"
                    className="ml-2 text-pink-600 underline"
                    rel="noopener noreferrer"
                  >
                    Till spel
                  </a>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                🔢 Arbitrage: {profitPercent.toFixed(2)}% vinst
              </p>

              <div className="mb-4">
                <label className="text-sm text-gray-600 mr-2">Insats totalt:</label>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                  className="border px-3 py-1 rounded w-24 text-sm"
                />
              </div>

              <div className="text-sm text-gray-700">
                💰 Lägg <strong>{stake1.toFixed(2)} kr</strong> hos {item.bookmaker1.name} &
                <strong> {stake2.toFixed(2)} kr</strong> hos {item.bookmaker2.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
