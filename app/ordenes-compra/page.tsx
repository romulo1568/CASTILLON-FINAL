"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Trash2, Edit, Plus } from "lucide-react";

interface OrdenCompra {
  IdOC: number;
  FechaOC: string;
  EstadoOC: string;
  TotalOC: number;
  Observaciones: string;
  Proveedor: string;
  Almacen: string;
  UsuarioCreador: string;
}

export default function OrdenCompraListPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/ordenes-compra?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setOrdenes(data.data);
        setTotal(data.total);
      })
      .catch(() => setError("Error al cargar las órdenes de compra"))
      .finally(() => setLoading(false));
  }, [page, pageSize, refresh]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta orden de compra?")) return;
    setLoading(true);
    await fetch(`/api/ordenes-compra/${id}`, { method: "DELETE" });
    setRefresh(r => !r);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
        <Link href="/ordenes-compra/crear">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nueva Orden de Compra
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
              <TableHead>Proveedor</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenes.map(oc => (
              <TableRow key={oc.IdOC}>
                <TableCell>{oc.IdOC}</TableCell>
                <TableCell>{oc.FechaOC?.slice(0, 10)}</TableCell>
                <TableCell>{oc.Proveedor}</TableCell>
                <TableCell>{oc.Almacen}</TableCell>
                <TableCell>{oc.EstadoOC}</TableCell>
                <TableCell>{oc.TotalOC?.toLocaleString()}</TableCell>
                <TableCell>{oc.UsuarioCreador}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/ordenes-compra/${oc.IdOC}`}><Button size="icon" variant="outline"><Edit className="h-4 w-4" /></Button></Link>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(oc.IdOC)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {ordenes.length === 0 && (
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