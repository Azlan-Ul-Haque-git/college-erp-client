import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">

        {/* Top Navbar */}
        <div className="flex items-center justify-end px-4 lg:px-8 h-16 border-b bg-white dark:bg-slate-800 dark:border-slate-700">

          {/* Notification Bell */}
          <NotificationBell />

        </div>

        {/* Mobile spacing for sidebar toggle */}
        <div className="lg:hidden h-2" />

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>

      </main>

    </div>
  );
}