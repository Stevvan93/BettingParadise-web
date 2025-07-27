// pages/airbitrage.js

import { useState } from "react";

export default function Airbitrage() {
  const [stake, setStake] = useState(1000);

  const data = [
    {
      match: "Manchester City vs Real Madrid",
      league: "UEFA Champions League",
      market: "Över 2.5 mål",
      bookmaker1: { name: "Bet365", odds: 2.10, url: "https://www.bet365.com" },
      bookmaker2: { name: "Unibet", odds: 2.05, url: "https://www.unibet.com" },
    },
    {
      match: "Arsenal vs Bayern München",
      league: "UEFA Champions League",
      market: "Båda lagen gör mål",
      bookmaker1: { name: "Betfair", odds: 1.95, url: "https://www.betfair.com" },
      bookmaker2: { name: "LeoVegas", odds: 2.00, url: "https://www.leovegas.com" },
    },
  ];

  const calculateStakes = (odds1, odds2, totalStake) => {
    const inverseSum = 1 / odds1 + 1 / odds2;
    const stake1 = (totalStake / inverseSum) / odds1;
    const stake2 = (totalStake / inverseSum) / odds2;
    return [stake1.toFixed(2), stake2.toFixed(2)];
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6 font-sans">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-6">Airbitrage-verktyget</h1>

      <div className="max-w-2xl mx-auto mb-8">
        <label className="block text-lg font-semibold mb-2">Ange total insats (kr):</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {data.map((arb, i) => {
          const [s1, s2] = calculateStakes(arb.bookmaker1.odds, arb.bookmaker2.odds, stake);
          const profit = ((stake / (1 / arb.bookmaker1.odds + 1 / arb.bookmaker2.odds)) - stake).toFixed(2);
          return (
            <div key={i} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
              <h2 className="text-2xl font-bold mb-2">{arb.match}</h2>
              <p className="text-sm text-gray-500 mb-1">{arb.league}</p>
              <p className="text-pink-600 font-semibold mb-4">{arb.market}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>{arb.bookmaker1.name}</strong></p>
                  <p>Odds: {arb.bookmaker1.odds}</p>
                  <p>Insats: {s1} kr</p>
                  <a href={arb.bookmaker1.url} target="_blank" className="text-blue-600 underline">Till spel</a>
                </div>
                <div>
                  <p><strong>{arb.bookmaker2.name}</strong></p>
                  <p>Odds: {arb.bookmaker2.odds}</p>
                  <p>Insats: {s2} kr</p>
                  <a href={arb.bookmaker2.url} target="_blank" className="text-blue-600 underline">Till spel</a>
                </div>
              </div>
              <p className="mt-4 text-green-600 font-semibold">Vinst: +{profit} kr</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
