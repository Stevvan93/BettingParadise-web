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
} from "recharts";

const STORAGE_KEY = "bettingparadise_spelloggen_v3";

export default function Spelloggen() {
  const [bets, setBets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters (kept simple)
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
      console.warn("Could not read localStorage:", e);
    }
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }, [bets]);

  // Add bet helper
  const addBet = (bet) => {
    const record = {
      ...bet,
      id: Date.now(),
      odds: Number(bet.odds),
      stake: Number(bet.stake),
      result: "pending",
      voidAmount: "", // only used when result is void and edited
    };
    setBets((p) => [...p, record]);
  };

  // Edit/save helper
  const saveEdit = (index, updated) => {
    setBets((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        ...updated,
        odds: Number(updated.odds),
        stake: Number(updated.stake),
        voidAmount:
          updated.result === "void"
            ? updated.voidAmount === "" || updated.voidAmount === null
              ? 0
              : Number(updated.voidAmount)
            : "",
      };
      return copy;
    });
  };

  // Delete
  const deleteBet = (index) => {
    if (!confirm("Ta bort detta spel?")) return;
    setBets((p) => p.filter((_, i) => i !== index));
  };

  // Unique bookies for filter dropdown
  const bookieOptions = useMemo(() => {
    const setB = new Set();
    bets.forEach((b) => {
      if (b.bookie && b.bookie.toString().trim()) setB.add(b.bookie.toString().trim());
    });
    return ["alla", ...Array.from(setB)];
  }, [bets]);

  // Filter logic
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
        // voidAmount used when provided; else 0
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

  // Chart data - running balance in order of filteredBets
  const chartData = useMemo(() => {
    const data = [];
    let running = 0;
    filteredBets.forEach((b, idx) => {
      const stake = Number(b.stake || 0);
      const odds = Number(b.odds || 0);
      let change = 0;
      if (b.result === "won") change = stake * (odds - 1);
      else if (b.result === "lost") change = -stake;
      else if (b.result === "void") change = b.voidAmount !== "" && b.voidAmount !== undefined ? Number(b.voidAmount) : 0;
      running += change;
      data.push({
        name: b.date || `Spel ${idx + 1}`,
        balance: Number(running.toFixed(2)),
        status: b.result,
      });
    });
    return data;
  }, [filteredBets]);

  // helper for status label
  const statusInfo = (res) => {
    if (res === "won") return { text: "Vinst", color: "text-green-700", bg: "bg-green-50" };
    if (res === "lost") return { text: "Förlust", color: "text-red-700", bg: "bg-red-50" };
    if (res === "void") return { text: "Void", color: "text-gray-800", bg: "bg-gray-100" };
    return { text: "Ej rättad", color: "text-yellow-700", bg: "bg-yellow-50" };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pink-600">📘 Spelloggen</h1>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="border px-2 py-1 rounded" />
            <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="border px-2 py-1 rounded" />
            <input placeholder="Sök liga..." value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="border px-2 py-1 rounded" />
            <select value={filterBookie} onChange={(e) => setFilterBookie(e.target.value)} className="border px-2 py-1 rounded">
              {bookieOptions.map((b) => (
                <option key={b} value={b}>
                  {b === "alla" ? "Alla spelbolag" : b}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded shadow"
          >
            ➕ Lägg till nytt spel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Bets list */}
        <div>
          {filteredBets.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-600">Inga spel i vyn ännu — lägg till ett spel ovan.</div>
          ) : (
            <div className="space-y-3">
              {filteredBets.map((b, idx) => {
                const s = statusInfo(b.result);
                // find original index in bets array for actions (since filteredBets is subset)
                const originalIndex = bets.findIndex((bb) => bb.id === b.id);
                return (
                  <div key={b.id} className={`bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between ${b.result === "void" ? "opacity-95" : ""}`}>
                    <div className="mb-3 md:mb-0">
                      <div className="font-semibold text-lg">
                        {b.team1} <span className="text-sm text-gray-400">vs</span> {b.team2}
                        <span className="ml-2 text-sm text-gray-500">({b.league || "-"})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {b.betType || "-"} • Odds: {b.odds} • Insats: {b.stake} kr • {b.bookie || "-"}
                      </div>
                      {b.link && (
                        <div className="mt-1">
                          <a href={b.link} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Till spel</a>
                        </div>
                      )}
                      {b.comment && <div className="mt-1 text-sm text-gray-500">Kommentar: {b.comment}</div>}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded text-sm ${s.bg} ${s.color}`}>{s.text}</div>
                      <button onClick={() => { setEditIndex(originalIndex); setShowEditModal(true); setEditIndex(originalIndex); }} className="text-sm text-blue-600 hover:underline">Redigera</button>
                      <button onClick={() => deleteBet(originalIndex)} className="text-sm text-red-600 hover:underline">Ta bort</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Stats + Chart */}
        <div>
          <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-500">Totalt (i vyn)</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Totalt staked (settled)</div>
              <div className="text-2xl font-bold">{stats.totalStaked} kr</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Profit</div>
              <div className="text-2xl font-bold">{stats.profit} kr</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ROI</div>
              <div className="text-2xl font-bold">{stats.roi} %</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Vunna</div>
              <div className="text-xl font-semibold text-green-600">{stats.won}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Förlorade</div>
              <div className="text-xl font-semibold text-red-600">{stats.lost}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Void</div>
              <div className="text-xl font-semibold text-gray-700">{stats.voids}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Win rate</div>
              <div className="text-xl font-semibold">{stats.winRate} %</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-3">Saldo över tid</h4>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500">Diagram visas när du har rättade spel (Vinst/Förlust/Void).</p>
            ) : (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="balance" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddEditModal
          mode="add"
          initial={null}
          onClose={() => setShowAddModal(false)}
          onSave={(obj) => {
            addBet(obj);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editIndex !== null && (
        <AddEditModal
          mode="edit"
          initial={bets[editIndex]}
          onClose={() => {
            setShowEditModal(false);
            setEditIndex(null);
          }}
          onSave={(obj) => {
            saveEdit(editIndex, obj);
            setShowEditModal(false);
            setEditIndex(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------- Modal component for Add/Edit ---------- */
function AddEditModal({ mode = "add", initial, onClose, onSave }) {
  const [local, setLocal] = useState(
    initial || {
      date: new Date().toISOString().slice(0, 10),
      team1: "",
      team2: "",
      league: "",
      betType: "",
      odds: "",
      stake: "",
      bookie: "",
      link: "",
      comment: "",
      result: "pending", // pending | won | lost | void
      voidAmount: "",
    }
  );

  useEffect(() => {
    if (initial) setLocal(initial);
  }, [initial]);

  const update = (k, v) => setLocal((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    // basic validation
    if (!local.team1 || !local.team2 || local.odds === "" || local.stake === "") {
      alert("Fyll i båda lagen, odds och insats.");
      return;
    }
    // normalize numbers
    const out = {
      ...local,
      odds: Number(local.odds),
      stake: Number(local.stake),
      voidAmount:
        local.result === "void" ? (local.voidAmount === "" || local.voidAmount === null ? 0 : Number(local.voidAmount)) : "",
    };
    onSave(out);
  };

  // modal animation classes: backdrop & panel
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 transform transition-all animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{mode === "add" ? "Lägg till nytt spel" : "Redigera spel"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Avbryt</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="date" value={local.date} onChange={(e) => update("date", e.target.value)} className="border p-2 rounded" />
          <input placeholder="Hemmalag" value={local.team1} onChange={(e) => update("team1", e.target.value)} className="border p-2 rounded" />
          <input placeholder="Bortalag" value={local.team2} onChange={(e) => update("team2", e.target.value)} className="border p-2 rounded" />
          <input placeholder="Liga/Turnering" value={local.league} onChange={(e) => update("league", e.target.value)} className="border p-2 rounded" />
          <input placeholder="Spel / Marknad" value={local.betType} onChange={(e) => update("betType", e.target.value)} className="border p-2 rounded md:col-span-2" />
          <input placeholder="Odds (t.ex. 2.10)" value={local.odds} onChange={(e) => update("odds", e.target.value)} type="number" step="0.01" className="border p-2 rounded" />
          <input placeholder="Insats (kr)" value={local.stake} onChange={(e) => update("stake", e.target.value)} type="number" className="border p-2 rounded" />
          <input placeholder="Bookie" value={local.bookie} onChange={(e) => update("bookie", e.target.value)} className="border p-2 rounded" />
          <input placeholder="Länk (till spel)" value={local.link} onChange={(e) => update("link", e.target.value)} className="border p-2 rounded md:col-span-2" />
          <textarea placeholder="Kommentar (valfritt)" value={local.comment} onChange={(e) => update("comment", e.target.value)} className="border p-2 rounded md:col-span-2" />

          <div className="col-span-2">
            <label className="block text-sm mb-1">Resultat (rätta i efterhand)</label>
            <select value={local.result} onChange={(e) => update("result", e.target.value)} className="border p-2 rounded w-full">
              <option value="pending">Ej rättad</option>
              <option value="won">Vinst</option>
              <option value="lost">Förlust</option>
              <option value="void">Void</option>
            </select>
          </div>

          {local.result === "void" && (
            <div className="col-span-2">
              <label className="block text-sm mb-1">Void - ange belopp (positivt eller negativt)</label>
              <input
                value={local.voidAmount}
                onChange={(e) => update("voidAmount", e.target.value)}
                placeholder="t.ex. 0 eller -25 eller 15"
                type="number"
                step="0.01"
                className="border p-2 rounded w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Skriv 0 för full återbetalning, -10 för minus, 10 för plus.</p>
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

/* Small css-in-js for animation (Tailwind doesn't include animate-fade-in by default) */
/* If you use a global CSS file you can add:
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px) scale(.99);} to { opacity:1; transform: translateY(0) scale(1);} }
.animate-fade-in { animation: fadeIn .18s ease-out; }
*/
