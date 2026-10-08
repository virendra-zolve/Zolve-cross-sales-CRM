import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { PartnerMaster } from '../types/partner';

type MasterInput = Omit<PartnerMaster, 'id' | 'partnerCode' | 'status' | 'createdAt' | 'updatedAt'>;

interface PartnerMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bdOwnerId: string;
  bdOwnerName: string;
  onMigrate: (rows: Array<{ master: MasterInput }>) => void;
}

/**
 * Lightweight migration importer. Accepts simple pipe-delimited rows:
 * LegalName | PartnerType | PartnerScale | PAN | OwnerName | OwnerEmail | OwnerPhone | City | State | Pincode | Country
 */
export const PartnerMigrationModal: React.FC<PartnerMigrationModalProps> = ({
  isOpen,
  onClose,
  bdOwnerId,
  bdOwnerName,
  onMigrate,
}) => {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parse = (): Array<{ master: MasterInput }> | null => {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    const rows: Array<{ master: MasterInput }> = [];
    for (const line of lines) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length < 11) {
        setError(`Row needs 11 fields: "${line}"`);
        return null;
      }
      const [legalBusinessName, partnerType, partnerScale, panNumber, ownerName, ownerEmail, ownerPhone, city, state, pincode, country] = parts;
      rows.push({
        master: {
          legalBusinessName,
          partnerType: partnerType as PartnerMaster['partnerType'],
          partnerScale: partnerScale as PartnerMaster['partnerScale'],
          panNumber,
          ownerName,
          ownerEmail,
          ownerPhone,
          contactPersonName: ownerName,
          contactPersonEmail: ownerEmail,
          contactPersonPhone: ownerPhone,
          registeredAddress: { addressLine1: '-', city, state, pincode, country },
          operatingSameAsRegistered: true,
          addressType: 'Head Office',
          bdOwnerId,
          bdOwnerName,
        },
      });
    }
    return rows;
  };

  const handleImport = () => {
    setError('');
    const rows = parse();
    if (!rows || rows.length === 0) {
      if (!error) setError('No valid rows found');
      return;
    }
    onMigrate(rows);
    setRaw('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Upload size={18} /> Migrate Existing Partners
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-600">
            Paste pipe-delimited rows (one per partner). These are activated directly, bypassing approval.
          </p>
          <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded">
            Name | Type | Scale | PAN | OwnerName | OwnerEmail | OwnerPhone | City | State | Pincode | Country
          </p>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            placeholder="ABC Consultants | DSA | Single Branch | ABCDE1234F | Ravi | ravi@abc.com | 9876543210 | Pune | MH | 411001 | India"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
          />
          {error && <div className="text-xs text-red-600">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button onClick={handleImport} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg">
            Import & Activate
          </button>
        </div>
      </div>
    </div>
  );
};
