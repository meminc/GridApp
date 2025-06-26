"use client";
import { useEffect, useState } from "react";

export default function ScenarioDetailPage({ params }) {
  const { id } = params;
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:4000/scenarios/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setScenario(data);
      })
      .catch(() => setError("Failed to load scenario"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{marginTop:40,textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{marginTop:40,textAlign:'center',color:'#b71c1c'}}>{error}</div>;
  if (!scenario) return null;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>{scenario.name}</h2>
      <div style={{ fontSize: 16, color: scenario.status === 'Running' ? '#388e3c' : '#b71c1c', marginBottom: 16 }}>
        Status: {scenario.status}
      </div>
      <div style={{ fontSize: 15, color: '#333', marginBottom: 24 }}>
        {scenario.description}
      </div>
      <a href="/scenarios" style={{ color: '#1976d2', textDecoration: 'underline', fontSize: 15 }}>&larr; Back to list</a>
    </div>
  );
} 