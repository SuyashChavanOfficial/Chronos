import React from 'react';
import DataTable from './components/DataTable';

function App() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Logo/Header */}
      <header className="mb-6 flex items-center gap-4">
        <div className="text-4xl font-extrabold text-indigo-600 tracking-widest shadow-md px-4 py-2 rounded-lg bg-white">
          Chronos
        </div>
      </header>

      {/* Main Table */}
      <DataTable />
    </div>
  );
}

export default App;
