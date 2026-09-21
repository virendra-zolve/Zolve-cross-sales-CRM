import React, { useState } from 'react';
import { FileText, Upload, Share2, Download, Trash2, Filter } from 'lucide-react';

interface Document {
  id: string;
  fileName: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  sharingStatus: 'Shared' | 'Not Shared' | 'Draft';
}

interface LeadDocumentsSectionProps {
  documents?: Document[];
  onUpload?: (file: File, category: string) => void;
  onShare?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

const DOCUMENT_CATEGORIES = [
  'Passport',
  'PAN Card',
  'Aadhaar Card',
  'Address Proof',
  'Academic Documents',
  'Financial Documents',
  'Test Scores',
  'University Documents',
  'Visa Documents',
  'Acceptance Letter',
  'Other',
];

export const LeadDocumentsSection: React.FC<LeadDocumentsSectionProps> = ({
  documents = [],
  onUpload,
  onShare,
  onDelete,
}) => {
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCategory) {
      onUpload?.(file, selectedCategory);
      setIsUploadingFile(false);
      setSelectedCategory('');
    }
  };

  const filteredDocuments = selectedFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedFilter);

  const getSharingStatusBadge = (status: string) => {
    const baseClass = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold';
    switch (status) {
      case 'Shared':
        return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>✓ Shared</span>;
      case 'Draft':
        return <span className={`${baseClass} bg-amber-100 text-amber-700`}>📝 Draft</span>;
      default:
        return <span className={`${baseClass} bg-slate-100 text-slate-600`}>Not Shared</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-700 font-semibold">
          📁 Documents & Files - Central repository for all lead documents. Share with lenders/vendors without re-uploading.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-slate-600" />
          Upload Document
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-medium block mb-1">Document Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">Select category...</option>
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-[11px] text-slate-500 font-medium block mb-1">Select File</label>
            <label className="flex items-center justify-center w-full p-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#2563EB] cursor-pointer transition-colors bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">
                  {isUploadingFile ? 'Choose file...' : 'Click to select'}
                </span>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!selectedCategory}
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-slate-500">Supported: PDF, JPG, PNG, Excel (Max 10MB per file)</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-semibold text-slate-600">Filter by Category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              selectedFilter === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {DOCUMENT_CATEGORIES.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedFilter === cat
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">File Name</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Category</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Uploaded By</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Sharing Status</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-6 h-6 text-slate-300" />
                      <span>No documents uploaded yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 text-slate-900 font-semibold truncate max-w-xs">{doc.fileName}</td>
                    <td className="px-4 py-2 text-slate-600">{doc.category}</td>
                    <td className="px-4 py-2 text-slate-600">{doc.uploadedBy}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {getSharingStatusBadge(doc.sharingStatus)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onShare?.(doc.id)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors cursor-pointer"
                          title="Share document"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete?.(doc.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors cursor-pointer"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
        <p className="text-xs text-indigo-700 font-semibold">
          💡 One document, many uses: A student's Passport can be shared to Loan + Visa + eSIM + Travel products without re-uploading. Documents are stored centrally and linked to products as needed.
        </p>
      </div>
    </div>
  );
};
