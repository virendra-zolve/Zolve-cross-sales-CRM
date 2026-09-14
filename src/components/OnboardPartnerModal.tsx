import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Partner, PartnerType, MasterProduct } from '../types';

interface OnboardPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePartner: (partner: Partner) => void;
  bdeUserId: string;
  bdeName: string;
  locationId: string;
  locationName: string;
  managerId: string;
  managerName: string;
}

export const OnboardPartnerModal: React.FC<OnboardPartnerModalProps> = ({
  isOpen,
  onClose,
  onCreatePartner,
  bdeUserId,
  bdeName,
  locationId,
  locationName,
  managerId,
  managerName,
}) => {
  const [step, setStep] = useState<'details' | 'commissions' | 'documents'>('details');
  const [formData, setFormData] = useState({
    // Business Legal
    businessName: '',
    partnerType: 'Agent' as PartnerType,
    pan: '',
    panNumber: '',
    cin: '',
    gst: '',
    gstNumber: '',
    
    // Owner
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    
    // Contact Person
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    
    // Registered Address
    addressLine1: '',
    addressLine2: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    
    // Operating Address
    sameAsRegistered: true,
    operatingAddressLine1: '',
    operatingAddressLine2: '',
    operatingStreet: '',
    operatingCity: '',
    operatingState: '',
    operatingPincode: '',
    operatingCountry: '',
    
    // Products
    eligibleProducts: [] as MasterProduct[],
    commissions: {} as Record<MasterProduct, number>, // product -> commission %
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});

  const partnerTypes: PartnerType[] = ['Agent', 'School', 'Coaching Center', 'Overseas Hub', 'Other'];
  const products: MasterProduct[] = ['Education Loan', 'Test Prep', 'Admissions', 'Accommodation', 'eSIM'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProductToggle = (product: MasterProduct) => {
    setFormData(prev => ({
      ...prev,
      eligibleProducts: prev.eligibleProducts.includes(product)
        ? prev.eligibleProducts.filter(p => p !== product)
        : [...prev.eligibleProducts, product],
      commissions: prev.eligibleProducts.includes(product)
        ? (() => { const { [product]: _, ...rest } = prev.commissions; return rest; })()
        : { ...prev.commissions, [product]: 5 }, // default 5%
    }));
  };

  const handleCommissionChange = (product: MasterProduct, value: number) => {
    setFormData(prev => ({
      ...prev,
      commissions: { ...prev.commissions, [product]: value },
    }));
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocs(prev => ({ ...prev, [docType]: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const partnerCode = `PART_${Date.now().toString().slice(-5)}`;
    const sourceCode = `SRC_${Date.now().toString().slice(-5)}`;
    
    const documents = Object.entries(uploadedDocs).map(([type, file]) => ({
      type: type as 'PAN' | 'CIN' | 'GST',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      uploadedBy: bdeName || 'BDE User',
    }));
    
    const newPartner: Partner = {
      id: `partner_${Date.now()}`,
      partnerCode,
      status: 'Pending Manager',
      
      businessName: formData.businessName,
      partnerType: formData.partnerType,
      pan: formData.pan,
      panNumber: formData.panNumber,
      cin: formData.cin,
      gst: formData.gst,
      gstNumber: formData.gstNumber,
      
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      
      contactPersonName: formData.contactPersonName,
      contactPersonEmail: formData.contactPersonEmail,
      contactPersonPhone: formData.contactPersonPhone,
      
      registeredAddress: {
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      },
      
      operatingAddress: !formData.sameAsRegistered ? {
        addressLine1: formData.operatingAddressLine1,
        addressLine2: formData.operatingAddressLine2,
        street: formData.operatingStreet,
        city: formData.operatingCity,
        state: formData.operatingState,
        pincode: formData.operatingPincode,
        country: formData.operatingCountry,
      } : undefined,
      
      bdeUserId,
      bdeName,
      managerId,
      managerName,
      locationId,
      locationName,
      sourceCode,
      createdAt: new Date().toISOString(),
      eligibleProducts: formData.eligibleProducts,
      commissions: formData.eligibleProducts.map(product => ({
        product,
        type: 'Percentage' as const,
        value: formData.commissions[product] || 5,
      })),
      documents,
      totalLeadsGenerated: 0,
      leadsConverted: 0,
      activeLeads: 0,
      approvalHistory: [{
        timestamp: new Date().toISOString(),
        action: 'submitted',
        actor: bdeName || 'BDE User',
        actorRole: 'BDE',
      }],
    };
    
    onCreatePartner(newPartner);
    setStep('details');
    setFormData({
      businessName: '',
      partnerType: 'Agent',
      pan: '',
      panNumber: '',
      cin: '',
      gst: '',
      gstNumber: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      contactPersonName: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
      addressLine1: '',
      addressLine2: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      sameAsRegistered: true,
      operatingAddressLine1: '',
      operatingAddressLine2: '',
      operatingStreet: '',
      operatingCity: '',
      operatingState: '',
      operatingPincode: '',
      operatingCountry: '',
      eligibleProducts: [],
      commissions: {},
    });
    setUploadedDocs({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Onboard New Partner</h2>
            <p className="text-xs text-slate-600 mt-1">Location: {locationName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1 border-b border-slate-200 px-4 py-2">
          {['details', 'commissions', 'documents'].map((s, idx) => (
            <button
              key={s}
              onClick={() => setStep(s as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                step === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {idx + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {step === 'details' && (
            <>
              {/* Business Legal Section */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <h3 className="font-semibold text-sm text-slate-900">Business & Legal</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="businessName"
                    placeholder="Business Name *"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <select
                    name="partnerType"
                    value={formData.partnerType}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {partnerTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    name="pan"
                    placeholder="PAN *"
                    value={formData.pan}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    name="panNumber"
                    placeholder="PAN Number (for invoice)"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    name="cin"
                    placeholder="CIN"
                    value={formData.cin}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    name="gst"
                    placeholder="GST"
                    value={formData.gst}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    name="gstNumber"
                    placeholder="GST Number (for invoice)"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  />
                </div>
              </div>

              {/* Owner Section */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <h3 className="font-semibold text-sm text-slate-900">Owner / Authorized Person</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Name *"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="email"
                    name="ownerEmail"
                    placeholder="Email *"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="tel"
                    name="ownerPhone"
                    placeholder="Phone *"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  />
                </div>
              </div>

              {/* Contact Person Section */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <h3 className="font-semibold text-sm text-slate-900">Contact Person</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="contactPersonName"
                    placeholder="Name"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="email"
                    name="contactPersonEmail"
                    placeholder="Email"
                    value={formData.contactPersonEmail}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="tel"
                    name="contactPersonPhone"
                    placeholder="Phone"
                    value={formData.contactPersonPhone}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  />
                </div>
              </div>

              {/* Registered Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-900">Registered Address</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Address Line 1 *"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                  />
                  
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {step === 'commissions' && (
            <>
              {/* Products Selection */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <h3 className="font-semibold text-sm text-slate-900">Select Eligible Products</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {products.map(product => (
                    <label key={product} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.eligibleProducts.includes(product)}
                        onChange={() => handleProductToggle(product)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">{product}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Commission Setup */}
              {formData.eligibleProducts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Commission Structure</h3>
                  <p className="text-xs text-slate-600">Set commission percentage for each product</p>
                  
                  <div className="space-y-2">
                    {formData.eligibleProducts.map(product => (
                      <div key={product} className="flex items-center justify-between p-2 border border-slate-200 rounded-lg">
                        <span className="text-sm font-medium text-slate-900">{product}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.commissions[product] || 5}
                            onChange={(e) => handleCommissionChange(product, parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-600">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'documents' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-900">Upload Documents</h3>
              <p className="text-xs text-slate-600">Upload business documents for verification</p>
              
              {['PAN', 'CIN', 'GST'].map(docType => (
                <div key={docType} className="border border-slate-300 rounded-lg p-3 hover:bg-slate-50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Upload size={16} className="text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">{docType} Document</span>
                    {uploadedDocs[docType] && (
                      <span className="text-xs text-emerald-600 ml-auto">✓ {uploadedDocs[docType].name}</span>
                    )}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocUpload(e, docType)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex gap-2">
              {step !== 'details' && (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'details' | 'commissions' | 'documents'> = ['details', 'commissions', 'documents'];
                    const currentIdx = steps.indexOf(step);
                    if (currentIdx > 0) setStep(steps[currentIdx - 1]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              
              {step !== 'documents' ? (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'details' | 'commissions' | 'documents'> = ['details', 'commissions', 'documents'];
                    const currentIdx = steps.indexOf(step);
                    if (currentIdx < steps.length - 1) setStep(steps[currentIdx + 1]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
