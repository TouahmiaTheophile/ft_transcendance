"use client"

import Link from "next/link";

export default function OnlinePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Online play (placeholder)</h1>
      <p>This page is a placeholder for the online game UI.</p>
      <p>
        <Link href="/dashboard">Back to dashboard</Link>
      </p>
    </main>
  );
}
