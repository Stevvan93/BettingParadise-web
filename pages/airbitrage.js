// pages/airbitrage.js
import { useEffect, useState } from 'react';

export default function Airbitrage() {
  const [matches, setMatches] = useState([]);
  const [stake, setStake] = useState(100);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await fetch(
          'https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=zyrVFqxK6K6Vc3p4oVSbK3bgHTIeLbL1'
        );
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Fel vid hämtning av odds:', error);
      }
    };

    fetchOdds();
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">Airbitrage-verktyget</h1>
      <p className="text-center max-w-2xl mx-auto text-lg mb-10">
        Analysera odds och hitta riskfria vinster automatiskt. Vårt verktyg scannar flera spelbolag i realtid.
      </p>
      <div className="text-center mb-10">
        <label className="mr-2 font-medium">Total insats (kr):</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {matches.map((match, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-pink-600 mb-2">
              {match.home_team} vs {match.away_team}
            </h2>
            <p className="text-sm text-gray-500 mb-1">{match.sport_title} – {match.commence_time.slice(0, 10)}</p>
            <ul className="text-sm text-gray-700 mb-4">
              {match.bookmakers.map((bookie) => (
                <li key={bookie.key} className="mb-1">
                  <span className="font-medium">{bookie.title}:</span>{' '}
                  {bookie.markets[0]?.outcomes?.map((o, i) => (
                    <span key={i}>{o.name} ({o.price}) </span>
                  ))}
                </li>
              ))}
            </ul>
            <a
              href={match.bookmakers[0]?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 underline text-sm"
            >
              Gå till spel
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
