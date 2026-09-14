import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TeamMember, TeamMemberRole, EmploymentType, ExperienceLevel, MasterProduct } from '../types';

interface TeamOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeamMember: (member: TeamMember) => void;
  currentUserRole: TeamMemberRole;
  currentUserId: string;
  currentUserName: string;
  locationId: string;
  locationName: string;
  managerId: string;
  managerName: string;
  availableManagers?: { id: string; name: string }[]; // for Head to select manager
}

export const TeamOnboardingModal: React.FC<TeamOnboardingModalProps> = ({
  isOpen,
  onClose,
  onCreateTeamMember,
  currentUserRole,
  currentUserId,
  currentUserName,
  locationId,
  locationName,
  managerId,
  managerName,
  availableManagers = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Agent' as TeamMemberRole,
    location: locationName,
    locationId,
    managerId,
    managerName,
    product: 'Education Loan' as MasterProduct,
    monthlyTarget: 0,
    capacityPercent: 0,
    employmentType: 'Full-time' as EmploymentType,
    joiningDate: new Date().toISOString().split('T')[0],
    experienceLevel: 'Fresher' as ExperienceLevel,
    bankAccountNumber: '',
    bankIfscCode: '',
    avatar: '',
  });

  // Determine available roles based on current user role
  const getAvailableRoles = (): TeamMemberRole[] => {
    if (currentUserRole === 'Head') {
      return ['Manager', 'Team Lead', 'Agent', 'BDE'];
    }
    if (currentUserRole === 'Manager') {
      return ['Team Lead', 'Agent', 'BDE'];
    }
    return [];
  };

  const employmentTypes: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
  const experienceLevels: ExperienceLevel[] = ['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];
  const products: MasterProduct[] = [
    'Education Loan',
    'Refinance',
    'Test Prep',
    'Test Voucher',
    'Admissions',
    'Accommodation',
    'eSIM',
    'Travel / Flights',
    'Bank Account',
    'Credit Card',
    'Money Transfer',
    'NRE/NRO Account',
    'Insurance',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyTarget' || name === 'capacityPercent' ? parseFloat(value) : value,
    }));
  };

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedManagerId = e.target.value;
    const selectedManager = availableManagers.find(m => m.id === selectedManagerId);
    setFormData(prev => ({
      ...prev,
      managerId: selectedManagerId,
      managerName: selectedManager?.name || '',
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as TeamMemberRole;
    setFormData(prev => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = `USER_${Date.now().toString().slice(-6)}`;

    const newTeamMember: TeamMember = {
      id: `member_${Date.now()}`,
      userId,
      status: 'Pending Approval',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar || undefined,
      role: formData.role,
      location: formData.location,
      locationId: formData.locationId,
      managerId: formData.managerId,
      managerName: formData.managerName,
      product: formData.product,
      monthlyTarget: formData.monthlyTarget,
      capacityPercent: formData.capacityPercent,
      employmentType: formData.employmentType,
      joiningDate: formData.joiningDate,
      experienceLevel: formData.experienceLevel,
      bankAccountNumber: formData.bankAccountNumber || undefined,
      bankIfscCode: formData.bankIfscCode || undefined,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
      approvalHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'submitted',
          actor: currentUserName,
          actorRole: currentUserRole === 'Head' ? 'Head' : 'Manager',
        },
      ],
    };

    onCreateTeamMember(newTeamMember);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Agent',
      location: locationName,
      locationId,
      managerId,
      managerName,
      product: 'Education Loan',
      monthlyTarget: 0,
      capacityPercent: 0,
      employmentType: 'Full-time',
      joiningDate: new Date().toISOString().split('T')[0],
      experienceLevel: 'Fresher',
      bankAccountNumber: '',
      bankIfscCode: '',
      avatar: '',
    });
  };

  const availableRoles = getAvailableRoles();

  if (!isOpen || availableRoles.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Onboard Team Member</h2>
            <p className="text-xs text-slate-600 mt-1">Location: {locationName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Basic Information</h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
              />
            </div>
          </div>

          {/* Role & Location */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Role & Location</h3>

            <div className="grid grid-cols-2 gap-3">
              <select
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={formData.location}
                disabled
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
              />

              {currentUserRole === 'Head' && availableManagers.length > 0 && (
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleManagerChange}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
                >
                  <option value="">Select Manager *</option>
                  {availableManagers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Product & Target */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Product & Target</h3>

            <div className="grid grid-cols-2 gap-3">
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {products.map(product => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="monthlyTarget"
                placeholder="Monthly Target *"
                value={formData.monthlyTarget}
                onChange={handleChange}
                required
                min="0"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="number"
                name="capacityPercent"
                placeholder="Capacity % *"
                value={formData.capacityPercent}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Employment Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {employmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bank Details (Optional) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-900">Bank Details (Optional)</h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="bankAccountNumber"
                placeholder="Account Number"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="text"
                name="bankIfscCode"
                placeholder="IFSC Code"
                value={formData.bankIfscCode}
                onChange={handleChange}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
