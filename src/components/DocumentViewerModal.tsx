import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Trash2, 
  Image as ImageIcon, 
  Plus, 
  FileSpreadsheet,
  CheckCircle,
  ClipboardPaste,
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  documentName: string | null;
  documentType: 'image' | 'pdf' | null;
  onUploadDocument: (file: File) => void;
  onClearDocument: () => void;
  onOpenAddModal: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
  onUploadDocument,
  onClearDocument,
  onOpenAddModal,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom on document change or modal open
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, documentUrl]);

  // Global paste handler to paste screenshot from clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const pastedFile = new File([blob], `Pasted_Screenshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`, {
              type: blob.type,
            });
            onUploadDocument(pastedFile);
            setZoom(1);
            setRotation(0);
            setCopiedNotification(true);
            setTimeout(() => setCopiedNotification(false), 3000);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, onUploadDocument]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    onUploadDocument(file);
    setZoom(1);
    setRotation(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(4, Number((prev + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, Number((prev - 0.25).toFixed(2))));
  const handleResetZoom = () => setZoom(1);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input always accessible */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-slate-900 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Paste notification toast */}
        {copiedNotification && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4" />
            <span>Screenshot pasted and loaded directly from clipboard!</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                  {documentName ? documentName : 'School Orders Document & Screenshot Assistant'}
                </h3>
                {documentType && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono text-[10px] font-bold uppercase">
                    {documentType}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect handwritten slips, teacher notes, or pasted screenshots while logging orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {documentUrl && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log Order From Slip</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar when document is active */}
        {documentUrl && (
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400 hidden sm:inline">Inspect:</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-bold transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="font-mono text-slate-300 px-2 py-1 bg-slate-950 rounded border border-slate-800 text-[11px] hover:border-slate-600 transition-colors"
                title="Reset zoom to 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-bold transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-[10px] hidden sm:inline">{rotation}°</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Replace File</span>
              </button>

              <button
                onClick={onClearDocument}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold cursor-pointer transition-colors"
                title="Remove Document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div 
          className={`flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4 relative ${
            isDraggingOver ? 'ring-4 ring-indigo-500 ring-inset bg-indigo-950/30' : ''
          }`}
        >
          {!documentUrl ? (
            <div className="max-w-md w-full bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <ImageIcon className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-white">Upload or Paste Order Screenshot</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Supports screenshots from your phone, photo of school paper slips, class notebook pages, or PDF sheets.
                </p>
              </div>

              {/* Drag & Drop / Click Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 rounded-xl bg-indigo-950/20 hover:bg-indigo-950/40 transition-all cursor-pointer group"
              >
                <Upload className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-bold text-indigo-200">
                  Click to select file or drag & drop here
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Images (PNG, JPG, WebP) & PDF documents
                </span>
              </div>

              {/* Paste Shortcut Banner */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-amber-400" />
                  <span>Direct Clipboard Paste Supported:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Take a screenshot with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200 text-[10px] border border-slate-700">Win+Shift+S</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200 text-[10px] border border-slate-700">Cmd+Shift+4</kbd> and simply press <strong className="text-white font-mono">Ctrl+V / Cmd+V</strong> anywhere in this window to load it immediately!
                </p>
              </div>
            </div>
          ) : documentType === 'pdf' ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-white shadow-2xl">
              <iframe
                src={documentUrl}
                title="Uploaded Order Document"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
              <img
                src={documentUrl}
                alt="Order Document Preview"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-none max-h-[75vh] object-contain shadow-2xl rounded-lg border border-slate-800 bg-slate-900 select-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] sm:text-xs">
            {documentUrl 
              ? 'Tip: Use zoom & rotate buttons to read student names and custom inscriptions.' 
              : 'Press Ctrl+V / Cmd+V to paste a screenshot directly.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
            {documentUrl && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-colors shadow-xs"
              >
                Log Order Form
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
