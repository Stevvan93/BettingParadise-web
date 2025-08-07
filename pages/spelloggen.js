import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Spelloggen() {
  const [bets, setBets] = useState([]);
  const [newBet, setNewBet] = useState({
    team1: "",
    team2: "",
    league: "",
    betType: "",
    odds: "",
    stake: "",
    result: "pending",
    link: "",
  });

  const handleChange = (e) => {
    setNewBet({ ...newBet, [e.target.name]: e.target.value });
  };

  const handleAddBet = () => {
    setBets([...bets, newBet]);
    setNewBet({
      team1: "",
      team2: "",
      league: "",
      betType: "",
      odds: "",
      stake: "",
      result: "pending",
      link: "",
    });
  };

  const handleResultChange = (index, result) => {
    const updatedBets = [...bets];
    updatedBets[index].result = result;
    setBets(updatedBets);
  };

  const totalStake = bets.reduce((sum, b) => sum + parseFloat(b.stake || 0), 0);
  const totalProfit = bets.reduce((sum, b) => {
    const stake = parseFloat(b.stake);
    const odds = parseFloat(b.odds);
    if (b.result === "won") return sum + stake * (odds - 1);
    if (b.result === "lost") return sum - stake;
    return sum;
  }, 0);
  const roi = totalStake > 0 ? ((totalProfit / totalStake) * 100).toFixed(2) : "0.00";

  // 🔧 Fixad logik för att undvika krascher
  let runningBalance = 0;
  const chartData = bets.map((b, i) => {
    const stake = parseFloat(b.stake);
    const odds = parseFloat(b.odds);
    const change = b.result === "won" ? stake * (odds - 1) : b.result === "lost" ? -stake : 0;
    runningBalance += change;
    return {
      name: `Spel ${i + 1}`,
      balance: runningBalance,
    };
  });

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-4">Spelloggen</h1>

      {/* Formulär för nytt spel */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {["team1", "team2", "league", "betType", "odds", "stake", "link"].map((field) => (
          <input
            key={field}
            name={field}
            value={newBet[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="border p-2 rounded"
            type={field === "odds" || field === "stake" ? "number" : "text"}
          />
        ))}
        <button onClick={handleAddBet} className="col-span-2 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded">
          Lägg till spel
        </button>
      </div>

      {/* Lista med bets */}
      <div className="space-y-4">
        {bets.map((bet, index) => (
          <div key={index} className="border rounded p-4 shadow-md">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
              <div>
                <p className="font-semibold">{bet.team1} vs {bet.team2}</p>
                <p className="text-sm text-gray-600">{bet.league}</p>
                <p>Spel: {bet.betType}</p>
                <p>Odds: {bet.odds} | Insats: {bet.stake} kr</p>
                {bet.link && (
                  <a href={bet.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Till spel
                  </a>
                )}
              </div>
              <div className="mt-2 md:mt-0">
                <label className="block text-sm font-medium">Resultat:</label>
                <select
                  value={bet.result}
                  onChange={(e) => handleResultChange(index, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="pending">Ej rättad</option>
                  <option value="won">Vinst</option>
                  <option value="lost">Förlust</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistik */}
      <div className="mt-8 p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Statistik</h2>
        <p>Antal spel: {bets.length}</p>
        <p>Totalt resultat: {totalProfit.toFixed(2)} kr</p>
        <p>ROI: {roi} %</p>
      </div>

      {/* Diagram */}
      {chartData.length > 0 && (
        <div className="mt-8 bg-white p-4 border rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Resultatutveckling</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
