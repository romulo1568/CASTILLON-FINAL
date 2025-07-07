"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ReqMaterialForm } from "@/components/reqmaterial/ReqMaterialForm";
import { DetReqMaterialForm } from "@/components/reqmaterial/DetReqMaterialForm";
import { Button } from "@/components/ui/button";

export default function EditarReqMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [detalles, setDetalles] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/reqmaterial/${id}`)
      .then(r => r.json())
      .then(data => {
        setInitialData(data);
        fetch(`/api/reqmaterial/detalle?idReqMaterial=${id}`)
          .then(r => r.json())
          .then(setDetalles)
          .finally(() => setLoading(false));
      });
  }, [id]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    const res = await fetch(`/api/reqmaterial/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, detalles }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/reqmaterial");
    } else {
      alert("Error al actualizar solicitud");
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que desea eliminar esta solicitud?")) return;
    setLoading(true);
    const res = await fetch(`/api/reqmaterial/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.push("/reqmaterial");
    } else {
      alert("Error al eliminar solicitud");
    }
  };

  if (!initialData) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Solicitud de Material</h1>
      <ReqMaterialForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
      <DetReqMaterialForm detalles={detalles} setDetalles={setDetalles} loading={loading} />
      <div className="flex gap-4 mt-4">
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>Eliminar</Button>
        <Button variant="outline" onClick={() => router.push("/reqmaterial")}>Volver</Button>
      </div>
    </div>
  );
} 