"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Widget({ title, value, icon, tooltip }) {
  return (
    <div style={{
      background: '#f4f8fb',
      borderRadius: 12,
      padding: 24,
      minWidth: 180,
      minHeight: 90,
      boxShadow: '0 2px 8px #0001',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 8,
      flex: 1,
      position: 'relative',
    }} title={tooltip}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 15, color: '#555', fontWeight: 500 }}>{title}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: '#1a237e' }}>{value}</span>
    </div>
  );
}

function AlarmItem({ message, severity }) {
  const color = severity === 'Critical' ? '#b71c1c' : severity === 'Warning' ? '#fbc02d' : '#388e3c';
  const icon = severity === 'Critical' ? '🚨' : severity === 'Warning' ? '⚠️' : 'ℹ️';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

function ActivityItem({ text, time }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', color: '#444' }}>
      <span style={{ fontSize: 16 }}>🕒</span>
      <span>{text}</span>
      <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>{time}</span>
    </div>
  );
}

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

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.replace("/login");
      return;
    }
    fetch("http://localhost:4000/auth/me", {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("jwt");
          setTimeout(() => router.replace("/login"), 1200);
        }
      })
      .catch(() => {
        setError("Network error");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Placeholder data
  const kpis = [
    { title: 'Active Users', value: 5, icon: '👤', tooltip: 'Users currently online' },
    { title: 'Running Simulations', value: 2, icon: '⚡', tooltip: 'Simulations in progress' },
    { title: 'Alarms', value: 1, icon: '🚨', tooltip: 'Active alarms in the system' },
  ];
  const scenarios = [
    { id: 1, name: 'Peak Load Scenario', status: 'Running' },
    { id: 2, name: 'Normal Operation', status: 'Idle' },
    { id: 3, name: 'Maintenance Mode', status: 'Idle' },
  ];
  const alarms = [
    { message: 'Voltage drop detected at Bus 2', severity: 'Critical' },
    { message: 'Line 3 overload warning', severity: 'Warning' },
  ];
  const activity = [
    { text: 'User admin edited topology', time: '2 min ago' },
    { text: 'Simulation run completed', time: '10 min ago' },
    { text: 'Alarm cleared on Load 1', time: '30 min ago' },
  ];

  if (loading) return <div style={{marginTop:40,textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{marginTop:40,textAlign:'center',color:'#b71c1c'}}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ marginBottom: 10, fontSize: 18, color: '#1976d2', fontWeight: 600 }}>
        Welcome, {user?.username}!
      </div>
      {user?.role === 'admin' && (
        <a href="/admin" style={{ alignSelf: 'flex-start', background: '#1976d2', color: '#fff', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, textDecoration: 'none', marginBottom: 8 }}>
          ⚙️ Admin Panel
        </a>
      )}
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 16 }}>
        {kpis.map((kpi) => (
          <Widget key={kpi.title} {...kpi} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: 20 }}>
          <h3 style={{ fontSize: 18, marginBottom: 10, color: '#b71c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🚨</span> Alarms
          </h3>
          {alarms.length === 0 ? <div style={{ color: '#888' }}>No active alarms</div> : alarms.map((a, i) => <AlarmItem key={i} {...a} />)}
        </div>
        <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: 20 }}>
          <h3 style={{ fontSize: 18, marginBottom: 10, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🕒</span> Recent Activity
          </h3>
          {activity.length === 0 ? <div style={{ color: '#888' }}>No recent activity</div> : activity.map((a, i) => <ActivityItem key={i} {...a} />)}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: 20, marginBottom: 18 }}>Recent Scenarios</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {scenarios.map((s) => (
            <ScenarioCard key={s.id} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
} 