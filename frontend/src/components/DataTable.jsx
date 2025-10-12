import React, { useEffect, useState } from "react";

function jsonToCsv(items) {
  if (!items || items.length === 0) return "";
  let csv = "receivedAt,payload\n";
  items.forEach((it) => {
    const payloadStr = JSON.stringify(it.payload).replace(/"/g, '""');
    csv += `"${it.receivedAt}","${payloadStr}"\n`;
  });
  return csv;
}

export default function DataTable() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const API = process.env.REACT_APP_API_URL || "/api";

  const fetchData = async (filterDate) => {
    setStatus("Loading...");
    try {
      const url = filterDate ? `${API}/data?date=${filterDate}` : `${API}/data`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);
      setStatus(`Loaded ${data.length} items`);
    } catch (e) {
      console.error(e);
      setStatus("Error loading");
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => fetchData(date || undefined)}>
          Refresh Now
        </button>
        <button
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

        <span>{status}</span>

        <label style={{ marginLeft: 12 }}>
          Choose date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button onClick={() => fetchData(date)}>Filter</button>
      </div>

      <table style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Received At</th>
            <th>Payload (JSON)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it._id || idx}>
              <td>{idx + 1}</td>
              <td>{new Date(it.receivedAt).toLocaleString()}</td>
              <td>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(it.payload, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
