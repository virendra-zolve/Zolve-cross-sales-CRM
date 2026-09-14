import React, { useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import { Partner } from '../types';

interface AgreementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  onUploadAgreement: (partnerId: string, file: File) => void;
  bdeName: string;
}

export const AgreementUploadModal: React.FC<AgreementUploadModalProps> = ({
  isOpen,
  onClose,
  partner,
  onUploadAgreement,
  bdeName,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!partner || !selectedFile) return;
    
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      onUploadAgreement(partner.id, selectedFile);
      setSelectedFile(null);
      setUploading(false);
      onClose();
    }, 1000);
  };

  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900">Upload Partnership Agreement</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Partner Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 mb-1">Partner Approved:</p>
            <p className="font-semibold text-slate-900">{partner.businessName}</p>
            <p className="text-xs text-slate-600 mt-1">
              Ready to sign agreement and activate partnership
            </p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
            
            {selectedFile ? (
              <>
                <p className="font-semibold text-emerald-600 text-sm">✓ File selected</p>
                <p className="text-xs text-slate-600 mt-1">{selectedFile.name}</p>
                <button
                  onClick={() => {
                    const input = document.getElementById('agreement-file-input') as HTMLInputElement;
                    input?.click();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 underline"
                >
                  Choose different file
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-600">
                  PDF, DOC, or image files (max 10MB)
                </p>
                <button
                  onClick={() => {
                    const input = document.getElementById('agreement-file-input') as HTMLInputElement;
                    input?.click();
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Browse Files
                </button>
              </>
            )}
            
            <input
              id="agreement-file-input"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Partner Details */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-medium text-slate-900">Pending Agreement</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Approved by Head:</span>
              <span className="font-medium text-emerald-600">✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Commission:</span>
              <span className="font-medium text-slate-900">
                {partner.commissions.map(c => `${c.product}: ${c.value}%`).join(', ')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              {uploading ? 'Uploading...' : 'Upload Agreement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
