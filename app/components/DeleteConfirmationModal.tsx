'use client';
import React from 'react';
import { FaExclamationTriangle, FaTrash, FaTimes } from 'react-icons/fa';

interface Props {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; itemName: string; isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, message, itemName, isLoading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600" />
            </div>
            <div><h3 className="font-semibold text-text">{title}</h3><p className="text-sm text-text-muted">{itemName}</p></div>
          </div>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
        </div>
        <div className="p-6">
          <p className="text-text-secondary mb-4">{message}</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700"><strong>Warning:</strong> This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-6 border-t border-border">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2">
            {isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Deleting...</span></> : <><FaTrash /><span>Delete</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
