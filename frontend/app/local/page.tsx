"use client"

import Link from "next/link";

export default function LocalPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Local play (placeholder)</h1>
      <p>This page is a placeholder for the local game UI.</p>
      <p>
        <Link href="/dashboard">Back to dashboard</Link>
      </p>
    </main>
  );
}
