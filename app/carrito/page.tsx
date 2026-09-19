import { redirect } from "next/navigation";

export default function CarritoPage() {
  // El carrito ahora es un drawer global, redirigir al inicio
  redirect("/");
}