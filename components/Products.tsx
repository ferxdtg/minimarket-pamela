import ProductCard from "./ProductCard";
import SectionTitle from "./SectionTitle";

export default function Products() {

  return (

    <section className="max-w-7xl mx-auto py-20 px-6">

      <SectionTitle

        title="Productos Destacados"

        subtitle="Las mejores ofertas para tu hogar"

      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        <ProductCard
          name="Arroz Costeño"
          price="5.90"
        />

        <ProductCard
          name="Aceite Primor"
          price="10.90"
        />

        <ProductCard
          name="Leche Gloria"
          price="4.50"
        />

        <ProductCard
          name="Fideos Don Vittorio"
          price="3.80"
        />

      </div>

    </section>

  )

}