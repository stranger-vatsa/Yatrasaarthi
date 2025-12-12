import React, { useState } from 'react';
import { generatePackingList } from '../services/geminiService';
import { PackingList, PackingCategory } from '../types';
import { Briefcase, Calendar, MapPin, Truck, CheckCircle2, Circle, Loader2, Sparkles, CloudSun, ShieldAlert } from 'lucide-react';

const PackingAssistant: React.FC = () => {
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState('');
    const [transport, setTransport] = useState('Flight');
    const [packingList, setPackingList] = useState<PackingList | null>(null);
    const [loading, setLoading] = useState(false);
    // Track checked items: Record<CategoryIndex-ItemIndex, boolean>
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination || !days) return;

        setLoading(true);
        setPackingList(null);
        setCheckedItems({});
        setError(null);
        
        try {
            const result = await generatePackingList(destination, days, transport);
            setPackingList(result);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Could not generate packing list. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = (catIndex: number, itemIndex: number) => {
        const key = `${catIndex}-${itemIndex}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const transportOptions = ["Flight", "Train", "Bus", "Car", "Bike", "Cruise", "Hiking"];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Layer */}
            <div 
                className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=1920&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="fixed inset-0 z-0 bg-wander-dark/90 backdrop-blur-[2px]" />

            <div className="relative z-10 pt-20 pb-32 px-4 md:px-12 flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-serif text-white mb-2">Your Packing Assistant</h2>
                        <p className="text-gray-400">Get a personalized checklist based on your destination, duration, and travel mode.</p>
                    </div>

                    <form onSubmit={handleGenerate} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-sm mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                                    <MapPin size={16} /> <span>Where are you going?</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="e.g., Manali, Paris"
                                    className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none placeholder-gray-600"
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
                                    placeholder="e.g., 7"
                                    className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none placeholder-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                                    <Truck size={16} /> <span>Mode of Transport</span>
                                </label>
                                <select 
                                    value={transport}
                                    onChange={(e) => setTransport(e.target.value)}
                                    className="w-full bg-black/20 border border-gray-600 rounded-2xl p-3 text-white focus:border-wander-accent focus:outline-none"
                                >
                                    {transportOptions.map(opt => (
                                        <option key={opt} value={opt} className="bg-wander-dark">{opt}</option>
                                    ))}
                                </select>
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
                            {loading ? <Loader2 className="animate-spin" /> : <Briefcase size={20} />}
                            <span>Get Checklist</span>
                        </button>
                    </form>

                    {packingList && (
                        <div className="animate-fade-in space-y-6">
                            {/* Header Summary */}
                            <div className="bg-gradient-to-r from-wander-green/30 to-blue-900/30 border border-wander-accent/20 rounded-3xl p-6 flex items-start gap-4 backdrop-blur-md">
                                <div className="p-3 bg-white/10 rounded-full text-wander-accent">
                                    <CloudSun size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Weather & Essentials</h3>
                                    <p className="text-gray-200">{packingList.weatherSummary}</p>
                                </div>
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {packingList.categories.map((category, catIndex) => {
                                    const isEmergency = category.category.toLowerCase().includes('emergency') || category.category.toLowerCase().includes('toolkit');
                                    return (
                                        <div key={catIndex} className={`bg-black/20 border rounded-3xl p-5 hover:border-white/10 transition backdrop-blur-sm ${isEmergency ? 'border-red-500/30 bg-red-900/10' : 'border-white/5'}`}>
                                            <h4 className={`text-lg font-serif mb-4 border-b border-white/5 pb-2 flex items-center gap-2 ${isEmergency ? 'text-red-300' : 'text-wander-accent'}`}>
                                                {isEmergency && <ShieldAlert size={20} className="text-red-400" />}
                                                {category.category}
                                            </h4>
                                            <ul className="space-y-3">
                                                {category.items.map((item, itemIndex) => {
                                                    const isChecked = checkedItems[`${catIndex}-${itemIndex}`];
                                                    return (
                                                        <li 
                                                            key={itemIndex} 
                                                            onClick={() => toggleCheck(catIndex, itemIndex)}
                                                            className={`flex items-start gap-3 cursor-pointer group p-2 rounded-2xl transition ${isChecked ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                                        >
                                                            <div className={`mt-1 shrink-0 ${isChecked ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                                {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                            </div>
                                                            <div>
                                                                <span className={`block font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                                    {item.item}
                                                                </span>
                                                                {item.reason && !isChecked && (
                                                                    <span className="text-xs text-gray-500 block mt-0.5 italic">
                                                                        {item.reason}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="text-center text-gray-500 text-sm mt-8 pb-12">
                                <p>Tip: Don't forget to double-check airline baggage policies if flying!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PackingAssistant;