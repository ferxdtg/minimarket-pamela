type ProductCardProps = {
    name: string;
    price: string;
  }
  
  export default function ProductCard({
    name,
    price
  }: ProductCardProps) {
  
    return (
  
      <div className="rounded-xl border p-4 shadow hover:shadow-xl transition">
  
        <div className="h-48 bg-gray-200 rounded-lg"></div>
  
        <h3 className="mt-4 text-xl font-bold">
          {name}
        </h3>
  
        <p className="text-red-600 font-bold mt-2">
          S/ {price}
        </p>
  
        <button className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
  
          Comprar
  
        </button>
  
      </div>
  
    )
  
  }