// src/components/HeadlessSafeSelect.jsx
import React, { useMemo, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'; // Necesitarás instalar @heroicons/react
import { Label } from '@/components/ui/label'; // Reutilizamos Label de Shadcn/UI

// Instala heroicons: npm install @heroicons/react

/**
 * Componente Select seguro y reutilizable construido con Headless UI.
 * Encapsula la lógica defensiva y permite control total sobre el estilo con Tailwind.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.label - Etiqueta para el Select.
 * @param {string | number | null | undefined} props.value - El valor actual que el Select intenta mostrar.
 * @param {function} props.onChange - Callback cuando el valor cambia.
 * @param {Array<object>} props.options - Array de objetos { id: ..., nombre?: ..., label?: ... }. Por defecto es [].
 * @param {string} [props.placeholder="Selecciona una opción"] - Texto del placeholder.
 * @param {boolean} [props.disabled=false] - Si el Select está deshabilitado por el componente padre.
 * @param {boolean} [props.loading=false] - Indica si las opciones están cargando.
 */
export function HeadlessSafeSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  disabled = false,
  loading = false,
}) {
  // Sanea el valor: "" si es null, undefined, 0, o no coincide con una opción válida.
  // Headless UI es más permisivo, pero lo mantenemos para consistencia.
  const safeValue = useMemo(() => {
    if (value === null || value === undefined || value === 0 || value === "") {
      return "";
    }
    const valueStr = String(value);
    const match = options.find(opt => opt?.id !== null && opt?.id !== undefined && String(opt.id) === valueStr);
    return match ? valueStr : "";
  }, [value, options]);

  // Prepend una opción "vacía" al array de opciones si hay datos.
  // Esto asegura que el placeholder pueda ser seleccionado y su valor "" coincida con un SelectItem.
  const finalOptions = useMemo(() => {
    const hasEmptyOption = options.some(opt => String(opt.id) === "");
    if (!hasEmptyOption) {
      // Usamos id: "" para el placeholder
      return [{ id: "", nombre: placeholder }, ...options];
    }
    return options;
  }, [options, placeholder]);

  // Encuentra la opción seleccionada para mostrarla en el trigger
  const selectedOption = useMemo(() => {
    return finalOptions.find(opt => String(opt.id) === safeValue) || { id: "", nombre: placeholder };
  }, [safeValue, finalOptions, placeholder]);

  // Manejo de estados de carga y listas vacías
  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
        <input
          type="text"
          value={`Cargando ${label.toLowerCase()}...`}
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
          value={`No hay ${label.toLowerCase()} disponibles.`}
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
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {finalOptions
                  .filter(opt => opt && (typeof opt.id === 'number' || (typeof opt.id === 'string' && opt.id.trim() !== '')) || String(opt.id) === "")
                  .map((opt) => (
                    <Listbox.Option
                      key={String(opt.id)}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
                          active ? 'bg-primary text-primary-foreground' : 'text-gray-900'
                        }`
                      }
                      value={String(opt.id)} // Aseguramos que el valor sea string para Headless UI
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                            {opt.nombre || opt.label || `ID ${opt.id}`}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                selected ? 'text-primary-foreground' : 'text-primary'
                              }`}
                            >
                              {/* Puedes usar un ícono de check aquí si lo deseas */}
                            </span>
                          ) : null}
                        </>
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
