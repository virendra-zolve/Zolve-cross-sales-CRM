import React, { useState } from 'react';
import { ShoppingBag, Plus, Zap, ExternalLink } from 'lucide-react';
import { MasterProduct, ProductOpportunity, ProductOpportunityStatus } from '../../types';

interface LeadProductsSectionProps {
  lead: any;
  onProductToggle?: (product: MasterProduct, isActive: boolean) => void;
  onProductStatusChange?: (product: MasterProduct, newStatus: ProductOpportunityStatus) => void;
  onOpenEducationLoan?: () => void;
}

const ALL_MASTER_PRODUCTS: MasterProduct[] = [
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

const PRODUCT_STATUS_OPTIONS: ProductOpportunityStatus[] = [
  'Not Started',
  'Interested',
  'In Progress',
  'Completed / Sold',
  'Not Interested',
  'Failed / Rejected',
  'Cancelled',
  'Closed',
];

const getStatusColor = (status: ProductOpportunityStatus) => {
  switch (status) {
    case 'Completed / Sold':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Interested':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Not Started':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-rose-100 text-rose-700 border-rose-200';
  }
};

const getProductIcon = (product: MasterProduct): string => {
  switch (product) {
    case 'Education Loan':
    case 'Refinance':
      return '📚';
    case 'Test Prep':
    case 'Test Voucher':
      return '📖';
    case 'Bank Account':
    case 'Credit Card':
    case 'Money Transfer':
    case 'NRE/NRO Account':
      return '🏦';
    case 'Admissions':
      return '✅';
    case 'Accommodation':
      return '🏠';
    case 'eSIM':
      return '📱';
    case 'Travel / Flights':
      return '✈️';
    case 'Insurance':
      return '🛡️';
    default:
      return '📦';
  }
};

export const LeadProductsSection: React.FC<LeadProductsSectionProps> = ({
  lead,
  onProductToggle,
  onProductStatusChange,
  onOpenEducationLoan,
}) => {
  const [expandedProduct, setExpandedProduct] = useState<MasterProduct | null>(null);
  const [showAddProducts, setShowAddProducts] = useState(false);

  const activeProducts = lead.productOpportunities?.filter(
    (p: ProductOpportunity) => lead.masterProducts?.[p.product]
  ) || [];

  const availableProducts = ALL_MASTER_PRODUCTS.filter(
    prod => !lead.masterProducts?.[prod]
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-50 to-slate-50 rounded-xl border border-amber-200 p-4">
        <p className="text-xs text-amber-700 font-semibold">
          🎯 Product Opportunities - Identify and pursue relevant products for each lead
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className="text-lg font-bold text-[#2563EB]">{activeProducts.length}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Products</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className="text-lg font-bold text-emerald-600">
            {activeProducts.filter((p: ProductOpportunity) => p.status === 'Completed / Sold').length}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Sold</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className="text-lg font-bold text-blue-600">
            {activeProducts.filter((p: ProductOpportunity) => p.status === 'In Progress').length}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">In Progress</div>
        </div>
      </div>

      {/* Add Products Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddProducts(!showAddProducts)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-[#1E40AF] cursor-pointer transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Products
        </button>
      </div>

      {/* Add Products Dropdown */}
      {showAddProducts && availableProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <p className="text-xs font-semibold text-slate-600 mb-2">Select products to add:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableProducts.map(product => (
              <button
                key={product}
                onClick={() => {
                  onProductToggle?.(product, true);
                }}
                className="inline-flex items-center gap-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{product}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Products List */}
      <div className="space-y-2">
        {activeProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No products added yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Products" to identify opportunities</p>
          </div>
        ) : (
          activeProducts.map((product: ProductOpportunity) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Product Header */}
              <button
                onClick={() => setExpandedProduct(expandedProduct === product.product ? null : product.product)}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getProductIcon(product.product)}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-900">{product.product}</div>
                    <div className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(product.status)}`}>
                      {product.status === 'Completed / Sold' ? '✓ Sold' :
                       product.status === 'In Progress' ? '⚡ Active' :
                       product.status === 'Interested' ? '🆕 New' : product.status}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400">{expandedProduct === product.product ? '−' : '+'}</span>
              </button>

              {/* Expanded Product Details */}
              {expandedProduct === product.product && (
                <div className="px-4 py-3 border-t border-slate-200 space-y-3 bg-slate-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">Status</label>
                      <select
                        value={product.status}
                        onChange={e => onProductStatusChange?.(product.product, e.target.value as ProductOpportunityStatus)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
                      >
                        {PRODUCT_STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    {product.product === 'Education Loan' && (
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">Amount</label>
                        <input
                          type="text"
                          placeholder={product.amount || 'e.g., $50,000'}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
                          readOnly
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {product.partner && (
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">Partner</label>
                        <input
                          type="text"
                          value={product.partner}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
                          readOnly
                        />
                      </div>
                    )}
                    {product.productOwner && (
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">Product Owner</label>
                        <input
                          type="text"
                          value={product.productOwner}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
                          readOnly
                        />
                      </div>
                    )}
                  </div>

                  {product.details && (
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">Details & Notes</label>
                      <textarea
                        value={product.details}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#2563EB]"
                        rows={2}
                        readOnly
                      />
                    </div>
                  )}

                  {/* Education Loan Special Section */}
                  {product.product === 'Education Loan' && (
                    <button
                      onClick={onOpenEducationLoan}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#2563EB] to-blue-600 text-white rounded-lg text-xs font-bold hover:shadow-md cursor-pointer transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Open Full Loan Profile
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Remove Product */}
                  <button
                    onClick={() => onProductToggle?.(product.product, false)}
                    className="w-full px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 cursor-pointer transition-colors"
                  >
                    Remove Product
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700 font-semibold">
          ℹ️ Products are independent of lead status. A lead can be Closed but still have In Progress or Completed products.
        </p>
      </div>
    </div>
  );
};
