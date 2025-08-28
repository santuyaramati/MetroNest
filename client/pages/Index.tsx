import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Home, Users, Building, CheckCircle, Star, Shield, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = () => {
    if (searchLocation.trim()) {
      navigate(`/rooms?city=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate('/rooms');
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const topCities = [
    "Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi", "Chennai", "Gurgaon", "Noida"
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Listings",
      description: "All our listings are verified for authenticity and safety"
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Connect with verified roommates and room owners"
    },
    {
      icon: CheckCircle,
      title: "Easy Process",
      description: "Simple steps to find your perfect accommodation"
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Get responses from property owners within 24 hours"
    }
  ];


  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Find compatible{" "}
            <span className="text-primary">roommates</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Rooms & PGs
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Share your room with right roommates
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
              <div className="flex items-center flex-1 px-4 min-h-[48px]">
                <MapPin className="text-gray-400 mr-2 flex-shrink-0" size={20} />
                <Input
                  type="text"
                  placeholder="Search Places..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="border-0 focus:ring-0 text-base sm:text-lg placeholder-gray-400 bg-transparent"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 rounded-full px-6 sm:px-8 py-3 mx-2 sm:mx-0"
                size="lg"
              >
                <Search className="mr-2" size={20} />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Go</span>
              </Button>
            </div>
          </div>

          {/* Top Cities */}
          <div className="mt-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Top Cities:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {topCities.map((city) => (
                <Link
                  key={city}
                  to={`/rooms?city=${city.toLowerCase()}`}
                  className="text-primary hover:text-primary/80 underline text-sm"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Quick Access Cards */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What are you looking for?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/rooms" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow group-hover:border-primary border-2 border-transparent">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Home size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Find Rooms
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover shared rooms and apartments that match your budget and preferences
                </p>
              </div>
            </Link>

            <Link to="/flatmates" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow group-hover:border-primary border-2 border-transparent">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Find Roommates
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with compatible roommates who share similar lifestyle and interests
                </p>
              </div>
            </Link>

            <Link to="/pgs" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow group-hover:border-primary border-2 border-transparent">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Paying Guests
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Find comfortable PG accommodations with all amenities included
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why choose MetroNest?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your perfect match?
          </h2>
          <p className="text-green-100 dark:text-green-200 mb-8 text-lg">
            Join users who have found their ideal living situation
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 px-8"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
