// pages/index.js

export default function Home() {
  return (
    <div className="bg-pink-50 min-h-screen font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <div className="text-2xl font-bold text-pink-500">BettingParadise</div>
        <div className="space-x-4 hidden md:flex">
          <a href="#" className="hover:text-pink-500">Hem</a>
          <a href="#grupper" className="hover:text-pink-500">Grupper</a>
          <a href="#airbitrage" className="hover:text-pink-500">Airbitrage</a>
          <a href="#kontakt" className="hover:text-pink-500">Kontakt</a>
          <a href="#login" className="hover:text-pink-500">Logga in</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="text-center py-24 px-4 bg-gradient-to-br from-pink-100 to-white">
        <h1 className="text-5xl font-bold text-pink-600 mb-4">Dina bästa speltips på ett ställe</h1>
        <p className="text-lg max-w-xl mx-auto mb-6">Följ experter, gå med i premiumgrupper och använd vårt arbitrageverktyg för att maximera din betting.</p>
        <button className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">Gå med nu</button>
      </header>

      {/* Grupper */}
      <section id="grupper" className="py-16 px-4 bg-white">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-10">Våra Premiumgrupper</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-pink-100 p-6 rounded-xl shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">🎯 Bet365 Premium</h3>
            <p className="mb-4">Få dagliga spel från Bet365 med hög vinstprocent.</p>
            <p className="font-bold text-lg">299 kr / månad</p>
          </div>
          <div className="bg-pink-100 p-6 rounded-xl shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">🌴 Paradise Premium</h3>
            <p className="mb-4">Vår exklusiva kanal med speltips från flera bolag.</p>
            <p className="font-bold text-lg">249 kr / månad</p>
          </div>
        </div>
      </section>

      {/* Airbitrage */}
      <section id="airbitrage" className="py-16 px-4 bg-pink-50">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">Airbitrage-verktyget</h2>
        <p className="max-w-2xl mx-auto text-center mb-10">Analysera odds och hitta riskfria vinster automatiskt. Vårt verktyg scannar flera spelbolag i realtid.</p>
        <div className="text-center">
          <button className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">Prova gratis i 7 dagar</button>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="py-16 px-4 bg-white">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">Kontakta oss</h2>
        <form className="max-w-xl mx-auto grid gap-4">
          <input type="text" placeholder="Namn" className="p-3 border rounded" required />
          <input type="email" placeholder="E-post" className="p-3 border rounded" required />
          <textarea rows="4" placeholder="Meddelande" className="p-3 border rounded" required></textarea>
          <button type="submit" className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition">Skicka</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-6 text-gray-600 bg-pink-100">
        &copy; 2025 BettingParadise. Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}
