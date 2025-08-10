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

const STORAGE_KEY = "spelloggen_v2_data";

export default function Spelloggen() {
  // Bets state
  const [bets, setBets] = useState([]);
  // Form for new bet
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
    result: "pending", // pending | won | lost | void
    voidAmount: "", // only used when editing/void
  });

  // Modal state for editing a bet
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters (keeps same as before if you used them)
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterLeague, setFilterLeague] = useState("");
  const [filterBookie, setFilterBookie] = useState("alla");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBets(JSON.parse(raw));
    } catch (e) {
      console.warn("Kunde inte läsa localStorage:", e);
    }
  }, []);

  // Save to localStorage when bets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
    } catch (e) {
      console.warn("Kunde inte skriva localStorage:", e);
    }
  }, [bets]);

  // handle form change for new bet
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Add a new bet
  const addBet = (e) => {
    e.preventDefault();
    if (!form.date || !form.team1 || !form.team2 || !form.stake || !form.odds) {
      alert("Fyll i datum, båda lag, odds och insats.");
      return;
    }
    const newBet = {
      ...form,
      id: Date.now(),
      odds: Number(form.odds),
      stake: Number(form.stake),
      result: "pending",
      voidAmount: "", // default empty
    };
    setBets((p) => [...p, newBet]);
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
      voidAmount: "",
    });
  };

  // Open edit modal for a bet index
  const openEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...bets[index] });
    setShowModal(true);
  };

  // Save edits from modal
  const saveEdit = (updated) => {
    setBets((prev) => {
      const copy = [...prev];
      // normalize fields
      copy[editIndex] = {
        ...copy[editIndex],
        ...updated,
        odds: Number(updated.odds),
        stake: Number(updated.stake),
        voidAmount: updated.voidAmount === "" ? "" : Number(updated.voidAmount),
      };
      return copy;
    });
    setShowModal(false);
    setEditIndex(null);
    setEditData(null);
  };

  // Delete a bet
  const deleteBet = (index) => {
    if (!confirm("Ta bort detta spel?")) return;
    setBets((p) => p.filter((_, i) => i !== index));
  };

  // Derived unique bookies for filter dropdown
  const bookieOptions = useMemo(() => {
    const s = new Set();
    bets.forEach((b) => {
      if (b.bookie && b.bookie.trim()) s.add(b.bookie.trim());
    });
    return ["alla", ...Array.from(s)];
  }, [bets]);

  // Filtering logic
  const filteredBets = useMemo(() => {
    return bets.filter((b) => {
      if (filterStart && (!b.date || b.date < filterStart)) return false;
      if (filterEnd && (!b.date || b.date > filterEnd)) return false;
      if (filterLeague && (!b.league || !b.league.toLowerCase().includes(filterLeague.toLowerCase()))) return false;
      if (filterBookie && filterBookie !== "alla" && b.bookie !== filterBookie) return false;
      return true;
    });
  }, [bets, filterStart, filterEnd, filterLeague, filterBookie]);

  // Stats based on filtered bets
  const stats = useMemo(() => {
    const total = filteredBets.length;
    const won = filteredBets.filter((b) => b.result === "won").length;
    const lost = filteredBets.filter((b) => b.result === "lost").length;
    const voids = filteredBets.filter((b) => b.result === "void").length;
    const pending = filteredBets.filter((b) => b.result === "pending").length;

    const totalStaked = filteredBets.reduce((acc, b) => {
      if (["won", "lost", "void"].includes(b.result)) return acc + Number(b.stake || 0);
      return acc;
    }, 0);

    const profit = filteredBets.reduce((acc, b) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      if (b.result === "won") return acc + stake * (odds - 1);
      if (b.result === "lost") return acc - stake;
      if (b.result === "void") {
        // If voidAmount specified, use it; else treat as 0
        const v = b.voidAmount !== "" && b.voidAmount !== undefined ? Number(b.voidAmount) : 0;
        return acc + v;
      }
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

  // Chart data: running balance based on filtered bets in order of appearance
  const balanceChartData = useMemo(() => {
    const data = [];
    let running = 0;
    filteredBets.forEach((b, i) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      let change = 0;
      if (b.result === "won") change = stake * (odds - 1);
      else if (b.result === "lost") change = -stake;
      else if (b.result === "void") {
        change = b.voidAmount !== "" && b.voidAmount !== undefined ? Number(b.voidAmount) : 0;
      } // pending => 0
      running += change;
      data.push({
        name: b.date || `Spel ${i + 1}`,
        balance: Number(running.toFixed(2)),
        change,
        status: b.result,
      });
    });
    return data;
  }, [filteredBets]);

  const statusChartData = useMemo(() => {
    return [
      { status: "Vinst", count: stats.won },
      { status: "Förlust", count: stats.lost },
      { status: "Void", count: stats.voids },
      { status: "Ej rättad", count: stats.pending },
    ];
  }, [stats]);

  // small helper for status color
  const statusLabel = (r) => {
    if (r === "won") return { text: "Vinst", color: "text-green-600", bg: "bg-green-50" };
    if (r === "lost") return { text: "Förlust", color: "text-red-600", bg: "bg-red-50" };
    if (r === "void") return { text: "Void", color: "text-gray-700", bg: "bg-gray-100" };
    return { text: "Ej rättad", color: "text-gray-500", bg: "bg-yellow-50" };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-pink-600">📘 Spelloggen</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="border p-2 rounded" />
        <input placeholder="Sök liga..." value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="border p-2 rounded" />
        <select value={filterBookie} onChange={(e) => setFilterBookie(e.target.value)} className="border p-2 rounded">
          {bookieOptions.map((b) => (
            <option key={b} value={b}>
              {b === "alla" ? "Alla spelbolag" : b}
            </option>
          ))}
        </select>
      </div>

      {/* Add new bet form */}
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
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded md:col-span-1">Lägg till spel</button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Totalt (i vyn)</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Totalt staked (settled)</div>
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
            <p className="text-sm text-gray-500">Inga rättade spel i vyn än — diagram visas när du rättar spel.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={balanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
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

      {/* Bets list */}
      <div className="space-y-3">
        {filteredBets.map((b, idx) => {
          const { text, color, bg } = statusLabel(b.result);
          return (
            <div key={b.id || idx} className={`bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between ${b.result === "void" ? "opacity-95" : ""}`}>
              <div className="mb-2 md:mb-0">
                <div className="font-semibold">
                  {b.team1} <span className="text-sm text-gray-500">vs</span> {b.team2}
                  <span className="ml-2 text-sm text-gray-400">({b.league || "-"})</span>
                </div>
                <div className="text-sm text-gray-600">
                  {b.betType || "-"} • Odds: {b.odds} • Insats: {b.stake} kr • Bookie: {b.bookie || "-"}
                </div>
                {b.link && (
                  <div className="mt-1">
                    <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Till spel</a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded text-sm ${bg} ${color}`}>{text}</div>
                <button onClick={() => openEdit(bets.findIndex(bb => bb === b))} className="text-sm text-blue-600 hover:underline">Redigera</button>
                <button onClick={() => deleteBet(bets.findIndex(bb => bb === b))} className="text-sm text-red-600 hover:underline">Ta bort</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Notera: Void kan vara positivt, 0 eller negativt beroende på vad du anger vid rättning (t.ex. -0.5 vid vissa Asian handicap). Void-värdet räknas in i profit/ROI.
      </div>

      {/* EDIT MODAL */}
      {showModal && editData && (
        <EditModal
          initial={editData}
          onClose={() => {
            setShowModal(false);
            setEditIndex(null);
            setEditData(null);
          }}
          onSave={(updated) => saveEdit(updated)}
        />
      )}
    </div>
  );
}

// Modal component (inner)
function EditModal({ initial, onClose, onSave }) {
  const [local, setLocal] = useState({
    odds: initial.odds,
    stake: initial.stake,
    result: initial.result || "pending",
    voidAmount: initial.voidAmount !== undefined ? initial.voidAmount : "",
    date: initial.date || "",
    team1: initial.team1 || "",
    team2: initial.team2 || "",
    league: initial.league || "",
    betType: initial.betType || "",
    bookie: initial.bookie || "",
    link: initial.link || "",
  });

  const handle = (k, v) => setLocal((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    // basic validation
    if (!local.team1 || !local.team2 || !local.odds || local.stake === "") {
      alert("Fyll i lag, odds och insats.");
      return;
    }
    // if void chosen but voidAmount empty, default to 0
    const out = {
      ...initial,
      odds: Number(local.odds),
      stake: Number(local.stake),
      result: local.result,
      voidAmount: local.result === "void" ? (local.voidAmount === "" ? 0 : Number(local.voidAmount)) : "",
      date: local.date,
      team1: local.team1,
      team2: local.team2,
      league: local.league,
      betType: local.betType,
      bookie: local.bookie,
      link: local.link,
    };
    onSave(out);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative z-10 transform transition-all">
        <h3 className="text-lg font-semibold mb-3">Redigera spel</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={local.date} onChange={(e) => handle("date", e.target.value)} type="date" className="border p-2 rounded" />
          <input value={local.team1} onChange={(e) => handle("team1", e.target.value)} placeholder="Hemmalag" className="border p-2 rounded" />
          <input value={local.team2} onChange={(e) => handle("team2", e.target.value)} placeholder="Bortalag" className="border p-2 rounded" />
          <input value={local.league} onChange={(e) => handle("league", e.target.value)} placeholder="Liga" className="border p-2 rounded" />
          <input value={local.betType} onChange={(e) => handle("betType", e.target.value)} placeholder="Spel / Marknad" className="border p-2 rounded md:col-span-2" />
          <input value={local.odds} onChange={(e) => handle("odds", e.target.value)} placeholder="Odds" type="number" step="0.01" className="border p-2 rounded" />
          <input value={local.stake} onChange={(e) => handle("stake", e.target.value)} placeholder="Insats (kr)" type="number" className="border p-2 rounded" />
          <input value={local.bookie} onChange={(e) => handle("bookie", e.target.value)} placeholder="Bookie" className="border p-2 rounded" />
          <input value={local.link} onChange={(e) => handle("link", e.target.value)} placeholder="Länk" className="border p-2 rounded md:col-span-2" />

          <div className="col-span-2">
            <label className="block mb-1 text-sm font-medium">Resultat</label>
            <select value={local.result} onChange={(e) => handle("result", e.target.value)} className="border p-2 rounded w-full">
              <option value="pending">Ej rättad</option>
              <option value="won">Vinst</option>
              <option value="lost">Förlust</option>
              <option value="void">Void</option>
            </select>
          </div>

          {local.result === "void" && (
            <div className="col-span-2">
              <label className="block mb-1 text-sm font-medium">Void - ange belopp (positivt eller negativt)</label>
              <input
                value={local.voidAmount}
                onChange={(e) => handle("voidAmount", e.target.value)}
                placeholder="t.ex. 0 eller -25 eller 15"
                className="border p-2 rounded w-full"
                type="number"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Skriv t.ex. 0 för full återbetalning, -10 för minus, 10 för plus.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded border">Avbryt</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">Spara</button>
        </div>
      </div>
    </div>
  );
}
