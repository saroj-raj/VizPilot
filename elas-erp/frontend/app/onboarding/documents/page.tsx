'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface WidgetSpec {
  id: string;
  type: string;
  title: string;
  description?: string;
  explanation?: string;
  vegaSpec?: any;
  vega_spec?: any;
  config?: any;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [domain, setDomain] = useState('');
  const [intent, setIntent] = useState('');
  const [filesMetadata, setFilesMetadata] = useState<any[]>([]);
  const [groqInput, setGroqInput] = useState<any>(null);
  const [groqResponse, setGroqResponse] = useState<any>(null);
  const [widgets, setWidgets] = useState<WidgetSpec[]>([]);
  const [datasetId, setDatasetId] = useState('');
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [previewDataCount, setPreviewDataCount] = useState(0);

  useEffect(() => {
    loadDataAndCallAPI();
  }, []);

  const loadDataAndCallAPI = async () => {
    try {
      const bizInfo = localStorage.getItem('businessInfo');
      const dom = localStorage.getItem('uploadDomain');
      const int = localStorage.getItem('uploadIntent');
      const meta = localStorage.getItem('uploadedFilesMetadata');
      const apiResponseStr = localStorage.getItem('uploadResponse');

      if (bizInfo) setBusinessInfo(JSON.parse(bizInfo));
      if (dom) setDomain(dom);
      if (int) setIntent(int);
      if (meta) setFilesMetadata(JSON.parse(meta));

      // Check if we have API response from upload page
      if (apiResponseStr) {
        console.log('✅ Found API response in localStorage');
        const apiResponse = JSON.parse(apiResponseStr);
        
        // DEBUG: Log widget details
        console.log('🔍 DEBUG: Total widgets in API response:', apiResponse.widgets?.length || 0);
        apiResponse.widgets?.forEach((w: any, i: number) => {
          console.log(`  Widget ${i+1}: ${w.title} (type: ${w.type})`);
        });
        
        setDatasetId(apiResponse.dataset_id || '');
        setWidgets(apiResponse.widgets || []);
        setGroqInput(apiResponse.groq_input || null);
        setGroqResponse(apiResponse.groq_response || null);
        setPreviewDataCount(apiResponse.preview?.length || 0);
        
        // Keep uploadResponse in localStorage for dashboard page
        console.log('📦 Keeping uploadResponse for dashboard access');
        
        setLoading(false);
      } else {
        // Fallback: No API response found (old flow or error)
        setLoading(false);
        setError('Please re-select your files below to generate AI insights.');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load saved data. Please go back and try again.');
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('domain', domain);
      formData.append('intent', intent);

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setDatasetId(data.dataset_id);
      setWidgets(data.widgets || []);
      setGroqInput(data.groq_input || null);
      setGroqResponse(data.groq_response || null);

      setLoading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process files. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      setLoading(true);
      
      // Get business info for dashboard name
      const bizInfo = localStorage.getItem('businessInfo');
      const businessName = bizInfo ? JSON.parse(bizInfo).businessName || 'My Dashboard' : 'My Dashboard';
      
      const dashboardData = {
        name: `${businessName} - ${domain || 'Dashboard'}`,
        dataset_id: datasetId,
        widgets: widgets,
        meta: {
          domain: domain,
          intent: intent,
          created_at: new Date().toISOString(),
          layout: widgets.map((w, idx) => ({
            i: w.id,
            x: (idx % 2) * 6,
            y: Math.floor(idx / 2) * 4,
            w: 6,
            h: 4,
          })),
        },
      };

      console.log('💾 Saving dashboard:', dashboardData);
      const response = await fetch('http://localhost:8000/api/dashboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', errorData);
        throw new Error('Failed to save dashboard');
      }
      
      const result = await response.json();
      console.log('✅ Dashboard saved:', result);
      
      // Store the full dashboard data for the admin page to load
      // IMPORTANT: Keep the preview data from the original upload!
      const originalUploadResponse = localStorage.getItem('uploadResponse');
      const originalData = originalUploadResponse ? JSON.parse(originalUploadResponse) : {};
      
      const dashboardViewData = {
        widgets: widgets,
        dataset_id: datasetId,
        domain: domain,
        intent: intent,
        groq_input: groqInput,
        groq_response: groqResponse,
        preview: originalData.preview || [],  // Keep preview data!
      };
      localStorage.setItem('uploadResponse', JSON.stringify(dashboardViewData));
      console.log('💾 Stored dashboard data for viewing (with preview):', {
        ...dashboardViewData,
        preview: `${dashboardViewData.preview.length} rows`
      });
      
      router.push('/dashboard/admin');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save dashboard. Please try again.');
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Elas ERP" width={40} height={40} />
              <span className="text-xl font-bold text-gray-900">Elas ERP</span>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">Step 4 of 4</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Review & Confirm</h1>
          <p className="text-gray-600">Review your inputs, see AI processing details, and preview your dashboard widgets</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{error}</p>
            {error.includes('re-select') && (
              <div className="mt-4">
                <input type="file" multiple accept=".csv,.xlsx,.xls" onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Your Input Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Business Information</h3>
              {businessInfo && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {businessInfo.businessName}</p>
                  <p><strong>Industry:</strong> {businessInfo.industry}</p>
                  <p><strong>Size:</strong> {businessInfo.size}</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Data Context</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Domain:</strong> {domain}</p>
                <p><strong>Intent:</strong> {intent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📁 Uploaded Files</h2>
          {filesMetadata.length > 0 ? (
            <div className="space-y-2">
              {filesMetadata.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No files uploaded yet</p>
          )}
        </div>

        {groqInput && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">🤖 AI Input (What we sent to Groq)</h2>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(JSON.stringify(groqInput, null, 2))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">📋 Copy</button>
                <button onClick={() => setShowInput(!showInput)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium">
                  {showInput ? '▼ Collapse' : '▶ Expand'}
                </button>
              </div>
            </div>
            {showInput && (
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">{JSON.stringify(groqInput, null, 2)}</pre>
            )}
          </div>
        )}

        {groqResponse && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">🤖 AI Response (What Groq returned)</h2>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(JSON.stringify(groqResponse, null, 2))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">📋 Copy</button>
                <button onClick={() => setShowResponse(!showResponse)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium">
                  {showResponse ? '▼ Collapse' : '▶ Expand'}
                </button>
              </div>
            </div>
            {showResponse && (
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">{JSON.stringify(groqResponse, null, 2)}</pre>
            )}
          </div>
        )}

        {/* DEBUG INFO PANEL */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">🔍 DEBUG INFO</h3>
          <div className="text-sm space-y-1">
            <p><strong>Total Widgets in State:</strong> {widgets.length}</p>
            <p><strong>Dataset ID:</strong> {datasetId || 'Not set'}</p>
            <p className={previewDataCount > 0 ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
              <strong>Preview Data Rows:</strong> {previewDataCount} {previewDataCount === 0 ? '⚠️ NO DATA!' : '✅'}
            </p>
            <div className="mt-2">
              <strong>Widget List:</strong>
              <ol className="list-decimal list-inside mt-1 ml-2">
                {widgets.map((w, i) => (
                  <li key={i} className="text-xs">
                    {w.title} <span className="text-gray-600">(type: {w.type})</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {widgets.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Dashboard Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {widgets.map((widget, idx) => (
                <div key={widget.id || `widget-${idx}`} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{widget.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{widget.explanation || widget.description || 'AI-generated visualization'}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Widget Type: {widget.type}</p>
                    {widget.config && (
                      <div className="text-xs text-gray-600 mt-2">
                        {widget.config.x_column && <div>X-Axis: {widget.config.x_column}</div>}
                        {widget.config.y_column && <div>Y-Axis: {widget.config.y_column}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button onClick={() => router.push('/onboarding/upload')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors" disabled={loading}>
            ← Back
          </button>
          <button onClick={handleSaveAndContinue} disabled={loading || !datasetId || widgets.length === 0}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : 'Save & Continue to Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  );
}
