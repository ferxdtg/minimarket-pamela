"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCartUI } from "@/lib/CartUIContext";


type ProductCardProps = {

  id:number;
  name:string;
  price:string;
  image:string;

};



export default function ProductCard({

id,
name,
price,
image

}:ProductCardProps){



const [quantity,setQuantity]=useState(0);


const [favorite,setFavorite]=useState(false);



const {addToCart}=useCart();


const {showNotification}=useCartUI();





function addProduct(){


if(quantity===0)return;



addToCart({

id,
name,
image,
price:Number(price),
quantity

});



showNotification(
`${name} agregado al carrito 🛒`
);



setQuantity(0);



}







return (

<div

className="
relative
bg-white
rounded-3xl
shadow-md
hover:shadow-2xl
transition-all
duration-300
overflow-hidden
border
border-gray-100
group
"

>





{/* FAVORITO */}


<button

onClick={()=>setFavorite(!favorite)}

className="
absolute
right-4
top-4
z-10
bg-white
rounded-full
w-10
h-10
shadow
flex
items-center
justify-center
text-xl
"

>

{

favorite

?

"❤️"

:

"🤍"

}


</button>









{/* IMAGEN */}


<div

className="
relative
h-56
bg-gray-50
overflow-hidden
"

>


<Image

src={image}
alt={name}
fill

className="
object-contain
p-5
group-hover:scale-110
transition-transform
duration-500
"

/>





<div

className="
absolute
top-4
left-4
bg-red-600
text-white
px-3
py-1
rounded-full
text-xs
font-black
"

>

🔥 Más vendido

</div>




</div>








{/* INFO */}


<div

className="
p-5
"

>


<h3

className="
text-xl
font-black
text-gray-900
"

>

{name}

</h3>





<div

className="
flex
items-center
gap-1
mt-2
"

>

<span className="text-yellow-500">

⭐⭐⭐⭐⭐

</span>


<span

className="
text-xs
text-gray-500
"

>

(120)

</span>


</div>







<div

className="
flex
items-center
gap-3
mt-4
"

>


<p

className="
text-3xl
font-black
text-red-600
"

>

S/{price}

</p>


<span

className="
bg-green-100
text-green-700
text-xs
font-black
px-3
py-1
rounded-full
"

>

Stock

</span>



</div>









{/* CANTIDAD */}


{/* CANTIDAD */}

<div
  className="
    flex
    justify-center
    mt-6
  "
>

  <div
    className="
      flex
      items-center
      bg-gray-100
      rounded-full
      p-1
      shadow-inner
      gap-2
    "
  >

    <button
      type="button"
      onClick={() =>
        setQuantity(
          Math.max(0, quantity - 1)
        )
      }
      className={`
        w-11
        h-11
        rounded-full
        font-black
        text-2xl
        shadow-md
        flex
        items-center
        justify-center
        transition-all
        
        ${
         quantity === 0
         ?
         "bg-white text-gray-400 cursor-not-allowed"
         :
         "bg-red-600 text-white hover:bg-red-700"
        }
        
        `}
    >
      −
    </button>


    <span
      className="
        w-10
        text-center
        text-xl
        font-black
        text-gray-900
      "
    >
      {quantity}
    </span>


    <button
      type="button"
      onClick={() =>
        setQuantity(quantity + 1)
      }
      className="
        w-11
        h-11
        rounded-full
        bg-red-600
        text-white
        text-2xl
        font-black
        shadow-md
        flex
        items-center
        justify-center
        hover:bg-red-700
        transition-all
      "
    >
      +
    </button>


  </div>

</div>








<button

onClick={addProduct}

disabled={quantity===0}

className={

`
mt-6
w-full
py-3
rounded-xl
font-black
transition

${

quantity===0

?

"bg-gray-200 text-gray-500"

:

"bg-red-600 text-white hover:bg-red-700 hover:scale-105"

}

`

}

>

{

quantity===0

?

"Selecciona cantidad"

:

"Agregar al carrito 🛒"

}


</button>





</div>





</div>


);


}