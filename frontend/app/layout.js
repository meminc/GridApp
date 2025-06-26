"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


function Breadcrumbs() {
  let pathname = "";
  try {
    pathname = usePathname();
  } catch {
    pathname = "/";
  }
  const segments = pathname.split("/").filter(Boolean);
  let path = "";
  return (
    <nav style={{ fontSize: 14, marginBottom: 16 }}>
      <Link href="/">Home</Link>
      {segments.map((seg, i) => {
        path += `/${seg}`;
        return (
          <span key={i}>
            {" "}&gt;{" "}
            <Link href={path}>{decodeURIComponent(seg)}</Link>
          </span>
        );
      })}
    </nav>
  );
}

const navLinks = [
  { href: "/", label: "🏠 Home" },
  { href: "/login", label: "🔑 Login" },
  { href: "/logout", label: "🚪 Logout" },
  { href: "/dashboard", label: "📊 Dashboard" },
  { href: "/scenarios", label: "🗂️ Scenario List" },
  { href: "/scenarios/1", label: "📄 Scenario Detail" },
];

function Sidebar({ open, onClose }) {
  return (
    <aside
      style={{
        width: open ? 240 : 0,
        background: "linear-gradient(180deg,#f4f4f4 80%,#e0e7ef 100%)",
        padding: open ? 28 : 0,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        borderRight: open ? "1px solid #e5e7eb" : "none",
        boxShadow: open ? "2px 0 8px #0001" : "none",
        transition: "width 0.2s, padding 0.2s",
        position: "fixed",
        top: 60,
        left: 0,
        height: "calc(100vh - 60px)",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      <h2 style={{ marginBottom: 36, fontSize: 20, color: "#222", letterSpacing: 1, display: open ? "block" : "none" }}>
        Grid Tool
      </h2>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            color: "#222",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: 16,
            transition: "background 0.15s, color 0.15s",
            marginBottom: 2,
            display: open ? "block" : "none",
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#e0e7ef')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          onClick={onClose}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}

function MenuButton({ onClick, open }) {
  return (
    <button
      aria-label="Toggle menu"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: 28,
        marginRight: 18,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {open ? "✖" : "☰"}
    </button>
  );
}

function UserInfo() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) return;
    fetch("http://localhost:4000/auth/me", {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);
  if (user)
    return (
      <span style={{ marginLeft: 18, fontSize: 15, color: '#fff', background: '#1976d2', borderRadius: 8, padding: '4px 12px', fontWeight: 500 }}>
        👤 {user.username} ({user.role})
      </span>
    );
  return (
    <Link href="/login" style={{ marginLeft: 18, color: '#fff', textDecoration: 'underline', fontSize: 15 }}>
      Login
    </Link>
  );
}

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Responsive: hide sidebar by default on small screens
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 900);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ margin: 0, padding: 0, background: "#f8fafc" }}
      >
        <header
          style={{
            width: "100%",
            background: "linear-gradient(90deg,#222 60%,#3a3a3a 100%)",
            color: "#fff",
            padding: "18px 24px 18px 16px",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 1,
            boxShadow: "0 2px 8px #0001",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            height: 60,
          }}
        >
          <MenuButton onClick={() => setSidebarOpen((o) => !o)} open={sidebarOpen} />
          <span style={{ letterSpacing: 2 }}>⚡ Grid Monitoring & Simulation Tool</span>
          <UserInfo />
        </header>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            paddingTop: 60,
            marginLeft: sidebarOpen ? 240 : 0,
            transition: "margin-left 0.2s",
          }}
        >
          <main
            style={{
              flex: 1,
              padding: window.innerWidth < 600 ? 16 : 40,
              background: "#fff",
              minHeight: "calc(100vh - 60px)",
              display: "flex",
              flexDirection: "column",
              transition: "padding 0.2s",
            }}
          >
            <Breadcrumbs />
            <div style={{ flex: 1 }}>{children}</div>
          </main>
        </div>
        <footer
          style={{
            width: "100%",
            background: "#222",
            color: "#fff",
            textAlign: "center",
            padding: window.innerWidth < 600 ? "10px 0" : "14px 0",
            fontSize: 15,
            position: "fixed",
            left: 0,
            bottom: 0,
            zIndex: 20,
            letterSpacing: 1,
            boxShadow: "0 -2px 8px #0001",
          }}
        >
          &copy; {new Date().getFullYear()} Grid Monitoring & Simulation Tool
        </footer>
      </body>
    </html>
  );
}
