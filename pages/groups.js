// pages/groups.js
export default function Grupper() {
  return (
    <div className="bg-white min-h-screen px-4 py-10 font-sans">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-12">
        Våra Premiumgrupper
      </h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Bet365 Premium */}
        <div className="bg-pink-100 rounded-xl p-6 shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2">🎯 Bet365 Premium</h2>
          <p className="mb-4 text-gray-700">
            Få dagliga spel från Bet365 med hög vinstprocent.
          </p>
          <ul className="mb-4 list-disc list-inside text-sm text-gray-600">
            <li>Dagliga tips via Telegram</li>
            <li>Statistik och analyser</li>
            <li>Support 24/7</li>
          </ul>
          <p className="text-lg font-bold mb-4">299 kr / månad</p>
          <button className="bg-pink-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-pink-600 transition">
            Gå med i Bet365 Premium
          </button>
        </div>

        {/* Paradise Premium */}
        <div className="bg-pink-100 rounded-xl p-6 shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-2">🌴 Paradise Premium</h2>
          <p className="mb-4 text-gray-700">
            Vår exklusiva kanal med speltips från flera bolag.
          </p>
          <ul className="mb-4 list-disc list-inside text-sm text-gray-600">
            <li>Tips från 3+ spelbolag</li>
            <li>Hög ROI & verifierad historik</li>
            <li>Live-spel & specialare</li>
          </ul>
          <p className="text-lg font-bold mb-4">249 kr / månad</p>
          <button className="bg-pink-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-pink-600 transition">
            Gå med i Paradise Premium
          </button>
        </div>
      </div>
    </div>
  );
}
