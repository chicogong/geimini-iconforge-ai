import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Layers, 
  Image as ImageIcon, 
  Grid2X2, 
  Trash2,
  AlertCircle,
  BrainCircuit,
  X,
  Download,
  Palette
} from 'lucide-react';
import { IconStyle, GeneratedIcon } from './types';
import { generateIconPrompts, generateSingleIcon } from './services/geminiService';
import { IconCard } from './components/IconCard';

function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>(IconStyle.THREE_D);
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'generating'>('idle');
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [previewIcon, setPreviewIcon] = useState<GeneratedIcon | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Scroll to results ref
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setPhase('thinking');
    setError(null);

    try {
      // Step 1: Thinking / Brainstorming
      // Use Gemini Flash to generate creative variations of the prompt
      const enhancedPrompts = await generateIconPrompts(prompt, selectedStyle, 4);
      
      setPhase('generating');

      // Step 2: Generation
      // Generate images in parallel based on the enhanced prompts
      const promises = enhancedPrompts.map(async (enhancedPrompt) => {
        try {
          const url = await generateSingleIcon(enhancedPrompt, selectedStyle);
          return { url, prompt: enhancedPrompt, success: true };
        } catch (err) {
          console.error("Failed to generate one icon", err);
          return { url: '', prompt: enhancedPrompt, success: false };
        }
      });

      const results = await Promise.all(promises);
      
      const newIcons: GeneratedIcon[] = results
        .filter(r => r.success)
        .map(r => ({
          id: Math.random().toString(36).substring(7),
          url: r.url,
          prompt: r.prompt, // Store the specific AI-enhanced prompt
          originalPrompt: prompt, // Store the user's original intent
          style: selectedStyle,
          createdAt: Date.now()
        }));

      if (newIcons.length === 0) {
        throw new Error("Failed to generate icons. Please try again.");
      }

      // Add to start of list
      setGeneratedIcons(prev => [...newIcons, ...prev]);
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      setError(err.message || "Something went wrong while generating icons.");
    } finally {
      setPhase('idle');
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all generated icons?")) {
      setGeneratedIcons([]);
    }
  };

  const isBusy = phase !== 'idle';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-200 selection:text-brand-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-brand-600 to-brand-400 p-2 rounded-lg text-white">
              <Layers size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              IconForge AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="hidden sm:block hover:text-brand-600 transition-colors cursor-pointer">Documentation</span>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">Beta</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero & Input Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Generate Professional <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">App Icons in Seconds</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create stunning, unique icons for your applications using Gemini AI. 
            Describe your concept, and we'll brainstorm 4 distinct variations for you.
          </p>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 sm:p-3 relative overflow-hidden transition-all duration-500">
            {isBusy && (
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 animate-gradient-x bg-[length:200%_100%]"></div>
            )}
            
            <form onSubmit={handleGenerate} className="flex flex-col gap-4 p-4">
              
              {/* Prompt Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Wand2 size={20} />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your icon (e.g., 'A fast rocket ship', 'A cute robot helper')"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                  disabled={isBusy}
                />
              </div>

              {/* Style Selection */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
                   <div className="flex items-center gap-2 text-slate-500 text-sm font-medium shrink-0">
                      <Palette size={16} />
                      <span>Style:</span>
                   </div>
                   <select 
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value as IconStyle)}
                      disabled={isBusy}
                      className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full sm:w-auto p-2.5 cursor-pointer hover:border-brand-400 transition-colors"
                   >
                      {Object.values(IconStyle).map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                   </select>
                </div>

                <button
                  type="submit"
                  disabled={isBusy || !prompt.trim()}
                  className={`
                    w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all transform
                    ${isBusy || !prompt.trim() 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:translate-y-[-1px] hover:shadow-brand-500/40 active:translate-y-[1px]'}
                  `}
                >
                  {phase === 'thinking' ? (
                    <>
                      <BrainCircuit size={20} className="animate-pulse" />
                      <span>Designing Concepts...</span>
                    </>
                  ) : phase === 'generating' ? (
                    <>
                      <Sparkles size={20} className="animate-spin" />
                      <span>Generating Assets...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Icons</span>
                      <Sparkles size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 text-sm max-w-2xl mx-auto animate-fadeIn">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

        </div>

        {/* Results Section */}
        <div ref={resultsRef} className="space-y-8">
          
          {generatedIcons.length > 0 && (
             <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                   <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                      <Grid2X2 size={20} />
                   </div>
                   <h2 className="text-xl font-bold text-slate-800">Generated Icons</h2>
                   <span className="ml-2 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                     {generatedIcons.length}
                   </span>
                </div>
                <button 
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Clear History</span>
                </button>
             </div>
          )}

          {generatedIcons.length === 0 && !isBusy && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No icons generated yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Enter a prompt above and select a style to generate your first set of professional icons.
              </p>
            </div>
          )}

          {/* Skeleton Loader during Generation */}
          {isBusy && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                    <div className="flex-1 bg-slate-100 animate-pulse relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
                       
                       {phase === 'thinking' ? (
                          <>
                             <BrainCircuit size={32} className="animate-pulse text-brand-400 mb-3"/>
                             <div className="h-2 bg-brand-200 rounded animate-pulse w-3/4 mx-auto"></div>
                             <p className="text-xs text-brand-500 mt-2 font-medium">Drafting Concept {i+1}...</p>
                          </>
                       ) : (
                          <>
                             <ImageIcon size={32} className="text-slate-300 mb-3"/>
                             <div className="h-2 bg-slate-200 rounded animate-pulse w-1/2 mx-auto"></div>
                             <p className="text-xs text-slate-400 mt-2 font-medium">Rendering...</p>
                          </>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* Icon Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {generatedIcons.map((icon) => (
              <IconCard 
                key={icon.id} 
                icon={icon} 
                onPreview={setPreviewIcon} 
              />
            ))}
          </div>
        </div>
      </main>

      {/* Full Screen Preview Modal */}
      {previewIcon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fadeIn">
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
             <button 
                onClick={() => setPreviewIcon(null)}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-800 transition-colors z-10"
             >
                <X size={24} />
             </button>

            {/* Image Side */}
            <div className="w-full md:w-1/2 bg-slate-100 flex items-center justify-center p-8 md:p-12">
               <div className="relative group w-full aspect-square shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                  <img 
                    src={previewIcon.url} 
                    alt={previewIcon.prompt} 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>

            {/* Details Side */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-white overflow-y-auto">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        {previewIcon.style}
                     </span>
                     <span className="text-slate-400 text-xs">
                        {new Date(previewIcon.createdAt).toLocaleTimeString()}
                     </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">
                    {previewIcon.originalPrompt}
                  </h3>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BrainCircuit size={14} /> 
                      AI Concept Design
                    </h4>
                    <p className="text-sm text-slate-600 italic leading-relaxed">"{previewIcon.prompt}"</p>
                  </div>

                  <div className="space-y-4">
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technical Specs</h4>
                        <div className="space-y-2 text-sm text-slate-700">
                           <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                              <span>Resolution</span>
                              <span className="font-mono text-slate-500">1024 x 1024 px</span>
                           </div>
                           <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                              <span>Aspect Ratio</span>
                              <span className="font-mono text-slate-500">1:1</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span>Format</span>
                              <span className="font-mono text-slate-500">PNG</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewIcon.url;
                        link.download = `iconforge-${previewIcon.style.toLowerCase().replace(/\s+/g, '-')}-${previewIcon.id}.png`;
                        link.click();
                    }}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all hover:shadow-lg active:scale-[0.99]"
                  >
                     <Download size={20} />
                     Download High Res
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        @keyframes gradient-x {
          0%, 100% {
              background-position: 0% 50%;
          }
          50% {
              background-position: 100% 50%;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default App;