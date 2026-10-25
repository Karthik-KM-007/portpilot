import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, pageTitle }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070C18] font-sans antialiased text-slate-100">
      {/* Precision Dark Maritime Navigation Sidebar */}
      <Sidebar />

      {/* Main Operational Canvas */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-[#070C18]">
        <TopBar pageTitle={pageTitle} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-[#070C18]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
