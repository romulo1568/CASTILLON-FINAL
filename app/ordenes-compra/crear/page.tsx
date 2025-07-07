"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrdenCompraForm } from "@/components/orden-compra/OrdenCompraForm";
import { toast } from "sonner";

export default function CrearOrdenCompraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // Aquí deberías obtener el id del usuario autenticado
    // Por ahora, simula con 1
    data.IdUsuarioIng = 1;
    const res = await fetch("/api/ordenes-compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Orden de compra creada");
      router.push("/ordenes-compra");
    } else {
      toast.error("Error al crear la orden de compra");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nueva Orden de Compra</h1>
      <OrdenCompraForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 