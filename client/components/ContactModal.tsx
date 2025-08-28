import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Room } from "@shared/types";

interface ContactModalProps {
  room: Room;
  type: 'contact' | 'message';
  children: React.ReactNode;
}

export function ContactModal({ room, type, children }: ContactModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const defaultMessage = type === 'contact' 
    ? `Hi ${room.contact.name}, I'm interested in your room "${room.title}" in ${room.location.name}. Could you please provide more details?`
    : `Hi ${room.contact.name}, I would like to know more about the room "${room.title}". Is it still available?`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;

    setIsSubmitting(true);
    
    // Simulate sending message (in production, this would be an API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the message to your backend
      console.log('Sending message:', {
        from: user,
        to: room.contact,
        room: room,
        message: message || defaultMessage,
        type: type
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to login to contact room owners. Please sign in to continue.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsOpen(false);
                window.location.href = '/login';
              }}>
                Go to Login
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'contact' ? <Phone size={20} /> : <Mail size={20} />}
            {type === 'contact' ? 'Contact Owner' : 'Send Message'}
          </DialogTitle>
        </DialogHeader>
        
        {submitted ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Your message has been sent successfully! The owner will get back to you soon.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{room.title}</h4>
              <p className="text-sm text-gray-600 mb-1">
                📍 {room.location.name}, {room.location.city}
              </p>
              <p className="text-sm text-gray-600">
                💰 ₹{room.rent.toLocaleString()}/month
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label>Contacting:</Label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{room.contact.name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  {type === 'contact' && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {room.contact.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail size={14} />
                    {room.contact.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                {type === 'contact' ? 'Your inquiry:' : 'Message:'}
              </Label>
              <Textarea
                id="message"
                placeholder={defaultMessage}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {message.length === 0 && 'Leave empty to use the default message above'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    {type === 'contact' ? 'Send Inquiry' : 'Send Message'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
