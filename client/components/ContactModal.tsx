import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Phone, Mail } from "lucide-react";
import type { Room } from "@shared/types";

interface ContactModalProps {
  room: Room;
  type: 'contact' | 'message';
  children: React.ReactNode;
}

export function ContactModal({ room, type, children }: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            <h4 className="font-semibold text-gray-900 mb-2">{room.title}</h4>
            <p className="text-sm text-gray-600 mb-1">
              📍 {room.location.name}, {room.location.city}
            </p>
            <p className="text-sm text-gray-600">
              💰 ₹{room.rent.toLocaleString()}/month
            </p>
          </div>

          <div className="space-y-2">
            <Label>Owner Contact</Label>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{room.contact.name}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {room.contact.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {room.contact.email}
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
