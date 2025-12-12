import { GoogleGenAI, Type } from "@google/genai";
import { Place, TripPlan, AspectRatio, ImageSize, PackingList, CultureInfo, PlaceDetails } from '../types';

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Retry helper for handling Rate Limits (429)
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (err: any) {
        const isRateLimit = err.status === 429 || err.code === 429 || err.message?.includes('429') || err.message?.includes('quota');
        
        if (retries > 0 && isRateLimit) {
            console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        
        if (isRateLimit) {
            throw new Error("You have exceeded your API quota. Please try again later.");
        }
        throw err;
    }
}

// --- Trip Planning (Reasoning) ---
export const generateTripPlan = async (destination: string, days: string, interests: string, mood?: string): Promise<TripPlan> => {
    return withRetry(async () => {
        const ai = getAiClient();
        let moodContext = "";
        if (mood) {
            moodContext = `The traveler's current mood is "${mood}". Please tailor the itinerary pace and activity style to match this mood.`;
        }

        const prompt = `Plan a ${days}-day trip to ${destination} focusing on ${interests}. 
        ${moodContext}
        Also provide typical weather conditions for a trip to this location.
        Return a structured JSON response.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        destination: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        weather: {
                            type: Type.OBJECT,
                            properties: {
                                temperature: { type: Type.STRING, description: "Average temperature range (e.g. 24°C - 30°C)" },
                                condition: { type: Type.STRING, description: "General weather condition (e.g. Sunny with light breeze)" },
                                packingTip: { type: Type.STRING, description: "One short sentence on what to pack" }
                            }
                        },
                        itinerary: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.INTEGER },
                                    activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    meals: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as TripPlan;
        }
        throw new Error("Failed to generate plan");
    });
};

// --- Culture & History ---
export const getDestinationCulture = async (destination: string): Promise<CultureInfo> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const prompt = `Provide a cultural overview of ${destination}.
        Include:
        1. A concise history of the place (max 100 words).
        2. A list of 3-5 major local festivals (name, typical time of year, and brief description).
        3. A detailed background on the culinary heritage, explicitly covering historical influences, key ingredients, and food culture.
        4. A list of 3 must-try authentic local dishes.
        5. Two short local legends, myths, or heartwarming community stories (approx 50 words each) that give the place character.
        Return as JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        destination: { type: Type.STRING },
                        history: { type: Type.STRING },
                        festivals: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    time: { type: Type.STRING, description: "Month or season" },
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        culinaryBackground: { type: Type.STRING },
                        dishes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        stories: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    story: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as CultureInfo;
        }
        throw new Error("Failed to fetch cultural info");
    });
};

