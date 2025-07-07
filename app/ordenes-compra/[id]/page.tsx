"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { OrdenCompraForm } from "@/components/orden-compra/OrdenCompraForm";
import { toast } from "sonner";

export default function EditarOrdenCompraPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/ordenes-compra/${id}`)
      .then(res => res.json())
      .then(setInitialData);
  }, [id]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // Aquí deberías obtener el id del usuario autenticado
    // Por ahora, simula con 1
    data.IdUsuarioIng = 1;
    const res = await fetch(`/api/ordenes-compra/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Orden de compra actualizada");
      router.push("/ordenes-compra");
    } else {
      toast.error("Error al actualizar la orden de compra");
    }
    setLoading(false);
  };

  if (!initialData) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Orden de Compra #{id}</h1>
      <OrdenCompraForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 