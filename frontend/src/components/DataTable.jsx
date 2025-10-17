import React, { useEffect, useState, useCallback } from "react";

// Helper to convert JSON to CSV
function jsonToCsv(items) {
  if (!items || items.length === 0) return "";
  let csv = "receivedAt,machineId,workDone,status,temperature\n";
  items.forEach((it) => {
    const { machineId, workDone, status, temperature } = it.payload || {};
    csv += `"${it.receivedAt}","${machineId}","${workDone}","${status}","${temperature}"\n`;
  });
  return csv;
}

export default function DataTable() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const API = process.env.REACT_APP_API_URL || "/api";

  const fetchData = useCallback(
    async (filterDate) => {
      setStatus("Loading...");
      try {
        const url = filterDate
          ? `${API}/data?date=${filterDate}`
          : `${API}/data`;
        const res = await fetch(url);
        const data = await res.json();
        setItems(data);
        setStatus(`Loaded ${data.length} items`);
      } catch (e) {
        console.error(e);
        setStatus("Error loading");
      }
    },
    [API]
  );

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(() => fetchData(date || undefined), 300000);
    return () => clearInterval(id);
  }, [date, fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API}/data/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems(items.filter((it) => it._id !== id));
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
      setStatus("Item deleted");
    } catch (err) {
      console.error(err);
      setStatus("Error deleting item");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} item(s)?`
      )
    )
      return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API}/data/${id}`, { method: "DELETE" })
        )
      );
      setItems(items.filter((it) => !selectedIds.includes(it._id)));
      setSelectedIds([]);
      setStatus(`${selectedIds.length} item(s) deleted`);
    } catch (err) {
      console.error(err);
      setStatus("Error deleting items");
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((it) => it._id));
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => fetchData(date || undefined)}
        >
          Refresh Now
        </button>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          onClick={() => {
            const blob = new Blob([JSON.stringify(items, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `n8n_data_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download JSON
        </button>

        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          onClick={() => {
            const csv = jsonToCsv(items);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `n8n_data_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download CSV
        </button>

        <button
          className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition ${
            selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
        >
          Delete Selected
        </button>

        <span className="text-gray-700 w-36 inline-block">{status}</span>

        <label className="ml-4 flex items-center gap-2">
          Choose date:
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          onClick={() => fetchData(date)}
        >
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border-b text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === items.length && items.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-8 py-2 border-b text-left">#</th>
              <th className="px-8 py-2 border-b text-left">Received At</th>
              <th className="px-8 py-2 border-b text-left">Machine ID</th>
              <th className="px-8 py-2 border-b text-left">Work Done</th>
              <th className="px-8 py-2 border-b text-left">Status</th>
              <th className="px-8 py-2 border-b text-left">Temperature</th>
              <th className="px-8 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              items.map((it, idx) => {
                const p = it.payload || {};
                const isSelected = selectedIds.includes(it._id);
                return (
                  <tr
                    key={it._id || idx}
                    className={`transition ${
                      isSelected
                        ? "bg-blue-100 hover:bg-blue-100"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <td className="px-4 py-2 border-b">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(it._id)}
                      />
                    </td>
                    <td className="px-6 py-2 border-b">{idx + 1}</td>
                    <td className="px-6 py-2 border-b">
                      {new Date(it.receivedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-2 border-b">{p.machineId ?? "-"}</td>
                    <td className="px-6 py-2 border-b">{p.workDone ?? "-"}</td>
                    <td className="px-6 py-2 border-b">{p.status ?? "-"}</td>
                    <td className="px-6 py-2 border-b">
                      {p.temperature ?? "-"}
                    </td>
                    <td className="px-6 py-2 border-b">
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        onClick={() => handleDelete(it._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
