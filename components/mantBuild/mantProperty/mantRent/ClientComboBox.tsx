"use client";

import * as React from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Cliente } from "@/lib/types";

const RESULTS_LIMIT = 20;

interface ClientComboBoxProps {
  onClientSelect: (client: Cliente) => void;
  disabled?: boolean;
}

export const ClientComboBox: React.FC<ClientComboBoxProps> = ({
  onClientSelect,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Cliente | null>(
    null
  );

  const handleSelect = (client: Cliente) => {
    setSelectedClient(client);
    onClientSelect(client);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="m-2 w-[200px] justify-start"
          disabled={disabled}
        >
          {selectedClient ? (
            <>
              {selectedClient.cli_nombre} {selectedClient.cli_papellido}
            </>
          ) : (
            <>+ Selecciona un cliente</>
          )}
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-[300px] p-0" align="start">
          {open && <ClientList onSelect={handleSelect} />}
        </PopoverContent>
      )}
    </Popover>
  );
};

interface ClientListProps {
  onSelect: (client: Cliente) => void;
}

// Busca en el servidor (con debounce) para no depender de la página de
// clientes que se haya cargado.
const ClientList: React.FC<ClientListProps> = ({ onSelect }) => {
  const [query, setQuery] = React.useState("");
  const [clients, setClients] = React.useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await axios.get("/api/client", {
          params: { search: query.trim() || undefined, limit: RESULTS_LIMIT },
        });
        if (!cancelled) setClients(res.data.data ?? []);
      } catch (error) {
        console.error("Error al buscar clientes:", error);
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Buscar por nombre o cédula..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Buscando...
          </div>
        ) : (
          <>
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.cli_id}
                  value={client.cli_id}
                  onSelect={() => onSelect(client)}
                >
                  {client.cli_nombre} {client.cli_papellido}{" "}
                  {client.cli_sapellido} - {client.cli_cedula}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
};
