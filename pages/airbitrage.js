import { useEffect, useState } from 'react';
import axios from 'axios';

const API_KEY = 'zyrVFqxK6K6Vc3p4oVSbK3bgHTIeLbL1';
const REGIONS = 'eu,uk,us';
const MARKETS = 'h2h,spreads,totals';

export default function Airbitrage() {
  const [oddsData, setOddsData] = useState([]);
  const [filteredOdds, setFilteredOdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [stake, setStake] = useState(100);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const res = await axios.get('https://api.apilayer.com/odds/live', {
          headers: { apikey: API_KEY },
          params: {
            regions: REGIONS,
            markets: MARKETS,
            oddsFormat: 'decimal'
          }
        });
        setOddsData(res.data.data || []);
        setFilteredOdds(res.data.data || []);
      } catch (err) {
        console.error('Kunde inte hämta odds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOdds();
  }, []);

  useEffect(() => {
    if (filter === '') {
      setFilteredOdds(oddsData);
    } else {
      const lower = filter.toLowerCase();
      const filtered = oddsData.filter((match) =>
        match.teams.some((team) => team.toLowerCase().includes(lower)) ||
        match.sport_title.toLowerCase().includes(lower)
      );
      setFilteredOdds(filtered);
    }
  }, [filter, oddsData]);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Airbitrage – Live Odds</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrera lag/turnering..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 text-black rounded w-full md:w-1/3"
        />
        <input
          type="number"
          placeholder="Insats"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="p-2 text-black rounded w-32"
        />
      </div>

      {loading && <p>Laddar odds...</p>}
      {!loading && filteredOdds.length === 0 && <p>Inga matcher hittades.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOdds.slice(0, 20).map((match, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{match.teams.join(' vs ')}</h2>
            <p className="text-sm text-gray-400">{match.sport_title} – {new Date(match.commence_time).toLocaleString()}</p>

            <div className="mt-3 space-y-2">
              {match.bookmakers.map((book, j) => (
                <div key={j}>
                  <p className="font-medium">{book.title}</p>
                  <ul className="ml-4 list-disc text-sm">
                    {book.markets.map((market, k) => (
                      <li key={k}>
                        <span className="capitalize">{market.key}</span>:
                        {market.outcomes.map((o, l) => (
                          <span key={l}>
                            {' '}{o.name} ({o.price})
                            {' '}– Vinst: {(stake * (o.price - 1)).toFixed(2)} kr
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm"
                  >
                    Till spel
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
