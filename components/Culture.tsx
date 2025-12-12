import React, { useState } from 'react';
import { getDestinationCulture } from '../services/geminiService';
import { CultureInfo } from '../types';
import { Scroll, Landmark, PartyPopper, Utensils, MapPin, Loader2, BookOpen, ExternalLink } from 'lucide-react';

const Culture: React.FC = () => {
    const [destination, setDestination] = useState('');
    const [cultureInfo, setCultureInfo] = useState<CultureInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDiscover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination) return;

        setLoading(true);
        setCultureInfo(null);
        setError(null);
        try {
            const result = await getDestinationCulture(destination);
            setCultureInfo(result);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Could not fetch cultural information. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Layer */}
            <div 
                className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1920&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 z-0 bg-wander-dark/90 backdrop-blur-[2px]" />

            <div className="relative z-10 pt-20 pb-32 px-4 md:px-12 flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif text-white mb-2">Local History & Festivals</h2>
                        <p className="text-gray-400">Deep dive into the soul of your destination.</p>
                    </div>

                    <form onSubmit={handleDiscover} className="max-w-xl mx-auto mb-16 relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Enter City or Region (e.g., Jaipur, Kyoto)"
                            className="w-full bg-white/5 border border-gray-600 rounded-full py-4 pl-12 pr-36 text-white focus:border-wander-accent focus:outline-none focus:ring-1 focus:ring-wander-accent transition shadow-xl"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !destination}
                            className="absolute right-2 top-2 bottom-2 bg-wander-accent text-wander-dark font-bold px-6 rounded-full hover:bg-yellow-500 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Discover"}
                        </button>
                    </form>

                    {error && (
                        <div className="max-w-xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-2xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    {cultureInfo && (
                        <div className="animate-fade-in space-y-8">
                            {/* History Section */}
                            <div className="bg-gradient-to-br from-black/40 to-wander-green/10 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Landmark size={120} />
                                </div>
                                <h3 className="text-2xl font-serif text-wander-accent mb-4 flex items-center gap-3">
                                    <Scroll size={24} /> History of {cultureInfo.destination}
                                </h3>
                                <p className="text-gray-200 leading-relaxed text-lg font-light border-l-2 border-wander-accent/30 pl-6">
                                    {cultureInfo.history}
                                </p>
                            </div>

                            {/* Culinary Heritage & Food History */}
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start backdrop-blur-sm relative overflow-hidden">
                                     {/* Background decoration for food section */}
                                     <div className="absolute -right-10 -bottom-10 opacity-5">
                                        <Utensils size={200} />
                                     </div>

                                    <div className="flex-1 relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-orange-500/20 rounded-full text-orange-400">
                                                <Utensils size={24} />
                                            </div>
                                            <h3 className="text-2xl font-serif text-white">Culinary Heritage & Food Culture</h3>
                                        </div>
                                        
                                        <p className="text-gray-300 italic mb-8 leading-relaxed pl-2 border-l-2 border-orange-500/30">
                                            "{cultureInfo.culinaryBackground}"
                                        </p>
                                        
                                        {cultureInfo.dishes && cultureInfo.dishes.length > 0 && (
                                            <div>
                                                <h4 className="text-sm uppercase tracking-widest text-orange-400 mb-4 font-semibold">Must-Try Authentic Dishes</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {cultureInfo.dishes.map((dish, i) => (
                                                        <div key={i} className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-orange-400/50 transition group flex flex-col justify-between h-full">
                                                            <div>
                                                                <h4 className="text-lg text-orange-200 font-bold mb-2 group-hover:text-orange-400 transition font-serif">{dish.name}</h4>
                                                                <p className="text-sm text-gray-400 leading-snug mb-4">{dish.description}</p>
                                                            </div>
                                                            <a 
                                                                href={`https://www.google.com/search?q=best+${encodeURIComponent(dish.name)}+in+${encodeURIComponent(cultureInfo.destination)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-orange-400/80 hover:text-orange-300 flex items-center gap-1 mt-auto pt-2 border-t border-white/5"
                                                            >
                                                                <span>Find places to eat</span>
                                                                <ExternalLink size={10} />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Festivals Grid */}
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                                    <PartyPopper className="text-pink-400" size={24} /> Local Festivals
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cultureInfo.festivals.map((festival, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition hover:-translate-y-1 duration-300 backdrop-blur-sm">
                                            <div className="text-xs uppercase tracking-wider text-wander-accent mb-2 font-semibold">
                                                {festival.time}
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-3">{festival.name}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {festival.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stories Section */}
                            {cultureInfo.stories && cultureInfo.stories.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                                        <BookOpen className="text-indigo-400" size={24} /> Legends & Community Stories
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {cultureInfo.stories.map((story, idx) => (
                                            <div key={idx} className="bg-black/20 border border-white/10 p-6 rounded-3xl hover:border-wander-accent/30 transition relative group backdrop-blur-sm">
                                                <div className="text-4xl text-white/5 font-serif absolute top-2 left-2 pointer-events-none group-hover:text-wander-accent/10 transition">“</div>
                                                <h4 className="text-lg font-bold text-wander-accent mb-3 pl-4 relative z-10">{story.title}</h4>
                                                <p className="text-gray-300 italic font-light pl-4 relative z-10">
                                                    {story.story}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Culture;