import React, { useState, useEffect } from 'react';
import { generateSEO } from './services/geminiService';
import { VideoCategory, SEOResponse } from './types';
import { SparklesIcon, CopyIcon, CheckIcon, YoutubeIcon, RefreshIcon, ImageIcon } from './components/Icons';

// --- UI Components ---

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false, 
  className = '' 
}: { 
  onClick?: () => void; 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline'; 
  disabled?: boolean;
  className?: string;
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 disabled:opacity-50",
    secondary: "bg-yt-paper hover:bg-yt-hover text-white border border-gray-700 disabled:opacity-50",
    outline: "border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ 
  title, 
  children, 
  className = '', 
  action 
}: { 
  title?: string; 
  children?: React.ReactNode; 
  className?: string; 
  action?: React.ReactNode; 
}) => (
  <div className={`bg-yt-paper border border-gray-800 rounded-2xl p-6 shadow-xl ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-red-600 rounded-full"></div>
            {title}
          </h3>
        )}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      title="نسخ النص"
    >
      {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
    </button>
  );
};

const GenerationLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "تحليل فكرة الفيديو والجمهور المستهدف...",
    "فحص خوارزميات اليوتيوب (تحديثات 2025)...",
    "توليد عناوين جذابة لزيادة نسبة النقر (CTR)...",
    "اختيار الكلمات المفتاحية الأكثر بحثاً...",
    "صياغة وصف احترافي وتنسيق المحتوى..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);

  return (
    <Card className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 animate-in fade-in duration-500">
       {/* Spinner / Visual */}
       <div className="relative w-24 h-24">
         <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
           <SparklesIcon className="w-8 h-8 text-red-500 animate-pulse" />
         </div>
       </div>

       {/* Progress Bar */}
       <div className="w-full max-w-md space-y-2">
         <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>جاري المعالجة بواسطة الذكاء الاصطناعي</span>
            <span>{Math.round(progress)}%</span>
         </div>
         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
           <div 
              className="h-full bg-gradient-to-r from-red-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
           ></div>
         </div>
       </div>

       {/* Steps List */}
       <div className="space-y-4 w-full max-w-sm text-right">
         {steps.map((step, idx) => (
           <div 
              key={idx} 
              className={`flex items-center gap-3 transition-all duration-500 ${
                idx === currentStep ? 'opacity-100 scale-105 transform' : 
                idx < currentStep ? 'opacity-50' : 'opacity-30'
              }`}
           >
             <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
               idx < currentStep ? 'bg-green-500/10 border-green-500 text-green-500' :
               idx === currentStep ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' :
               'border-gray-800 bg-gray-900'
             }`}>
               {idx < currentStep ? <CheckIcon className="w-3 h-3" /> : 
                idx === currentStep ? <div className="w-2 h-2 bg-red-500 rounded-full" /> : 
                <div className="w-2 h-2 bg-gray-700 rounded-full" />}
             </div>
             <span className={`text-sm ${idx === currentStep ? 'text-white font-bold' : 'text-gray-400'}`}>
               {step}
             </span>
           </div>
         ))}
       </div>
    </Card>
  );
};

// --- Main App ---

export default function App() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [category, setCategory] = useState<VideoCategory>(VideoCategory.TECH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("الرجاء إدخال فكرة الفيديو");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateSEO({ topic, audience, category });
      setResult(data);
    } catch (err) {
      setError("حدث خطأ أثناء توليد البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-yt-paper/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <YoutubeIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TubeRank <span className="text-red-500">AI</span></h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            منشئ أفكار و سيو اليوتيوب
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            اصنع المحتوى الذي يحبه اليوتيوب
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            حول فكرتك إلى خطة نشر متكاملة. نستخدم الذكاء الاصطناعي لتصنيف الفيديو واستهداف الجمهور المناسب بدقة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="sticky top-24">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">فكرة الفيديو</label>
                  <textarea 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="اكتب فكرة الفيديو هنا... (مثال: أفضل هواتف للألعاب بسعر رخيص)"
                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">الجمهور المستهدف (اختياري)</label>
                  <input 
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="مثال: المبتدئين، الطلاب، محبي التقنية..."
                    className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">فئة الفيديو (هام للتصنيف)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {Object.values(VideoCategory).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all text-right px-3 ${
                          category === cat 
                          ? 'bg-red-500/10 border-red-500 text-red-500' 
                          : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading ? (
                    <>
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      تجهيز خطة النشر
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {loading && (
              <GenerationLoader />
            )}

            {result && !loading && (
              <>
                {/* Strategy Note */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 shrink-0">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-100 mb-1">استراتيجية الخوارزمية (2025)</h4>
                    <p className="text-sm text-blue-200/80 leading-relaxed">{result.algorithmStrategy}</p>
                    <div className="mt-3 flex gap-2">
                       <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        التصنيف المقترح: {result.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Ideas */}
                <Card title="أفكار للصورة المصغرة (Thumbnails)" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.thumbnailIdeas && result.thumbnailIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-black/20 rounded-xl overflow-hidden border border-gray-800 flex flex-col">
                        {/* Visual Mockup */}
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative p-4 flex items-center justify-center text-center group">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                          <p className="relative z-10 font-black text-xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-tight uppercase transform -rotate-2">
                            {idea.text}
                          </p>
                          <div className="absolute bottom-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* Details */}
                        <div className="p-4 flex-1 flex flex-col gap-3">
                           <div>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">المشهد</span>
                             <p className="text-sm text-gray-300 leading-snug">{idea.description}</p>
                           </div>
                           <div className="pt-3 border-t border-gray-800 mt-auto">
                             <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">النص المقترح</span>
                             <div className="flex justify-between items-center">
                                <span className="text-white font-bold text-sm bg-red-500/10 px-2 py-1 rounded border border-red-500/20">{idea.text}</span>
                                <CopyButton text={idea.text} />
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Titles */}
                <Card title="العناوين المقترحة (عالية النقر)" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <div className="space-y-3">
                    {result.titles.map((title, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-3 bg-black/20 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                        <span className="font-medium text-gray-200">{title}</span>
                        <CopyButton text={title} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Description */}
                <Card 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                  title="الوصف (مهيأ لمحركات البحث)" 
                  action={
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-gray-500 font-medium hidden sm:block">نسخ الوصف</span>
                       <CopyButton text={result.description} />
                    </div>
                  }
                >
                  <pre className="whitespace-pre-wrap font-sans text-gray-300 bg-black/20 p-4 rounded-xl border border-gray-800 text-sm leading-relaxed min-h-[200px]">
                    {result.description}
                  </pre>
                </Card>

                {/* Keywords & Hashtags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <Card title="الكلمات المفتاحية (Tags)">
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 border border-gray-700 transition-colors cursor-default">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => navigator.clipboard.writeText(result.keywords.join(','))}
                        className="text-xs py-2 px-4"
                      >
                        نسخ الكل
                      </Button>
                    </div>
                  </Card>

                  <Card title="الهاشتاقات (#)">
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                       <Button 
                        variant="outline" 
                        onClick={() => navigator.clipboard.writeText(result.hashtags.join(' '))}
                        className="text-xs py-2 px-4"
                      >
                        نسخ الكل
                      </Button>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}