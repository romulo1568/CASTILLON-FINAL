"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Detalle {
  IdDetReqMaterial?: number;
  CodMaterial?: string;
  idMarca?: number;
  idModelo?: number;
  Precio?: number;
  Cantidad?: number;
  Estado?: string;
}

interface OrdenCompraFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function OrdenCompraForm({ initialData, onSubmit, loading }: OrdenCompraFormProps) {
  // Cabecera
  const [idFilial, setIdFilial] = useState(initialData?.idFilial || "");
  const [IdAlmacenDestino, setIdAlmacenDestino] = useState(initialData?.IdAlmacenDestino || "");
  const [idProveedor, setIdProveedor] = useState(initialData?.idProveedor || "");
  const [EstadoOC, setEstadoOC] = useState(initialData?.EstadoOC || "");
  const [FechaOC, setFechaOC] = useState(initialData?.FechaOC?.slice(0,10) || "");
  const [Observaciones, setObservaciones] = useState(initialData?.Observaciones || "");
  const [CodMoneda, setCodMoneda] = useState(initialData?.CodMoneda || "PEN");
  const [CondicionesPago, setCondicionesPago] = useState(initialData?.CondicionesPago || "");
  const [FechaEntrega, setFechaEntrega] = useState(initialData?.FechaEntrega?.slice(0,10) || "");
  const [LugarEntrega, setLugarEntrega] = useState(initialData?.LugarEntrega || "");
  const [BaseImponible, setBaseImponible] = useState(initialData?.BaseImponible || 0);
  const [Impuesto, setImpuesto] = useState(initialData?.Impuesto || 0);
  const [TotalOC, setTotalOC] = useState(initialData?.TotalOC || 0);
  // Detalles
  const [detalles, setDetalles] = useState<Detalle[]>(initialData?.detalles || []);
  const [reqMaterialId, setReqMaterialId] = useState("");
  const [reqMaterialPendiente, setReqMaterialPendiente] = useState(false);

