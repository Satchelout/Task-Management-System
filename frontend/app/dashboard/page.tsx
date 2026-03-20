'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', {
        params: {
          page,
          limit: 10,
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter }),
        },
      });
      setTasks(data.tasks);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [fetchTasks, router]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.post('/tasks', { title: newTitle });
      setNewTitle('');
      toast.success('Task added!');
      fetchTasks();
    } catch {
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (id: string) => {
    try {
      await api.post(`/tasks/${id}/toggle`);
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted!');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const saveEdit = async () => {
    if (!editTask) return;
    try {
      await api.patch(`/tasks/${editTask.id}`, { title: editTask.title });
      setEditTask(null);
      toast.success('Task updated!');
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">My Tasks</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-500 transition"
        >
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Add Task */}
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task and press Enter..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tasks..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Task List */}
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.status === 'COMPLETED'}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />

                {/* Title or Edit input */}
                {editTask?.id === task.id ? (
                  <input
                    value={editTask.title}
                    onChange={(e) =>
                      setEditTask({ ...editTask, title: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    className={`flex-1 text-sm ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {task.title}
                  </span>
                )}

                {/* Action buttons */}
                {editTask?.id === task.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="text-blue-600 text-xs font-medium hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditTask(null)}
                      className="text-gray-400 text-xs hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditTask(task)}
                      className="text-gray-400 text-xs hover:text-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 text-xs hover:text-red-500 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}

            {/* Empty state */}
            {tasks.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No tasks found. Add one above!
              </p>
            )}
          </ul>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <button
              disabled={page >= Math.ceil(total / 10)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

