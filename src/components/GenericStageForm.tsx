import React, { useCallback, useMemo, useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

export interface StageFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'multi-select';
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null; // Returns error message or null if valid
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  autoPopulated?: boolean; // Show badge if auto-populated from Lead Profile
}

export interface StageFormConfig {
  stageName: string;
  description?: string;
  fields: StageFieldConfig[];
}

interface GenericStageFormProps {
  config: StageFormConfig;
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onFieldBlur?: (fieldName: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * GenericStageForm - Dynamic form renderer for education loan journey stages
 * 
 * Features:
 * - Renders different field types (text, email, phone, number, date, select, checkbox, textarea)
 * - Real-time field validation with inline error display
 * - Auto-population badges for shared fields
 * - Form-level validation tracking
 * - Accessible form structure
 */
const GenericStageForm: React.FC<GenericStageFormProps> = ({
  config,
  formData,
  validationErrors,
  onFieldChange,
  onFieldBlur,
  onValidationChange,
}) => {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Validate entire form
  const isFormValid = useMemo(() => {
    return config.fields
      .filter(field => field.required)
      .every(field => {
        const value = formData[field.name];
        return value !== undefined && value !== null && value !== '';
      });
  }, [config.fields, formData]);

  // Notify parent of validation state changes
  React.useEffect(() => {
    onValidationChange?.(isFormValid && Object.keys(validationErrors).length === 0);
  }, [isFormValid, validationErrors, onValidationChange]);

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      onFieldChange(fieldName, value);
    },
    [onFieldChange]
  );

  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setTouched(prev => new Set(prev).add(fieldName));
      onFieldBlur?.(fieldName);
    },
    [onFieldBlur]
  );

  const renderField = (field: StageFieldConfig) => {
    const value = formData[field.name];
    const error = validationErrors[field.name];
    const isTouched = touched.has(field.name);
    const hasError = error && isTouched;

    const baseInputClasses = `
      w-full px-3 py-2 text-sm border rounded-lg transition-all
      ${hasError
        ? 'border-red-300 bg-red-50 text-slate-900 placeholder-red-300'
        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
      }
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
    `.trim();

    const selectClasses = `
      ${baseInputClasses}
      appearance-none bg-right bg-no-repeat pr-8
    `;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            minLength={field.minLength}
            maxLength={field.maxLength}
            disabled={field.autoPopulated}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled={field.autoPopulated}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled={field.autoPopulated}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            min={field.minValue}
            max={field.maxValue}
            disabled={field.autoPopulated}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            className={baseInputClasses}
            disabled={field.autoPopulated}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            className={selectClasses}
            disabled={field.autoPopulated}
          >
            <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}...`}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={value || false}
              onChange={e => handleFieldChange(field.name, e.target.checked)}
              onBlur={() => handleFieldBlur(field.name)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={field.autoPopulated}
            />
            <span className="text-sm text-slate-700">{field.placeholder || field.label}</span>
          </label>
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field.name)}
            placeholder={field.placeholder}
            className={`${baseInputClasses} min-h-[100px] resize-none`}
            minLength={field.minLength}
            maxLength={field.maxLength}
            disabled={field.autoPopulated}
          />
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={e => {
                    const updated = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter(v => v !== opt.value);
                    handleFieldChange(field.name, updated);
                  }}
                  onBlur={() => handleFieldBlur(field.name)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={field.autoPopulated}
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage description */}
      {config.description && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">{config.description}</p>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-6">
        {config.fields.length === 0 ? (
          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center">
            <p className="text-sm font-semibold text-slate-700">This stage is not yet configured</p>
            <p className="text-xs text-slate-500 mt-1">Fields for this stage will be added in the next update</p>
          </div>
        ) : (
          config.fields.map(field => (
          <div key={field.name}>
            {/* Field label */}
            <label className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-900">
                {field.label}
              </span>
              {field.required ? (
                <span className="text-red-600 text-sm font-bold">*</span>
              ) : (
                <span className="text-slate-500 text-xs">(optional)</span>
              )}
              {field.autoPopulated && (
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                  <Check className="w-3 h-3" />
                  Auto-populated
                </span>
              )}
            </label>

            {/* Field hint */}
            {field.hint && (
              <p className="text-xs text-slate-500 mb-2 ml-0">
                💡 {field.hint}
              </p>
            )}

            {/* Field input */}
            <div className="relative">
              {renderField(field)}

              {/* Validation error icon */}
              {hasError && (
                <X className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>

            {/* Error message */}
            {hasError && (
              <div className="mt-1.5 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* Form summary */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">
              {config.fields.filter(f => formData[f.name]).length}/{config.fields.length}
            </span>
            {' fields completed'}
          </p>
          <div className="flex items-center gap-2">
            {isFormValid && config.fields.filter(f => f.required).length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                All required fields filled
              </span>
            ) : config.fields.filter(f => f.required).length > 0 ? (
              <span className="text-xs text-slate-500">
                Fill all required fields to continue
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericStageForm;
