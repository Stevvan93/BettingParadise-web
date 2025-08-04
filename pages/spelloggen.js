// pages/spelloggen.js
import { useState } from "react";

export default function Spelloggen() {
  const [bets, setBets] = useState([]);
  const [form, setForm] = useState({
    date: "",
    match: "",
    market: "",
    odds: "",
    stake: "",
    result: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBets([...bets, form]);
    setForm({ date: "", match: "", market: "", odds: "", stake: "", result: "" });
  };

  const getStats = () => {
    const total = bets.length;
    const won = bets.filter((b) => b.result === "Vinst");
    const lost = bets.filter((b) => b.result === "Förlust");
    const push = bets.filter((b) => b.result === "Push");
    const profit = bets.reduce((sum, b) => {
      const stake = parseFloat(b.stake);
      const odds = parseFloat(b.odds);
      if (b.result === "Vinst") return sum + (stake * (odds - 1));
      if (b.result === "Push") return sum;
      return sum - stake;
    }, 0);
    const roi = ((profit / bets.reduce((sum, b) => sum + parseFloat(b.stake || 0), 0)) * 100).toFixed(2);

    return { total, won: won.length, lost: lost.length, push: push.length, profit: profit.toFixed(2), roi };
  };

  const stats = getStats();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📘 Spelloggen</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            onChange={handleChange}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            className="border p-2 rounded"
            required={key !== "result"}
          />
        ))}
        <select name="result" value={form.result} onChange={handleChange} className="border p-2 rounded">
          <option value="">Resultat</option>
          <option value="Vinst">Vinst</option>
          <option value="Förlust">Förlust</option>
          <option value="Push">Push</option>
        </select>
        <button type="submit" className="col-span-2 md:col-span-1 bg-pink-500 text-white p-2 rounded">Lägg till spel</button>
      </form>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📊 Statistik</h2>
        <p>Totalt spelade: {stats.total}</p>
        <p>Vunna: {stats.won}</p>
        <p>Förlorade: {stats.lost}</p>
        <p>Push: {stats.push}</p>
        <p>Profit: {stats.profit} kr</p>
        <p>ROI: {stats.roi}%</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">🧾 Dina spel</h2>
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="border p-2">Datum</th>
              <th className="border p-2">Match</th>
              <th className="border p-2">Marknad</th>
              <th className="border p-2">Odds</th>
              <th className="border p-2">Insats</th>
              <th className="border p-2">Resultat</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, i) => (
              <tr key={i}>
                <td className="border p-2">{bet.date}</td>
                <td className="border p-2">{bet.match}</td>
                <td className="border p-2">{bet.market}</td>
                <td className="border p-2">{bet.odds}</td>
                <td className="border p-2">{bet.stake}</td>
                <td className="border p-2">{bet.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
