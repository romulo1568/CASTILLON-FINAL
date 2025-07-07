"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Trash2, Edit, Plus } from "lucide-react";

export default function ReqMaterialPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [catalogos, setCatalogos] = useState<any>({});

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/reqmaterial?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setSolicitudes(data.data);
        setTotal(data.total);
      })
      .catch(() => setError("Error al cargar las solicitudes de material"))
      .finally(() => setLoading(false));
  }, [page, pageSize, refresh]);

  useEffect(() => {
    fetch("/api/reqmaterial/catalogos").then(r => r.json()).then(setCatalogos);
  }, []);

  const getLabel = (catalogo: string, codigo: string) => {
    const cat = catalogos[catalogo];
    if (!cat) return `Desconocido (${codigo})`;
    const found = cat.find((c: any) => c.codigo === codigo);
    return found ? found.label : `Desconocido (${codigo})`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
    setLoading(true);
    await fetch(`/api/reqmaterial/${id}`, { method: "DELETE" });
    setRefresh(r => !r);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Solicitudes de Material</h1>
        <Link href="/reqmaterial/crear">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nueva Solicitud
          </Button>
        </Link>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="pageSize">Mostrar:</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={e => setPageSize(e.target.value === "Todos" ? "Todos" : Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value="Todos">Todos</option>
        </select>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.map((r: any) => (
              <TableRow key={r.idReqMaterial}>
                <TableCell>{r.idReqMaterial}</TableCell>
                <TableCell>{r.FechaReq?.slice(0, 10)}</TableCell>
                <TableCell>{r.DescripcionFilial}</TableCell>
                <TableCell>{getLabel("TipoReq", r.TipoReq)}</TableCell>
                <TableCell>{getLabel("MotivoReq", r.MotivoReq)}</TableCell>
                <TableCell>{getLabel("OrigenReq", r.OrigenReq)}</TableCell>
                <TableCell>{getLabel("EstadoReq", r.EstadoReq)}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/reqmaterial/${r.idReqMaterial}`}><Button size="icon" variant="outline"><Edit className="h-4 w-4" /></Button></Link>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(r.idReqMaterial)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {solicitudes.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No hay registros</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageSize !== "Todos" && (
        <Pagination
          page={page}
          pageSize={Number(pageSize)}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
} 