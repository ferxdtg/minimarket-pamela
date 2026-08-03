"use client";

import { useCartUI } from "@/lib/CartUIContext";
import CartNotification from "./CartNotification";


export default function CartNotificationWrapper(){


  const {
    notification
  } = useCartUI();



  return (

    <CartNotification
      message={notification}
    />

  );


}