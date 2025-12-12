import React, { useState, useEffect } from 'react';
import { searchPlaces, getPlaceDetails, generateTravelImage } from '../services/geminiService';
import { Place, PlaceDetails } from '../types';
import { MapPin, Utensils, Bed, Mountain, Navigation, RefreshCw, Star, Heart, Search, X, MessageSquare, Image as ImageIcon, ExternalLink, Loader2, Sparkles } from 'lucide-react';

const Explore: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'famous' | 'food' | 'lodging' | 'favorites'>('famous');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [customLocation, setCustomLocation] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [favorites, setFavorites] = useState<Place[]>([]);
  
  // Modal State
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiImageLoading, setAiImageLoading] = useState(false);

  // Load favorites from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yatrasaarthi_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const getLocation = () => {
    setLocating(true);
    setError(null);
    setCustomLocation(""); // Reset custom location when using GPS
    setSearchInput("");
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
          setError("Could not get your location. Please enable location permissions or enter a location manually.");
          setLocating(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLocating(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (activeCategory === 'favorites') return;
    
    // Only search if we have a location (GPS or text) and we aren't currently waiting for GPS
    if ((location || customLocation) && !locating) {
      const timer = setTimeout(() => {
        handleSearch(activeCategory);
      }, 1500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, customLocation, activeCategory]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
        setCustomLocation(searchInput.trim());
        // We will trigger the effect to search
    }
  };

  const handleSearch = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = category === 'famous' ? 'Famous tourist attractions' 
                  : category === 'food' ? 'Best restaurants' 
                  : 'Top rated hotels and lodges';
      
      let results: Place[] = [];
      if (customLocation) {
        results = await searchPlaces(query, undefined, undefined, customLocation);
      } else if (location) {
        results = await searchPlaces(query, location.lat, location.lng);
      }
      
      setPlaces(results);
    } catch (e: any) {
      setError(e.message || "Failed to fetch places using Gemini Maps Grounding.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (place: Place) => favorites.some(f => f.name === place.name);

  const toggleFavorite = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation(); // Prevent modal open
    let newFavs: Place[];
    if (isFavorite(place)) {
      newFavs = favorites.filter(f => f.name !== place.name);
    } else {
      newFavs = [...favorites, place];
    }
    setFavorites(newFavs);
    localStorage.setItem('yatrasaarthi_favorites', JSON.stringify(newFavs));
  };

  const openDetails = async (place: Place) => {
      setSelectedPlace(place);
      setDetails(null);
      setAiImage(null);
      setDetailsLoading(true);

      try {
          const det = await getPlaceDetails(place.name, location?.lat, location?.lng, customLocation);
          setDetails(det);
      } catch (err) {
          console.error(err);
          // Fallback if detail fetch fails
          setDetails({
              distance: "Unknown",
              reviews: ["Could not load reviews."],
              visualDescription: place.description || "No description available."
          });
      } finally {
          setDetailsLoading(false);
      }
  };

  const generateVisualization = async () => {
      if (!details?.visualDescription) return;
      setAiImageLoading(true);
      try {
          const images = await generateTravelImage(details.visualDescription + ", cinematic, photorealistic, 4k", "1K", "16:9");
          if (images.length > 0) setAiImage(images[0]);
      } catch (err: any) {
          console.error(err);
          alert(err.message || "Failed to generate visualization.");
      } finally {
          setAiImageLoading(false);
      }
  };

  const getBackgroundImage = () => {
    switch(activeCategory) {
        case 'food': return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920&auto=format&fit=crop";
        case 'lodging': return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop";
        case 'favorites': return "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1920&auto=format&fit=crop";
        default: return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1920&auto=format&fit=crop";
    }
  };

  const displayedPlaces = activeCategory === 'favorites' ? favorites : places;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{
            backgroundImage: `url('${getBackgroundImage()}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-0 bg-wander-dark/90 backdrop-blur-[2px]" />

      <div className="relative z-10 pt-20 pb-32 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-serif mb-2 text-white">Explore {customLocation ? customLocation : "Nearby"}</h2>
                    <p className="text-gray-400">Discover famous spots and local favorites.</p>
                </div>
                
                {/* Search Bar */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleManualSearch} className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-wander-accent transition-colors" size={18} />
                        <input 
                            type="text" 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search specific city..."
                            className="w-full bg-black/20 border border-gray-600 rounded-full py-2.5 pl-10 pr-10 text-white focus:border-wander-accent focus:outline-none focus:ring-1 focus:ring-wander-accent transition"
                        />
                        {searchInput && (
                            <button 
                                type="button" 
                                onClick={() => { setSearchInput(''); setCustomLocation(''); if(location) getLocation(); }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>
                    
                    {customLocation ? (
                        <button 
                            onClick={getLocation}
                            className="flex items-center justify-center space-x-2 bg-wander-accent text-wander-dark px-4 py-2 rounded-full font-medium hover:bg-white transition"
                        >
                            <Navigation size={16} />
                            <span className="whitespace-nowrap">Use GPS</span>
                        </button>
                    ) : (
                        location && !locating && (
                            <div className="flex items-center justify-center space-x-2 text-wander-accent text-sm bg-wander-accent/10 px-4 py-2 rounded-full border border-wander-accent/20">
                                <Navigation size={14} />
                                <span className="whitespace-nowrap">Current Location</span>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => setActiveCategory('famous')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition whitespace-nowrap ${activeCategory === 'famous' ? 'bg-wander-accent text-wander-dark border-wander-accent shadow-[0_0_15px_rgba(238,186,77,0.3)]' : 'border-gray-600 text-gray-300 hover:border-white hover:bg-white/5'}`}
            >
                <Star size={18} className={activeCategory === 'famous' ? 'fill-wander-dark' : ''} /> <span>Famous Attractions</span>
            </button>
            <button 
                onClick={() => setActiveCategory('food')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition whitespace-nowrap ${activeCategory === 'food' ? 'bg-wander-accent text-wander-dark border-wander-accent' : 'border-gray-600 text-gray-300 hover:border-white hover:bg-white/5'}`}
            >
                <Utensils size={18} /> <span>Restaurants</span>
            </button>
            <button 
                onClick={() => setActiveCategory('lodging')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition whitespace-nowrap ${activeCategory === 'lodging' ? 'bg-wander-accent text-wander-dark border-wander-accent' : 'border-gray-600 text-gray-300 hover:border-white hover:bg-white/5'}`}
            >
                <Bed size={18} /> <span>Lodging</span>
            </button>
            <button 
                onClick={() => setActiveCategory('favorites')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition whitespace-nowrap ${activeCategory === 'favorites' ? 'bg-wander-accent text-wander-dark border-wander-accent' : 'border-gray-600 text-gray-300 hover:border-white hover:bg-white/5'}`}
            >
                <Heart size={18} className={activeCategory === 'favorites' ? 'fill-wander-dark' : ''} /> <span>Favorites</span>
            </button>
            </div>

            {error && activeCategory !== 'favorites' && (
                <div className="p-6 bg-red-900/20 border border-red-500/50 text-red-200 rounded-3xl flex flex-col items-center justify-center text-center mb-8 animate-in fade-in slide-in-from-top-4">
                    <p className="mb-4 font-semibold">{error}</p>
                    <div className="flex gap-4">
                        <button onClick={getLocation} className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/40 px-4 py-2 rounded-2xl transition">
                            <RefreshCw size={16} /> <span>Retry GPS</span>
                        </button>
                    </div>
                </div>
            )}

            {locating && !customLocation ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-wander-accent/20 rounded-full animate-ping"></div>
                        <Navigation className="relative text-wander-accent" size={48} />
                    </div>
                    <p className="mt-6 font-medium">Acquiring your location...</p>
                </div>
            ) : loading && activeCategory !== 'favorites' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-48 bg-white/5 rounded-3xl border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedPlaces.map((place, index) => (
                        <div 
                            key={place.name + index} 
                            onClick={() => openDetails(place)}
                            className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition group flex flex-col justify-between h-full hover:border-wander-accent/50 hover:shadow-lg hover:shadow-black/50 relative cursor-pointer backdrop-blur-sm"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4 pr-10">
                                    <h3 className="text-xl font-serif text-white group-hover:text-wander-accent transition line-clamp-2">{place.name}</h3>
                                </div>
                                {/* Action Buttons Container */}
                                <div className="absolute top-6 right-6 flex items-center space-x-2">
                                    {/* Favorite Button */}
                                    <button 
                                        onClick={(e) => toggleFavorite(e, place)}
                                        className="p-2 rounded-full hover:bg-white/10 transition z-10"
                                        title={isFavorite(place) ? "Remove from favorites" : "Save to favorites"}
                                    >
                                        <Heart 
                                            size={20} 
                                            className={`transition-colors duration-300 ${isFavorite(place) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-white"}`} 
                                        />
                                    </button>
                                </div>

                                <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                                    {place.description || place.address || "Click to see details, reviews, and distance."}
                                </p>
                            </div>
                            
                            <div className="mt-4 text-xs uppercase tracking-wider text-wander-accent font-semibold flex items-center">
                                <span>View Details</span>
                                <ExternalLink size={12} className="ml-2" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedPlace && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPlace(null)}>
                    <div 
                        className="bg-[#0f1f26] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-1">{selectedPlace.name}</h3>
                                {details ? (
                                    <p className="text-wander-accent flex items-center gap-2 text-sm">
                                        <MapPin size={16} /> 
                                        <span>{details.distance} from {customLocation ? 'center' : 'current location'}</span>
                                    </p>
                                ) : (
                                    <div className="h-5 w-32 bg-white/10 animate-pulse rounded"></div>
                                )}
                            </div>
                            <button 
                                onClick={() => setSelectedPlace(null)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {detailsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Loader2 className="animate-spin mb-4" size={32} />
                                    <p>Gathering distance, reviews, and visuals...</p>
                                </div>
                            ) : details ? (
                                <>
                                    {/* Reviews Section */}
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <MessageSquare size={18} className="text-blue-400" /> What People Say
                                        </h4>
                                        <ul className="space-y-2">
                                            {details.reviews.map((review, idx) => (
                                                <li key={idx} className="text-gray-300 text-sm pl-4 border-l-2 border-white/10 italic">
                                                    "{review}"
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Visuals Section */}
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                            <ImageIcon size={18} className="text-pink-400" /> Visuals
                                        </h4>
                                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                            {details.visualDescription}
                                        </p>

                                        {/* AI Image Generation Area */}
                                        <div className="mt-4">
                                            {aiImage ? (
                                                <div className="relative group">
                                                    <img src={aiImage} alt="AI Representation" className="w-full rounded-2xl border border-white/10 shadow-lg" />
                                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">AI Generated</div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 flex-wrap">
                                                    <a 
                                                        href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(selectedPlace.name + " " + (customLocation || (location ? "" : "")))}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm font-medium"
                                                    >
                                                        <Search size={16} /> View Real Photos
                                                    </a>
                                                    <button
                                                        onClick={generateVisualization}
                                                        disabled={aiImageLoading}
                                                        className="flex-1 bg-gradient-to-r from-wander-accent to-yellow-600 text-wander-dark hover:from-yellow-400 hover:to-yellow-500 py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
                                                    >
                                                        {aiImageLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                                        <span>AI Visualize</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-red-400 text-center">Failed to load details.</p>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex gap-4">
                            {selectedPlace.uri && (
                                <a 
                                    href={selectedPlace.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 py-3 rounded-2xl flex items-center justify-center gap-2 transition font-medium border border-blue-500/30"
                                >
                                    <Navigation size={18} /> Open in Google Maps
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Explore;