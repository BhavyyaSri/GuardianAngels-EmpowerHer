import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ArrowLeft, Phone, Mail, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

interface EmergencyContactsProps {
  onBack: () => void;
}

export const EmergencyContacts = ({ onBack }: EmergencyContactsProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const [region, setRegion] = useState<string>('IN');

  const getPhonePlaceholder = (r: string) => {
    switch ((r || '').toUpperCase()) {
      case 'IN':
        return '+91 9876543210';
      case 'US':
        return '+1 5551234567';
      case 'UK':
        return '+44 7123 456789';
      default:
        return '+1234567890';
    }
  };

  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (typeof parsed.region === 'string') setRegion(parsed.region);
      }
    } catch {}
  }, []);

  const saveContacts = (updatedContacts: Contact[]) => {
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (!newContact.name || (!newContact.phone && !newContact.email)) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a name and phone number or email.",
        variant: "destructive"
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };

    const updatedContacts = [...contacts, contact];
    saveContacts(updatedContacts);

    setNewContact({ name: '', phone: '', email: '', relationship: '' });
    setIsAdding(false);

    toast({
      title: "Contact Added",
      description: `${contact.name} has been added to your emergency contacts.`,
    });
  };

  const deleteContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    saveContacts(updatedContacts);

    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed.",
    });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-empowerment">Emergency Contacts</h1>
      </div>

      <Card className="glass-card p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Add trusted contacts who will receive your emergency alerts. You can add up to 5 contacts.
        </p>

        {contacts.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No emergency contacts added yet</p>
          </div>
        )}

        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-4 bg-card-elevated">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{contact.name}</h3>
                  {contact.relationship && (
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  )}
                  <div className="flex flex-col space-y-1 mt-2">
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone size={14} />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail size={14} />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => deleteContact(contact.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {contacts.length < 5 && (
          <>
            {!isAdding ? (
              <Button
                onClick={() => setIsAdding(true)}
                className="w-full empowerment-button mt-4"
              >
                <Plus size={16} className="mr-2" />
                Add Emergency Contact
              </Button>
            ) : (
              <Card className="p-4 mt-4 bg-card-elevated">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder={getPhonePlaceholder(region)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="Friend, Family, etc."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addContact} className="flex-1 empowerment-button">
                      Add Contact
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  );
};