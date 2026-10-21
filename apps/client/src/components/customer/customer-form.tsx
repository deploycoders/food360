'use client';

import { useState, type FormEvent } from 'react';
import { CustomerData } from '@/types';

interface CustomerFormProps {
  isOpen: boolean;
  onSubmit: (data: CustomerData) => void;
}

export default function CustomerForm({ isOpen, onSubmit }: CustomerFormProps) {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'Mínimo 2 caracteres';
    }

    if (!cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!/^\d{6,10}$/.test(cedula.trim())) {
      newErrors.cedula = 'Ingresa una cédula válida (6-10 dígitos)';
    }

    if (!telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{10,11}$/.test(telefono.trim())) {
      newErrors.telefono = 'Ingresa un teléfono válido (10-11 dígitos)';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ nombre: nombre.trim(), cedula: cedula.trim(), telefono: telefono.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0e1711]/75 backdrop-blur-xs animate-fade-in" />

      {/* Modal Dialog (Bordes 12px-16px suaves) */}
      <div
        className={`relative w-full max-w-sm bg-white rounded-xl p-6 shadow-xl text-[var(--color-text-body)] border border-[var(--color-border)] animate-slide-up ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <span className="font-editorial-serif text-xl font-semibold text-[var(--color-text-primary)]">
            360 food
          </span>
          <h3 className="font-editorial-serif text-lg font-medium text-[var(--color-text-primary)] mt-0.5">
            Registro de Comensal
          </h3>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-1 font-normal">
            Ingresa tus datos para procesar y despachar tu comanda a cocina
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nombre */}
          <div>
            <label htmlFor="customer-name" className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-primary)] mb-1 block">
              Nombre y Apellido
            </label>
            <input
              id="customer-name"
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
              }}
              placeholder="Ej: Carlos Mendoza"
              className={`w-full bg-[#F9F8F3] border rounded-lg px-3 py-2.5 text-xs text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-forest)] focus:bg-white ${
                errors.nombre ? 'border-[var(--color-accent-terracotta)]' : 'border-[var(--color-border)]'
              }`}
            />
            {errors.nombre && (
              <p className="text-[var(--color-accent-terracotta)] text-[11px] mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Cédula */}
          <div>
            <label htmlFor="customer-cedula" className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-primary)] mb-1 block">
              Cédula de Identidad
            </label>
            <input
              id="customer-cedula"
              type="text"
              inputMode="numeric"
              value={cedula}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setCedula(val);
                if (errors.cedula) setErrors((prev) => ({ ...prev, cedula: '' }));
              }}
              placeholder="Ej: 18456789"
              className={`w-full bg-[#F9F8F3] border rounded-lg px-3 py-2.5 text-xs text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-forest)] focus:bg-white ${
                errors.cedula ? 'border-[var(--color-accent-terracotta)]' : 'border-[var(--color-border)]'
              }`}
            />
            {errors.cedula && (
              <p className="text-[var(--color-accent-terracotta)] text-[11px] mt-1">{errors.cedula}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="customer-phone" className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-primary)] mb-1 block">
              Teléfono de Contacto
            </label>
            <input
              id="customer-phone"
              type="text"
              inputMode="numeric"
              value={telefono}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setTelefono(val);
                if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: '' }));
              }}
              placeholder="Ej: 04141234567"
              className={`w-full bg-[#F9F8F3] border rounded-lg px-3 py-2.5 text-xs text-[var(--color-text-body)] outline-none transition-colors focus:border-[var(--color-forest)] focus:bg-white ${
                errors.telefono ? 'border-[var(--color-accent-terracotta)]' : 'border-[var(--color-border)]'
              }`}
            />
            {errors.telefono && (
              <p className="text-[var(--color-accent-terracotta)] text-[11px] mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[var(--color-accent-terracotta)] hover:bg-[var(--color-accent-terracotta-hover)] text-white font-medium text-xs uppercase tracking-wider cursor-pointer mt-2 transition-colors shadow-xs"
          >
            Continuar con la Orden →
          </button>
        </form>
      </div>
    </div>
  );
}