// --- Packing Assistant ---
export const generatePackingList = async (destination: string, days: string, transport: string): Promise<PackingList> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const prompt = `Generate a detailed packing checklist for a ${days}-day trip to ${destination} via ${transport}.
        Consider the local weather, culture, and mode of transport restrictions.
        Organize items into logical categories.
        CRITICAL: You MUST include a category named "Emergency Toolkit" with safety essentials appropriate for the destination and transport mode.
        Other categories example: Clothing, Toiletries, Electronics, Documents, Health.
        Provide a brief weather summary.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        destination: { type: Type.STRING },
                        weatherSummary: { type: Type.STRING, description: "Brief summary of expected weather." },
                        categories: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    items: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                item: { type: Type.STRING },
                                                reason: { type: Type.STRING, description: "Brief reason why this is needed (optional)" }
                                            },
                                            required: ["item"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const list = JSON.parse(response.text) as PackingList;
            
            // Post-processing: Ensure Emergency Toolkit exists
            const hasEmergency = list.categories.some(c => 
                c.category.toLowerCase().includes('emergency') || 
                c.category.toLowerCase().includes('toolkit')
            );

            if (!hasEmergency) {
                list.categories.push({
                    category: "Emergency Toolkit",
                    items: [
                        { item: "Basic First Aid Kit", reason: "For minor injuries" },
                        { item: "Power Bank & Cables", reason: "Communication backup" },
                        { item: "Emergency Cash", reason: "Digital payments backup" },
                        { item: "Flashlight", reason: "Power outages" },
                        { item: "ID Photocopies", reason: "Loss of originals" },
                        { item: "Local Emergency Numbers", reason: "Police/Ambulance" }
                    ]
                });
            }
            
            return list;
        }
        throw new Error("Failed to generate packing list");
    });
};

// --- Exploration (Maps Grounding) ---
export const searchPlaces = async (category: string, lat?: number, lng?: number, locationName?: string): Promise<Place[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        
        let prompt = "";
        const config: any = {
            tools: [{ googleMaps: {} }],
        };

        if (locationName) {
            // Text-based search
            prompt = `Find top 5 ${category} in ${locationName}.`;
        } else if (lat !== undefined && lng !== undefined) {
            // Geolocation-based search
            prompt = `Find top 5 ${category} near me.`;
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: lat,
                        longitude: lng
                    }
                }
            };
        } else {
            throw new Error("Location or coordinates required");
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: config
        });

        const places: Place[] = [];
        
        // Extract grounding chunks which contain the real Maps data
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (groundingChunks) {
            groundingChunks.forEach(chunk => {
                if (chunk.web?.uri && chunk.web?.title) {
                     places.push({
                        name: chunk.web.title,
                        uri: chunk.web.uri,
                        description: "Found via Web Search"
                    });
                } else if (chunk.maps?.uri && chunk.maps?.title) {
                     places.push({
                         name: chunk.maps.title,
                         uri: chunk.maps.uri,
                         address: chunk.maps.placeId, 
                         description: "View on Google Maps"
                     });
                }
            });
        }

        // Fallback if structured data is missing but text exists
        if (places.length === 0 && response.text) {
             places.push({ name: "AI Suggestion", description: response.text });
        }

        return places;
    });
};

// --- Detailed Place Information ---
export const getPlaceDetails = async (placeName: string, userLat?: number, userLng?: number, locationText?: string): Promise<PlaceDetails> => {
    return withRetry(async () => {
        const ai = getAiClient();
        
        let locationContext = "";
        if (userLat && userLng) {
            locationContext = `Calculate the approximate distance from coordinates ${userLat}, ${userLng}.`;
        } else if (locationText) {
            locationContext = `Calculate the approximate distance from the center of ${locationText}.`;
        } else {
            locationContext = "Distance not applicable (unknown user location).";
        }

        const prompt = `Provide detailed information for the place "${placeName}".
        ${locationContext}
        Provide a summary of 3 recent or popular reviews (what people generally love or dislike).
        Provide a vivid visual description of what the place looks like (architecture, vibe, colors).
        
        Return the output as a valid JSON object with the following keys:
        "distance" (string, e.g. "3.2 km" or "Unknown"), 
        "reviews" (array of strings), 
        "visualDescription" (string).
        
        Do not wrap the JSON in markdown code blocks (like \`\`\`json). Just return the raw JSON string.`;

        const config: any = {
            tools: [{ googleMaps: {} }],
        };

        if (userLat && userLng) {
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: userLat,
                        longitude: userLng
                    }
                }
            };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: config
        });

        if (response.text) {
            try {
                const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanText) as PlaceDetails;
            } catch (e) {
                console.error("JSON Parse Error in getPlaceDetails", e, response.text);
                 return {
                    distance: "Unknown",
                    reviews: [],
                    visualDescription: response.text
                 };
            }
        }
        throw new Error("Failed to fetch place details");
    });
};

// --- Navigation Assistance ---
export const getRouteGuidance = async (lat: number, lng: number, destination: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const prompt = `I am currently at coordinates ${lat}, ${lng}. I want to go to "${destination}". 
        Using Google Maps data, provide a concise travel guide.
        Include:
        1. Estimated distance and time (driving vs walking).
        2. Key landmarks I might pass.
        3. A quick tip for this route.
        Keep it brief, friendly, and formatted (use **bold** for key points).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                 toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lng
                        }
                    }
                }
            }
        });
        return response.text;
    });
};

// --- Image Generation ---
export const generateTravelImage = async (prompt: string, size: ImageSize, aspectRatio: AspectRatio) => {
    // Note: Image preview models might have stricter rate limits or distinct quotas.
    return withRetry(async () => {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
             // @ts-ignore
             await window.aistudio.openSelectKey();
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: size
                }
            }
        });
        
        const images: string[] = [];
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        return images;
    });
};

// --- Image Editing ---
export const editTravelImage = async (base64Image: string, prompt: string, mimeType: string = 'image/jpeg') => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        }
                    },
                    { text: prompt }
                ]
            }
        });

        const images: string[] = [];
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        return images;
    });
}

// --- Video Generation ---
export const generateTravelVideo = async (base64Image: string, prompt: string, mimeType: string = 'image/jpeg') => {
    // Only wrap the generation request, not the polling loop, in retry
    const operation = await withRetry(async () => {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
             // @ts-ignore
             await window.aistudio.openSelectKey();
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        return await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || "Animate this travel scene naturally",
            image: {
                imageBytes: base64Image,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9' 
            }
        });
    });

    // We re-instantiate client for polling (no special key needed usually but good practice)
    const ai = getAiClient();
    let currentOperation = operation;

    while (!currentOperation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Simple retry for polling if it hits rate limit, though less likely for status checks
        currentOperation = await withRetry(() => ai.operations.getVideosOperation({ operation: currentOperation }));
    }

    const videoUri = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
         const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
         const blob = await videoRes.blob();
         return URL.createObjectURL(blob);
    }
    throw new Error("Video generation failed");
};