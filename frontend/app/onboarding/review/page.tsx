'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import FileDropzone from '../../components/FileDropzone';
import dynamic from 'next/dynamic';

const VegaLite = dynamic(() => import('react-vega').then(m => m.VegaLite), { ssr: false });

type SimpleFile = { name: string; sizeKB: number; file?: File };
type Widget = { title: string; explanation?: string; vega_spec: any; role?: string };

export default function DocumentUpload() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<SimpleFile[]>([]);
  const [domain, setDomain] = useState<string>('general');
  const [intent, setIntent] = useState<string>('quick_viz');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uploadedDocs');
      if (saved) setUploadedFiles(JSON.parse(saved));
      const biStr = localStorage.getItem('businessInfo');
      if (biStr) {
        const bi = JSON.parse(biStr);
        if (bi?.businessType) setDomain(bi.businessType);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('uploadedDocs', JSON.stringify(uploadedFiles.map(({ file, ...rest }) => rest)));
    } catch {}
  }, [uploadedFiles]);

  const onFilesSelected = async (files: File[]) => {
    const first = files[0];
    if (!first) return;
    const item = { name: first.name, sizeKB: parseFloat((first.size / 1024).toFixed(2)), file: first };
    setUploadedFiles(prev => [item, ...prev]);

    console.log('\n' + '='.repeat(80));
    console.log('📤 FRONTEND - Upload started');
    console.log('='.repeat(80));
    console.log('📁 File:', first.name, `(${item.sizeKB} KB)`);
    console.log('🏢 Domain:', domain || 'general');
    console.log('🎯 Intent:', intent || 'quick_viz');

    // Immediately propose widgets against backend for first file
    try {
      const fd = new FormData();
      fd.append('file', first);
      fd.append('domain', domain || 'general');
      fd.append('intent', intent || 'quick_viz');

      console.log('⏳ Sending to backend /api/upload...');
      const resp = await fetch(`${apiBase}/api/upload`, { method: 'POST', body: fd });
      console.log(`📥 Response status: ${resp.status} ${resp.statusText}`);
      
      if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      
      const data = await resp.json();
      console.log('📦 Response data:', data);
      console.log(`   - Widgets: ${data.widgets?.length || 0}`);
      console.log(`   - Preview rows: ${data.preview?.length || 0}`);
      
      if (data.widgets && data.widgets.length > 0) {
        console.log('✨ Widget proposals:');
        data.widgets.forEach((w: any, i: number) => {
          console.log(`   ${i + 1}. ${w.title}`);
          console.log(`      Vega spec:`, w.vega_spec);
        });
      }
      
      setWidgets(data.widgets || []);
      setPreview(data.preview || []);
      
      console.log('✅ State updated successfully');
      console.log('='.repeat(80) + '\n');
    } catch (e) {
      console.error('❌ Upload error:', e);
      console.log('='.repeat(80) + '\n');
      alert('Upload failed. Please ensure backend is running.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const name = `My Dashboard (${new Date().toLocaleString()})`;
      const resp = await fetch(`${apiBase}/api/dashboard/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, widgets, meta: { domain, intent } }),
      });
      if (!resp.ok) throw new Error(`Save failed: ${resp.status}`);
      const out = await resp.json();
      alert('Dashboard saved!');
      router.push(`/dashboard/ceo?id=${out.id}`);
    } catch (e) {
      console.error(e);
      alert('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="font-bold text-3xl text-gray-900 mb-2 text-center">Upload your files</h1>
      <div className="text-gray-600 text-lg mb-8 text-center">Upload a CSV/XLSX and we\'ll propose charts instantly.</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">📄 Upload a data file</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input className="border rounded-lg px-3 py-2" placeholder="Domain (e.g. sales)" value={domain} onChange={e => setDomain(e.target.value)} />
              <input className="border rounded-lg px-3 py-2" placeholder="Intent (e.g. growth)" value={intent} onChange={e => setIntent(e.target.value)} />
            </div>
            <FileDropzone onFilesSelected={onFilesSelected} accept=".csv,.tsv,.xlsx,.xls" />

            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Uploaded</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <div className="font-medium text-sm">{file.name}</div>
                          <div className="text-xs text-gray-500">{file.sizeKB} KB</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {widgets.length > 0 && (
            <Card>
              <h3 className="font-bold text-lg mb-4">Proposed charts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {widgets.map((w, idx) => (
                  <div key={idx} className="bg-white rounded-lg border p-3">
                    <div className="font-semibold mb-2">{w.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{w.explanation}</div>
                    {/* @ts-ignore */}
                    <VegaLite spec={w.vega_spec} data={{ preview }} actions={false} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Dashboard'}</Button>
              </div>
            </Card>
          )}

          <Card className="bg-gray-50">
            <h3 className="font-bold mb-2 flex items-center gap-2">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Use tidy CSV with a header row.</li>
              <li>Include at least one numeric measure and one category or date.</li>
              <li>We only read the first ~200 rows for instant previews.</li>
            </ul>
          </Card>
        </div>
        <div className="md:col-span-1 flex items-end justify-end gap-3">
          <Button variant="secondary" onClick={() => router.push('/onboarding/team')}>Back</Button>
          <Button variant="primary" onClick={() => router.push('/dashboard/ceo')}>Skip</Button>
        </div>
      </div>
    </div>
  );
}