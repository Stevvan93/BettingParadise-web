import { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = "zyrVFqxK6K6Vc3p4oVSbK3bgHTIeLbL1"; // gratisversionen du valt
const REGIONS = "eu"; // EU-odds
const MARKETS = "h2h,spreads,totals,player_props"; // flera marknader
const SPORTS = ["soccer_epl", "soccer_champions_league", "soccer_uefa_euro", "soccer_fifa_world_cup"];

export default function Airbitrage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stake, setStake] = useState(100);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const allGames = [];
        for (const sport of SPORTS) {
          const response = await axios.get(
            `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
            {
              params: {
                apiKey: API_KEY,
                regions: REGIONS,
                markets: MARKETS,
                oddsFormat: "decimal",
              },
            }
          );
          allGames.push(...response.data);
        }
        setGames(allGames);
      } catch (error) {
        console.error("Fel vid hämtning av odds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, []);

  const calculateReturns = (odds) => {
    const inv = odds.reduce((acc, odd) => acc + 1 / odd, 0);
    if (inv < 1) {
      const returns = odds.map((odd) => ((stake / odd) / inv).toFixed(2));
      const profit = (stake / inv - stake).toFixed(2);
      return { returns, profit };
    }
    return null;
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">Airbitrage</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Insats (SEK):</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          className="border rounded px-3 py-2 w-32"
        />
      </div>

      {loading ? (
        <p>Laddar odds...</p>
      ) : (
        <div className="space-y-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="border rounded p-4 shadow-md bg-white"
            >
              <h2 className="text-xl font-semibold text-pink-700">
                {game.home_team} vs {game.away_team}
              </h2>
              <p className="text-sm text-gray-600 mb-2">{game.sport_title} – {game.commence_time.slice(0, 16).replace("T", " ")}</p>

              {game.bookmakers.map((bookie) => (
                <div key={bookie.key} className="mb-4">
                  <h3 className="font-semibold">{bookie.title}</h3>
                  {bookie.markets.map((market) => (
                    <div key={market.key} className="ml-4 text-sm">
                      <p className="font-medium mt-1 underline">{market.key}</p>
                      <ul className="list-disc ml-6">
                        {market.outcomes.map((outcome, idx) => (
                          <li key={idx}>
                            {outcome.name}: {outcome.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}

              {/* Visa arbitrage om möjligt */}
              {game.bookmakers.length >= 2 &&
                (() => {
                  const market = game.bookmakers[0].markets.find((m) => m.key === "h2h");
                  const otherMarket = game.bookmakers[1].markets.find((m) => m.key === "h2h");

                  if (market && otherMarket) {
                    const odds = [market.outcomes[0].price, otherMarket.outcomes[1].price];
                    const result = calculateReturns(odds);
                    if (result) {
                      return (
                        <div className="mt-2 bg-green-100 border-l-4 border-green-500 text-green-700 p-3">
                          <p><strong>Arbitrage-möjlighet!</strong></p>
                          <p>Vinst: {result.profit} kr</p>
                          <p>Fördela: {result.returns[0]} kr på {market.outcomes[0].name}, {result.returns[1]} kr på {otherMarket.outcomes[1].name}</p>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
