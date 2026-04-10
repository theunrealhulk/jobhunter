import { Button } from '../../components/core/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function DashboardPage() {
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-dark p-5">
      <div className="max-w-6xl mx-auto">
        <div className="bg-neutral text-white p-6 rounded-lg mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            variant="warning"
            text="Logout"
            onClick={handleLogout}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-neutral dark:text-white mb-4">
            Welcome to JobHunter Admin
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You are successfully logged in!
          </p>
        </div>
      </div>
    </div>
  );
}
