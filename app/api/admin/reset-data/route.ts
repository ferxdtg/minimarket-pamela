import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

export const dynamic = "force-dynamic";

/**
 * Endpoint de mantenimiento para dejar la base de datos en CERO KILÓMETROS.
 * Elimina registros de prueba de:
 * - products
 * - orders
 * - suppliers (facturas)
 * - customers (billetera/clientes)
 * 
 * Mantiene 100% intactos:
 * - categories
 * - settings
 * - promotions
 */
export async function GET() {
  try {
    const collectionsToClear = ["products", "orders", "suppliers", "customers"];
    const deletedSummary: Record<string, number> = {};

    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      let count = 0;

      if (!snap.empty) {
        // Firestore limita batches a 500 operaciones
        let batch = writeBatch(db);
        let batchCount = 0;

        for (const docSnap of snap.docs) {
          batch.delete(doc(db, colName, docSnap.id));
          count++;
          batchCount++;

          if (batchCount === 400) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
          }
        }

        if (batchCount > 0) {
          await batch.commit();
        }
      }

      deletedSummary[colName] = count;
    }

    return NextResponse.json({
      success: true,
      message: "✅ Base de datos reiniciada a 0 kilómetros exitosamente. Las categorías se mantuvieron intactas.",
      deleted: deletedSummary,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al reiniciar base de datos" },
      { status: 500 }
    );
  }
}
