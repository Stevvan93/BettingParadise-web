// pages/airbitrage.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Airbitrage() {
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('soccer_epl');
  const [market, setMarket] = useState('h2h');
  const [oddsData, setOddsData] = useState([]);
  const [stake, setStake] = useState(100);

  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;

  // Hämta tillgängliga sporter
  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await axios.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`);
        setSports(res.data.filter(s => s.active));
      } catch (err) {
        console.error('Error fetching sports:', err);
      }
    }
    fetchSports();
  }, []);

  // Hämta odds för vald sport & marknad
  useEffect(() => {
    async function fetchOdds() {
      try {
        const res = await axios.get(`https://api.the-odds-api.com/v4/sports/${selectedSport}/odds`, {
          params: {
            apiKey,
            regions: 'eu,uk,us',
            markets: market,
            oddsFormat: 'decimal'
          }
        });
        setOddsData(res.data);
      } catch (err) {
        console.error('Error fetching odds:', err);
      }
    }
    if (selectedSport && market) fetchOdds();
  }, [selectedSport, market]);

  const calculateStake = (odds1, odds2) => {
    const inv1 = 1 / odds1;
    const inv2 = 1 / odds2;
    const totalInv = inv1 + inv2;
    const stake1 = (stake * inv1) / totalInv;
    const stake2 = (stake * inv2) / totalInv;
    return {
      stake1: stake1.toFixed(2),
      stake2: stake2.toFixed(2)
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">Airbitrage</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="p-2 border rounded"
        >
          {sports.map((s) => (
            <option key={s.key} value={s.key}>
              {s.title}
            </option>
          ))}
        </select>

        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="h2h">1X2</option>
          <option value="totals">Över/Under</option>
          <option value="spreads">Handikapp</option>
        </select>

        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="p-2 border rounded"
          placeholder="Insats"
        />
      </div>

      <div className="space-y-6">
        {oddsData.map((match, index) => {
          const bookmakers = match.bookmakers || [];
          if (bookmakers.length < 2) return null;

          const bm1 = bookmakers[0];
          const bm2 = bookmakers[1];

          const odds1 = bm1.markets?.[0]?.outcomes?.[0]?.price;
          const odds2 = bm2.markets?.[0]?.outcomes?.[1]?.price;

          if (!odds1 || !odds2) return null;

          const stakeCalc = calculateStake(odds1, odds2);

          return (
            <div key={index} className="bg-white shadow p-4 rounded-lg border">
              <div className="text-gray-700 font-semibold">
                {match.home_team} vs {match.away_team}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {match.sport_title} – {match.commence_time.slice(0, 10)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <strong>{bm1.title}</strong>: {odds1} <br />
                  Stake: {stakeCalc.stake1} kr
                </div>
                <div>
                  <strong>{bm2.title}</strong>: {odds2} <br />
                  Stake: {stakeCalc.stake2} kr
                </div>
              </div>

              <div className="text-right">
                <a
                  href={bm1.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:underline text-sm"
                >
                  Gå till spel →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
