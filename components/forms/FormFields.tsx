import { UseFormRegister, FieldError } from 'react-hook-form';

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export function Input({ label, name, type = 'text', placeholder, register, error, required }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

interface SelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export function Select({ label, name, options, register, error, required }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...register(name)}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

interface TextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export function Textarea({ label, name, placeholder, rows = 3, register, error, required }: TextareaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...register(name)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}
