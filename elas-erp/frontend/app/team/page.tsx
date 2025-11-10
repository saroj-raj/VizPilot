'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'finance';
}

export default function TeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee' | 'finance',
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = () => {
    try {
      const saved = localStorage.getItem('teamMembers');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTeamMembers(parsed);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
      };

      const updatedTeam = [...teamMembers, member];
      setTeamMembers(updatedTeam);
      
      // Save to localStorage
      localStorage.setItem('teamMembers', JSON.stringify(updatedTeam));

      // TODO: Save to backend
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const businessInfo = localStorage.getItem('businessInfo');
      const businessId = businessInfo ? JSON.parse(businessInfo).businessName?.toLowerCase().replace(/\s/g, '_') : 'default';
      
      await fetch(`${apiBase}/api/business/${businessId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      }).catch(err => console.error('Backend save failed:', err));

      // Reset form
      setNewMember({ name: '', email: '', role: 'employee' });
      setShowAddForm(false);
      alert('Team member added successfully!');
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Error adding team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const updatedTeam = teamMembers.filter(m => m.id !== memberId);
      setTeamMembers(updatedTeam);
      localStorage.setItem('teamMembers', JSON.stringify(updatedTeam));

      // TODO: Remove from backend
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const businessInfo = localStorage.getItem('businessInfo');
      const businessId = businessInfo ? JSON.parse(businessInfo).businessName?.toLowerCase().replace(/\s/g, '_') : 'default';
      
      await fetch(`${apiBase}/api/business/${businessId}/team/${memberId}`, {
        method: 'DELETE',
      }).catch(err => console.error('Backend delete failed:', err));

      alert('Team member removed successfully!');
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Error removing team member. Please try again.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      manager: 'bg-blue-100 text-blue-700 border-blue-200',
      employee: 'bg-green-100 text-green-700 border-green-200',
      finance: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[role as keyof typeof colors] || colors.employee;
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: '👑',
      manager: '📊',
      employee: '👤',
      finance: '💰',
    };
    return icons[role as keyof typeof icons] || '👤';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Member Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Members ({teamMembers.length})</h2>
            <p className="text-sm text-gray-600">Manage your team and assign roles</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Team Member
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Team Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="finance">Finance</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMember({ name: '', email: '', role: 'employee' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team Members List */}
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-6">Add your first team member to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Team Member
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getRoleBadgeColor(member.role)} border`}>
                            {getRoleIcon(member.role)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(member.role)}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
