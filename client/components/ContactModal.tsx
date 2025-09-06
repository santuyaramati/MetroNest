import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Phone, Mail } from "lucide-react";
import type { Room } from "@shared/types";

interface ContactModalProps {
  room: any; // accepts Room, Flatmate or PG transformed objects
  type: 'contact' | 'message';
  children: React.ReactNode;
}

export function ContactModal({ room, type, children }: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const title = room?.title || room?.name || 'Listing';
  const locationName = room?.location?.name || room?.location || 'Unknown location';
  const locationCity = room?.location?.city || room?.city || '';

  const priceLabel = room?.rent
    ? `₹${Number(room.rent).toLocaleString()}/month`
    : room?.budget
      ? `₹${Number(room.budget.min).toLocaleString()} - ₹${Number(room.budget.max).toLocaleString()}`
      : '';

  const contactName = room?.contact?.name || room?.name || 'Contact';
  const contactPhone = room?.contact?.phone || room?.contact?.phone || 'N/A';
  const contactEmail = room?.contact?.email || room?.contact?.email || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone size={20} />
            Contact Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
            <p className="text-sm text-gray-600 mb-1">{locationName}{locationCity ? `, ${locationCity}` : ''}</p>
            {priceLabel && <p className="text-sm text-gray-600">{priceLabel}</p>}
          </div>

          <div className="space-y-2">
            <Label>Contact</Label>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{contactName}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {contactPhone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {contactEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
