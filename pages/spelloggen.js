import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Spelloggen() {
  const [bets, setBets] = useState([]);
  const [newBet, setNewBet] = useState({
    match: "",
    odds: "",
    stake: "",
    result: "pending",
  });

  const handleInputChange = (e) => {
    setNewBet({ ...newBet, [e.target.name]: e.target.value });
  };

  const addBet = () => {
    if (!newBet.match || !newBet.odds || !newBet.stake) return;
    setBets([...bets, newBet]);
    setNewBet({ match: "", odds: "", stake: "", result: "pending" });
  };

  const updateResult = (index, result) => {
    const updated = [...bets];
    updated[index].result = result;
    setBets(updated);
  };

  const calculateStats = () => {
    const total = bets.length;
    const won = bets.filter((b) => b.result === "won");
    const lost = bets.filter((b) => b.result === "lost");
    const profit = bets.reduce((acc, bet) => {
      const stake = parseFloat(bet.stake);
      const odds = parseFloat(bet.odds);
      if (bet.result === "won") return acc + stake * (odds - 1);
      if (bet.result === "lost") return acc - stake;
      return acc;
    }, 0);
    const totalStaked = bets.reduce(
      (acc, bet) => acc + (bet.result !== "pending" ? parseFloat(bet.stake) : 0),
      0
    );
    const roi = totalStaked ? ((profit / totalStaked) * 100).toFixed(2) : 0;
    return { total, won: won.length, lost: lost.length, roi, profit: profit.toFixed(2) };
  };

  const stats = calculateStats();

  const chartData = bets.map((b, i) => {
    let prevProfit = i > 0 ? parseFloat(chartData[i - 1]?.balance || 0) : 0;
    const stake = parseFloat(b.stake);
    const odds = parseFloat(b.odds);
    const change = b.result === "won" ? stake * (odds - 1) : b.result === "lost" ? -stake : 0;
    return {
      name: `Spel ${i + 1}`,
      balance: prevProfit + change,
    };
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-pink-600">Spelloggen</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          className="border p-2 rounded col-span-2"
          name="match"
          value={newBet.match}
          onChange={handleInputChange}
          placeholder="Match / Spel"
        />
        <input
          className="border p-2 rounded"
          name="odds"
          value={newBet.odds}
          onChange={handleInputChange}
          placeholder="Odds"
          type="number"
        />
        <input
          className="border p-2 rounded"
          name="stake"
          value={newBet.stake}
          onChange={handleInputChange}
          placeholder="Insats"
          type="number"
        />
      </div>
      <button
        onClick={addBet}
        className="bg-pink-600 text-white px-6 py-2 rounded mb-6 hover:bg-pink-700"
      >
        Lägg till spel
      </button>

      <div className="grid md:grid-cols-3 gap-4 text-center mb-8">
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Totalt antal spel</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">ROI</p>
          <p className="text-2xl font-bold">{stats.roi}%</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Total vinst</p>
          <p className="text-2xl font-bold">{stats.profit} kr</p>
        </div>
      </div>

      {bets.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="balance" stroke="#ec4899" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Spel</h2>
        <div className="space-y-3">
          {bets.map((bet, index) => (
            <div key={index} className="bg-white shadow rounded p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="font-medium">{bet.match}</p>
                <p className="text-sm text-gray-600">Odds: {bet.odds} | Insats: {bet.stake} kr</p>
              </div>
              <div className="mt-2 md:mt-0">
                <select
                  className="border p-2 rounded"
                  value={bet.result}
                  onChange={(e) => updateResult(index, e.target.value)}
                >
                  <option value="pending">Ej rättad</option>
                  <option value="won">Vinst</option>
                  <option value="lost">Förlust</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
