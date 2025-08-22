import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Settings, MapPin, Shield, AlarmClock } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (page: string) => void;
  onAlarm?: () => void; // triggers deterrent alarm directly
}

export const QuickActions = ({ onNavigate, onAlarm }: QuickActionsProps) => {
  const actions = [
    {
      id: 'alarm',
      label: 'Deterrent Alarm',
      description: 'Play loud siren and flash',
      icon: AlarmClock,
      color: 'empowerment-button'
    },
    {
      id: 'contacts',
      label: 'Emergency Contacts',
      description: 'Manage your emergency contacts',
      icon: Users,
      color: 'empowerment-button'
    },
    {
      id: 'report',
      label: 'Report Unsafe Area',
      description: 'Report locations that feel unsafe',
      icon: MapPin,
      color: 'empowerment-button'
    },
    {
      id: 'safety-tips',
      label: 'Safety Tips',
      description: 'Learn safety tips and resources',
      icon: Shield,
      color: 'empowerment-button'
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure app preferences',
      icon: Settings,
      color: 'empowerment-button'
    }
  ];

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold text-center mb-6 text-empowerment">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id} className="glass-card p-0 overflow-hidden">
              <Button
                onClick={() => {
                  if (action.id === 'alarm' && onAlarm) {
                    onAlarm();
                  } else {
                    onNavigate(action.id);
                  }
                }}
                variant="ghost"
                className={`w-full h-full p-4 flex flex-col items-center space-y-3 ${action.color} border-0 text-empowerment-foreground`}
              >
                <Icon size={32} />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-80 mt-1">{action.description}</div>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};