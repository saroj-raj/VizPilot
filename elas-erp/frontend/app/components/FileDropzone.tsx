import React from 'react';
import Button from './Button';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export default function FileDropzone({
  onFilesSelected,
  accept = '.csv,.xlsx,.xls',
  multiple = false,
}: FileDropzoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="space-y-4">
        <div className="text-slate-600">
          <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-slate-600">
            Drag and drop your file here, or
          </p>
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            Browse Files
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Supported formats: CSV, Excel (.xlsx, .xls)
        </p>
      </div>
    </div>
  );
}
