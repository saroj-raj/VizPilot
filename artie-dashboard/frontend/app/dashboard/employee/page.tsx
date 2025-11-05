'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Employee-specific data
  const myTasks = [
    { id: 1, title: 'Complete Q4 Report', priority: 'High', status: 'In Progress', dueDate: 'Nov 2', progress: 75 },
    { id: 2, title: 'Client Meeting Prep', priority: 'High', status: 'Pending', dueDate: 'Nov 1', progress: 30 },
    { id: 3, title: 'Code Review', priority: 'Medium', status: 'In Progress', dueDate: 'Nov 3', progress: 60 },
    { id: 4, title: 'Update Documentation', priority: 'Low', status: 'Pending', dueDate: 'Nov 5', progress: 0 },
    { id: 5, title: 'Team Sync Meeting', priority: 'Medium', status: 'Completed', dueDate: 'Oct 31', progress: 100 },
  ];

  const weeklyHours = [
    { day: 'Mon', hours: 8, target: 8 },
    { day: 'Tue', hours: 7.5, target: 8 },
    { day: 'Wed', hours: 9, target: 8 },
    { day: 'Thu', hours: 8, target: 8 },
    { day: 'Fri', hours: 7, target: 8 },
  ];

  const taskDistribution = [
    { category: 'Development', count: 12 },
    { category: 'Meetings', count: 8 },
    { category: 'Documentation', count: 5 },
    { category: 'Testing', count: 7 },
    { category: 'Learning', count: 3 },
  ];

  const productivityTrend = [
    { week: 'Week 1', completed: 8, created: 10 },
    { week: 'Week 2', completed: 12, created: 11 },
    { week: 'Week 3', completed: 10, created: 9 },
    { week: 'Week 4', completed: 14, created: 12 },
  ];

  const upcomingDeadlines = [
    { task: 'Client Meeting Prep', date: 'Tomorrow', priority: 'High' },
    { task: 'Complete Q4 Report', date: 'In 2 days', priority: 'High' },
    { task: 'Code Review', date: 'In 3 days', priority: 'Medium' },
    { task: 'Update Documentation', date: 'In 5 days', priority: 'Low' },
  ];

  const recentActivity = [
    { action: 'Completed task: Team Sync Meeting', time: '2 hours ago', icon: '✅' },
    { action: 'Updated: Complete Q4 Report (75%)', time: '4 hours ago', icon: '📝' },
    { action: 'Started: Code Review', time: '1 day ago', icon: '🚀' },
    { action: 'Submitted timesheet for last week', time: '2 days ago', icon: '⏱️' },
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

  const completedTasks = myTasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = myTasks.filter(t => t.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Elas ERP</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👤</span>
                <span className="text-gray-700 font-medium">Employee Dashboard</span>
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
                  <span className="text-xl">👤</span>
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
                      <span>📊</span><span className="text-sm">Manager</span>
                    </button>
                    <button onClick={() => { router.push('/dashboard/employee'); setShowRoleSwitcher(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2">
                      <span>👤</span><span className="text-sm font-semibold text-blue-600">Employee (Current)</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-300"></div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Employee'}</p>
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
            {['tasks', 'timesheet', 'goals', 'calendar', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeTab === tab ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">
                  {tab === 'tasks' && '✅'}
                  {tab === 'timesheet' && '⏱️'}
                  {tab === 'goals' && '🎯'}
                  {tab === 'calendar' && '📅'}
                  {tab === 'documents' && '📄'}
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
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Completed Tasks</h3>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-4xl font-bold mb-2">{completedTasks}</div>
              <p className="text-sm opacity-80">Great progress!</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">In Progress</h3>
                <span className="text-2xl">🔄</span>
              </div>
              <div className="text-4xl font-bold mb-2">{inProgressTasks}</div>
              <p className="text-sm opacity-80">Keep going!</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Pending Tasks</h3>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-4xl font-bold mb-2">{pendingTasks}</div>
              <p className="text-sm opacity-80">Time to start</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Hours This Week</h3>
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-4xl font-bold mb-2">39.5</div>
              <p className="text-sm opacity-80">of 40 target</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* My Tasks */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h3>
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div key={task.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{task.title}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            task.status === 'Completed' ? 'bg-green-600' :
                            task.status === 'In Progress' ? 'bg-blue-600' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{task.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Due: {task.dueDate}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        task.status === 'Completed' ? 'bg-green-50 text-green-700' :
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {upcomingDeadlines.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <span className="text-xl">⏰</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.task}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                        item.priority === 'High' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Hours */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Time Tracking</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#3b82f6" name="Actual Hours" />
                  <Bar dataKey="target" fill="#d1d5db" name="Target Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Task Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.category} (${entry.count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Productivity Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={productivityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed" />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={3} name="Created" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
