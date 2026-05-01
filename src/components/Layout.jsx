import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full overflow-x-hidden">

        {/* Top Navbar */}
        <div className="hidden lg:flex items-center justify-end px-8 h-16 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
          <NotificationBell />
        </div>

        {/* Mobile spacing */}
        <div className="lg:hidden pt-20" />

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 w-full max-w-full overflow-x-auto">
          {children}
        </div>

      </main>

    </div>
  );
}