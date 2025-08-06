// NY KOD – startsida med navbar, hero, grupper, spelloggen, kontakt och footer
export default function Home() {
  return (
    <div className="bg-pink-50 min-h-screen font-sans">
      <nav className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <div className="text-2xl font-bold text-pink-500">BettingParadise</div>
        <div className="space-x-4 hidden md:flex">
          <a href="#" className="hover:text-pink-500">Hem</a>
          <a href="#grupper" className="hover:text-pink-500">Grupper</a>
          <a href="#spelloggen" className="hover:text-pink-500">Spelloggen</a>
          <a href="#kontakt" className="hover:text-pink-500">Kontakt</a>
          <a href="#login" className="hover:text-pink-500">Logga in</a>
        </div>
      </nav>

      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-4">Välkommen till BettingParadise</h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
          Bli en del av Sveriges mest pålitliga betting-community. Gå med i våra grupper eller logga dina spel i spelloggen.
        </p>
      </section>

      <section id="grupper" className="py-20 px-4 bg-white text-center">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Våra Grupper</h2>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <div className="p-6 border rounded-lg shadow-md bg-pink-100">
            <h3 className="text-xl font-semibold mb-2">Bet365 Premium</h3>
            <p className="mb-4">299 kr/mån – Spel med fokus på Bet365 och högt värde.</p>
            <button className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">Gå med</button>
          </div>
          <div className="p-6 border rounded-lg shadow-md bg-pink-100">
            <h3 className="text-xl font-semibold mb-2">Paradise Premium</h3>
            <p className="mb-4">249 kr/mån – Värdespel på flera marknader, inkl. specialspel.</p>
            <button className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">Gå med</button>
          </div>
        </div>
      </section>

      <section id="spelloggen" className="py-20 px-4 bg-pink-50 text-center">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Spelloggen</h2>
        <p className="text-gray-700 max-w-xl mx-auto">
          Håll koll på dina spel, bokför vinster och förluster, och analysera din bettingstatistik över tid. Ett perfekt verktyg för dig som vill bli mer professionell i ditt spelande.
        </p>
      </section>

      <section id="kontakt" className="py-20 px-4 bg-white text-center">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Kontakt</h2>
        <p className="mb-4">Har du frågor? Hör av dig till oss!</p>
        <a href="mailto:bettingparadise1@gmail.com" className="text-pink-600 hover:underline">
          bettingparadise1@gmail.com
        </a>
      </section>

      <footer className="text-center py-6 text-sm text-gray-500 bg-pink-100">
        © {new Date().getFullYear()} BettingParadise. Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}
