"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600';
      case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return '🗑️';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">{getIcon()}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white px-6 py-3 rounded-lg transition-colors font-medium ${getColors()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}