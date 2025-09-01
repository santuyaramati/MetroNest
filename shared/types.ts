export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  location: Location;
  amenities: string[];
  images: string[];
  roomType: 'single' | 'shared' | 'private';
  gender: 'male' | 'female' | 'any';
  available: boolean;
  availableFrom: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Flatmate {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  profession: string;
  budget: {
    min: number;
    max: number;
  };
  location: Location;
  preferences: {
    gender: 'male' | 'female' | 'any';
    lifestyle: string[];
    amenities: string[];
  };
  about: string;
  contact: {
    phone: string;
    email: string;
  };
  images?: string[];
  createdAt: string;
  verified: boolean;
}

export interface PG {
  id: string;
  name: string;
  description: string;
  rent: number;
  deposit: number;
  location: Location;
  amenities: string[];
  images: string[];
  roomTypes: Array<{
    type: 'single' | 'shared' | 'triple';
    rent: number;
    available: number;
  }>;
  gender: 'male' | 'female' | 'both';
  meals: boolean;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  rules: string[];
  createdAt: string;
  rating: number;
  reviews: number;
}

export interface SearchFilters {
  location?: string;
  minRent?: number;
  maxRent?: number;
  gender?: 'male' | 'female' | 'any';
  amenities?: string[];
  roomType?: string;
}

export interface SearchResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
