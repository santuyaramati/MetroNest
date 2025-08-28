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

// Enhanced interface for demonstration
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

  // Mock data for demonstration
  const mockPGs: SimplePG[] = [
    {
      id: "1",
      name: "Green Valley PG",
      description: "Premium PG accommodation with all modern amenities",
      rent: 12000,
      location: { name: "HSR Layout", city: "Bangalore" },
      amenities: ["WiFi", "AC", "Laundry", "Security", "Gym", "Parking"],
      gender: "both",
      meals: true,
      rating: 4.5,
      reviews: 28
    },
    {
      id: "2",
      name: "Comfort Stay PG",
      description: "Affordable and comfortable PG for working professionals",
      rent: 8500,
      location: { name: "Koramangala", city: "Bangalore" },
      amenities: ["WiFi", "Security", "Housekeeping", "Kitchen"],
      gender: "male",
      meals: false,
      rating: 4.2,
      reviews: 15
    },
    {
      id: "3",
      name: "Women's Paradise PG",
      description: "Safe and secure accommodation for working women",
      rent: 10000,
      location: { name: "Indiranagar", city: "Bangalore" },
      amenities: ["WiFi", "AC", "Security", "Housekeeping", "TV"],
      gender: "female",
      meals: true,
      rating: 4.7,
      reviews: 42
    },
    {
      id: "4",
      name: "Budget Friendly PG",
      description: "Affordable stay with basic amenities for students",
      rent: 6500,
      location: { name: "Whitefield", city: "Bangalore" },
      amenities: ["WiFi", "Security", "Kitchen"],
      gender: "both",
      meals: false,
      rating: 3.8,
      reviews: 12
    },
    {
      id: "5",
      name: "Luxury Living PG",
      description: "Premium accommodation with all modern facilities",
      rent: 18000,
      location: { name: "Banjara Hills", city: "Hyderabad" },
      amenities: ["WiFi", "AC", "Gym", "Security", "Parking", "Power Backup"],
      gender: "both",
      meals: true,
      rating: 4.8,
      reviews: 67
    }
  ];

  const fetchPGs = async () => {
    setLoading(true);
    // Simulate API call with filtering
    setTimeout(() => {
      let filteredPGs = [...mockPGs];

      // Filter by location
      if (searchLocation) {
        filteredPGs = filteredPGs.filter(pg =>
          pg.location.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
          pg.location.city.toLowerCase().includes(searchLocation.toLowerCase())
        );
      }

      // Filter by price range
      filteredPGs = filteredPGs.filter(pg =>
        pg.rent >= priceRange[0] && pg.rent <= priceRange[1]
      );

      // Filter by gender
      if (gender && gender !== 'any') {
        filteredPGs = filteredPGs.filter(pg =>
          pg.gender === gender || pg.gender === 'both'
        );
      }

      // Filter by meals
      if (mealsIncluded !== null) {
        filteredPGs = filteredPGs.filter(pg => pg.meals === mealsIncluded);
      }

      // Filter by amenities
      if (selectedAmenities.length > 0) {
        filteredPGs = filteredPGs.filter(pg =>
          selectedAmenities.every(amenity => pg.amenities.includes(amenity))
        );
      }

      // Sort results
      if (sortBy === 'price_low') {
        filteredPGs.sort((a, b) => a.rent - b.rent);
      } else if (sortBy === 'price_high') {
        filteredPGs.sort((a, b) => b.rent - a.rent);
      } else if (sortBy === 'rating') {
        filteredPGs.sort((a, b) => b.rating - a.rating);
      }

      setPgs(filteredPGs);
      setLoading(false);
    }, 800);
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
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
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
                <div className="relative">
                  <img 
                    src="/placeholder.svg"
                    alt={pg.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => toggleBookmark(pg, 'pg')}
                  >
                    <Heart
                      size={16}
                      className={isBookmarked(pg.id, 'pg') ? 'fill-red-500 text-red-500' : ''}
                    />
                  </Button>
                  <div className="absolute top-2 left-2 space-y-1">
                    <Badge className="bg-primary text-white">
                      PG
                    </Badge>
                    {pg.meals && (
                      <Badge className="bg-orange-500 text-white block">
                        <Utensils size={12} className="mr-1" />
                        Meals
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 flex items-center">
                    <Star className="text-yellow-500 fill-current" size={14} />
                    <span className="text-sm font-medium ml-1">{pg.rating}</span>
                    <span className="text-xs text-gray-600 ml-1">({pg.reviews})</span>
                  </div>
                </div>
                
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