  // Selects
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [detReqMaterial, setDetReqMaterial] = useState<any[]>([]);
  const [filiales, setFiliales] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/proveedores").then(r => r.json()).then(setProveedores);
    fetch("/api/almacenes").then(r => r.json()).then(setAlmacenes);
    fetch("/api/materiales").then(r => r.json()).then(setMateriales);
    fetch("/api/marcas").then(r => r.json()).then(setMarcas);
    fetch("/api/modelos").then(r => r.json()).then(setModelos);
    fetch("/api/detreqmaterial").then(r => r.json()).then(setDetReqMaterial);
    fetch("/api/filiales").then(r => r.json()).then(setFiliales);
  }, []);

  // Agregar detalle vacío
  const addDetalle = () => setDetalles([...detalles, {}]);
  // Eliminar detalle
  const removeDetalle = (idx: number) => setDetalles(detalles.filter((_, i) => i !== idx));
  // Actualizar detalle
  const updateDetalle = (idx: number, field: string, value: any) => {
    setDetalles(detalles.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  // Calcular totales
  useEffect(() => {
    const base = detalles.reduce((sum, d) => sum + ((d.Precio || 0) * (d.Cantidad || 0)), 0);
    setBaseImponible(base);
    setImpuesto(base * 0.18);
    setTotalOC(base * 1.18);
  }, [detalles]);

  // Buscar requerimiento y cargar detalles si está pendiente
  const handleBuscarReqMaterial = async () => {
    if (!reqMaterialId) return toast.error("Ingrese un ID de requerimiento");
    const res = await fetch(`/api/reqmaterial/${reqMaterialId}`);
    if (!res.ok) return toast.error("Requerimiento no encontrado");
    const req = await res.json();
    if (req.EstadoReq !== "099") {
      toast.error(`El requerimiento no está pendiente. Estado actual: ${req.EstadoReq}`);
      setReqMaterialPendiente(false);
      return;
    }
    toast.success("El requerimiento está pendiente. Cargando detalles...");
    // Cargar detalles del requerimiento
    const detallesRes = await fetch(`/api/reqmaterial/detalle?idReqMaterial=${reqMaterialId}`);
    const detallesData = await detallesRes.json();
    console.log("Datos crudos de DetReqMaterial:", detallesData);
    if (!Array.isArray(detallesData) || detallesData.length === 0) {
      toast.error("El requerimiento no tiene detalles para cargar");
      setDetalles([]);
      setReqMaterialPendiente(false);
      return;
    }
    // Mapear los detalles al formato esperado por la orden de compra
    const detallesMapped = detallesData.map((d: any) => ({
      IdDetReqMaterial: d.IdDetReqMaterial, // clave para DetOrdenCompra
      CodMaterial: d.CodMaterial,
      idMarca: d.idMarca,
      idModelo: d.idModelo,
      Precio: d.PrecioMat || d.Precio || 0,
      Cantidad: d.CantSolicitada || d.Cantidad || 0,
      Estado: "002", // Por procesar por defecto
    }));
    setDetalles(detallesMapped);
    setReqMaterialPendiente(true);
    toast.success("Detalles de requerimiento cargados");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const data = {
      idFilial,
      IdAlmacenDestino,
      idProveedor,
      EstadoOC,
      FechaOC,
      Observaciones,
      CodMoneda,
      CondicionesPago,
      FechaEntrega,
      LugarEntrega,
      BaseImponible,
      Impuesto,
      TotalOC,
      detalles,
    };
    await onSubmit(data);
    // Si se usó un requerimiento pendiente, aprobarlo
    if (reqMaterialPendiente && reqMaterialId) {
      await fetch(`/api/reqmaterial/${reqMaterialId}/aprobar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IdUsuarioUltMod: 1 }), // TODO: usar usuario real
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-end gap-2 mb-4">
        <div>
          <label>ID Requerimiento</label>
          <Input type="number" value={reqMaterialId} onChange={e => setReqMaterialId(e.target.value)} placeholder="ID ReqMaterial" min={1} />
        </div>
        <Button type="button" size="sm" onClick={handleBuscarReqMaterial}>Buscar</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Filial</label>
          <select value={idFilial} onChange={e => setIdFilial(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {Array.isArray(filiales) && filiales.map((f: any) => <option key={f.idFilial} value={f.idFilial}>{f.DescripcionFilial}</option>)}
          </select>
        </div>
        <div>
          <label>Proveedor</label>
          <select value={idProveedor} onChange={e => setIdProveedor(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {Array.isArray(proveedores) && proveedores.map((p: any) => <option key={p.IdProveedor} value={p.IdProveedor}>{p.RazonSocial}</option>)}
          </select>
        </div>
        <div>
          <label>Almacén</label>
          <select value={IdAlmacenDestino} onChange={e => setIdAlmacenDestino(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            {Array.isArray(almacenes) && almacenes.map((a: any) => <option key={a.IdAlmacen} value={a.IdAlmacen}>{a.NombreAlmacen}</option>)}
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select value={EstadoOC} onChange={e => setEstadoOC(e.target.value)} required className="w-full border rounded px-2 py-1">
            <option value="">Seleccione...</option>
            <option value="002">Por procesar</option>
            <option value="003">Procesado</option>
            <option value="004">Anulado</option>
          </select>
        </div>
        <div>
          <label>Fecha OC</label>
          <Input type="date" value={FechaOC} onChange={e => setFechaOC(e.target.value)} required />
        </div>
        <div>
          <label>Moneda</label>
          <select value={CodMoneda} onChange={e => setCodMoneda(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="001">PEN</option>
            <option value="002">USD</option>
          </select>
        </div>
        <div>
          <label>Observaciones</label>
          <Input value={Observaciones} onChange={e => setObservaciones(e.target.value)} />
        </div>
      </div>
      <div>
        <h2 className="font-bold mb-2">Detalle de Materiales</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detalles.map((d, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <select value={d.CodMaterial || ""} onChange={e => updateDetalle(idx, "CodMaterial", e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Seleccione...</option>
                    {Array.isArray(materiales) && materiales.map((m: any) => <option key={m.CodMaterial} value={m.CodMaterial}>{m.DscMaterial}</option>)}
                  </select>
                </TableCell>
                <TableCell>
                  <select value={d.idMarca || ""} onChange={e => updateDetalle(idx, "idMarca", e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Seleccione...</option>
                    {Array.isArray(marcas) && marcas.map((m: any) => <option key={m.idMarca} value={m.idMarca}>{m.Marca}</option>)}
                  </select>
                </TableCell>
                <TableCell>
                  <select value={d.idModelo || ""} onChange={e => updateDetalle(idx, "idModelo", e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Seleccione...</option>
                    {Array.isArray(modelos) && modelos.map((m: any) => <option key={m.idModelo} value={m.idModelo}>{m.Modelo}</option>)}
                  </select>
                </TableCell>
                <TableCell>
                  <Input type="number" value={d.Precio || ""} onChange={e => updateDetalle(idx, "Precio", Number(e.target.value))} min={0} className="w-28 px-3 py-2" />
                </TableCell>
                <TableCell>
                  <Input type="number" value={d.Cantidad || ""} onChange={e => updateDetalle(idx, "Cantidad", Number(e.target.value))} min={0} className="w-24 px-3 py-2" />
                </TableCell>
                <TableCell>
                  <select value={d.Estado || ""} onChange={e => updateDetalle(idx, "Estado", e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Seleccione...</option>
                    <option value="002">Por procesar</option>
                    <option value="003">Procesado</option>
                    <option value="004">Anulado</option>
                  </select>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="destructive" onClick={() => removeDetalle(idx)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button type="button" className="mt-2" onClick={addDetalle}><Plus className="h-4 w-4" /> Agregar Material</Button>
      </div>
      <div className="flex gap-4 font-bold">
        <div>Base Imponible: {BaseImponible.toFixed(2)}</div>
        <div>IGV: {Impuesto.toFixed(2)}</div>
        <div>Total: {TotalOC.toFixed(2)}</div>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
      </div>
    </form>
  );
} 