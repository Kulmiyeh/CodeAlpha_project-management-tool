import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
