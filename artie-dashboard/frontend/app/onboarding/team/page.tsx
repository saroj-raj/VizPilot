'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamSetupPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'employee',
  });

  useEffect(() => {
    // Load saved data if available
    const saved = localStorage.getItem('teamMembers');
    if (saved) {
      setTeamMembers(JSON.parse(saved));
    }
  }, []);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
    };
    const updatedTeam = [...teamMembers, member];
    setTeamMembers(updatedTeam);
    localStorage.setItem('teamMembers', JSON.stringify(updatedTeam));
    setNewMember({ name: '', email: '', role: 'employee' });
  };

  const removeMember = (id: string) => {
    const updatedTeam = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updatedTeam);
    localStorage.setItem('teamMembers', JSON.stringify(updatedTeam));
  };

  const handleContinue = () => {
    // Can continue with or without team members
    router.push('/onboarding/upload');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewMember({
      ...newMember,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elas ERP
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Add your team members</h2>
          <p className="text-gray-600 mt-2">Step 2 of 3 - Team Setup (Optional)</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-600">✓ Step 1</span>
            <span className="text-sm font-medium text-blue-600">Step 2</span>
            <span className="text-sm font-medium text-gray-400">Step 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Add Member Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>
          <form onSubmit={addMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={newMember.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={newMember.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newMember.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="finance">Finance</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Member
            </button>
          </form>
        </div>

        {/* Team Members List */}
        {teamMembers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Team Members ({teamMembers.length})
            </h3>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                      {member.role}
                    </span>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/onboarding/business"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Back
          </Link>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {teamMembers.length > 0 ? 'Continue' : 'Skip for Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
