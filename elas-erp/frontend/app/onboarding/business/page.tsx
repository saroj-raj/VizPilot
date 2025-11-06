'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CountrySelect from '../../components/CountrySelect';

export default function BusinessPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    size: '',
    country: '',
    description: '',
  });

  const industries = [
    'Technology', 'Manufacturing', 'Retail', 'Healthcare', 
    'Finance', 'Education', 'Real Estate', 'Other'
  ];

  const sizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '500+ employees'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage or send to API
    localStorage.setItem('businessInfo', JSON.stringify(formData));
    router.push('/onboarding/team');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elas ERP
            </h1>
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Step 1 of 3</span>
            <span className="text-sm text-gray-600">Business Information</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your business</h2>
            <p className="text-gray-600">This information helps us customize your ERP experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select company size</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <CountrySelect
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us what your business does..."
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Back to Home
              </Link>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
              >
                Next: Team Setup
              </button>
            </div>
          </form>
        </div>

        {/* AI Assistant Hint */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">AI Assistant Available</h4>
            <p className="text-sm text-blue-700">
              Our AI can help you set up your business profile and recommend best practices based on your industry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
