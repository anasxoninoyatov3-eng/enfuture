import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/Card';
import { Button } from '@/Button';
import { Input } from '@/Input';
import { User, Mail, GraduationCap, Trophy, TrendingUp, Edit2, Save } from 'lucide-react';
import { useUserStore } from '@/userStore';
import { KnowledgeLevel } from '@/types';

const LEVELS: KnowledgeLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const ProfilePage = () => {
  const { user, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editLevel, setEditLevel] = useState<KnowledgeLevel>(user?.currentLevel || 'A1');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Please sign in</h2>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    updateProfile({
      firstName: editFirstName,
      lastName: editLastName,
      currentLevel: editLevel
    });
    setIsEditing(false);
  };

  const masteredCount = user.topicProgress.filter(p => p.mastered).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and learning progress</p>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center gap-2"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-2 p-8 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-32 w-32 rounded-full object-cover shadow-lg border-4 border-white dark:border-slate-800"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                    {user.firstName[0]}{user.lastName[0] || ''}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        icon={<User className="h-4 w-4 text-slate-400" />}
                        placeholder="First Name"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {user.firstName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Last Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        icon={<User className="h-4 w-4 text-slate-400" />}
                        placeholder="Last Name"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {user.lastName || '-'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {user.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Current Level
                    </label>
                    {isEditing ? (
                      <select
                        value={editLevel}
                        onChange={(e) => setEditLevel(e.target.value as KnowledgeLevel)}
                        className="w-full h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600"
                      >
                        {LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        Level {user.currentLevel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Card */}
          <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 space-y-8">
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stats</div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">XP</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{user.xp}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Streak</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{user.streak} days</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Topics Mastered</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{masteredCount}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Join Date</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </Card>
        </div>

        {/* Topic Progress */}
        {user.topicProgress.length > 0 && (
          <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Topic Progress</h2>
            <div className="space-y-4">
              {user.topicProgress.map((progress) => (
                <div key={`${progress.topic}-${progress.level}`} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {progress.topic}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Level {progress.level} • {progress.attempts} attempt{progress.attempts > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {progress.testScore !== null && (
                      <div className="text-right">
                        <div className={`text-sm font-bold ${progress.testScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {progress.testScore}%
                        </div>
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      progress.mastered 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {progress.mastered ? 'Mastered' : 'In Progress'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};
