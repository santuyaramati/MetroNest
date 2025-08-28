import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, Filter, User, Briefcase, Phone, Mail, Heart, X } from "lucide-react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import type { Flatmate, SearchResponse } from "@shared/types";

export default function Flatmates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flatmates, setFlatmates] = useState<Flatmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState(searchParams.get('city') || '');
  const [budgetRange, setBudgetRange] = useState([5000, 50000]);
  const [gender, setGender] = useState<string>('any');
  const [profession, setProfession] = useState<string>('any');
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const lifestyleOptions = [
    'Non-smoking', 'Vegetarian', 'Working Professional', 'Student', 'Early Riser',
    'Night Owl', 'Pet Friendly', 'Party Lover', 'Fitness Enthusiast', 'Music Lover',
    'Clean & Organized', 'Social', 'Quiet', 'Cook at Home'
  ];

  const professionOptions = [
    'Software Engineer', 'Data Analyst', 'Product Manager', 'Designer', 'Marketing',
    'Sales', 'Consultant', 'Teacher', 'Doctor', 'Lawyer', 'Student', 'Freelancer', 'Other'
  ];

  const fetchFlatmates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchLocation) params.append('location', searchLocation);
      if (budgetRange[0] > 5000) params.append('minBudget', budgetRange[0].toString());
      if (budgetRange[1] < 50000) params.append('maxBudget', budgetRange[1].toString());
      if (gender && gender !== 'any') params.append('gender', gender);
      if (profession && profession !== 'any') params.append('profession', profession);
      if (ageRange[0] > 18) params.append('minAge', ageRange[0].toString());
      if (ageRange[1] < 50) params.append('maxAge', ageRange[1].toString());
      if (selectedLifestyle.length > 0) params.append('lifestyle', selectedLifestyle.join(','));
      if (verifiedOnly) params.append('verified', 'true');
      if (sortBy && sortBy !== 'relevance') params.append('sortBy', sortBy);

      const response = await fetch(`/api/search/flatmates?${params.toString()}`);
      const data: SearchResponse<Flatmate> = await response.json();
      setFlatmates(data.data);
    } catch (error) {
      console.error('Error fetching flatmates:', error);
      setFlatmates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlatmates();
  }, [searchLocation, budgetRange, gender, profession, ageRange, selectedLifestyle, verifiedOnly, sortBy]);

  const handleSearch = () => {
    fetchFlatmates();
  };

  const resetFilters = () => {
    setSearchLocation('');
    setBudgetRange([5000, 50000]);
    setGender('any');
    setProfession('any');
    setAgeRange([18, 50]);
    setSelectedLifestyle([]);
    setVerifiedOnly(false);
    setSortBy('relevance');
    setSearchParams({});
  };

  const toggleLifestyle = (lifestyle: string) => {
    setSelectedLifestyle(prev => 
      prev.includes(lifestyle) 
        ? prev.filter(l => l !== lifestyle)
        : [...prev, lifestyle]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchLocation) count++;
    if (budgetRange[0] > 5000 || budgetRange[1] < 50000) count++;
    if (gender && gender !== 'any') count++;
    if (profession && profession !== 'any') count++;
    if (ageRange[0] > 18 || ageRange[1] < 50) count++;
    if (selectedLifestyle.length > 0) count++;
    if (verifiedOnly) count++;
    if (sortBy && sortBy !== 'relevance') count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Find Roommates</h1>
          
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
              className="md:hidden relative"
            >
              <Filter className="mr-2" size={16} />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* Primary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Range: ₹{budgetRange[0].toLocaleString()} - ₹{budgetRange[1].toLocaleString()}
                </label>
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  max={50000}
                  min={5000}
                  step={1000}
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profession</label>
                <Select value={profession} onValueChange={setProfession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {professionOptions.map(prof => (
                      <SelectItem key={prof} value={prof.toLowerCase()}>{prof}</SelectItem>
                    ))}
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
                    <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                    <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                    <SelectItem value="age_young">Age: Youngest First</SelectItem>
                    <SelectItem value="age_old">Age: Oldest First</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Secondary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age Range: {ageRange[0]} - {ageRange[1]} years
                </label>
                <Slider
                  value={ageRange}
                  onValueChange={setAgeRange}
                  max={50}
                  min={18}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="verified"
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Verified profiles only
                </label>
              </div>
            </div>

            {/* Lifestyle Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Lifestyle Preferences {selectedLifestyle.length > 0 && `(${selectedLifestyle.length} selected)`}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {lifestyleOptions.map((lifestyle) => (
                  <div key={lifestyle} className="flex items-center space-x-2">
                    <Checkbox
                      id={lifestyle}
                      checked={selectedLifestyle.includes(lifestyle)}
                      onCheckedChange={() => toggleLifestyle(lifestyle)}
                    />
                    <label
                      htmlFor={lifestyle}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {lifestyle}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <>
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchLocation && (
                    <Badge variant="secondary" className="text-xs">
                      Location: {searchLocation}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => setSearchLocation('')}
                      />
                    </Badge>
                  )}
                  {(budgetRange[0] > 5000 || budgetRange[1] < 50000) && (
                    <Badge variant="secondary" className="text-xs">
                      Budget: ₹{budgetRange[0].toLocaleString()}-₹{budgetRange[1].toLocaleString()}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => setBudgetRange([5000, 50000])}
                      />
                    </Badge>
                  )}
                  {gender && gender !== 'any' && (
                    <Badge variant="secondary" className="text-xs">
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => setGender('any')}
                      />
                    </Badge>
                  )}
                  {profession && profession !== 'any' && (
                    <Badge variant="secondary" className="text-xs">
                      {profession.charAt(0).toUpperCase() + profession.slice(1)}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => setProfession('any')}
                      />
                    </Badge>
                  )}
                  {(ageRange[0] > 18 || ageRange[1] < 50) && (
                    <Badge variant="secondary" className="text-xs">
                      Age: {ageRange[0]}-{ageRange[1]}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => setAgeRange([18, 50])}
                      />
                    </Badge>
                  )}
                  {verifiedOnly && (
                    <Badge variant="secondary" className="text-xs">
                      Verified Only
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => setVerifiedOnly(false)}
                      />
                    </Badge>
                  )}
                  {selectedLifestyle.map((lifestyle) => (
                    <Badge key={lifestyle} variant="secondary" className="text-xs">
                      {lifestyle}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer" 
                        onClick={() => toggleLifestyle(lifestyle)}
                      />
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `Found ${flatmates.length} roommates`}
          </p>
          {getActiveFiltersCount() > 0 && (
            <span className="text-sm text-primary">
              {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : flatmates.length > 0 ? (
            flatmates.map((flatmate) => (
              <Card key={flatmate.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {flatmate.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span>{flatmate.age} years</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{flatmate.gender}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleBookmark(flatmate, 'flatmate')}
                    >
                      <Heart
                        size={16}
                        className={isBookmarked(flatmate.id, 'flatmate') ? 'fill-red-500 text-red-500' : ''}
                      />
                    </Button>
                  </div>

                  {/* Profession */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <Briefcase size={16} className="mr-2" />
                    <span className="text-sm">{flatmate.profession}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{flatmate.location.name}, {flatmate.location.city}</span>
                  </div>

                  {/* Budget */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget Range:</div>
                    <div className="text-lg font-semibold text-primary">
                      ₹{flatmate.budget.min.toLocaleString()} - ₹{flatmate.budget.max.toLocaleString()}
                    </div>
                  </div>

                  {/* About */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {flatmate.about}
                  </p>

                  {/* Lifestyle */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lifestyle:</div>
                    <div className="flex flex-wrap gap-1">
                      {flatmate.preferences.lifestyle.slice(0, 3).map((pref) => (
                        <Badge key={pref} variant="secondary" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                      {flatmate.preferences.lifestyle.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{flatmate.preferences.lifestyle.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Verification */}
                  {flatmate.verified && (
                    <div className="mb-4">
                      <Badge className="bg-green-100 text-green-800">
                        ✓ Verified
                      </Badge>
                    </div>
                  )}

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
                <User size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2 dark:text-white">No roommates found</h3>
                <p className="dark:text-gray-300">Try adjusting your search criteria or filters</p>
                {getActiveFiltersCount() > 0 && (
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {flatmates.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Roommates
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
