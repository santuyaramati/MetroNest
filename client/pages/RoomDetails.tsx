import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Room } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Home, Shield } from 'lucide-react';
import { ContactModal } from '@/components/ContactModal';

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${id}`);
        const json = await res.json();
        if (json.success) setRoom(json.data);
      } finally { setLoading(false); }
    };
    fetchRoom();
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto p-6">Loading...</div>;
  if (!room) return <div className="max-w-5xl mx-auto p-6">Room not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4 text-sm text-gray-500"><Link to="/rooms">← Back to Rooms</Link></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold dark:text-white">{room.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                      <MapPin size={16} />
                      <span>{room.location.name}, {room.location.city}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white">₹{room.rent.toLocaleString()}/mo</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="outline">{room.roomType}</Badge>
                  <Badge variant="outline">{room.gender === 'any' ? 'Any gender' : room.gender}</Badge>
                  <div className="flex items-center gap-1"><Calendar size={14} /> Available from {new Date(room.availableFrom).toLocaleDateString()}</div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{room.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map(a => <Badge key={a} variant="secondary">{a}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold">Contact</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <div>Name: {room.contact.name}</div>
                  <div>Phone: {room.contact.phone}</div>
                  <div>Email: {room.contact.email}</div>
                </div>
                <ContactModal room={room} type="contact">
                  <Button className="w-full">View Contact Details</Button>
                </ContactModal>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2"><Home size={16} /> Deposit: ₹{room.deposit.toLocaleString()}</div>
                <div className="flex items-center gap-2"><Shield size={16} /> Verified: {room.available ? 'Yes' : 'No'}</div>
                <div>Posted: {new Date(room.createdAt).toLocaleDateString()}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
