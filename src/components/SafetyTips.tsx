import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Phone, MapPin, Eye, Users, AlertTriangle, Home } from 'lucide-react';

interface SafetyTipsProps {
  onBack: () => void;
}

export const SafetyTips = ({ onBack }: SafetyTipsProps) => {
  const tips = [
    {
      category: "General Safety",
      icon: Shield,
      items: [
        "Trust your instincts - if something feels wrong, it probably is",
        "Stay alert and aware of your surroundings at all times",
        "Keep your phone charged and easily accessible",
        "Share your location with trusted friends or family",
        "Avoid isolated areas, especially at night"
      ]
    },
    {
      category: "Walking & Transportation",
      icon: MapPin,
      items: [
        "Walk confidently and with purpose",
        "Stay in well-lit, populated areas",
        "Avoid wearing headphones in unfamiliar areas",
        "Keep emergency contacts readily available",
        "Use reputable ride-sharing services when needed"
      ]
    },
    {
      category: "Emergency Preparedness",
      icon: Phone,
      items: [
        "Know emergency numbers for your area",
        "Practice using the SOS feature regularly",
        "Keep emergency contacts updated",
        "Learn basic self-defense techniques",
        "Carry a whistle or personal alarm"
      ]
    },
    {
      category: "Online Safety",
      icon: Eye,
      items: [
        "Don't share your real-time location on social media",
        "Be cautious about sharing personal information",
        "Use privacy settings on social platforms",
        "Be wary of meeting online contacts in person",
        "Trust your instincts about suspicious messages"
      ]
    },
    {
      category: "Social Situations",
      icon: Users,
      items: [
        "Stay with trusted friends when going out",
        "Have a safety buddy system",
        "Don't leave drinks unattended",
        "Have a safe word with friends for emergencies",
        "Plan your transportation home in advance"
      ]
    },
    {
      category: "Home Safety",
      icon: Home,
      items: [
        "Always lock doors and windows",
        "Don't open doors for unexpected visitors",
        "Keep curtains closed at night",
        "Install good lighting around your home",
        "Know your neighbors and build community connections"
      ]
    }
  ];

  const emergencyNumbers = [
    { country: "Universal Emergency", number: "112" },
    { country: "Police (India)", number: "100" },
    { country: "Ambulance (India)", number: "108" },
    { country: "Women Helpline (India)", number: "1091" },
    { country: "Police (US)", number: "911" },
    { country: "Police (UK)", number: "999" },
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-empowerment">Safety Tips</h1>
      </div>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="text-warning" size={20} />
          <h3 className="font-semibold">Emergency Numbers</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 mb-6">
          {emergencyNumbers.map((emergency, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-card-elevated rounded">
              <span className="text-sm">{emergency.country}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${emergency.number}`, '_self')}
                className="text-primary"
              >
                {emergency.number}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {tips.map((tipCategory, index) => {
          const Icon = tipCategory.icon;
          return (
            <Card key={index} className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className="text-empowerment" size={24} />
                <h3 className="font-semibold text-lg">{tipCategory.category}</h3>
              </div>
              <ul className="space-y-3">
                {tipCategory.items.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-empowerment mt-2 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card p-6 bg-gradient-empowerment text-empowerment-foreground">
        <h3 className="font-semibold mb-3">Remember</h3>
        <p className="text-sm">
          Your safety is the most important thing. Trust your instincts, stay aware, 
          and don't hesitate to ask for help when you need it. You are strong, capable, 
          and deserving of safety and respect.
        </p>
      </Card>
    </div>
  );
};