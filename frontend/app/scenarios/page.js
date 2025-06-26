"use client";
import { useEffect, useState } from "react";

function ScenarioCard({ name, status, id }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0 1px 6px #0001',
      padding: 20,
      minWidth: 200,
      minHeight: 90,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      border: '1px solid #e5e7eb',
    }}>
      <span style={{ fontWeight: 600, fontSize: 17 }}>{name}</span>
      <span style={{ fontSize: 14, color: status === 'Running' ? '#388e3c' : '#b71c1c' }}>{status}</span>
      <a href={`/scenarios/${id}`} style={{ color: '#1976d2', fontSize: 14, marginTop: 8, textDecoration: 'underline' }}>View Details</a>
    </div>
  );
}

export default function ScenarioListPage() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/scenarios")
      .then(res => res.json())
      .then(data => setScenarios(data))
      .catch(() => setError("Failed to load scenarios"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{marginTop:40,textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{marginTop:40,textAlign:'center',color:'#b71c1c'}}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 22 }}>Scenarios</h2>
        <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>
          ＋ Add Scenario
        </button>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} {...s} />
        ))}
      </div>
    </div>
  );
} 