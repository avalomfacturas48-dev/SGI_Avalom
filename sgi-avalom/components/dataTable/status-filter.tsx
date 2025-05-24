"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
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

interface StatusOption {
  label: string;
  value: string;
}

interface StatusFilterProps {
  filterName: string;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  statuses: StatusOption[];
}

export function StatusFilter({
  selectedStatuses,
  onStatusChange,
  statuses,
  filterName,
}: StatusFilterProps) {
  const [open, setOpen] = React.useState(false);

  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      onStatusChange(selectedStatuses.filter((status) => status !== value));
    } else {
      onStatusChange([...selectedStatuses, value]);
    }
  };

  const clearFilters = () => {
    onStatusChange([]);
    setOpen(false);
  };

  const removeFilter = (value: string) => {
    onStatusChange(selectedStatuses.filter((status) => status !== value));
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="borderOrange"
            size="sm"
            className="h-10 border-dashed"
          >
            <Search className="mr-2 h-4 w-4" />
            {selectedStatuses.length > 0
              ? "Filtros aplicados"
              : `Filtrar por ${filterName}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar filtros..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    onSelect={() => toggleStatus(status.value)}
                  >
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded border border-primary ${
                        selectedStatuses.includes(status.value)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </div>
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {selectedStatuses.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      {selectedStatuses.length > 0 &&
        selectedStatuses.some((status) =>
          statuses.find((s) => s.value === status)
        ) && (
          <div className="flex flex-wrap gap-2">
            {selectedStatuses.map((status) => {
              const statusOption = statuses.find((s) => s.value === status);
              if (!statusOption) return null;
              return (
                <Button
                  key={status}
                  variant="secondary"
                  size="sm"
                  className="h-8 px-2 text-sm"
                  onClick={() => removeFilter(status)}
                >
                  {statusOption.label}
                  <X className="ml-2 h-3 w-3" />
                </Button>
              );
            })}
          </div>
        )}
    </div>
  );
}
