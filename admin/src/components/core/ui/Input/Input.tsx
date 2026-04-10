import { InputHTMLAttributes, SelectHTMLAttributes, useState } from 'react';
import * as LucideIcons from 'lucide-react';

type InputType = 'text' | 'email' | 'number' | 'currency' | 'password' | 'switch' | 'datePicker' | 'timePicker' | 'dateTimePicker' | 'dropDownList';
type LabelDisplay = 'legend' | 'normal' | 'none';

interface BaseInputProps {
  name: string;
  label?: string;
  icon?: string;
  type?: InputType;
  value?: string;
  placeholder?: string;
  onChange?: ((value: string) => void) | React.Dispatch<React.SetStateAction<string>>;
  onBlur?: () => void;
  options?: string[];
  labelDisplay?: LabelDisplay;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
}

type InputProps = BaseInputProps & (
  | ({ type?: 'text' | 'email' | 'number' | 'currency' | 'password' | 'datePicker' | 'timePicker' | 'dateTimePicker' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>)
  | ({ type: 'switch' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>)
  | ({ type: 'dropDownList' } & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>)
);

const CurrencySymbol = { USD: '$', EUR: '€', GBP: '£', default: '$' };

export function Input({
  name,
  label = '',
  icon,
  type = 'text',
  value = '',
  placeholder: customPlaceholder,
  onChange,
  onBlur,
  options = [],
  labelDisplay,
  isError = false,
  errorMessage = '',
  className = '',
  ...props
}: InputProps) {
  const placeholder = customPlaceholder ?? `${name} placeholder`;
  const effectiveLabelDisplay = label ? (labelDisplay ?? 'legend') : 'none';
  const [internalValue, setInternalValue] = useState(value);
  const [switchChecked, setSwitchChecked] = useState(value === 'true' || value === 'on');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const IconComponent = icon ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] : null;

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    if (onChange) {
      (onChange as (value: string) => void)(newValue);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'switch':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={name}
              checked={switchChecked}
              onChange={(e) => {
                setSwitchChecked(e.target.checked);
                onChange?.(e.target.checked ? 'true' : 'false');
              }}
              className="sr-only peer"
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-accent"></div>
          </label>
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{CurrencySymbol.default}</span>
            <input
              type="number"
              name={name}
              placeholder={placeholder}
              value={internalValue}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-neutral dark:text-white border-gray-300 dark:border-gray-600 ${isError ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'focus:ring-accent'}`}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name={name}
              placeholder={placeholder}
              value={internalValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={onBlur}
              className={`w-full px-3 py-2 pr-10 border rounded focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-neutral dark:text-white border-gray-300 dark:border-gray-600 ${isError ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'focus:ring-accent'}`}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <LucideIcons.EyeOff className="w-4 h-4" /> : <LucideIcons.Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'dropDownList':
        return (
          <div className="relative">
            <select
              name={name}
              value={internalValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setDropdownOpen(false)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-neutral dark:text-white border-gray-300 dark:border-gray-600 appearance-none cursor-pointer ${isError ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'focus:ring-accent'}`}
              {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
            >
              <option value="">{dropdownOpen ? 'Type to search...' : 'Select...'}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <LucideIcons.ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        );

      default:
        return (
          <input
            type={type === 'datePicker' ? 'date' : type === 'timePicker' ? 'time' : type === 'dateTimePicker' ? 'datetime-local' : type}
            name={name}
            placeholder={placeholder}
            value={internalValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-neutral dark:text-white border-gray-300 dark:border-gray-600 ${isError ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'focus:ring-accent'}`}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        );
    }
  };

  const labelContent = (
    <>
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {label}
    </>
  );

  if (effectiveLabelDisplay === 'none') {
    return <div className={className}>{renderInput()}</div>;
  }

  if (effectiveLabelDisplay === 'legend') {
    return (
      <fieldset className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 ${className}`}>
        <legend className="flex items-center gap-2 px-2 text-sm font-medium text-neutral dark:text-white">
          {labelContent}
        </legend>
        {renderInput()}
      </fieldset>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="flex items-center gap-2 text-sm font-medium text-neutral dark:text-white">
        {labelContent}
      </label>
      {renderInput()}
      {isError && errorMessage && (
        <span className="text-xs text-red-500 dark:text-red-400 mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
