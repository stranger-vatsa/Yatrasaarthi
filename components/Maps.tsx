import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Search, ArrowRight, Loader2, Locate, X, Map as MapIcon, Share2 } from 'lucide-react';
import { getRouteGuidance } from '../services/geminiService';

const Maps: React.FC = () => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [destination, setDestination] = useState('');
    const [guidance, setGuidance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shareBtnText, setShareBtnText] = useState("Share");
    const [showRoute, setShowRoute] = useState(false);

    const getLocation = () => {
        setLocating(true);
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocating(false);
                },
                (err) => {
                    console.error(err);
                    setError("Unable to access location. Please enable permissions.");
                    setLocating(false);
                }
            );
        } else {
            setError("Geolocation is not supported.");
            setLocating(false);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const handleGetDirections = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location || !destination) return;

        setLoading(true);
        setGuidance(null);
        setShowRoute(true);
        try {
            const advice = await getRouteGuidance(location.lat, location.lng, destination);
            setGuidance(advice || "Unable to generate guidance.");
        } catch (err) {
            console.error(err);
            setGuidance("Could not get AI guidance at this moment.");
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setDestination('');
        setGuidance(null);
        setShowRoute(false);
    };

    const openGoogleMaps = () => {
        if (!location || !destination) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${encodeURIComponent(destination)}`;
        window.open(url, '_blank');
    };

    const handleShare = async () => {
        if (!location) return;

        let url = '';
        let text = '';
        let title = '';

        if (destination) {
            url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${encodeURIComponent(destination)}`;
            title = `Route to ${destination}`;
            text = `Check out this route to ${destination}!`;
        } else {
            url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
            title = 'My Location';
            text = `I'm currently here!`;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
            } catch (err) {
                console.log('Share canceled', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setShareBtnText("Copied!");
                setTimeout(() => setShareBtnText("Share"), 2000);
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    const mapSrc = location 
        ? (showRoute && destination 
            ? `https://www.google.com/maps?saddr=${location.lat},${location.lng}&daddr=${encodeURIComponent(destination)}&output=embed`
            : `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`)
        : '';

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Layer */}
            <div 
                className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1920&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 z-0 bg-wander-dark/90 backdrop-blur-[2px]" />

            <div className="relative z-10 pt-20 pb-32 px-4 md:px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    
                    {/* Left Panel: Controls & Guidance */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-4xl font-serif text-white">Smart Navigation</h2>
                            <button 
                                onClick={handleShare}
                                disabled={!location}
                                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed group"
                            >
                                <Share2 size={16} className="group-hover:text-wander-accent transition-colors" />
                                <span className="hidden sm:inline font-medium">{shareBtnText}</span>
                            </button>
                        </div>
                        
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-6 shadow-lg backdrop-blur-sm">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className={`w-3 h-3 rounded-full ${locating ? 'bg-yellow-400 animate-ping' : location ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-gray-300 text-sm uppercase tracking-wider font-medium">
                                    {locating ? "Locating you..." : location ? "Current Location Active" : "Location Unavailable"}
                                </span>
                            </div>

                            <form onSubmit={handleGetDirections} className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-wander-accent transition-colors">
                                    <Search size={20} />
                                </div>
                                <input 
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Search destination (e.g., 'Cafe near me')"
                                    className="w-full bg-black/40 border border-gray-600 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:border-wander-accent focus:outline-none focus:ring-1 focus:ring-wander-accent transition shadow-inner"
                                />
                                {destination && (
                                    <button 
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                                <button 
                                    type="submit"
                                    disabled={loading || !location || !destination}
                                    className="mt-4 w-full bg-wander-accent text-wander-dark font-bold py-3 rounded-full hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2 shadow-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
                                    <span>Get AI Route</span>
                                </button>
                            </form>
                        </div>

                        {guidance && (
                            <div className="bg-gradient-to-br from-wander-green/20 to-black/40 border border-wander-accent/20 p-6 rounded-3xl flex-1 animate-fade-in flex flex-col shadow-xl backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-wander-accent mb-4 flex items-center">
                                    <MapPin size={20} className="mr-2" /> Route Insights
                                </h3>
                                <div className="prose prose-invert prose-sm max-w-none text-gray-300 mb-6 overflow-y-auto max-h-60 custom-scrollbar pr-2 leading-relaxed whitespace-pre-line">
                                    {guidance}
                                </div>
                                <button 
                                    onClick={openGoogleMaps}
                                    className="mt-auto w-full bg-white/10 text-white font-semibold py-3 rounded-2xl hover:bg-white/20 transition flex items-center justify-center space-x-2 border border-white/5"
                                >
                                    <span>Open in Google Maps App</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Map View */}
                    <div className="h-[500px] lg:h-auto bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl min-h-[500px] group backdrop-blur-sm">
                        {!location && !locating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-black/60 z-10 p-6 text-center">
                                <MapIcon size={48} className="mb-4 opacity-50" />
                                <p className="mb-4">Location access is needed to show the map.</p>
                                <button onClick={getLocation} className="text-wander-accent hover:underline flex items-center">
                                    <Locate size={16} className="mr-1" /> Enable Location
                                </button>
                            </div>
                        )}
                        
                        {mapSrc && (
                            <>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={mapSrc}
                                    title="Live Map"
                                    className="w-full h-full"
                                ></iframe>
                                
                                {location && (
                                    <button 
                                        onClick={() => setShowRoute(false)}
                                        className="absolute bottom-6 right-6 bg-wander-dark border border-white/20 text-white p-3 rounded-full shadow-xl hover:bg-wander-accent hover:text-wander-dark transition-all duration-300 z-20 group/recenter"
                                        title="Recenter on current location"
                                    >
                                        <Locate size={24} className={!showRoute ? "text-wander-accent" : "text-white group-hover/recenter:text-wander-dark"} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Maps;