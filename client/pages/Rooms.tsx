import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, Filter, Phone, Calendar, Eye } from "lucide-react";
import { ContactModal } from "@/components/ContactModal";
import { Link } from "react-router-dom";
import type { Room, SearchResponse } from "@shared/types";

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState([5000, 50000]);
  const [roomType, setRoomType] = useState<string>('any');
  const [gender, setGender] = useState<string>('any');
  const [showFilters, setShowFilters] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      if (priceRange[0] > 5000) params.append('minRent', priceRange[0].toString());
      if (priceRange[1] < 50000) params.append('maxRent', priceRange[1].toString());
      if (roomType && roomType !== 'any') params.append('roomType', roomType);
      if (gender && gender !== 'any') params.append('gender', gender);

      const response = await fetch(`/api/search/rooms?${params.toString()}`);
      const data: SearchResponse<Room> = await response.json();
      setRooms(data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchLocation, priceRange, roomType, gender]);

  const handleSearch = () => {
    fetchRooms();
  };

  const resetFilters = () => {
    setSearchLocation('');
    setPriceRange([5000, 50000]);
    setRoomType('any');
    setGender('any');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Find Rooms</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Enter location (city, area, landmark)"
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
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={50000}
                min={5000}
                step={1000}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Type</label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender Preference</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `Found ${rooms.length} rooms`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                    <Link to={`/rooms/${room.id}`} className="hover:underline">{room.title}</Link>
                  </h3>

                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{room.location.name}, {room.location.city}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">₹{room.rent.toLocaleString()}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">/month</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {room.gender === 'any' ? 'Any Gender' : room.gender.charAt(0).toUpperCase() + room.gender.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{room.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">Available from {new Date(room.availableFrom).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <ContactModal room={room} type="contact">
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                        <Phone size={16} className="mr-1" />
                        Contact
                      </Button>
                    </ContactModal>
                    <Link to={`/rooms/${room.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye size={16} className="mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2 dark:text-white">No rooms found</h3>
                <p className="dark:text-gray-300">Try adjusting your search criteria or filters</p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {rooms.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Rooms
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
