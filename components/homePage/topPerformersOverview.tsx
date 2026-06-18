"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { HomeIcon, UserIcon, TrophyIcon, ArrowUpRightIcon } from "lucide-react";

interface TopClient {
  cli_id: string;
  cli_nombre: string;
  cli_papellido: string;
  cli_sapellido?: string;
  cli_cedula: string;
  cli_telefono: string;
  cli_correo: string;
  cli_fechacreacion: string;
  cli_direccion?: string | null;
  cli_estadocivil?: string | null;
  _count: {
    ava_clientexalquiler: number;
  };
}

interface TopProperty {
  prop_id: string;
  prop_identificador: string;
  prop_descripcion: string;
  edi_id: string;
  tipp_id: string;
  _count: {
    ava_alquiler: number;
  };
}

interface TopPerformersOverviewProps {
  topClients?: TopClient[];
  topProperties?: TopProperty[];
  loading?: boolean;
  clientDetailRoute?: string;
  propertyDetailRoute?: string;
  maxItems?: number;
}

export function TopPerformersOverview({
  topClients = [],
  topProperties = [],
  loading = false,
  clientDetailRoute = "/mantClient",
  propertyDetailRoute = "/mantBuild",
  maxItems = 5,
}: TopPerformersOverviewProps) {
  const [hoveredItem, setHoveredItem] = useState<{
    type: string;
    id: string;
  } | null>(null);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500 dark:text-yellow-300";
      case 1:
        return "text-gray-400 dark:text-gray-500";
      case 2:
        return "text-amber-700 dark:text-amber-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  };

  const getRowBgColor = (index: number, isHovered: boolean) => {
    if (isHovered) {
      return "bg-slate-100 dark:bg-slate-800";
    }

    switch (index) {
      case 0:
        return "bg-yellow-100 dark:bg-yellow-900";
      case 1:
        return "bg-slate-100 dark:bg-slate-700";
      case 2:
        return "bg-yellow-50 dark:bg-amber-900";
      default:
        return "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle>Top Clientes</CardTitle>
            </div>
            <Link
              href={`${clientDetailRoute}`}
              className="flex items-center text-sm text-blue-500 hover:text-blue-700 transition-colors"
            >
              Ver todos
              <ArrowUpRightIcon className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <CardDescription>Clientes con más alquileres</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : topClients.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">No hay datos disponibles</p>
          ) : (
            <>
              {/* Móvil */}
              <div className="sm:hidden divide-y divide-border rounded-md border">
                {topClients.slice(0, maxItems).map((client, index) => (
                  <Link key={client.cli_id} href={clientDetailRoute} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-6 flex justify-center">
                      {index < 3 ? (
                        <TrophyIcon className={`h-4 w-4 ${getMedalColor(index)}`} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{`${client.cli_nombre} ${client.cli_papellido}`}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.cli_correo}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                      {client._count.ava_clientexalquiler}
                    </Badge>
                  </Link>
                ))}
              </div>
              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Alquileres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.slice(0, maxItems).map((client, index) => (
                      <TableRow
                        key={client.cli_id}
                        className={`${getRowBgColor(index, hoveredItem?.type === "client" && hoveredItem?.id === client.cli_id)} cursor-pointer transition-colors`}
                        onMouseEnter={() => setHoveredItem({ type: "client", id: client.cli_id })}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => (window.location.href = clientDetailRoute)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center justify-center">
                            {index < 3 ? <TrophyIcon className={`h-5 w-5 ${getMedalColor(index)}`} /> : <span className="text-slate-500">{index + 1}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{`${client.cli_nombre} ${client.cli_papellido}`}</div>
                          <div className="text-xs text-muted-foreground">{client.cli_correo}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{client._count.ava_clientexalquiler}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-50 p-2 rounded-full">
                <HomeIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <CardTitle>Top Propiedades</CardTitle>
            </div>
            <Link
              href={`${propertyDetailRoute}`}
              className="flex items-center text-sm text-emerald-500 hover:text-emerald-700 transition-colors"
            >
              Ver todas
              <ArrowUpRightIcon className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <CardDescription>Propiedades con más alquileres</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : topProperties.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground">No hay datos disponibles</p>
          ) : (
            <>
              {/* Móvil */}
              <div className="sm:hidden divide-y divide-border rounded-md border">
                {topProperties.slice(0, maxItems).map((property, index) => (
                  <Link key={property.prop_id} href={propertyDetailRoute} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-6 flex justify-center">
                      {index < 3 ? (
                        <TrophyIcon className={`h-4 w-4 ${getMedalColor(index)}`} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{property.prop_identificador}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{property.prop_descripcion}</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex-shrink-0">
                      {property._count.ava_alquiler}
                    </Badge>
                  </Link>
                ))}
              </div>
              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Propiedad</TableHead>
                      <TableHead className="text-right">Alquileres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProperties.slice(0, maxItems).map((property, index) => (
                      <TableRow
                        key={property.prop_id}
                        className={`${getRowBgColor(index, hoveredItem?.type === "property" && hoveredItem?.id === property.prop_id)} cursor-pointer transition-colors`}
                        onMouseEnter={() => setHoveredItem({ type: "property", id: property.prop_id })}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => (window.location.href = propertyDetailRoute)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center justify-center">
                            {index < 3 ? <TrophyIcon className={`h-5 w-5 ${getMedalColor(index)}`} /> : <span className="text-slate-500">{index + 1}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{property.prop_identificador}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{property.prop_descripcion}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{property._count.ava_alquiler}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TopPerformersOverview;
