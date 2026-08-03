"use client";

import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";
import { useState } from "react";


export default function Navbar(){


  const { cart } = useCart();


  const { openCart } = useCartUI();


  const [menu,setMenu] = useState(false);



  const totalItems = cart.reduce(

    (total,item)=>
      total + item.quantity,

    0

  );





return (

<header

className="
sticky
top-0
z-40
bg-white
shadow-md
"

>


<nav

className="
max-w-7xl
mx-auto
px-5
py-3
flex
items-center
justify-between
gap-5
"

>



{/* LOGO */}

<div

className="
flex
items-center
gap-3
"

>


<div

className="
w-12
h-12
rounded-2xl
bg-gradient-to-br
from-red-600
to-orange-500
flex
items-center
justify-center
text-2xl
shadow-lg
"

>

🛒

</div>



<div>


<h1

className="
text-xl
md:text-2xl
font-black
text-gray-900
leading-none
"

>

Pamela Market

</h1>


<p

className="
text-xs
text-gray-500
mt-1
"

>

Compra rápido, recibe mejor

</p>


</div>



</div>







{/* BUSCADOR */}


<div

className="
hidden
md:flex
flex-1
max-w-xl
"

>


<div

className="
w-full
bg-gray-100
rounded-full
px-5
py-3
flex
items-center
gap-3
"

>


<span>

🔎

</span>


<input

placeholder="
Busca arroz, bebidas, snacks...
"

className="
bg-transparent
outline-none
w-full
text-gray-700
"

/>


</div>


</div>







{/* INFO DELIVERY */}

<div

className="
hidden
lg:flex
flex-col
text-xs
font-bold
"

>


<span

className="
text-gray-800
"

>

📍 Tu zona

</span>


<span

className="
text-green-600
"

>

🚚 Delivery activo

</span>


</div>








{/* CARRITO */}


<button

onClick={openCart}

className="
relative
bg-red-600
text-white
px-5
py-3
rounded-full
font-black
hover:scale-105
transition
shadow-lg
"

>


🛒


<span className="hidden md:inline">

 Carrito

</span>



{

totalItems > 0 &&


<span

className="
absolute
-top-2
-right-2
bg-yellow-400
text-black
text-xs
w-6
h-6
rounded-full
flex
items-center
justify-center
font-black
"

>


{totalItems}


</span>


}



</button>






{/* MOBILE */}

<button

className="
md:hidden
text-3xl
"

onClick={()=>setMenu(!menu)}

>

☰

</button>



</nav>






{/* MENU MOBILE */}


{

menu &&

<div

className="
md:hidden
border-t
px-5
py-5
space-y-4
bg-white
"

>


<button

className="
block
font-bold
text-gray-800
"

>

Productos

</button>



<button

className="
block
font-bold
text-gray-800
"

>

Ofertas 🔥

</button>



<button

onClick={openCart}

className="
block
font-bold
text-red-600
"

>

🛒 Mi carrito

</button>



</div>


}



</header>


);


}