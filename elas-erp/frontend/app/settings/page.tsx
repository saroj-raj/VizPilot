'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface BusinessInfo {
  businessName: string;
  industry: string;
  size: string;
  country: string;
  description: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: '',
    industry: '',
    size: '',
    country: '',
    description: '',
  });

  useEffect(() => {
    // Load existing business info from localStorage
    const loadBusinessInfo = () => {
      try {
        const saved = localStorage.getItem('businessInfo');
        if (saved) {
          const parsed = JSON.parse(saved);
          setBusinessInfo({
            businessName: parsed.businessName || '',
            industry: parsed.industry || '',
            size: parsed.size || '',
            country: parsed.country || '',
            description: parsed.description || '',
          });
        }
      } catch (error) {
        console.error('Error loading business info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBusinessInfo({
      ...businessInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
      localStorage.setItem('businessName', businessInfo.businessName);

      // TODO: Save to backend API
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/business/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo: businessInfo,
          teamMembers: [],
          uploadedFiles: [],
          useHistoricalData: false,
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{user?.email || 'Not logged in'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">User ID:</span>
              <span className="font-mono text-sm text-gray-700">{user?.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Business Settings Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessInfo.businessName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business name"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={businessInfo.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <select
                id="size"
                name="size"
                value={businessInfo.size}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select size</option>
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="501+ employees">501+ employees</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={businessInfo.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., United States"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={businessInfo.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your business..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border-2 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure? This action cannot be undone.')) {
                    alert('Account deletion not implemented yet');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
