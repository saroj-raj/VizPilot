'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ManagerDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Manager-specific data
  const teamPerformance = [
    { name: 'John Doe', tasks: 28, completed: 24, efficiency: 86 },
    { name: 'Jane Smith', tasks: 32, completed: 30, efficiency: 94 },
    { name: 'Mike Johnson', tasks: 25, completed: 22, efficiency: 88 },
    { name: 'Sarah Williams', tasks: 30, completed: 27, efficiency: 90 },
    { name: 'Tom Brown', tasks: 22, completed: 19, efficiency: 86 },
  ];

  const projectTimeline = [
    { project: 'Website Redesign', progress: 85, deadline: '2025-11-15', status: 'On Track' },
    { project: 'Mobile App', progress: 60, deadline: '2025-12-01', status: 'On Track' },
    { project: 'CRM Integration', progress: 40, deadline: '2025-11-30', status: 'At Risk' },
    { project: 'Data Migration', progress: 95, deadline: '2025-11-10', status: 'On Track' },
  ];

  const weeklyProductivity = [
    { week: 'Week 1', tasksCompleted: 45, tasksCreated: 50, teamHours: 200 },
    { week: 'Week 2', tasksCompleted: 52, tasksCreated: 48, teamHours: 210 },
    { week: 'Week 3', tasksCompleted: 48, tasksCreated: 52, teamHours: 205 },
    { week: 'Week 4', tasksCompleted: 55, tasksCreated: 50, teamHours: 215 },
  ];

  const skillsRadar = [
    { skill: 'Communication', team: 85, benchmark: 75 },
    { skill: 'Technical', team: 90, benchmark: 80 },
    { skill: 'Problem Solving', team: 88, benchmark: 78 },
    { skill: 'Collaboration', team: 92, benchmark: 82 },
    { skill: 'Creativity', team: 78, benchmark: 75 },
    { skill: 'Time Management', team: 86, benchmark: 80 },
  ];

  const upcomingMeetings = [
    { title: 'Sprint Planning', time: 'Today, 2:00 PM', attendees: 8 },
    { title: 'Client Review', time: 'Tomorrow, 10:00 AM', attendees: 5 },
    { title: 'Team 1-on-1s', time: 'Nov 2, 9:00 AM', attendees: 2 },
    { title: 'Budget Review', time: 'Nov 3, 3:00 PM', attendees: 4 },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Elas ERP</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span className="text-gray-700 font-medium">Manager Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900" title="Notifications">
                <span className="text-xl">🔔</span>
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              {/* Role Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
                >
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-medium">Switch Role</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button onClick={() => { router.push('/dashboard/admin'); setShowRoleSwitcher(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2">
                      <span>👑</span><span className="text-sm">Admin</span>
                    </button>
                    <button onClick={() => { router.push('/dashboard/finance'); setShowRoleSwitcher(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2">
                      <span>💰</span><span className="text-sm">Finance</span>
                    </button>
                    <button onClick={() => { router.push('/dashboard/manager'); setShowRoleSwitcher(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2">
                      <span>📊</span><span className="text-sm font-semibold text-blue-600">Manager (Current)</span>
                    </button>
                    <button onClick={() => { router.push('/dashboard/employee'); setShowRoleSwitcher(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2">
                      <span>👤</span><span className="text-sm">Employee</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-300"></div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Manager'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button onClick={() => logout()} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {['overview', 'team', 'projects', 'schedule', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeTab === tab ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">
                  {tab === 'overview' && '📊'}
                  {tab === 'team' && '👥'}
                  {tab === 'projects' && '📁'}
                  {tab === 'schedule' && '📅'}
                  {tab === 'reports' && '📈'}
                </span>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Team Members</h3>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-4xl font-bold mb-2">12</div>
              <p className="text-sm opacity-80">89% avg efficiency</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Active Projects</h3>
                <span className="text-2xl">📁</span>
              </div>
              <div className="text-4xl font-bold mb-2">8</div>
              <p className="text-sm opacity-80">75% on track</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Tasks This Week</h3>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-4xl font-bold mb-2">165</div>
              <p className="text-sm opacity-80">142 completed</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Team Hours</h3>
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-4xl font-bold mb-2">830</div>
              <p className="text-sm opacity-80">This month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Team Performance */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#8b5cf6" name="Completed Tasks" />
                  <Bar dataKey="tasks" fill="#d1d5db" name="Total Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skills Radar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Skills Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillsRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Team Average" dataKey="team" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Radar name="Industry Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Productivity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Productivity Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tasksCompleted" stroke="#10b981" strokeWidth={3} name="Completed" />
                  <Line type="monotone" dataKey="tasksCreated" stroke="#3b82f6" strokeWidth={3} name="Created" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting, idx) => (
                  <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                      <p className="text-xs text-gray-500">{meeting.time}</p>
                      <p className="text-xs text-gray-400 mt-1">{meeting.attendees} attendees</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
            <div className="space-y-4">
              {projectTimeline.map((project, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{project.project}</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      project.status === 'On Track' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Deadline: {project.deadline}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
