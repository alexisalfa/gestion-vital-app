// src/components/HeadlessSafeSelect.jsx
import React, { useMemo, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Label } from '@/components/ui/label';

/**
 * Componente Select Seguro (Nivel Enterprise)
 * Blindado contra errores de propiedades indefinidas para evitar colapsos de UI.
 */
export function HeadlessSafeSelect({
  label = "opción", // 🦾 Blindaje: Valor por defecto si no se envía prop
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  disabled = false,
  loading = false,
}) {
  // Sanea el valor para asegurar consistencia
  const safeValue = useMemo(() => {
    if (value === null || value === undefined || value === 0 || value === "") {
      return "";
    }
    const valueStr = String(value);
    const match = options.find(opt => opt?.id !== null && opt?.id !== undefined && String(opt.id) === valueStr);
    return match ? valueStr : "";
  }, [value, options]);

  // Asegura que siempre exista una opción vacía para el placeholder
  const finalOptions = useMemo(() => {
    const hasEmptyOption = options.some(opt => String(opt?.id) === "");
    if (!hasEmptyOption) {
      return [{ id: "", nombre: placeholder }, ...options];
    }
    return options;
  }, [options, placeholder]);

  // Encuentra la opción seleccionada de forma segura
  const selectedOption = useMemo(() => {
    return finalOptions.find(opt => String(opt?.id) === safeValue) || { id: "", nombre: placeholder };
  }, [safeValue, finalOptions, placeholder]);

  // 🦾 SOLUCIÓN AL ERROR toLowerCase:
  // Convertimos label a String y proporcionamos fallback antes de transformar a minúsculas.
  const safeLabelLower = String(label || 'opciones').toLowerCase();

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
        <input
          type="text"
          value={`Cargando ${safeLabelLower}...`}
          disabled
          className="w-full bg-gray-100 text-gray-500 px-3 py-2 rounded-md text-sm italic cursor-not-allowed"
        />
      </div>
    );
  }

  if (options.length === 0 && !loading) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
        <input
          type="text"
          value={`No hay ${safeLabelLower} disponibles.`}
          disabled
          className="w-full bg-gray-100 text-gray-500 px-3 py-2 rounded-md text-sm italic cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
      <Listbox value={selectedOption.id} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm">
              <span className="block truncate">
                {selectedOption.nombre || selectedOption.label || placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {finalOptions
                  .filter(opt => opt && (typeof opt.id === 'number' || (typeof opt.id === 'string' && opt.id.trim() !== '')) || String(opt.id) === "")
                  .map((opt) => (
                    <Listbox.Option
                      key={String(opt.id)}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                        }`
                      }
                      value={String(opt.id)}
                    >
                      {({ selected }) => (
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {opt.nombre || opt.label || `ID ${opt.id}`}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}