// pages/grupper.js

export default function Grupper() {
  return (
    <div className="bg-white min-h-screen px-4 py-10 font-sans">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-12">Våra Premiumgrupper</h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Bet365 Premium */}
        <div className="bg-pink-100 rounded-xl p-6 shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2">🎯 Bet365 Premium</h2>
          <p className="mb-4 text-gray-700">Dagliga speltips för Bet365 med hög ROI. Exklusivt innehåll för medlemmar.</p>
          <ul className="mb-4 list-disc list-inside text-sm text-gray-600">
            <li>Dagliga tips via Telegram</li>
            <li>Statistik och analyser</li>
            <li>Support 24/7</li>
          </ul>
          <p className="text-lg font-bold">299 kr / månad</p>
          <button className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-pink-600 transition">Gå med</button>
        </div>

        {/* Paradise Premium */}
        <div className="bg-pink-100 rounded-xl p-6 shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2">🌴 Paradise Premium</h2>
          <p className="mb-4 text-gray-700">Flera speltips per dag från olika bolag. Perfekt för dig som vill maximera din betting.</p>
          <ul className="mb-4 list-disc list-inside text-sm text-gray-600">
            <li>Tips från 3+ spelsajter</li>
            <li>Inkluderar Value & Arbitrage</li>
            <li>Telegram + Discord-kanal</li>
          </ul>
          <p className="text-lg font-bold">249 kr / månad</p>
          <button className="mt-4 bg-pink-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-pink-600 transition">Gå med</button>
        </div>
      </div>
    </div>
  );
}
