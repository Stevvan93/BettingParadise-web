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
    bookie: "",
    link: "",
    result: "pending",
  });

  // FILTER STATES
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterLeague, setFilterLeague] = useState("");
  const [filterBookie, setFilterBookie] = useState("alla");

  // Load from localStorage
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
    if (!form.date || !form.team1 || !form.team2 || !form.stake || !form.odds) {
      alert("Fyll i datum, lag, odds och insats.");
      return;
    }
    setBets((p) => [...p, { ...form }]);
    setForm({
      date: "",
      team1: "",
      team2: "",
      league: "",
      betType: "",
      odds: "",
      stake: "",
      bookie: "",
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

  // Derived: unique bookies for dropdown
  const bookieOptions = useMemo(() => {
    const setB = new Set();
    bets.forEach((b) => {
      if (b.bookie && b.bookie.trim()) setB.add(b.bookie.trim());
    });
    return ["alla", ...Array.from(setB)];
  }, [bets]);

  // FILTER LOGIC
  const filteredBets = useMemo(() => {
    return bets.filter((b) => {
      // date filter (dates stored as YYYY-MM-DD)
      if (filterStart) {
        if (!b.date || b.date < filterStart) return false;
      }
      if (filterEnd) {
        if (!b.date || b.date > filterEnd) return false;
      }
      // league text filter
      if (filterLeague) {
        const lower = filterLeague.toLowerCase();
        if (!b.league || !b.league.toLowerCase().includes(lower)) return false;
      }
      // bookie filter
      if (filterBookie && filterBookie !== "alla") {
        if (!b.bookie || b.bookie !== filterBookie) return false;
      }
      return true;
    });
  }, [bets, filterStart, filterEnd, filterLeague, filterBookie]);

  // Stats computed from filteredBets (so stats reflect current filter)
  const stats = useMemo(() => {
    const total = filteredBets.length;
    const won = filteredBets.filter((b) => b.result === "won").length;
    const lost = filteredBets.filter((b) => b.result === "lost").length;
    const voids = filteredBets.filter((b) => b.result === "void").length;
    const pending = filteredBets.filter((b) => b.result === "pending").length;

    const totalStaked = filteredBets.reduce((acc, b) => {
      if (["won", "lost", "void"].includes(b.result)) {
        return acc + Number(b.stake || 0);
      }
      return acc;
    }, 0);

    const profit = filteredBets.reduce((acc, b) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      if (b.result === "won") return acc + stake * (odds - 1);
      if (b.result === "lost") return acc - stake;
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
  }, [filteredBets]);

  // Chart data based on filtered bets (running balance)
  const balanceChartData = useMemo(() => {
    const data = [];
    let running = 0;
    filteredBets.forEach((b, i) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      let change = 0;
      if (b.result === "won") change = stake * (odds - 1);
      else if (b.result === "lost") change = -stake;
      else if (b.result === "void") change = 0;
      running += change;
      data.push({
        name: b.date || `Spel ${i + 1}`,
        balance: Number(running.toFixed(2)),
      });
    });
    return data;
  }, [filteredBets]);

  // Status bar chart (based on filtered)
  const statusChartData = useMemo(() => {
    return [
      { status: "Vinst", count: stats.won },
      { status: "Förlust", count: stats.lost },
      { status: "Void", count: stats.voids },
      { status: "Ej rättad", count: stats.pending },
    ];
  }, [stats]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-pink-600">📘 Spelloggen</h1>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm block mb-1">Från</label>
          <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="text-sm block mb-1">Till</label>
          <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="text-sm block mb-1">Liga (sök)</label>
          <input placeholder="Sök liga..." value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="text-sm block mb-1">Spelbolag</label>
          <select value={filterBookie} onChange={(e) => setFilterBookie(e.target.value)} className="border p-2 rounded w-full">
            {bookieOptions.map((b) => (
              <option key={b} value={b}>{b === "alla" ? "Alla" : b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={addBet} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input name="date" type="date" value={form.date} onChange={handleFormChange} className="border p-2 rounded" required />
        <input name="team1" placeholder="Hemmalag" value={form.team1} onChange={handleFormChange} className="border p-2 rounded" required />
        <input name="team2" placeholder="Bortalag" value={form.team2} onChange={handleFormChange} className="border p-2 rounded" required />
        <input name="league" placeholder="Liga/Turnering" value={form.league} onChange={handleFormChange} className="border p-2 rounded" />

        <input name="betType" placeholder="Spel / Marknad" value={form.betType} onChange={handleFormChange} className="border p-2 rounded md:col-span-2" />
        <input name="odds" placeholder="Odds (t.ex. 2.10)" value={form.odds} onChange={handleFormChange} className="border p-2 rounded" type="number" step="0.01" />
        <input name="stake" placeholder="Insats (kr)" value={form.stake} onChange={handleFormChange} className="border p-2 rounded" type="number" />
        <input name="bookie" placeholder="Spelbolag" value={form.bookie} onChange={handleFormChange} className="border p-2 rounded md:col-span-3" />
        <input name="link" placeholder="Länk (till spel)" value={form.link} onChange={handleFormChange} className="border p-2 rounded md:col-span-3" />
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded md:col-span-1">
          Lägg till spel
        </button>
      </form>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Totalt spel (filter)</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Totalt staked (settled)</div>
          <div className="text-2xl font-bold">{stats.totalStaked} kr</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Profit (filter)</div>
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
            <p className="text-sm text-gray-500">Inga registrerade resultat i vyn ännu — diagram visas när spel rättas.</p>
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
        {filteredBets.map((b, i) => (
          <div key={i} className="bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-2 md:mb-0">
              <div className="font-semibold">{b.team1} vs {b.team2} <span className="text-sm text-gray-500">({b.league})</span></div>
              <div className="text-sm text-gray-600">Spel: {b.betType || "-"} • Odds: {b.odds} • Insats: {b.stake} kr • Bookie: {b.bookie || "-"}</div>
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
                onChange={(e) => {
                  // find original index in bets array (not filtered index)
                  const originalIndex = bets.findIndex(bb => bb === b);
                  if (originalIndex !== -1) updateResult(originalIndex, e.target.value);
                }}
              >
                <option value="pending">Ej rättad</option>
                <option value="won">Vinst</option>
                <option value="lost">Förlust</option>
                <option value="void">Void</option>
              </select>

              <button
                onClick={() => {
                  const originalIndex = bets.findIndex(bb => bb === b);
                  if (originalIndex !== -1) deleteBet(originalIndex);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Ta bort
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Notera: <strong>Void</strong> betyder att insatsen återbetalas — ingen vinst eller förlust räknas. Void räknas i totalantal spel i vyn men påverkar inte ROI eller win-rate.
      </div>
    </div>
  );
}
