import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Building, Plus, X, MapPin, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RoomListing {
  title: string;
  description: string;
  rent: string;
  deposit: string;
  location: string;
  roomType: string;
  gender: string;
  amenities: string[];
  images: string[];
  availableFrom: string;
}

interface FlatmateListing {
  name: string;
  age: string;
  gender: string;
  profession: string;
  budgetMin: string;
  budgetMax: string;
  location: string;
  about: string;
  lifestyle: string[];
  preferredGender: string;
  images: string[];
}

interface PGListing {
  name: string;
  description: string;
  location: string;
  amenities: string[];
  roomTypes: Array<{
    type: string;
    rent: string;
    available: string;
  }>;
  gender: string;
  meals: boolean;
  rules: string[];
}

export default function PostListing() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("room");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Form states
  const [roomListing, setRoomListing] = useState<RoomListing>({
    title: '',
    description: '',
    rent: '',
    deposit: '',
    location: '',
    roomType: '',
    gender: '',
    amenities: [],
    images: [],
    availableFrom: ''
  });

  const [flatmateListing, setFlatmateListing] = useState<FlatmateListing>({
    name: user?.name || '',
    age: '',
    gender: '',
    profession: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    about: '',
    lifestyle: [],
    preferredGender: '',
    images: []
  });

  const [pgListing, setPgListing] = useState<PGListing>({
    name: '',
    description: '',
    location: '',
    amenities: [],
    roomTypes: [{ type: 'single', rent: '', available: '' }],
    gender: '',
    meals: false,
    rules: []
  });

  const commonAmenities = [
    'WiFi', 'AC', 'Parking', 'Security', 'Housekeeping', 'Gym', 'Laundry', 
    'Kitchen', 'TV', 'Fridge', 'Washing Machine', 'Power Backup'
  ];

  const lifestyleOptions = [
    'Non-smoking', 'Vegetarian', 'Working Professional', 'Student', 'Early Riser',
    'Night Owl', 'Pet Friendly', 'Party Lover', 'Fitness Enthusiast', 'Music Lover'
  ];

  const addAmenity = (amenity: string, listingType: string) => {
    if (listingType === 'room') {
      if (!roomListing.amenities.includes(amenity)) {
        setRoomListing(prev => ({
          ...prev,
          amenities: [...prev.amenities, amenity]
        }));
      }
    } else if (listingType === 'pg') {
      if (!pgListing.amenities.includes(amenity)) {
        setPgListing(prev => ({
          ...prev,
          amenities: [...prev.amenities, amenity]
        }));
      }
    }
  };

  const removeAmenity = (amenity: string, listingType: string) => {
    if (listingType === 'room') {
      setRoomListing(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }));
    } else if (listingType === 'pg') {
      setPgListing(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }));
    }
  };

  const addLifestyle = (lifestyle: string) => {
    if (!flatmateListing.lifestyle.includes(lifestyle)) {
      setFlatmateListing(prev => ({
        ...prev,
        lifestyle: [...prev.lifestyle, lifestyle]
      }));
    }
  };

  const removeLifestyle = (lifestyle: string) => {
    setFlatmateListing(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.filter(l => l !== lifestyle)
    }));
  };

  const addRoomType = () => {
    setPgListing(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, { type: 'single', rent: '', available: '' }]
    }));
  };

  const removeRoomType = (index: number) => {
    setPgListing(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setMessage({ type: 'error', text: 'Please login to post a listing' });
      return;
    }

    // Prevent double submission
    if (loading) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let apiEndpoint = '';
      let postData: any = {};

      const isValidObjectId = (v: string) => /^[a-fA-F0-9]{24}$/.test(v);
      const safeUserId = isValidObjectId(user.id) ? user.id : '000000000000000000000000';

      if (activeTab === 'room') {
        apiEndpoint = '/api/listings/room';
        postData = {
          ...roomListing,
          userId: safeUserId
        };
      } else if (activeTab === 'flatmate') {
        apiEndpoint = '/api/listings/flatmate';
        postData = {
          ...flatmateListing,
          userId: safeUserId
        };
      } else if (activeTab === 'pg') {
        apiEndpoint = '/api/listings/pg';
        postData = {
          ...pgListing,
          userId: safeUserId
        };
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        try {
          const errJson = await response.json();
          const errMsg = errJson?.message || (Array.isArray(errJson?.errors) ? errJson.errors.map((e:any)=>e.message).join(', ') : 'Request failed');
          setMessage({ type: 'error', text: errMsg });
          return;
        } catch {
          setMessage({ type: 'error', text: `Request failed (${response.status})` });
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} listing posted successfully! It will now appear in search results.` });

        // Reset form after success
        setTimeout(() => {
          if (activeTab === 'room') {
            setRoomListing({
              title: '', description: '', rent: '', deposit: '', location: '',
              roomType: '', gender: '', amenities: [], images: [], availableFrom: ''
            });
          } else if (activeTab === 'flatmate') {
            setFlatmateListing({
              name: user?.name || '', age: '', gender: '', profession: '',
              budgetMin: '', budgetMax: '', location: '', about: '',
              lifestyle: [], preferredGender: '', images: []
            });
          } else {
            setPgListing({
              name: '', description: '', location: '', amenities: [],
              roomTypes: [{ type: 'single', rent: '', available: '' }],
              gender: '', meals: false, rules: []
            });
          }
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to post listing. Please try again.' });
      }
    } catch (error) {
      console.error('Post listing error:', error);

      // Handle specific "body stream already read" error
      if (error instanceof TypeError && error.message.includes('body stream already read')) {
        setMessage({
          type: 'error',
          text: 'Request processing error. Please try submitting again.'
        });
      } else {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full dark:bg-gray-800">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to post a listing.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Post Your Listing</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your space or find the perfect roommate</p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Card className="dark:bg-gray-800">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="room" className="flex items-center gap-2">
                  <Home size={16} />
                  Room/Flat
                </TabsTrigger>
                <TabsTrigger value="flatmate" className="flex items-center gap-2">
                  <Users size={16} />
                  Find Roommate
                </TabsTrigger>
                <TabsTrigger value="pg" className="flex items-center gap-2">
                  <Building size={16} />
                  PG
                </TabsTrigger>
              </TabsList>

              {/* Room Listing Form */}
              <TabsContent value="room">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="room-title" className="dark:text-gray-300">Listing Title</Label>
                      <Input
                        id="room-title"
                        placeholder="e.g., Spacious room in Koramangala"
                        value={roomListing.title}
                        onChange={(e) => setRoomListing(prev => ({...prev, title: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="room-rent" className="dark:text-gray-300">Monthly Rent (₹)</Label>
                      <Input
                        id="room-rent"
                        type="number"
                        placeholder="15000"
                        value={roomListing.rent}
                        onChange={(e) => setRoomListing(prev => ({...prev, rent: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="room-deposit" className="dark:text-gray-300">Security Deposit (₹)</Label>
                      <Input
                        id="room-deposit"
                        type="number"
                        placeholder="30000"
                        value={roomListing.deposit}
                        onChange={(e) => setRoomListing(prev => ({...prev, deposit: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="room-type" className="dark:text-gray-300">Room Type</Label>
                      <Select value={roomListing.roomType} onValueChange={(value) => setRoomListing(prev => ({...prev, roomType: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Room</SelectItem>
                          <SelectItem value="shared">Shared Room</SelectItem>
                          <SelectItem value="private">Private Room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="room-gender" className="dark:text-gray-300">Gender Preference</Label>
                      <Select value={roomListing.gender} onValueChange={(value) => setRoomListing(prev => ({...prev, gender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="room-location" className="dark:text-gray-300">Location</Label>
                      <Input
                        id="room-location"
                        placeholder="e.g., Koramangala, Bangalore"
                        value={roomListing.location}
                        onChange={(e) => setRoomListing(prev => ({...prev, location: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="room-available" className="dark:text-gray-300">Available From</Label>
                      <Input
                        id="room-available"
                        type="date"
                        value={roomListing.availableFrom}
                        onChange={(e) => setRoomListing(prev => ({...prev, availableFrom: e.target.value}))}
                        className="dark:[color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="dark:text-gray-300">Description</Label>
                    <Textarea
                      placeholder="Describe your room, nearby facilities, house rules, etc."
                      value={roomListing.description}
                      onChange={(e) => setRoomListing(prev => ({...prev, description: e.target.value}))}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label className="dark:text-gray-300">Amenities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonAmenities.map(amenity => (
                        <Button
                          key={amenity}
                          type="button"
                          size="sm"
                          variant={roomListing.amenities.includes(amenity) ? "default" : "outline"}
                          onClick={() => roomListing.amenities.includes(amenity) 
                            ? removeAmenity(amenity, 'room') 
                            : addAmenity(amenity, 'room')
                          }
                        >
                          {amenity}
                        </Button>
                      ))}
                    </div>
                  </div>


                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Room Listing'}
                  </Button>
                </form>
              </TabsContent>

              {/* Flatmate Listing Form */}
              <TabsContent value="flatmate">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="flatmate-name" className="dark:text-gray-300">Your Name</Label>
                      <Input
                        id="flatmate-name"
                        value={flatmateListing.name}
                        onChange={(e) => setFlatmateListing(prev => ({...prev, name: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="flatmate-age" className="dark:text-gray-300">Age</Label>
                      <Input
                        id="flatmate-age"
                        type="number"
                        placeholder="25"
                        value={flatmateListing.age}
                        onChange={(e) => setFlatmateListing(prev => ({...prev, age: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="flatmate-gender" className="dark:text-gray-300">Gender</Label>
                      <Select value={flatmateListing.gender} onValueChange={(value) => setFlatmateListing(prev => ({...prev, gender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="flatmate-profession" className="dark:text-gray-300">Profession</Label>
                      <Input
                        id="flatmate-profession"
                        placeholder="e.g., Software Engineer"
                        value={flatmateListing.profession}
                        onChange={(e) => setFlatmateListing(prev => ({...prev, profession: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="flatmate-budget-min" className="dark:text-gray-300">Budget Min (₹)</Label>
                      <Input
                        id="flatmate-budget-min"
                        type="number"
                        placeholder="10000"
                        value={flatmateListing.budgetMin}
                        onChange={(e) => setFlatmateListing(prev => ({...prev, budgetMin: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="flatmate-budget-max" className="dark:text-gray-300">Budget Max (₹)</Label>
                      <Input
                        id="flatmate-budget-max"
                        type="number"
                        placeholder="20000"
                        value={flatmateListing.budgetMax}
                        onChange={(e) => setFlatmateListing(prev => ({...prev, budgetMax: e.target.value}))}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="flatmate-location" className="dark:text-gray-300">Preferred Location</Label>
                      <Input
                        id="flatmate-location"
                        placeholder="e.g., Koramangala, Bangalore"
                        value={flatmateListing.location}
                        onChange={(e) => setFlatmateListing(prev => ({...prev, location: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="flatmate-preferred-gender" className="dark:text-gray-300">Preferred Roommate Gender</Label>
                      <Select value={flatmateListing.preferredGender} onValueChange={(value) => setFlatmateListing(prev => ({...prev, preferredGender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="dark:text-gray-300">About You</Label>
                      <span className={`text-sm ${
                        flatmateListing.about.length < 50
                          ? 'text-red-500'
                          : flatmateListing.about.length > 1000
                            ? 'text-red-500'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {flatmateListing.about.length}/1000 characters
                        {flatmateListing.about.length < 50 && (
                          <span className="ml-2 text-red-500">(minimum 50)</span>
                        )}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Tell potential roommates about yourself, your lifestyle, interests, hobbies, work schedule, and what you're looking for in a living situation. Minimum 50 characters required."
                      value={flatmateListing.about}
                      onChange={(e) => setFlatmateListing(prev => ({...prev, about: e.target.value}))}
                      rows={4}
                      required
                      className={flatmateListing.about.length < 50 ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {flatmateListing.about.length < 50 && flatmateListing.about.length > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Please write at least {50 - flatmateListing.about.length} more characters to help others understand you better.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="dark:text-gray-300">Lifestyle Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lifestyleOptions.map(lifestyle => (
                        <Button
                          key={lifestyle}
                          type="button"
                          size="sm"
                          variant={flatmateListing.lifestyle.includes(lifestyle) ? "default" : "outline"}
                          onClick={() => flatmateListing.lifestyle.includes(lifestyle) 
                            ? removeLifestyle(lifestyle) 
                            : addLifestyle(lifestyle)
                          }
                        >
                          {lifestyle}
                        </Button>
                      ))}
                    </div>
                  </div>


                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Posting...' : 'Post Roommate Request'}
                  </Button>
                </form>
              </TabsContent>

              {/* PG Listing Form */}
              <TabsContent value="pg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="pg-name" className="dark:text-gray-300">PG Name</Label>
                      <Input
                        id="pg-name"
                        placeholder="e.g., Green Valley PG"
                        value={pgListing.name}
                        onChange={(e) => setPgListing(prev => ({...prev, name: e.target.value}))}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="pg-location" className="dark:text-gray-300">Location</Label>
                      <Input
                        id="pg-location"
                        placeholder="e.g., HSR Layout, Bangalore"
                        value={pgListing.location}
                        onChange={(e) => setPgListing(prev => ({...prev, location: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="pg-gender" className="dark:text-gray-300">Gender</Label>
                      <Select value={pgListing.gender} onValueChange={(value) => setPgListing(prev => ({...prev, gender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="both">Both (Co-ed)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="pg-meals"
                        checked={pgListing.meals}
                        onChange={(e) => setPgListing(prev => ({...prev, meals: e.target.checked}))}
                      />
                      <Label htmlFor="pg-meals" className="dark:text-gray-300">Meals Included</Label>
                    </div>
                  </div>

                  <div>
                    <Label className="dark:text-gray-300">Description</Label>
                    <Textarea
                      placeholder="Describe your PG, facilities, location benefits, etc."
                      value={pgListing.description}
                      onChange={(e) => setPgListing(prev => ({...prev, description: e.target.value}))}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label className="dark:text-gray-300">Room Types & Pricing</Label>
                    {pgListing.roomTypes.map((roomType, index) => (
                      <div key={index} className="flex gap-2 mt-2 items-end">
                        <div className="flex-1">
                          <Select 
                            value={roomType.type} 
                            onValueChange={(value) => {
                              const newRoomTypes = [...pgListing.roomTypes];
                              newRoomTypes[index].type = value;
                              setPgListing(prev => ({...prev, roomTypes: newRoomTypes}));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Room type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="shared">Shared</SelectItem>
                              <SelectItem value="triple">Triple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Rent per month"
                            value={roomType.rent}
                            onChange={(e) => {
                              const newRoomTypes = [...pgListing.roomTypes];
                              newRoomTypes[index].rent = e.target.value;
                              setPgListing(prev => ({...prev, roomTypes: newRoomTypes}));
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Available"
                            value={roomType.available}
                            onChange={(e) => {
                              const newRoomTypes = [...pgListing.roomTypes];
                              newRoomTypes[index].available = e.target.value;
                              setPgListing(prev => ({...prev, roomTypes: newRoomTypes}));
                            }}
                          />
                        </div>
                        {pgListing.roomTypes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRoomType(index)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRoomType}
                      className="mt-2"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Room Type
                    </Button>
                  </div>

                  <div>
                    <Label className="dark:text-gray-300">Amenities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonAmenities.map(amenity => (
                        <Button
                          key={amenity}
                          type="button"
                          size="sm"
                          variant={pgListing.amenities.includes(amenity) ? "default" : "outline"}
                          onClick={() => pgListing.amenities.includes(amenity) 
                            ? removeAmenity(amenity, 'pg') 
                            : addAmenity(amenity, 'pg')
                          }
                        >
                          {amenity}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Posting...' : 'Post PG Listing'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
