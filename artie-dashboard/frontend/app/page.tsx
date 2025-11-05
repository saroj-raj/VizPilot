'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { id: 'admin', name: 'Administrator', icon: '👑', description: 'Full system access' },
    { id: 'manager', name: 'Manager', icon: '📊', description: 'Team & resource management' },
    { id: 'employee', name: 'Employee', icon: '👤', description: 'Standard user access' },
    { id: 'finance', name: 'Finance', icon: '💰', description: 'Financial operations' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Elas ERP
              </h1>
            </div>
            <nav className="flex space-x-4">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">About</a>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition border border-gray-300 px-4 py-2 rounded-lg hover:border-blue-600">
                Login
              </Link>
              <Link href="/onboarding/business" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Elas ERP</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern Enterprise Resource Planning solution designed to streamline your business operations
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">Select Your Role</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => (
              <Link
                key={role.id}
                href={`/dashboard/${role.id}`}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 ${
                  selectedRole === role.id ? 'border-blue-600' : 'border-transparent'
                }`}
                onMouseEnter={() => setSelectedRole(role.id)}
                onMouseLeave={() => setSelectedRole('')}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">{role.icon}</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{role.name}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Real-time Analytics</h4>
              <p className="text-gray-600">
                Monitor your business metrics in real-time with interactive dashboards and reports
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">AI Assistant</h4>
              <p className="text-gray-600">
                Get intelligent insights and automation powered by advanced AI technology
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Secure & Reliable</h4>
              <p className="text-gray-600">
                Enterprise-grade security with role-based access control and data encryption
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Business Management</h4>
              <p className="text-gray-600">
                Comprehensive tools for managing your business operations from one place
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Team Collaboration</h4>
              <p className="text-gray-600">
                Enable seamless collaboration across teams with integrated communication tools
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Mobile Ready</h4>
              <p className="text-gray-600">
                Access your ERP system anywhere, anytime from any device
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Integrations</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of companies using Elas ERP to streamline their operations
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/onboarding/business"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Elas ERP. All rights reserved. | Built with Next.js & FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}
