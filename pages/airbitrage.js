// pages/airbitrage.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Airbitrage() {
  const [oddsData, setOddsData] = useState([]);
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('soccer_epl');
  const [market, setMarket] = useState('h2h');
  const [stake, setStake] = useState(100);

  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;

  useEffect(() => {
    async function fetchSports() {
      const res = await axios.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`);
      setSports(res.data.filter(s => s.active));
    }

    fetchSports();
  }, []);

  useEffect(() => {
    async function fetchOdds() {
      const res = await axios.get(`https://api.the-odds-api.com/v4/sports/${selectedSport}/odds`, {
        params: {
          apiKey,
          regions: 'eu',
          markets: market,
          oddsFormat: 'decimal'
        }
      });
      setOddsData(res.data);
    }

    fetchOdds();
  }, [selectedSport, market]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Airbitrage</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">Välj sport/turnering</label>
          <select
            className="w-full border rounded p-2"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            {sports.map((sport) => (
              <option key={sport.key} value={sport.key}>{sport.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Välj marknad</label>
          <select
            className="w-full border rounded p-2"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          >
            <option value="h2h">1X2 (Matchvinnare)</option>
            <option value="totals">Över/Under</option>
            <option value="spreads">Handikapp</option>
            <option value="btts">Båda lagen gör mål</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Stake (insats per spel)</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {oddsData.map((match) => (
          <div key={match.id} className="border rounded p-4 shadow">
            <h2 className="font-semibold text-lg mb-2">
              {match.home_team} vs {match.away_team} ({match.sport_title})
            </h2>
            <p className="text-sm text-gray-500 mb-2">{match.commence_time}</p>

            {match.bookmakers?.[0]?.markets?.[0]?.outcomes.map((outcome) => (
              <div key={outcome.name} className="flex justify-between items-center mb-1">
                <span>{outcome.name}</span>
                <span>{outcome.price}x | Möjlig vinst: {(stake * outcome.price).toFixed(2)} kr</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
 
