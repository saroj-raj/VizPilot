'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: '', email: '', role: 'employee' }
  ]);

  const roles = [
    { value: 'admin', label: 'Administrator', icon: '👑' },
    { value: 'manager', label: 'Manager', icon: '📊' },
    { value: 'employee', label: 'Employee', icon: '👤' },
    { value: 'finance', label: 'Finance', icon: '💰' },
  ];

  const addMember = () => {
    setMembers([...members, {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'employee'
    }]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('teamMembers', JSON.stringify(members));
    router.push('/onboarding/upload');
  };

  const skipStep = () => {
    router.push('/onboarding/upload');
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
            <span className="text-sm font-medium text-blue-600">Step 2 of 3</span>
            <span className="text-sm text-gray-600">Team Setup</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add your team members</h2>
            <p className="text-gray-600">Invite team members and assign their roles</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Members List */}
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={member.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Team Member {index + 1}</h4>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={member.role}
                        onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.icon} {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member Button */}
            <button
              type="button"
              onClick={addMember}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
            >
              + Add Another Team Member
            </button>

            {/* Role Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Role Descriptions</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {roles.map((role) => (
                  <div key={role.value} className="flex items-start space-x-2">
                    <span className="text-lg">{role.icon}</span>
                    <div>
                      <span className="font-medium text-blue-800">{role.label}:</span>
                      <span className="text-blue-700 ml-1">
                        {role.value === 'admin' && 'Full system access'}
                        {role.value === 'manager' && 'Team & resource management'}
                        {role.value === 'employee' && 'Standard user access'}
                        {role.value === 'finance' && 'Financial operations'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Link
                href="/onboarding/business"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </Link>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={skipStep}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 transition"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                >
                  Next: Upload Documents
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
