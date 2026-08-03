export default function Categories(){


    const categories = [
  
      {
        icon:"🍚",
        name:"Abarrotes",
        description:"Arroz, fideos, azúcar y más"
      },
  
  
      {
        icon:"🥤",
        name:"Bebidas",
        description:"Gaseosas, jugos y agua"
      },
  
  
      {
        icon:"🥛",
        name:"Lácteos",
        description:"Leche, yogurt y derivados"
      },
  
  
      {
        icon:"🧼",
        name:"Limpieza",
        description:"Productos para tu hogar"
      },
  
  
      {
        icon:"🍪",
        name:"Snacks",
        description:"Galletas y antojos"
      },
  
  
      {
        icon:"🐶",
        name:"Mascotas",
        description:"Alimentos y accesorios"
      }
  
  
    ];
  
  
  
  
  
    return (
  
  
      <section
  
        className="
          py-14
          bg-gray-50
        "
  
      >
  
  
  
        <div
  
          className="
            max-w-7xl
            mx-auto
            px-6
          "
  
        >
  
  
  
          <div
  
            className="
              text-center
              mb-10
            "
  
          >
  
  
            <h2
  
              className="
                text-3xl
                md:text-4xl
                font-black
                text-gray-900
              "
  
            >
  
              ¿Qué estás buscando hoy?
  
            </h2>
  
  
  
            <p
  
              className="
                mt-3
                text-gray-600
              "
  
            >
  
  Explora nuestros productos y encuentra todo para tu hogar
  
            </p>
  
  
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
  
  
                <button
  
  
                  key={index}
  
  
                  className="
                    bg-white
                    rounded-2xl
                    p-5
                    shadow-sm
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition
                    text-center
                  "
  
  
                >
  
  
  
                  <div
  
                    className="
                      text-5xl
                    "
  
                  >
  
                    {category.icon}
  
                  </div>
  
  
  
  
                  <h3
  
                    className="
                      mt-4
                      font-black
                      text-gray-900
                    "
  
                  >
  
                    {category.name}
  
                  </h3>
  
  
  
  
  
                  <p
  
                    className="
                      mt-2
                      text-xs
                      text-gray-500
                    "
  
                  >
  
                    {category.description}
  
                  </p>
  
  
  
  
                </button>
  
  
  
              ))
  
  
            }
  
  
  
          </div>
  
  
  
        </div>
  
  
  
      </section>
  
  
  
    );
  
  
  }