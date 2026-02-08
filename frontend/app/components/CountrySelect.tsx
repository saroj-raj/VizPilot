'use client';
import React from 'react';
import Select, { StylesConfig } from 'react-select';

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

const countries: CountryOption[] = [
  // Popular countries first
  { value: 'United States', label: 'United States', flag: '🇺🇸' },
  { value: 'United Kingdom', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'India', label: 'India', flag: '🇮🇳' },
  { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'France', label: 'France', flag: '🇫🇷' },
  { value: 'Japan', label: 'Japan', flag: '🇯🇵' },
  { value: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'China', label: 'China', flag: '🇨🇳' },
  
  // All other countries alphabetically
  { value: 'Afghanistan', label: 'Afghanistan', flag: '🇦🇫' },
  { value: 'Albania', label: 'Albania', flag: '🇦🇱' },
  { value: 'Algeria', label: 'Algeria', flag: '🇩🇿' },
  { value: 'Argentina', label: 'Argentina', flag: '🇦🇷' },
  { value: 'Austria', label: 'Austria', flag: '🇦🇹' },
  { value: 'Bangladesh', label: 'Bangladesh', flag: '🇧🇩' },
  { value: 'Belgium', label: 'Belgium', flag: '🇧🇪' },
  { value: 'Brazil', label: 'Brazil', flag: '🇧🇷' },
  { value: 'Chile', label: 'Chile', flag: '🇨🇱' },
  { value: 'Colombia', label: 'Colombia', flag: '🇨🇴' },
  { value: 'Czech Republic', label: 'Czech Republic', flag: '🇨🇿' },
  { value: 'Denmark', label: 'Denmark', flag: '🇩🇰' },
  { value: 'Egypt', label: 'Egypt', flag: '🇪🇬' },
  { value: 'Finland', label: 'Finland', flag: '🇫🇮' },
  { value: 'Greece', label: 'Greece', flag: '🇬🇷' },
  { value: 'Hong Kong', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'Hungary', label: 'Hungary', flag: '🇭🇺' },
  { value: 'Iceland', label: 'Iceland', flag: '🇮🇸' },
  { value: 'Indonesia', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'Ireland', label: 'Ireland', flag: '🇮🇪' },
  { value: 'Israel', label: 'Israel', flag: '🇮🇱' },
  { value: 'Italy', label: 'Italy', flag: '🇮🇹' },
  { value: 'Kenya', label: 'Kenya', flag: '🇰🇪' },
  { value: 'Malaysia', label: 'Malaysia', flag: '🇲🇾' },
  { value: 'Mexico', label: 'Mexico', flag: '🇲🇽' },
  { value: 'Netherlands', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'New Zealand', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'Nigeria', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'Norway', label: 'Norway', flag: '🇳🇴' },
  { value: 'Pakistan', label: 'Pakistan', flag: '🇵🇰' },
  { value: 'Philippines', label: 'Philippines', flag: '🇵🇭' },
  { value: 'Poland', label: 'Poland', flag: '🇵🇱' },
  { value: 'Portugal', label: 'Portugal', flag: '🇵🇹' },
  { value: 'Qatar', label: 'Qatar', flag: '🇶🇦' },
  { value: 'Romania', label: 'Romania', flag: '🇷🇴' },
  { value: 'Russia', label: 'Russia', flag: '🇷🇺' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'South Africa', label: 'South Africa', flag: '🇿🇦' },
  { value: 'South Korea', label: 'South Korea', flag: '🇰🇷' },
  { value: 'Spain', label: 'Spain', flag: '🇪🇸' },
  { value: 'Sweden', label: 'Sweden', flag: '🇸🇪' },
  { value: 'Switzerland', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'Taiwan', label: 'Taiwan', flag: '🇹🇼' },
  { value: 'Thailand', label: 'Thailand', flag: '🇹🇭' },
  { value: 'Turkey', label: 'Turkey', flag: '🇹🇷' },
  { value: 'Ukraine', label: 'Ukraine', flag: '🇺🇦' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'Vietnam', label: 'Vietnam', flag: '🇻🇳' },
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const customStyles: StylesConfig<CountryOption, false> = {
  control: (provided, state) => ({
    ...provided,
    padding: '0.5rem',
    border: state.isFocused ? '2px solid #3b82f6' : '1px solid #d1d5db',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      border: '1px solid #9ca3af',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#eff6ff'
      : 'white',
    color: state.isSelected ? 'white' : '#111827',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
};

export default function CountrySelect({ value, onChange, required = false }: CountrySelectProps) {
  const selectedOption = countries.find((c) => c.value === value) || null;

  const formatOptionLabel = (option: CountryOption) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '1.25rem' }}>{option.flag}</span>
      <span>{option.label}</span>
    </div>
  );

  return (
    <Select<CountryOption>
      options={countries}
      value={selectedOption}
      onChange={(option) => onChange(option?.value || '')}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      placeholder="Search or select a country..."
      isSearchable
      required={required}
      classNamePrefix="country-select"
    />
  );
}
