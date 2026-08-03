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
 id={1}
 name="Arroz Costeño"
 price="5.90"
/>

<ProductCard
 id={2}
 name="leche gloria"
 price="3.20"
/>

<ProductCard
 id={3}
 name="Fideos arabe"
 price="6.90"
/>

<ProductCard
 id={4}
 name="Biscocho bimbo"
 price="7.90"
/>

      </div>

    </section>

  )

}