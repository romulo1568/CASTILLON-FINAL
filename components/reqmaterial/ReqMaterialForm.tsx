"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReqMaterialForm({ initialData, onSubmit, loading, detalles = [], setDetalles }: any) {
  // Cabecera
  const [idFilial, setIdFilial] = useState(initialData?.idFilial || "");
  const [FechaReq, setFechaReq] = useState(initialData?.FechaReq?.slice(0, 10) || "");
  const [TipoReq, setTipoReq] = useState(initialData?.TipoReq || "");
  const [MotivoReq, setMotivoReq] = useState(initialData?.MotivoReq || "");
  const [OrigenReq, setOrigenReq] = useState(initialData?.OrigenReq || "");
  const [EstadoReq, setEstadoReq] = useState(initialData?.EstadoReq || "");
  const [LugarCompra, setLugarCompra] = useState(undefined);
  const [NumEnvio, setNumEnvio] = useState(undefined);
  // Selects
  const [filiales, setFiliales] = useState<any[]>([]);
  const [catalogos, setCatalogos] = useState<any>({});

  useEffect(() => {
    fetch("/api/reqmaterial/filiales").then(r => r.json()).then(setFiliales);
    fetch("/api/reqmaterial/catalogos").then(r => r.json()).then(setCatalogos);
  }, []);

  const addDetalle = () => setDetalles && setDetalles([...detalles, {}]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      idFilial,
      FechaReq,
      TipoReq,
      MotivoReq,
      OrigenReq,
      EstadoReq,
      detalles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Filial</label>
          <select value={idFilial} onChange={e => setIdFilial(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {Array.isArray(filiales) && filiales.map((f: any) => <option key={f.idFilial} value={f.idFilial}>{f.DescripcionFilial}</option>)}
          </select>
        </div>
        <div>
          <label>Tipo de Requerimiento</label>
          <select value={TipoReq} onChange={e => setTipoReq(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {catalogos.TipoReq?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label>Motivo</label>
          <select value={MotivoReq} onChange={e => setMotivoReq(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {catalogos.MotivoReq?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label>Origen</label>
          <select value={OrigenReq} onChange={e => setOrigenReq(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {catalogos.OrigenReq?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select value={EstadoReq} onChange={e => setEstadoReq(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {catalogos.EstadoReq?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label>Fecha de Requerimiento</label>
          <Input type="date" value={FechaReq} onChange={e => setFechaReq(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <Button type="button" size="sm" onClick={addDetalle}>+ Agregar Material</Button>
      </div>
      <div className="flex gap-4 mt-8">
        <Button type="submit" size="sm" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
      </div>
    </form>
  );
} 