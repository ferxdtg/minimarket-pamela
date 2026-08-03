export default function Features(){


    const features = [
  
      {
        icon:"🚚",
        title:"Delivery rápido",
        text:"Recibe tu pedido en la puerta de tu casa"
      },
  
  
      {
        icon:"📍",
        title:"Ubicación exacta",
        text:"Usamos GPS para entregar sin errores"
      },
  
  
      {
        icon:"💳",
        title:"Pagos fáciles",
        text:"Yape, Plin y efectivo"
      },
  
  
      {
        icon:"⭐",
        title:"Atención personalizada",
        text:"Estamos para ayudarte"
      }
  
  
    ];
  
  
  
  
  
    return (
  
  
      <section
  
        className="
          bg-white
          py-8
          border-y
          border-gray-200
        "
  
      >
  
  
  
        <div
  
          className="
            max-w-7xl
            mx-auto
            px-6
            grid
            grid-cols-2
            md:grid-cols-4
            divide-y
            md:divide-y-0
            md:divide-x
            divide-gray-200
          "
  
        >
  
  
  
          {
  
  
            features.map((item,index)=>(
  
  
              <div
  
                key={index}
  
                className="
                  flex
                  items-center
                  gap-4
                  px-4
                  py-5
                  md:justify-center
                "
  
              >
  
  
  
  
                <div
  
                  className="
                    text-4xl
                  "
  
                >
  
                  {item.icon}
  
                </div>
  
  
  
  
  
                <div>
  
  
                  <h3
  
                    className="
                      font-black
                      text-gray-900
                      text-sm
                      md:text-base
                    "
  
                  >
  
                    {item.title}
  
                  </h3>
  
  
  
                  <p
  
                    className="
                      text-xs
                      text-gray-500
                      mt-1
                      max-w-[180px]
                    "
  
                  >
  
                    {item.text}
  
                  </p>
  
  
  
                </div>
  
  
  
  
              </div>
  
  
  
            ))
  
  
  
          }
  
  
  
        </div>
  
  
  
  
      </section>
  
  
  
    );
  
  
  }