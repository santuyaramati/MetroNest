import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, Building, Star, Utensils, Phone, Mail, Heart, Filter } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarkContext";

interface SimplePG {
  id: string;
  name: string;
  description: string;
  rent: number;
  location: { name: string; city: string };
  amenities: string[];
  gender: 'male' | 'female' | 'both';
  meals: boolean;
  rating: number;
  reviews: number;
}

export default function PGs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pgs, setPgs] = useState<SimplePG[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState([5000, 25000]);
  const [gender, setGender] = useState<string>('any');
  const [mealsIncluded, setMealsIncluded] = useState<boolean | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const commonAmenities = [
    'WiFi', 'AC', 'Laundry', 'Security', 'Gym', 'Parking',
    'Kitchen', 'TV', 'Housekeeping', 'Power Backup'
  ];

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      if (priceRange[0] > 5000) params.append('minRent', String(priceRange[0]));
      if (priceRange[1] < 25000) params.append('maxRent', String(priceRange[1]));
      if (gender && gender !== 'any') params.append('gender', gender);
      if (mealsIncluded !== null) params.append('meals', String(mealsIncluded));
      // backend handles pagination; we can pass defaults
      params.append('page', '1');
      params.append('limit', '24');

      const res = await fetch(`/api/search/pgs?${params.toString()}`);
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        const list: SimplePG[] = json.data.map((pg: any) => ({
          id: pg.id,
          name: pg.name,
          description: pg.description,
          rent: pg.rent,
          location: pg.location,
          amenities: pg.amenities || [],
          gender: pg.gender,
          meals: pg.meals,
          rating: pg.rating || 0,
          reviews: pg.reviews || 0,
        }));
        setPgs(list);
      } else {
        setPgs([]);
      }
    } catch (e) {
      setPgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPGs();
  }, [searchLocation, priceRange, gender, mealsIncluded, selectedAmenities, sortBy]);

  const handleSearch = () => {
    fetchPGs();
  };

  const resetFilters = () => {
    setSearchLocation('');
    setPriceRange([5000, 25000]);
    setGender('any');
    setMealsIncluded(null);
    setSelectedAmenities([]);
    setSortBy('relevance');
    setSearchParams({});
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Paying Guests (PGs)</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Enter location (city, area)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
              <Search className="mr-2" size={16} />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="mr-2" size={16} />
              Filters
            </Button>
          </div>

          {/* Filters */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={25000}
                min={5000}
                step={500}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="both">Co-ed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meals</label>
              <Select value={mealsIncluded === null ? 'any' : mealsIncluded.toString()} onValueChange={(value) => {
                if (value === 'any') setMealsIncluded(null);
                else setMealsIncluded(value === 'true');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="true">Meals Included</SelectItem>
                  <SelectItem value="false">No Meals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amenities Filter */}
          <div className={`mb-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Amenities {selectedAmenities.length > 0 && `(${selectedAmenities.length} selected)`}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {commonAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <div className={`flex justify-end mb-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <Button variant="outline" onClick={resetFilters}>
              Reset All Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `Found ${pgs.length} PGs`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : pgs.length > 0 ? (
            pgs.map((pg) => (
              <Card key={pg.id} className="hover:shadow-lg transition-shadow">
                
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {pg.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{pg.location.name}, {pg.location.city}</span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {pg.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary">₹{pg.rent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Starting from /month</div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pg.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {pg.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{pg.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs">
                      {pg.gender === 'both' ? 'Co-ed' : pg.gender.charAt(0).toUpperCase() + pg.gender.slice(1)} PG
                    </Badge>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                      <Phone size={16} className="mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail size={16} className="mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <Building size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2 dark:text-white">No PGs found</h3>
                <p className="dark:text-gray-300">Try adjusting your search criteria or location</p>
              </div>
            </div>
          )}
        </div>

        {pgs.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More PGs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
