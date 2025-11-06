export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function uploadDemoFile(fd: FormData) {
	const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: fd });
	if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
	return res.json();
}
