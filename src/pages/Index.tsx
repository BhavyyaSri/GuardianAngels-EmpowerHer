import { useRef, useState } from 'react';
import { SOSButton } from '@/components/SOSButton';
import { QuickActions } from '@/components/QuickActions';
import { DeterrentAlarm, DeterrentAlarmHandle } from '@/components/DeterrentAlarm';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { ReportUnsafeArea } from '@/components/ReportUnsafeArea';
import { SafetyTips } from '@/components/SafetyTips';
import { Settings } from '@/components/Settings';
import { Card } from '@/components/ui/card';
import { Shield, Heart } from 'lucide-react';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const alarmRef = useRef<DeterrentAlarmHandle>(null);

  const handleSOSTrigger = () => {
    // SOS has been triggered - could add additional logic here
    console.log('SOS triggered successfully');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'contacts':
        return <EmergencyContacts onBack={() => setCurrentPage('home')} />;
      case 'report':
        return <ReportUnsafeArea onBack={() => setCurrentPage('home')} />;
      case 'safety-tips':
        return <SafetyTips onBack={() => setCurrentPage('home')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentPage('home')} />;
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Shield className="text-empowerment" size={32} />
                <h1 className="text-3xl font-bold bg-gradient-empowerment bg-clip-text text-transparent">
                  EmpowHER
                </h1>
                <Heart className="text-primary" size={32} />
              </div>
              <p className="text-muted-foreground max-w-sm">
                Your safety companion. Stay empowered, stay safe.
              </p>
            </div>

            {/* SOS Button */}
            <SOSButton onSOSTrigger={handleSOSTrigger} />

            {/* Quick Actions */}
            <QuickActions onNavigate={setCurrentPage} onAlarm={() => alarmRef.current?.start()} />

            {/* Safety Reminder */}
            <Card className="glass-card p-4 bg-gradient-card">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember: Trust your instincts and stay aware of your surroundings
                </p>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 flex items-center justify-center">
      {/* Invisible alarm controller mounted at root to enable direct trigger */}
      <DeterrentAlarm ref={alarmRef} showUI={false} />
      <div className="w-full max-w-md">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default Index;
