// pages/spelloggen.js
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const STORAGE_KEY = "spelloggen_bets_v1";

export default function Spelloggen() {
  const [bets, setBets] = useState([]);
  const [form, setForm] = useState({
    date: "",
    team1: "",
    team2: "",
    league: "",
    betType: "",
    odds: "",
    stake: "",
    link: "",
    result: "pending", // pending | won | lost | void
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBets(JSON.parse(raw));
    } catch (e) {
      console.warn("Kunde inte läsa localStorage:", e);
    }
  }, []);

  // Save on bets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
    } catch (e) {
      console.warn("Kunde inte skriva localStorage:", e);
    }
  }, [bets]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const addBet = (e) => {
    e.preventDefault();
    // basic validation
    if (!form.date || !form.team1 || !form.team2 || !form.stake || !form.odds) {
      alert("Fyll i datum, lag, odds och insats.");
      return;
    }
    // push new bet (clone)
    setBets((p) => [...p, { ...form }]);
    setForm({
      date: "",
      team1: "",
      team2: "",
      league: "",
      betType: "",
      odds: "",
      stake: "",
      link: "",
      result: "pending",
    });
  };

  const updateResult = (index, newResult) => {
    setBets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], result: newResult };
      return copy;
    });
  };

  const deleteBet = (index) => {
    if (!confirm("Ta bort detta spel?")) return;
    setBets((prev) => prev.filter((_, i) => i !== index));
  };

  // Stats: total staked (only settled bets), total profit (won + lost only),
  // win rate excludes voids, pending excluded from settled
  const stats = useMemo(() => {
    const total = bets.length;
    const won = bets.filter((b) => b.result === "won").length;
    const lost = bets.filter((b) => b.result === "lost").length;
    const voids = bets.filter((b) => b.result === "void").length;
    const pending = bets.filter((b) => b.result === "pending").length;

    const totalStaked = bets.reduce((acc, b) => {
      // stake counts only for bets that are settled (won/lost/void)
      if (["won", "lost", "void"].includes(b.result)) {
        return acc + Number(b.stake || 0);
      }
      return acc;
    }, 0);

    const profit = bets.reduce((acc, b) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      if (b.result === "won") return acc + stake * (odds - 1);
      if (b.result === "lost") return acc - stake;
      if (b.result === "void") return acc + 0; // no change
      return acc;
    }, 0);

    const roi = totalStaked ? ((profit / totalStaked) * 100).toFixed(2) : "0.00";
    const winRate = won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(2) : "0.00";

    return {
      total,
      won,
      lost,
      voids,
      pending,
      totalStaked,
      profit: Number(profit.toFixed(2)),
      roi,
      winRate,
    };
  }, [bets]);

  // Chart data: running balance (include only settled change per bet in order)
  const balanceChartData = useMemo(() => {
    const data = [];
    let running = 0;
    bets.forEach((b, i) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      let change = 0;
      if (b.result === "won") change = stake * (odds - 1);
      else if (b.result === "lost") change = -stake;
      else if (b.result === "void") change = 0;
      // pending: change 0 until corrected
      running += change;
      data.push({
        name: b.date || `Spel ${i + 1}`,
        balance: Number(running.toFixed(2)),
      });
    });
    return data;
  }, [bets]);

  // Bar chart data: counts per status (won/lost/void/pending)
  const statusChartData = useMemo(() => {
    const { won, lost, voids, pending } = stats;
    return [
      { status: "Vinst", count: won },
      { status: "Förlust", count: lost },
      { status: "Void", count: voids },
      { status: "Ej rättad", count: pending },
    ];
  }, [stats]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-pink-600">📘 Spelloggen</h1>

      {/* Form */}
      <form onSubmit={addBet} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleFormChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="team1"
          placeholder="Hemmalag"
          value={form.team1}
          onChange={handleFormChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="team2"
          placeholder="Bortalag"
          value={form.team2}
          onChange={handleFormChange}
          className="border p-2 rounded"
          required
        />
        <input name="league" placeholder="Liga/Turnering" value={form.league} onChange={handleFormChange} className="border p-2 rounded" />

        <input name="betType" placeholder="Spel / Marknad" value={form.betType} onChange={handleFormChange} className="border p-2 rounded md:col-span-2" />
        <input name="odds" placeholder="Odds (t.ex. 2.10)" value={form.odds} onChange={handleFormChange} className="border p-2 rounded" type="number" step="0.01" />
        <input name="stake" placeholder="Insats (kr)" value={form.stake} onChange={handleFormChange} className="border p-2 rounded" type="number" />
        <input name="link" placeholder="Länk (till spel)" value={form.link} onChange={handleFormChange} className="border p-2 rounded md:col-span-3" />
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded md:col-span-1">
          Lägg till spel
        </button>
      </form>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Totalt spel</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Totalt staked</div>
          <div className="text-2xl font-bold">{stats.totalStaked} kr</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Profit</div>
          <div className="text-2xl font-bold">{stats.profit} kr</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">ROI</div>
          <div className="text-2xl font-bold">{stats.roi} %</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Saldo över tid</h3>
          {balanceChartData.length === 0 ? (
            <p className="text-sm text-gray-500">Inga registrerade resultat ännu — diagram visas när du rättar spel.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={balanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Resultat - fördelning</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bet list */}
      <div className="space-y-3">
        {bets.map((b, i) => (
          <div key={i} className="bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-2 md:mb-0">
              <div className="font-semibold">{b.team1} vs {b.team2} <span className="text-sm text-gray-500">({b.league})</span></div>
              <div className="text-sm text-gray-600">Spel: {b.betType || "-"} • Odds: {b.odds} • Insats: {b.stake} kr</div>
              {b.link && (
                <div className="mt-1">
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Till spel</a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                className="border p-2 rounded"
                value={b.result || "pending"}
                onChange={(e) => updateResult(i, e.target.value)}
              >
                <option value="pending">Ej rättad</option>
                <option value="won">Vinst</option>
                <option value="lost">Förlust</option>
                <option value="void">Void</option>
              </select>

              <button onClick={() => deleteBet(i)} className="text-sm text-red-600 hover:underline">Ta bort</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Notera: <strong>Void</strong> betyder att insatsen återbetalas — ingen vinst eller förlust räknas. Void räknas i totalantal spel men påverkar inte ROI eller win-rate.
      </div>
    </div>
  );
}
