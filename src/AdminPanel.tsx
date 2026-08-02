import { motion } from 'framer-motion';
import { Card } from '@/Card';
import { Shield, Search, Trash2, Clock, MapPin, Users, Ban, CheckCircle } from 'lucide-react';
import { useUserStore } from '@/userStore';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export const AdminPanel = () => {
  const { user } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'audit' | 'users'>('audit');
  const [googleUsers, setGoogleUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [firestoreAuditLogs, setFirestoreAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (user?.email === 'dinoyatova21@gmail.com') {
      if (activeTab === 'audit') {
        loadAuditLogs();
      } else {
        loadGoogleUsers();
      }
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'audit_logs'));
      const logs: any[] = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      // Sort by timestamp desc
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setFirestoreAuditLogs(logs);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const loadGoogleUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setGoogleUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    if (confirm(`Haqiqatan ham foydalanuvchini ${currentStatus ? 'blokdan chiqarmoqchimisiz?' : 'bloklamoqchimisiz?'}`)) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          isBlocked: !currentStatus
        });
        // Update local state
        setGoogleUsers(googleUsers.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus } : u));
      } catch (err) {
        console.error('Error updating completely:', err);
      }
    }
  };

  if (user?.email?.toLowerCase() !== 'dinoyatova21@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredLogs = (firestoreAuditLogs || []).filter(log =>
    (log.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = googleUsers.filter(u =>
    (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            Admin Boshqaruv Paneli
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Boshqaruv Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Saytga kirganlar auditi va hisoblar nazorati.</p>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            "px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 border-transparent",
            activeTab === 'audit' ? "bg-white dark:bg-slate-900 text-indigo-600 border-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Audit Loglari
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 border-transparent flex items-center gap-2",
            activeTab === 'users' ? "bg-white dark:bg-slate-900 text-indigo-600 border-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Users className="h-4 w-4" /> Barcha Foydalanuvchilar
        </button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeTab === 'audit' ? 'Audit Loglari' : 'Foydalanuvchilar Ro\'yxati'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {activeTab === 'audit'
                ? 'Faqat shu "admin" subdomainiga kirgan va registratsiya qilinganlarning harakatlari.'
                : 'Tizimda Google yoki Email orqali ro\'yxatdan o\'tgan foydalanuvchilar ro\'yxati.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ism yoki email izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
              />
            </div>
            {activeTab === 'audit' && (
              <div className="flex gap-2">
                <button
                  onClick={loadAuditLogs}
                  disabled={loadingAudit}
                  className="h-10 px-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 text-xs font-bold gap-2"
                >
                  <Clock className="h-4 w-4" /> {loadingAudit ? 'Yuklanmoqda...' : 'Yangilash'}
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Haqiqatan ham barcha audit ma'lumotlarini o'chirib tashlamoqchimisiz?")) {
                      setLoadingAudit(true);
                      try {
                        const { deleteDoc, doc } = await import('firebase/firestore');
                        const querySnapshot = await getDocs(collection(db, 'audit_logs'));
                        const deletePromises: Promise<any>[] = [];
                        querySnapshot.forEach((document) => {
                          deletePromises.push(deleteDoc(doc(db, 'audit_logs', document.id)));
                        });
                        await Promise.all(deletePromises);
                        setFirestoreAuditLogs([]);
                      } catch (err) {
                        console.error('Error clearing audit logs:', err);
                      } finally {
                        setLoadingAudit(false);
                      }
                    }
                  }}
                  className="h-10 px-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 hover:bg-rose-100 text-xs font-bold gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Tozalash
                </button>
              </div>
            )}
            {activeTab === 'users' && (
              <button
                onClick={loadGoogleUsers}
                disabled={loadingUsers}
                className="h-10 px-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 text-xs font-bold gap-2"
              >
                <Clock className="h-4 w-4" /> {loadingUsers ? 'Yuklanmoqda...' : 'Yangilash'}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'audit' ? (
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
                {loadingAudit && firestoreAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
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
                            {log.name ? log.name[0] : '?'}
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
          ) : (
            <table className="w-full whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 rounded-tl-2xl">Foydalanuvchi</th>
                  <th className="px-6 py-4">Oxirgi Kirish</th>
                  <th className="px-6 py-4">Bloklash orqali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 gap-y-1">
                {loadingUsers && googleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      Hech qanday Google foydalanuvchisi topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group", u.isBlocked && "opacity-60")}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} alt={u.displayName} className="h-10 w-10 rounded-full overflow-hidden shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {u.displayName}
                              {u.isBlocked && <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-600">BLOKLANGAN</span>}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('uz-UZ') : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleBlockUser(u.id, !!u.isBlocked)}
                          className={cn(
                            "h-9 px-4 rounded-lg flex items-center justify-center text-xs font-bold gap-2 transition-colors",
                            u.isBlocked
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                          )}
                        >
                          {u.isBlocked ? (
                            <><CheckCircle className="h-4 w-4" /> Blokdan chiqarish</>
                          ) : (
                            <><Ban className="h-4 w-4" /> Bloklash</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

