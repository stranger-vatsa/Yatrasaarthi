
export interface TripPlan {
  destination: string;
  duration: string;
  itinerary: DayPlan[];
  weather?: WeatherInfo;
}

export interface WeatherInfo {
  temperature: string;
  condition: string;
  packingTip: string;
}

export interface DayPlan {
  day: number;
  activities: string[];
  meals: string[];
}

export interface Place {
  name: string;
  address?: string;
  rating?: number;
  description?: string;
  uri?: string; // Google Maps URI
}

export interface PlaceDetails {
  distance: string;
  reviews: string[];
  visualDescription: string;
}

export enum StudioMode {
  GENERATE_IMAGE = 'GENERATE_IMAGE',
  EDIT_IMAGE = 'EDIT_IMAGE',
  GENERATE_VIDEO = 'GENERATE_VIDEO',
}

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface PackingItem {
  item: string;
  reason?: string;
  checked?: boolean;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface PackingList {
  destination: string;
  weatherSummary: string;
  categories: PackingCategory[];
}

export interface Festival {
  name: string;
  time: string;
  description: string;
}

export interface CommunityStory {
  title: string;
  story: string;
}

export interface Dish {
  name: string;
  description: string;
}

export interface CultureInfo {
  destination: string;
  history: string;
  festivals: Festival[];
  culinaryBackground: string;
  dishes: Dish[];
  stories: CommunityStory[];
}
