
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-pink-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-pink-700 mb-4">Välkommen till BettingParadise!</h1>
      <p className="text-lg text-pink-600 mb-6">Ditt centrum för value betting och airbitrage.</p>
      <nav className="space-x-4">
        <Link href="/groups" className="text-pink-800 underline">Våra Grupper</Link>
        <Link href="/airbitrage" className="text-pink-800 underline">Airbitrage</Link>
        <Link href="/ranking" className="text-pink-800 underline">Ranking</Link>
        <Link href="/contact" className="text-pink-800 underline">Kontakt</Link>
      </nav>
    </div>
  );
}
