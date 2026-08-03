export default function Categories() {


    const categories = [
    
    {
    icon:"🔥",
    title:"Ofertas",
    description:"Promociones y descuentos"
    },
    
    {
    icon:"🍚",
    title:"Abarrotes",
    description:"Arroz, fideos y básicos"
    },
    
    {
    icon:"🥤",
    title:"Bebidas",
    description:"Gaseosas, jugos y agua"
    },
    
    {
    icon:"🍪",
    title:"Snacks",
    description:"Galletas y dulces"
    },
    
    {
    icon:"🧼",
    title:"Limpieza",
    description:"Productos para tu hogar"
    },
    
    {
    icon:"🍼",
    title:"Bebés",
    description:"Todo para los pequeños"
    },
    
    ];
    
    
    
    
    
    return (
    
    <section
    
    className="
    py-20
    px-6
    bg-white
    "
    
    >
    
    
    <div
    
    className="
    max-w-7xl
    mx-auto
    "
    
    >
    
    
    
    <div
    
    className="
    flex
    justify-between
    items-end
    mb-10
    "
    
    >
    
    
    <div>
    
    
    <h2
    
    className="
    text-3xl
    md:text-5xl
    font-black
    text-gray-900
    "
    
    >
    
    Compra por categoría
    
    </h2>
    
    
    <p
    
    className="
    mt-3
    text-gray-600
    "
    
    >
    
    Encuentra lo que necesitas rápidamente
    
    </p>
    
    
    </div>
    
    
    
    <button
    
    className="
    hidden
    md:block
    text-red-600
    font-black
    "
    
    >
    
    Ver todas →
    
    </button>
    
    
    
    </div>
    
    
    
    
    
    
    
    
    
    <div
    
    className="
    grid
    grid-cols-2
    md:grid-cols-3
    lg:grid-cols-6
    gap-5
    "
    
    >
    
    
    
    {
    
    categories.map((category,index)=>(
    
    
    <div
    
    key={index}
    
    className="
    group
    cursor-pointer
    bg-[#FFF8F0]
    rounded-3xl
    p-6
    text-center
    hover:bg-red-600
    transition-all
    duration-300
    hover:-translate-y-2
    shadow-sm
    hover:shadow-xl
    "
    
    >
    
    
    <div
    
    className="
    text-5xl
    group-hover:scale-110
    transition
    "
    
    >
    
    {category.icon}
    
    </div>
    
    
    
    <h3
    
    className="
    mt-4
    font-black
    text-gray-900
    group-hover:text-white
    "
    
    >
    
    {category.title}
    
    </h3>
    
    
    
    <p
    
    className="
    mt-2
    text-xs
    text-gray-600
    group-hover:text-white/90
    "
    
    >
    
    {category.description}
    
    </p>
    
    
    
    </div>
    
    
    ))
    
    
    }
    
    
    
    </div>
    
    
    
    
    
    </div>
    
    
    </section>
    
    
    );
    
    
    }