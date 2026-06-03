import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-300 antialiased">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-900/30">{children}</main>
    </div>
  );
}
