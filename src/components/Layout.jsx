import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile top padding for hamburger */}
        <div className="lg:hidden h-16" />
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}