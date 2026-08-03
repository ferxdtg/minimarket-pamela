export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-24">
      <div className="max-w-6xl mx-auto text-center px-6">

        <h1 className="text-6xl font-bold">
          Bienvenido al Minimarket Pamela
        </h1>

        <p className="mt-6 text-xl">
          Encuentra los mejores productos para tu hogar al mejor precio.
        </p>

        <button className="mt-10 bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:scale-105 transition">
          Comprar Ahora
        </button>

      </div>
    </section>
  )
}