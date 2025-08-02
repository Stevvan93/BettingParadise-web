import { useEffect, useState } from "react";
import axios from "axios";

export default function Airbitrage() {
  const [arbitrageGames, setArbitrageGames] = useState([]);
  const [stake, setStake] = useState(100);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await axios.get("https://api.the-odds-api.com/v4/sports/soccer_epl/odds", {
          params: {
            regions: "eu",
            markets: "h2h",
            apiKey: "zyrVFqxK6K6Vc3p4oVSbK3bgHTIeLbL1",
          },
        });

        const games = response.data;
        const arbitrage = [];

        for (let game of games) {
          if (!game.bookmakers || game.bookmakers.length < 2) continue;

          const odds = [];

          // Plocka ut högsta oddset per utfall (1, X, 2)
          for (let bookmaker of game.bookmakers) {
            const market = bookmaker.markets.find((m) => m.key === "h2h");
            if (!market) continue;

            market.outcomes.forEach((outcome, index) => {
              if (!odds[index] || outcome.price > odds[index].price) {
                odds[index] = {
                  price: outcome.price,
                  bookmaker: bookmaker.title,
                  name: outcome.name,
                };
              }
            });
          }

          // Kontrollera om arbitrage-möjlighet finns
          if (odds.length === 3) {
            const impliedProb =
              (1 / odds[0].price) + (1 / odds[1].price) + (1 / odds[2].price);
            const profitPercent = (1 / impliedProb) * 100;

            if (profitPercent > 100) {
              arbitrage.push({
                ...game,
                odds,
                profitPercent: profitPercent.toFixed(2),
              });
            }
          }
        }

        setArbitrageGames(arbitrage);
      } catch (err) {
        console.error("Fel vid hämtning av odds:", err);
      }
    };

    fetchOdds();
  }, []);

  const calcStake = (price) => ((stake / price).toFixed(2));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Airbitrage</h1>

      <div className="mb-6">
        <label className="block font-medium mb-2">Total insats:</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          className="p-2 border rounded w-full max-w-xs"
        />
      </div>

      {arbitrageGames.length === 0 ? (
        <p>Hämtar arbitrage-spel...</p>
      ) : (
        arbitrageGames.map((game, index) => (
          <div key={index} className="border p-4 rounded-xl mb-6 shadow">
            <h2 className="text-lg font-semibold mb-1">
              {game.home_team} vs {game.away_team}
            </h2>
            <p className="text-sm text-gray-600 mb-2">{game.sport_title} – {game.commence_time.slice(0, 10)}</p>
            <p className="text-green-600 font-bold mb-2">Arbitrage: {game.profitPercent}%</p>

            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-1">Utfall</th>
                  <th className="py-1">Odds</th>
                  <th className="py-1">Bookie</th>
                  <th className="py-1">Insats</th>
                </tr>
              </thead>
              <tbody>
                {game.odds.map((odd, i) => (
                  <tr key={i}>
                    <td className="py-1">{odd.name}</td>
                    <td className="py-1">{odd.price}</td>
                    <td className="py-1">{odd.bookmaker}</td>
                    <td className="py-1">{calcStake(odd.price)} kr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
