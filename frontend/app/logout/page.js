"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("jwt");
    setTimeout(() => {
      router.replace("/login");
    }, 1000);
  }, [router]);
  return <div style={{textAlign:'center',marginTop:40}}>Logging out...</div>;
} 