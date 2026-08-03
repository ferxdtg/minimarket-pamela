import ProductCard from "./ProductCard";
import SectionTitle from "./SectionTitle";

export default function Products() {
  return (
    <section className="max-w-7xl mx-auto py-20 px-6">

      <SectionTitle
        title="Productos Destacados"
        subtitle="Las mejores ofertas para tu hogar"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

      <ProductCard
  id={1}
  name="Arroz Costeño"
  price="5.90"
  image="/productos/arrozcosteno.jpg"
/>

        <ProductCard
          id={2}
          name="Leche Gloria"
          price="4.50"
          image="/productos/lechegloria.jpg"
        />

        <ProductCard
          id={3}
          name="Sopa Maruchan"
          price="6.90"
          image="/productos/maruchan.jpg"
        />

        <ProductCard
          id={4}
          name="Bizcocho Bimbo"
          price="7.50"
          image="/productos/bizcochobimbo.jpg"
        />

      </div>

    </section>
  );
}