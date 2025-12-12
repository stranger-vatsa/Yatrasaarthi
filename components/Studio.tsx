import React, { useState } from 'react';
import { generateTravelImage, editTravelImage, generateTravelVideo } from '../services/geminiService';
import { StudioMode, AspectRatio, ImageSize } from '../types';
// Fixed: Added Sparkles to imports
import { Image as ImageIcon, Video, Edit, Download, Upload, Loader2, Play, Sparkles } from 'lucide-react';

const Studio: React.FC = () => {
    const [mode, setMode] = useState<StudioMode>(StudioMode.GENERATE_IMAGE);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Image Gen Options
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
    const [imageSize, setImageSize] = useState<ImageSize>("1K");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null); // Clear previous results
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64Data = result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleAction = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            if (mode === StudioMode.GENERATE_IMAGE) {
                const images = await generateTravelImage(prompt, imageSize, aspectRatio);
                if (images.length > 0) setResult(images[0]);
            } else if (mode === StudioMode.EDIT_IMAGE) {
                if (!selectedImage) throw new Error("Please upload an image first.");
                const base64 = await convertFileToBase64(selectedImage);
                const images = await editTravelImage(base64, prompt, selectedImage.type);
                if (images.length > 0) setResult(images[0]);
            } else if (mode === StudioMode.GENERATE_VIDEO) {
                if (!selectedImage) throw new Error("Please upload an image first.");
                const base64 = await convertFileToBase64(selectedImage);
                const videoUrl = await generateTravelVideo(base64, prompt, selectedImage.type);
                setResult(videoUrl);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-wander-dark pt-20 pb-32 px-4 md:px-12 flex flex-col items-center">
             <div className="w-full max-w-5xl">
                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                    <div>
                         <h2 className="text-4xl font-serif">Creative Studio</h2>
                         <p className="text-gray-400 mt-2">Generate, Edit, and Animate using Gemini Pro & Veo</p>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button 
                        onClick={() => { setMode(StudioMode.GENERATE_IMAGE); setResult(null); setError(null); }}
                        className={`p-4 rounded-3xl border flex flex-col items-center justify-center transition ${mode === StudioMode.GENERATE_IMAGE ? 'bg-wander-accent text-wander-dark border-wander-accent' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                        <ImageIcon className="mb-2" />
                        <span className="font-semibold">Generate Image</span>
                    </button>
                     <button 
                        onClick={() => { setMode(StudioMode.EDIT_IMAGE); setResult(null); setError(null); }}
                        className={`p-4 rounded-3xl border flex flex-col items-center justify-center transition ${mode === StudioMode.EDIT_IMAGE ? 'bg-wander-accent text-wander-dark border-wander-accent' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Edit className="mb-2" />
                        <span className="font-semibold">Edit Image</span>
                    </button>
                     <button 
                        onClick={() => { setMode(StudioMode.GENERATE_VIDEO); setResult(null); setError(null); }}
                        className={`p-4 rounded-3xl border flex flex-col items-center justify-center transition ${mode === StudioMode.GENERATE_VIDEO ? 'bg-wander-accent text-wander-dark border-wander-accent' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Video className="mb-2" />
                        <span className="font-semibold">Veo Video</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Controls */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 h-fit">
                        
                        {(mode === StudioMode.EDIT_IMAGE || mode === StudioMode.GENERATE_VIDEO) && (
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-2">Upload Source Image</label>
                                <div className="border-2 border-dashed border-gray-600 rounded-3xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-wander-accent hover:text-white transition cursor-pointer relative">
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="max-h-40 rounded-2xl shadow" />
                                    ) : (
                                        <>
                                            <Upload size={32} className="mb-2" />
                                            <span>Click to Upload</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Prompt</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none h-32 resize-none"
                                placeholder={
                                    mode === StudioMode.GENERATE_IMAGE ? "Describe the scene you want to create..." : 
                                    mode === StudioMode.EDIT_IMAGE ? "Describe how to change the image (e.g., 'add a sunset')" :
                                    "Describe the movement (e.g., 'drone shot of the scenery')"
                                }
                            />
                        </div>

                        {mode === StudioMode.GENERATE_IMAGE && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Aspect Ratio</label>
                                    <select 
                                        value={aspectRatio} 
                                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                        className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none"
                                    >
                                        {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Size</label>
                                    <select 
                                        value={imageSize} 
                                        onChange={(e) => setImageSize(e.target.value as ImageSize)}
                                        className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none"
                                    >
                                        <option value="1K">1K</option>
                                        <option value="2K">2K</option>
                                        <option value="4K">4K</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleAction}
                            disabled={loading || (!prompt && mode === StudioMode.GENERATE_IMAGE) || ((!selectedImage) && mode !== StudioMode.GENERATE_IMAGE)}
                            className="w-full bg-wander-accent text-wander-dark font-bold py-3 rounded-full hover:bg-yellow-500 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            <span>
                                {mode === StudioMode.GENERATE_IMAGE ? "Generate" : mode === StudioMode.EDIT_IMAGE ? "Edit Image" : "Generate Video"}
                            </span>
                        </button>
                         {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                    </div>

                    {/* Output Area */}
                    <div className="flex-[2] bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                        {loading ? (
                             <div className="flex flex-col items-center text-gray-400">
                                <Loader2 className="w-12 h-12 animate-spin mb-4 text-wander-accent" />
                                <p>Creating magic with Gemini...</p>
                                {mode === StudioMode.GENERATE_VIDEO && <p className="text-xs mt-2 text-gray-500">Video generation may take a moment</p>}
                             </div>
                        ) : result ? (
                            mode === StudioMode.GENERATE_VIDEO ? (
                                <video src={result} controls autoPlay loop className="max-w-full max-h-[600px] rounded-2xl shadow-2xl" />
                            ) : (
                                <img src={result} alt="Generated" className="max-w-full max-h-[600px] rounded-2xl shadow-2xl object-contain" />
                            )
                        ) : (
                            <div className="text-gray-600 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center">
                                    <Sparkles size={32} />
                                </div>
                                <p>Your masterpiece will appear here</p>
                            </div>
                        )}
                        
                        {result && !loading && (
                            <a href={result} download={`yatrasaarthi_${Date.now()}.${mode === StudioMode.GENERATE_VIDEO ? 'mp4' : 'png'}`} className="absolute top-4 right-4 bg-black/60 p-3 rounded-full hover:bg-black/80 text-white transition">
                                <Download size={20} />
                            </a>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Studio;