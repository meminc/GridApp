"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
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
        if (data.user) {
          setUser(data.user);
          if (data.user.role !== "admin") router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      });
  }, [router]);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    fetch("http://localhost:4000/users", {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{marginTop:40,textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{marginTop:40,textAlign:'center',color:'#b71c1c'}}>{error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ fontSize: 24, marginBottom: 24 }}>Admin Panel: User Management</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#e3eaf6' }}>
            <th style={{ textAlign: 'left', padding: 10 }}>Username</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}>{u.username}</td>
              <td style={{ padding: 10 }}>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 