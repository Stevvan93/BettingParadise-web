import { useState } from 'react';

export default function Spelloggen() {
  const [bets, setBets] = useState([
    {
      date: '2025-08-04',
      match: 'Man United - Arsenal',
      market: 'Över 2.5 mål',
      odds: 1.95,
      stake: 500,
      result: 'Vinst'
    }
  ]);

  const [newBet, setNewBet] = useState({
    date: '',
    match: '',
    market: '',
    odds: '',
    stake: '',
    result: 'Vinst'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBet((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBet = (e) => {
    e.preventDefault();
    setBets((prev) => [...prev, newBet]);
    setNewBet({
      date: '',
      match: '',
      market: '',
      odds: '',
      stake: '',
      result: 'Vinst'
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-pink-500">📘 Spelloggen</h1>
      <p className="mb-6">Lägg till och följ dina spel.</p>

      {/* Formulär */}
      <form onSubmit={handleAddBet} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-pink-50 p-4 rounded-xl shadow">
        <input type="date" name="date" value={newBet.date} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="match" placeholder="Match" value={newBet.match} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="market" placeholder="Marknad" value={newBet.market} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" name="odds" placeholder="Odds" value={newBet.odds} onChange={handleChange} className="p-2 border rounded" step="0.01" required />
        <input type="number" name="stake" placeholder="Insats (kr)" value={newBet.stake} onChange={handleChange} className="p-2 border rounded" required />
        <select name="result" value={newBet.result} onChange={handleChange} className="p-2 border rounded">
          <option value="Vinst">Vinst</option>
          <option value="Förlust">Förlust</option>
        </select>
        <button type="submit" className="md:col-span-3 bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition">
          Lägg till spel
        </button>
      </form>

      {/* Tabell */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-pink-100 text-pink-800">
            <tr>
              <th className="text-left px-4 py-3">Datum</th>
              <th className="text-left px-4 py-3">Match</th>
              <th className="text-left px-4 py-3">Marknad</th>
              <th className="text-left px-4 py-3">Odds</th>
              <th className="text-left px-4 py-3">Insats</th>
              <th className="text-left px-4 py-3">Resultat</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, index) => (
              <tr key={index} className="border-b hover:bg-pink-50">
                <td className="px-4 py-2">{bet.date}</td>
                <td className="px-4 py-2">{bet.match}</td>
                <td className="px-4 py-2">{bet.market}</td>
                <td className="px-4 py-2">{bet.odds}</td>
                <td className="px-4 py-2">{bet.stake} kr</td>
                <td className={`px-4 py-2 font-semibold ${bet.result === 'Vinst' ? 'text-green-600' : 'text-red-500'}`}>
                  {bet.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
