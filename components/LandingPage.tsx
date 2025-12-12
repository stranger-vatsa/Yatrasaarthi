import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const destinations = [
  {
    id: 1,
    name: "Agra",
    tagline: "The City of Eternal Love",
    description: "Home to the Taj Mahal, a world wonder. Explore the architectural marvels of the Mughal empire along the Yamuna river.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Bangalore",
    tagline: "The Garden City",
    description: "A blend of royal heritage at Bangalore Palace and modern vibrancy. Explore the lush gardens and historic architecture.",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Tamil Nadu",
    tagline: "Land of Temples",
    description: "Discover the towering gopurams and ancient Dravidian architecture that define the spiritual soul of the south.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Varanasi",
    tagline: "The City of Lights",
    description: "One of the oldest living cities in the world. Experience the divine Ganga Aarti and the spiritual ghats.",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Kerala",
    tagline: "God's Own Country",
    description: "Serene backwaters, lush greenery, and ancient temples. A journey into nature's soul.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Goa",
    tagline: "Pearl of the Orient",
    description: "Where pristine beaches meet rich Portuguese heritage. A paradise for relaxation and exploration.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Rajasthan",
    tagline: "Land of Kings",
    description: "Majestic forts, golden deserts, and vibrant culture. Relive the era of royalty and valor.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Ladakh",
    tagline: "Roof of the World",
    description: "Monasteries perched on rugged mountains and crystal clear lakes. Find peace in the silence.",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Kashmir",
    tagline: "Paradise on Earth",
    description: "Snow-capped mountains, serene Dal Lake, and vibrant Mughal gardens. A mesmerizing landscape of beauty.",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "Hampi",
    tagline: "City of Ruins",
    description: "A UNESCO World Heritage site featuring the magnificent ruins of the Vijayanagara Empire amidst boulder-strewn hills.",
    image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 11,
    name: "Meghalaya",
    tagline: "Abode of Clouds",
    description: "Explore living root bridges, cascading waterfalls, and the cleanest villages in Asia hidden in the misty hills.",
    image: "https://images.unsplash.com/photo-1592652495944-984429940738?q=80&w=1920&auto=format&fit=crop",
  },
  {
     id: 12,
     name: "Andaman",
     tagline: "Emerald Blue Islands",
     description: "Pristine white sandy beaches, turquoise waters, and vibrant coral reefs. An exotic island getaway.",
     image: "https://images.unsplash.com/photo-1589979481223-deb893043163?q=80&w=1920&auto=format&fit=crop",
  }
];

const LandingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destinations.length);
    }, 8000); // 8 seconds per slide to match zoom duration
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-wander-dark overflow-hidden font-sans">
      
      {/* Branding / Logo */}
      <div className="absolute top-8 left-6 md:left-16 z-30">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-widest flex items-center gap-2">
            YATRASAARTHI <span className="text-wander-accent text-4xl">.</span>
        </h1>
      </div>

      {/* Full Screen Background Slider with Ken Burns Effect */}
      {destinations.map((dest, index) => (
        <div 
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
            <div className="absolute inset-0 overflow-hidden">
                <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                />
            </div>
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-wander-dark via-black/40 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* Main Content Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto w-full pointer-events-none">
         <div className="max-w-2xl pointer-events-auto mt-12 md:mt-0">
             <div className="flex items-center space-x-2 text-wander-accent mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                <span className="uppercase tracking-[0.2em] text-sm font-semibold">Incredible India</span>
             </div>
             
             {/* Text Content */}
             <div key={currentSlide}>
                 <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-4 leading-none tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    {destinations[currentSlide].name}
                 </h1>
                 
                 <h2 className="text-2xl md:text-3xl font-serif text-wander-accent mb-6 italic animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    {destinations[currentSlide].tagline}
                 </h2>
                 
                 <p className="text-gray-200 text-lg mb-10 max-w-lg leading-relaxed border-l-2 border-wander-accent/50 pl-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 backdrop-blur-sm bg-black/10 py-2">
                    {destinations[currentSlide].description}
                 </p>
             </div>

             <div className="flex space-x-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                 <Link 
                    to="/planner" 
                    className="group px-8 py-4 bg-wander-accent text-wander-dark font-bold tracking-widest uppercase hover:bg-white hover:text-black transition duration-300 flex items-center gap-2"
                 >
                    Start Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <Link 
                    to="/explore" 
                    className="px-8 py-4 border border-white text-white font-bold tracking-widest uppercase hover:bg-white/10 transition duration-300"
                 >
                    Explore
                 </Link>
             </div>
         </div>
      </div>

      {/* Location Pin Decoration */}
      <div className="absolute top-24 right-10 md:right-20 z-20 text-white/10 animate-pulse hidden lg:block pointer-events-none">
         <MapPin size={300} strokeWidth={0.5} />
      </div>
    </div>
  );
};

export default LandingPage;