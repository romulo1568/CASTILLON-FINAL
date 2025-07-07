"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DetReqMaterialForm({ detalles, setDetalles, loading }: any) {
  const [materiales, setMateriales] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [catalogos, setCatalogos] = useState<any>({});

  useEffect(() => {
    fetch("/api/reqmaterial/materiales").then(r => r.json()).then(setMateriales);
    fetch("/api/reqmaterial/marcas").then(r => r.json()).then(setMarcas);
    fetch("/api/reqmaterial/modelos").then(r => r.json()).then(setModelos);
    fetch("/api/reqmaterial/proveedores").then(r => r.json()).then(setProveedores);
    fetch("/api/reqmaterial/catalogos").then(r => r.json()).then(setCatalogos);
  }, []);

  const addDetalle = () => setDetalles([...detalles, {}]);
  const removeDetalle = (idx: number) => setDetalles(detalles.filter((_: any, i: number) => i !== idx));
  const updateDetalle = (idx: number, field: string, value: any) => {
    setDetalles(detalles.map((d: any, i: number) => i === idx ? { ...d, [field]: value } : d));
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <h2 className="font-bold mb-2">Detalle de Materiales</h2>
      <table className="w-full border mb-2 min-w-[900px]">
        <thead>
          <tr>
            <th>Material</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Proveedor</th>
            <th>Modalidad</th>
            <th>Estado</th>
            <th>Moneda</th>
            <th>Cant. Solicitada</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((d: any, idx: number) => (
            <tr key={idx}>
              <td>
                <select value={d.CodMaterial || ""} onChange={e => updateDetalle(idx, "CodMaterial", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {materiales.map((m: any) => <option key={m.CodMaterial} value={m.CodMaterial}>{m.DscMaterial}</option>)}
                </select>
              </td>
              <td>
                <select value={d.idMarca || ""} onChange={e => updateDetalle(idx, "idMarca", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {marcas.map((m: any) => <option key={m.idMarca} value={m.idMarca}>{m.Marca}</option>)}
                </select>
              </td>
              <td>
                <select value={d.idModelo || ""} onChange={e => updateDetalle(idx, "idModelo", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {modelos.map((m: any) => <option key={m.idModelo} value={m.idModelo}>{m.Modelo}</option>)}
                </select>
              </td>
              <td>
                <select value={d.idProveedor || ""} onChange={e => updateDetalle(idx, "idProveedor", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {proveedores.map((p: any) => <option key={p.IdProveedor} value={p.IdProveedor}>{p.RazonSocial}</option>)}
                </select>
              </td>
              <td>
                <select value={d.ModalidadAtencion || ""} onChange={e => updateDetalle(idx, "ModalidadAtencion", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {catalogos.ModalidadAtencion?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
                </select>
              </td>
              <td>
                <select value={d.EstadoDetReq || ""} onChange={e => updateDetalle(idx, "EstadoDetReq", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {catalogos.EstadoDetReq?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
                </select>
              </td>
              <td>
                <select value={d.CodMoneda || ""} onChange={e => updateDetalle(idx, "CodMoneda", e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Seleccione...</option>
                  {catalogos.CodMoneda?.map((c: any) => <option key={c.codigo} value={c.codigo}>{c.label}</option>)}
                </select>
              </td>
              <td>
                <Input type="number" value={d.CantSolicitada || ""} onChange={e => updateDetalle(idx, "CantSolicitada", e.target.value)} min={0} className="w-24 px-3 py-2" />
              </td>
              <td>
                <Input type="number" value={d.PrecioMat || ""} onChange={e => updateDetalle(idx, "PrecioMat", e.target.value)} min={0} className="w-24 px-3 py-2" />
              </td>
              <td>
                <Button size="icon" variant="destructive" onClick={() => removeDetalle(idx)}>-</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 