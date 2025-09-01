import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Flatmate } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Briefcase, Wallet } from 'lucide-react';

export default function FlatmateDetails() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Flatmate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIt = async () => {
      try {
        const res = await fetch(`/api/flatmates/${id}`);
        const json = await res.json();
        if (json.success) setProfile(json.data);
      } finally { setLoading(false); }
    };
    fetchIt();
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
  if (!profile) return <div className="max-w-5xl mx-auto p-6">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4 text-sm text-gray-500"><Link to="/flatmates">← Back to Roommates</Link></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold dark:text-white">{profile.name}</h1>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><User size={16} /> {profile.age} • {profile.gender}</span>
                      <span className="flex items-center gap-1"><Briefcase size={16} /> {profile.profession}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white flex items-center gap-1"><Wallet size={14} /> ₹{profile.budget.min}-{profile.budget.max}</Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  <span>{profile.location.name}, {profile.location.city}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{profile.about}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.lifestyle.map(l => <Badge key={l} variant="secondary">{l}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div>Contact: {profile.contact.email} • {profile.contact.phone}</div>
                <div>Posted: {new Date(profile.createdAt).toLocaleDateString()}</div>
                {profile.verified && <div className="text-green-600">✓ Verified</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
