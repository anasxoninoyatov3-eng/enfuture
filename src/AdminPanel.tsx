import { motion } from 'framer-motion';
import { Card } from '@/Card';
import { Shield, Users, Activity, MoreVertical, Search, Filter, Trash2 } from 'lucide-react';
import { useUserStore } from '@/userStore';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';

export const AdminPanel = () => {
  const { user, allUsers } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Check for admin email (dinoyatova21@gmail.com)
  if (user?.email !== 'dinoyatova21@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredUsers = allUsers.filter(u =>
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-600 uppercase tracking-widest">
            <Shield className="h-3 w-3" />
            Admin Authority
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage users, monitor activity, and configure system settings.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{allUsers.length}</h3>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active (Today)</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {allUsers.filter(u => {
                const lastStudied = u.topicProgress.find(p => p.lastStudied);
                if (!lastStudied?.lastStudied) return false;
                const today = new Date().toDateString();
                return new Date(lastStudied.lastStudied).toDateString() === today;
              }).length}
            </h3>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Admins</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">1</h3>
          </div>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Users Information</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">All registered users across the platform.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
              />
            </div>
            <button className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 rounded-tl-2xl">User</th>
                <th className="px-6 py-4">Level & XP</th>
                <th className="px-6 py-4">Topics Mastered</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-100 shrink-0 flex items-center justify-center">
                          {u.picture ? (
                            <img src={u.picture} alt={`${u.firstName} ${u.lastName}`} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-indigo-600 font-bold text-sm">
                              {u.firstName[0]}{u.lastName[0] || ''}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">Level {u.currentLevel}</span>
                        <span className="text-xs font-bold text-indigo-600">{u.xp} XP</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {u.topicProgress.filter(p => p.mastered).length} / {u.topicProgress.length}
                        </span>
                        <span className="text-xs text-slate-400">Topics mastered</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {new Date(u.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
