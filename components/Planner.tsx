import React, { useState } from 'react';
import { generateTripPlan } from '../services/geminiService';
import { TripPlan } from '../types';
import { 
    Sparkles, Calendar, MapPin, Heart, X, ArrowUpRight, Map, 
    Plane, Train, Bus, BedDouble, ExternalLink, 
    CloudSun, Thermometer, Briefcase,
    Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, CloudFog, Snowflake
} from 'lucide-react';

const Planner: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [interests, setInterests] = useState('');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!destination || !days) return;
    
    setLoading(true);
    setPlan(null);
    setError(null);
    setSelectedActivity(null);
    try {
        const result = await generateTripPlan(destination, days, interests);
        setPlan(result);
    } catch (error: any) {
        console.error(error);
        setError(error.message || "Failed to generate plan. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return <CloudRain size={32} className="text-blue-400" />;
    if (c.includes('snow') || c.includes('blizzard') || c.includes('flurries') || c.includes('ice')) return <CloudSnow size={32} className="text-white" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning size={32} className="text-yellow-400" />;
    if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return <CloudFog size={32} className="text-gray-400" />;
    if (c.includes('cloud') || c.includes('overcast') || c.includes('gloom')) return <Cloud size={32} className="text-gray-300" />;
    if (c.includes('sun') || c.includes('clear') || c.includes('bright') || c.includes('hot')) return <Sun size={32} className="text-yellow-500" />;
    if (c.includes('wind') || c.includes('breeze')) return <Wind size={32} className="text-blue-200" />;
    if (c.includes('cold') || c.includes('freeze')) return <Snowflake size={32} className="text-cyan-200" />;
    return <CloudSun size={32} className="text-orange-300" />;
  };

  const bookingOptions = [
      {
          id: 'flight',
          label: 'Book Flights',
          icon: <Plane size={24} />,
          url: `https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(destination)}`,
          color: 'text-sky-400',
          bg: 'bg-sky-400/10 hover:bg-sky-400/20'
      },
      {
          id: 'hotel',
          label: 'Book Hotels',
          icon: <BedDouble size={24} />,
          url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`,
          color: 'text-indigo-400',
          bg: 'bg-indigo-400/10 hover:bg-indigo-400/20'
      },
      {
          id: 'train',
          label: 'Train Tickets',
          icon: <Train size={24} />,
          url: `https://www.google.com/search?q=train+tickets+to+${encodeURIComponent(destination)}`,
          color: 'text-emerald-400',
          bg: 'bg-emerald-400/10 hover:bg-emerald-400/20'
      },
      {
          id: 'bus',
          label: 'Bus Tickets',
          icon: <Bus size={24} />,
          url: `https://www.google.com/search?q=bus+tickets+to+${encodeURIComponent(destination)}`,
          color: 'text-orange-400',
          bg: 'bg-orange-400/10 hover:bg-orange-400/20'
      }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
        {/* Background Layer */}
        <div 
            className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1920&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        />
        <div className="fixed inset-0 z-0 bg-wander-dark/90 backdrop-blur-[2px]" />

        <div className="relative z-10 pt-20 pb-32 px-4 md:px-12 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <h2 className="text-4xl font-serif mb-6 text-center text-white">Trip Planner</h2>
                
                <form onSubmit={handlePlan} className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-sm mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                                <MapPin size={16} /> <span>Destination</span>
                            </label>
                            <input 
                                type="text" 
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g., Paris, Tokyo"
                                className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                                <Calendar size={16} /> <span>Duration (Days)</span>
                            </label>
                            <input 
                                type="number" 
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                placeholder="e.g., 5"
                                className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                                <Heart size={16} /> <span>Interests</span>
                            </label>
                            <input 
                                type="text" 
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="e.g., History, Food"
                                className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-2xl text-sm text-center">
                            {error}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="mt-6 w-full bg-wander-accent text-wander-dark font-bold py-3 rounded-full hover:bg-yellow-500 transition flex justify-center items-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <span>Thinking...</span>
                        ) : (
                            <>
                                <span>Generate </span>
                            </>
                        )}
                    </button>
                </form>

                {plan && (
                    <div className="space-y-8 animate-fade-in pb-20">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-serif text-white">Your Trip to {plan.destination}</h3>
                            <p className="text-wander-accent">{plan.duration}</p>
                        </div>

                        {/* Weather Widget */}
                        {plan.weather && (
                            <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-full shadow-inner backdrop-blur-sm">
                                        {getWeatherIcon(plan.weather.condition)}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">Weather Forecast</h4>
                                        <p className="text-cyan-200/80 text-sm">{plan.weather.condition}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-2xl border border-white/5">
                                    <Thermometer size={20} className="text-orange-400" />
                                    <span className="text-xl font-bold text-white">{plan.weather.temperature}</span>
                                </div>

                                <div className="flex items-start gap-3 max-w-xs bg-black/20 p-3 rounded-2xl border border-white/5">
                                    <Briefcase size={20} className="text-wander-accent shrink-0 mt-1" />
                                    <p className="text-xs text-gray-300 italic">"{plan.weather.packingTip}"</p>
                                </div>
                            </div>
                        )}

                        {/* Booking Section */}
                        <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                                <ExternalLink size={18} className="mr-2" /> Book Your Journey
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {bookingOptions.map((option) => (
                                    <a
                                        key={option.id}
                                        href={option.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-transparent transition-all duration-300 group ${option.bg}`}
                                    >
                                        <div className={`mb-2 ${option.color} group-hover:scale-110 transition-transform`}>
                                            {option.icon}
                                        </div>
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                            {option.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid gap-6">
                            {plan.itinerary.map((day) => (
                                <div key={day.day} className="bg-white/5 border border-white/10 rounded-3xl p-6 transition">
                                    <h4 className="text-xl font-bold text-wander-accent mb-4">Day {day.day}</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-sm uppercase tracking-wide text-gray-500 mb-3">Activities</h5>
                                            <ul className="space-y-2">
                                                {day.activities.map((act, i) => (
                                                    <li 
                                                        key={i} 
                                                        onClick={() => setSelectedActivity(act)}
                                                        className="flex items-center justify-between p-3 rounded-2xl bg-black/20 hover:bg-white/10 border border-transparent hover:border-white/10 cursor-pointer group transition"
                                                    >
                                                        <span className="text-gray-200 group-hover:text-white">{act}</span>
                                                        <div className="flex items-center text-gray-500 group-hover:text-wander-accent transition-colors">
                                                            <span className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity">View Map</span>
                                                            <Map size={16} />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Meals</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {day.meals.map((meal, i) => (
                                                    <span key={i} className="px-3 py-1 bg-black/40 rounded-full text-xs text-gray-300 border border-white/5">{meal}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Map Modal */}
            {selectedActivity && plan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedActivity(null)}>
                    <div className="bg-[#0f1f26] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h3 className="text-xl font-serif text-white flex items-center gap-2">
                                    <MapPin className="text-wander-accent" size={20} />
                                    {selectedActivity}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">in {plan.destination}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedActivity(null)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 min-h-[400px] bg-black/40 relative">
                             <iframe
                                width="100%"
                                height="100%"
                                className="absolute inset-0"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(selectedActivity + ", " + plan.destination)}&output=embed`}
                                title="Activity Location"
                            ></iframe>
                        </div>

                        <div className="p-4 bg-black/20 flex justify-between items-center">
                            <span className="text-xs text-gray-500 hidden md:inline">Map view generated based on location query.</span>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedActivity + ", " + plan.destination)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-wander-accent text-sm font-semibold hover:text-white transition flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-white/5"
                            >
                                <span>Open in Google Maps App</span>
                                <ArrowUpRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Planner;