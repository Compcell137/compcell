import React from 'react';

interface ServiceFormProps {
  initialData?: any;
  users?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  user?: any;
}

// Formulario básico para servicios técnicos
const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, users, onSave, onCancel, loading, user }) => {
  const [form, setForm] = React.useState<any>(initialData || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Marca</label>
        <input name="brand" value={form.brand || ''} onChange={handleChange} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Modelo</label>
        <input name="model" value={form.model || ''} onChange={handleChange} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Tipo</label>
        <input name="type" value={form.type || ''} onChange={handleChange} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Problema</label>
        <textarea name="issue" value={form.issue || ''} onChange={handleChange} className="w-full p-2 rounded bg-zinc-900 border border-zinc-700" />
      </div>
      <div className="flex gap-2 mt-6">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="bg-zinc-700 text-white px-4 py-2 rounded" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default ServiceForm;
