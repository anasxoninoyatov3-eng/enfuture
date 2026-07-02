import { motion } from 'framer-motion';
import { Card } from '@/Card';
import { Shield, Activity, Search, Trash2, Clock, MapPin } from 'lucide-react';
import { useUserStore } from '@/userStore';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/utils';


export const AdminPanel = () => {
  const { user, auditLogs } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Check for admin email (dinoyatova21@gmail.com)
  if (user?.email !== 'dinoyatova21@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredLogs = (auditLogs || []).filter(log =>
    log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            Admin Authority - admin.enfuture.uz
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saytga Kirganlar Auditi</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Faqat ushbu "admin" subdomainiga yo'naltirilgan va kirganlar hisoboti.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Jami Kirishlar</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{(auditLogs || []).length}</h3>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Oxirgi 24 soatda</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {(auditLogs || []).filter(l => new Date(l.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}
            </h3>
          </div>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Audit Loglari</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Faqat shu "admin" subdomainiga kirgan va ro'yxatdan o'tganlar nazorati.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ism yoki email bo'yicha qidiruv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
              />
            </div>
            <button
              onClick={() => {
                if (confirm("Haqiqatan ham barcha audit ma'lumotlarini o'chirib tashlamoqchimisiz?")) {
                  useUserStore.setState({ auditLogs: [] });
                }
              }}
              title="Auditni tozalash"
              className="h-10 px-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors text-xs font-bold gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Tozalash
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 rounded-tl-2xl">Foydalanuvchi</th>
                <th className="px-6 py-4">Amal Turi</th>
                <th className="px-6 py-4">Vaqti</th>
                <th className="px-6 py-4">Joylashuv (IP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 gap-y-1">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Hech qanday audit log topilmadi.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-100 text-indigo-600 font-bold shrink-0 flex items-center justify-center">
                          {log.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{log.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{log.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold",
                        log.type === 'login' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      )}>
                        {log.type === 'login' ? 'Tizimga Kirdi' : "Ro'yxatdan o'tdi"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {new Date(log.timestamp).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Tashkent, UZ <span className="text-xs text-slate-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">(192.168.1.1)</span>
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

