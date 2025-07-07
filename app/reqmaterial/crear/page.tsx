"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReqMaterialForm } from "@/components/reqmaterial/ReqMaterialForm";
import { DetReqMaterialForm } from "@/components/reqmaterial/DetReqMaterialForm";
import { Button } from "@/components/ui/button";

export default function CrearReqMaterialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [detalles, setDetalles] = useState<any[]>([]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    const res = await fetch("/api/reqmaterial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, detalles }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/reqmaterial");
    } else {
      alert("Error al crear solicitud");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva Solicitud de Material</h1>
      <ReqMaterialForm initialData={{}} onSubmit={handleSubmit} loading={loading} detalles={detalles} setDetalles={setDetalles} />
      <DetReqMaterialForm detalles={detalles} setDetalles={setDetalles} loading={loading} />
    </div>
  );
} 