import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  FileCode,
  FileText,
  Table,
  Eye,
  ExternalLink,
  Layers,
  Calendar,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Image as ImageIcon,
  Presentation,
  Film,
  Music,
  Box,
  FileQuestion
} from 'lucide-react';
import { VaultFile } from '../types';
import { api } from '../api';

interface FilePreviewModalProps {
  file: VaultFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: VaultFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Presentation PPT state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Image controls state
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // CSV table search state
  const [csvSearch, setCsvSearch] = useState('');

  // 3D Canvas ref
  const canvas3DRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file && isOpen) {
      setLoading(true);
      setCurrentSlideIndex(0);
      setImageZoom(1);
      setImageRotation(0);
      setCsvSearch('');

      api.getPreview(file.id)
        .then((data) => {
          setPreviewData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Preview error:', err);
          if (file.textContent) {
            setPreviewData({
              type: 'text',
              content: file.textContent,
              mimeType: file.mimeType,
              name: file.name
            });
          } else {
            setPreviewData({
              type: 'raw',
              url: `/api/files/${file.id}/raw`,
              mimeType: file.mimeType,
              name: file.name
            });
          }
          setLoading(false);
        });
    } else {
      setPreviewData(null);
    }
  }, [file, isOpen]);

  // Keyboard navigation for PPT slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !previewData || previewData.type !== 'presentation') return;
      const slides = previewData.slides || [];
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewData]);

  if (!isOpen || !file) return null;

  const handleCopyCode = () => {
    if (previewData?.content) {
      navigator.clipboard.writeText(previewData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 1. Presentation Slides View
  const renderPresentationView = () => {
    const slides = previewData?.slides || [];
    if (slides.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Presentation className="w-16 h-16 text-amber-500 mb-3" />
          <h3 className="text-base font-bold text-white">Presentation Slide Deck</h3>
          <p className="text-xs text-slate-400 mt-1">
            Download this PPT/PPTX file to view in Microsoft PowerPoint or Google Slides.
          </p>
        </div>
      );
    }

    const currentSlide = slides[currentSlideIndex] || slides[0];

    return (
      <div className="flex flex-col h-full bg-slate-950">
        {/* Presentation Controls Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 font-mono text-[11px] font-bold">
              SLIDE {currentSlideIndex + 1} OF {slides.length}
            </span>
            <span className="text-slate-300 font-semibold truncate hidden sm:inline">
              {currentSlide.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
              title="Next Slide (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Stage Canvas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Thumbnails Sidebar */}
          <div className="hidden md:flex flex-col w-48 bg-slate-900/60 border-r border-slate-800 p-2 gap-2 overflow-y-auto shrink-0">
            {slides.map((s: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'bg-slate-800 border-amber-400 text-white shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-amber-400 font-bold mb-1">
                  #{s.slideNumber || idx + 1}
                </div>
                <div className="text-[11px] font-semibold truncate leading-tight">
                  {s.title}
                </div>
              </button>
            ))}
          </div>

          {/* Active Slide Canvas (16:9 widescreen layout) */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950">
            <div className="w-full max-w-4xl aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden ring-1 ring-white/5">
              {/* Corner Watermark */}
              <div className="absolute top-4 right-6 text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                NCSC Science Exhibition • Slide {currentSlide.slideNumber || currentSlideIndex + 1}
              </div>

              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 font-semibold mb-3">
                  NCSC-2026-ENV-01
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                  {currentSlide.title}
                </h1>
                {currentSlide.subtitle && (
                  <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-1">
                    {currentSlide.subtitle}
                  </p>
                )}

                <div className="mt-6 space-y-3">
                  {currentSlide.keyPoints?.map((pt: string, pIdx: number) => (
                    <div key={pIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0 shadow-sm shadow-amber-400/50" />
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speaker Notes Callout */}
              {currentSlide.speakerNotes && (
                <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-sans italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-semibold text-amber-400 not-italic mr-1.5">
                    Speaker Notes / Defense Prompt:
                  </span>
                  {currentSlide.speakerNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. High-Resolution Image Viewer with Zoom & Rotate
  const renderImageView = () => {
    const imgUrl = previewData?.url || `/api/files/${file.id}/raw`;

    return (
      <div className="flex flex-col h-full bg-slate-950">
        {/* Image Tools Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span className="font-mono text-[11px]">{file.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400">{formatSize(file.size)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setImageZoom((prev) => Math.max(prev - 0.25, 0.25))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-cyan-300 px-1 min-w-[45px] text-center">
              {Math.round(imageZoom * 100)}%
            </span>
            <button
              onClick={() => setImageZoom((prev) => Math.min(prev + 0.25, 4))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setImageZoom(1);
                setImageRotation(0);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950 relative select-none">
          <img
            src={imgUrl}
            alt={file.name}
            style={{
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl border border-slate-800/80"
          />
        </div>
      </div>
    );
  };

  // 3. Interactive CSV / Spreadsheets
  const renderCSVTable = (raw: string) => {
    const lines = raw.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return <p className="text-slate-400 p-6">Empty dataset</p>;

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));

    const filteredRows = csvSearch
      ? rows.filter((r) => r.some((c) => c.toLowerCase().includes(csvSearch.toLowerCase())))
      : rows;

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">
              Interactive Table ({filteredRows.length} of {rows.length} rows)
            </span>
          </div>
          <input
            type="text"
            placeholder="Search data records..."
            value={csvSearch}
            onChange={(e) => setCsvSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-700 text-cyan-300 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="p-2.5 px-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 px-3 whitespace-nowrap">
                      {cell === 'TRUE' || cell === 'Success' ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[10px]">
                          {cell}
                        </span>
                      ) : cell.includes('HIGH') ? (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50 text-[10px]">
                          {cell}
                        </span>
                      ) : cell.includes('DETECTED') ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/50 text-[10px]">
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const isHTML = previewData?.type === 'html' || ext === 'html' || ext === 'htm' || file.isStaticPublic;
  const isPresentation = previewData?.type === 'presentation' || ['ppt', 'pptx', 'key', 'odp'].includes(ext);
  const isImage = previewData?.type === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext);
  const isSVG = previewData?.type === 'svg' || ext === 'svg';
  const isPDF = previewData?.type === 'pdf' || ext === 'pdf';
  const isSpreadsheet = previewData?.type === 'spreadsheet' || ['csv', 'tsv', 'xlsx', 'xls'].includes(ext);
  const isVideo = previewData?.type === 'video' || ['mp4', 'webm', 'mov'].includes(ext);
  const isAudio = previewData?.type === 'audio' || ['mp3', 'wav', 'ogg'].includes(ext);
  const isCode = previewData?.type === 'text' || ['ino', 'py', 'cpp', 'c', 'h', 'js', 'ts', 'json', 'css', 'sh'].includes(ext);
  const isMarkdown = previewData?.type === 'markdown' || ext === 'md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              {isPresentation ? (
                <Presentation className="w-5 h-5 text-amber-400" />
              ) : isImage ? (
                <ImageIcon className="w-5 h-5 text-pink-400" />
              ) : isHTML ? (
                <Sparkles className="w-5 h-5 text-cyan-400" />
              ) : isCode ? (
                <FileCode className="w-5 h-5 text-emerald-400" />
              ) : isSpreadsheet ? (
                <Table className="w-5 h-5 text-purple-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white truncate">{file.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-[10px] font-mono text-cyan-300">
                  {file.version || 'v1.0'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {file.category} • {formatSize(file.size)} • Updated {new Date(file.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCode && previewData?.content && (
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}

            {isMarkdown && (
              <button
                onClick={handlePrint}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print scientific document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}

            <button
              onClick={() => onDownload(file)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-hidden bg-slate-950 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">Loading file preview stream...</p>
            </div>
          ) : isPresentation ? (
            renderPresentationView()
          ) : isImage ? (
            renderImageView()
          ) : isHTML ? (
            <div className="w-full h-full relative">
              <iframe
                src={previewData?.url || file.staticUrl || `/simulations/${file.storagePath}`}
                className="w-full h-full border-0"
                title={file.name}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
              <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-lg backdrop-blur pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 3D WebGL / HTML Canvas Active
              </div>
            </div>
          ) : isPDF ? (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={`/api/files/${file.id}/raw#toolbar=1`}
                className="w-full h-full border-0"
                title={file.name}
              />
            </div>
          ) : isSpreadsheet && previewData?.content ? (
            renderCSVTable(previewData.content)
          ) : isSVG && previewData?.content ? (
            <div className="w-full h-full flex flex-col">
              <div className="p-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Vector Electrical & Component Schematic</span>
                <span className="font-mono text-cyan-400">Scalable Vector Graphics (SVG)</span>
              </div>
              <div
                className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950"
                dangerouslySetInnerHTML={{ __html: previewData.content }}
              />
            </div>
          ) : isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 p-6">
              <video
                controls
                autoPlay
                className="max-w-full max-h-[75vh] rounded-xl shadow-2xl border border-slate-800"
              >
                <source src={`/api/files/${file.id}/raw`} type={file.mimeType || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAudio ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6">
              <Music className="w-16 h-16 text-cyan-400 mb-4 animate-bounce" />
              <h3 className="text-sm font-bold text-white mb-3">{file.name}</h3>
              <audio controls className="w-full max-w-md">
                <source src={`/api/files/${file.id}/raw`} type={file.mimeType || 'audio/mpeg'} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : isMarkdown && previewData?.content ? (
            <div className="w-full h-full overflow-y-auto p-6 sm:p-10 font-sans max-w-4xl mx-auto text-slate-200">
              <div className="prose prose-invert prose-cyan max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {previewData.content}
              </div>
            </div>
          ) : isCode && previewData?.content ? (
            <div className="w-full h-full overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-950">
              <pre className="line-numbers whitespace-pre">
                <code>{previewData.content}</code>
              </pre>
            </div>
          ) : previewData?.content ? (
            <div className="w-full h-full overflow-auto p-6 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {previewData.content}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
              <FileQuestion className="w-16 h-16 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-white mb-1">
                Document Stream Ready
              </p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                This document is safely stored in your private vault drive. You can download or view it anytime.
              </p>
              <button
                onClick={() => onDownload(file)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download File ({formatSize(file.size)})
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Category: <strong className="text-cyan-400">{file.category}</strong>
            </span>
            <span>
              Total Downloads: <strong className="text-white font-mono">{file.downloads || 0}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {file.tags.map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
