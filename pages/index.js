export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-pink-600 p-6">
      <h1 className="text-4xl font-bold mb-4">Välkommen till BettingParadise!</h1>
      <p className="text-lg text-center">Ditt centrum för value betting och airbitrage.</p>
      <nav className="mt-6 flex gap-4">
        <a href="/groups" className="underline">Våra Grupper</a>
        <a href="/airbitrage" className="underline">Airbitrage</a>
        <a href="/ranking" className="underline">Ranking</a>
        <a href="/contact" className="underline">Kontakt</a>
      </nav>
    </div>
  );
}
