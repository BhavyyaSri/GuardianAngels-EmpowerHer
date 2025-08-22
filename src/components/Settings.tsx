import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bell, MapPin, Shield, Smartphone, Trash2, AlarmClock, Volume2, Zap, Globe, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  onBack: () => void;
}

interface PersonalDetails {
  fullName: string;
  bloodGroup: string;
  medicalNotes: string;
}

interface AppSettings {
  notifications: boolean;
  locationSharing: boolean;
  autoLocation: boolean;
  emergencyDelay: number;
  soundAlerts: boolean;
  alarmVolume: number;
  alarmFlash: boolean;
  alarmVibrate: boolean;
  region: string;
  customEmergencyNumber: string;
  personalDetails: PersonalDetails;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    locationSharing: true,
    autoLocation: true,
    emergencyDelay: 0,
    soundAlerts: true,
    alarmVolume: 0.9,
    alarmFlash: true,
    alarmVibrate: true,
    region: 'IN',
    customEmergencyNumber: '',
    personalDetails: {
      fullName: '',
      bloodGroup: '',
      medicalNotes: ''
    }
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  const updateSetting = (key: keyof AppSettings, value: boolean | number | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    });
  };

  const updatePersonalDetails = (key: keyof PersonalDetails, value: string) => {
    const newSettings: AppSettings = {
      ...settings,
      personalDetails: {
        ...settings.personalDetails,
        [key]: value,
      },
    };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    toast({ title: 'Personal Details Updated', description: 'Your personal information has been saved.' });
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('emergencyContacts');
      localStorage.removeItem('unsafeAreaReports');
      localStorage.removeItem('appSettings');
      
      toast({
        title: "Data Cleared",
        description: "All app data has been removed.",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      contacts: JSON.parse(localStorage.getItem('emergencyContacts') || '[]'),
      reports: JSON.parse(localStorage.getItem('unsafeAreaReports') || '[]'),
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'empowher-data.json';
    a.click();
    
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded as a JSON file.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const sanitizeSettings = (incoming: any): AppSettings => {
    const defaults: AppSettings = {
      notifications: true,
      locationSharing: true,
      autoLocation: true,
      emergencyDelay: 0,
      soundAlerts: true,
      alarmVolume: 0.9,
      alarmFlash: true,
      alarmVibrate: true,
      region: 'IN',
      customEmergencyNumber: '',
      personalDetails: {
        fullName: '',
        bloodGroup: '',
        medicalNotes: ''
      }
    };
    const out: AppSettings = { ...defaults };
    const keys: (keyof AppSettings)[] = [
      'notifications','locationSharing','autoLocation','emergencyDelay','soundAlerts','alarmVolume','alarmFlash','alarmVibrate','region','customEmergencyNumber'
    ];
    for (const k of keys) {
      if (incoming && Object.prototype.hasOwnProperty.call(incoming, k)) {
        (out as any)[k] = (incoming as any)[k];
      }
    }
    // clamp types
    out.emergencyDelay = Math.max(0, Number(out.emergencyDelay) || 0);
    out.alarmVolume = Math.max(0, Math.min(1, Number(out.alarmVolume) || 0));
    out.region = String(out.region || 'IN').toUpperCase();
    out.customEmergencyNumber = String(out.customEmergencyNumber || '').trim();

    // sanitize personalDetails
    const allowedBG = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];
    const incPD = incoming && typeof incoming.personalDetails === 'object' ? incoming.personalDetails : {};
    const fullName = String(incPD?.fullName || '').trim();
    const bgRaw = String(incPD?.bloodGroup || '').trim().toUpperCase();
    const bloodGroup = allowedBG.includes(bgRaw) ? bgRaw : '';
    const notes = String(incPD?.medicalNotes || '').trim().slice(0, 500);
    out.personalDetails = {
      fullName,
      bloodGroup,
      medicalNotes: notes,
    };
    return out;
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate and apply
      let importedCount = { contacts: 0, reports: 0 };

      if (Array.isArray(data?.contacts)) {
        localStorage.setItem('emergencyContacts', JSON.stringify(data.contacts));
        importedCount.contacts = data.contacts.length;
      }
      if (Array.isArray(data?.reports)) {
        localStorage.setItem('unsafeAreaReports', JSON.stringify(data.reports));
        importedCount.reports = data.reports.length;
      }
      if (data?.settings && typeof data.settings === 'object') {
        const sanitized = sanitizeSettings(data.settings);
        localStorage.setItem('appSettings', JSON.stringify(sanitized));
        setSettings((prev) => ({ ...prev, ...sanitized }));
      }

      toast({
        title: 'Import complete',
        description: `Imported ${importedCount.contacts} contacts and ${importedCount.reports} reports. Settings updated.`,
      });
    } catch (err) {
      console.error('Import error:', err);
      toast({ title: 'Import failed', description: 'The selected file is not a valid EmpowHER export.', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-empowerment">Settings</h1>
      </div>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-sm font-medium">
                Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive alerts and reminders
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="soundAlerts" className="text-sm font-medium">
                Sound Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Play sounds for emergency alerts
              </p>
            </div>
            <Switch
              id="soundAlerts"
              checked={settings.soundAlerts}
              onCheckedChange={(checked) => updateSetting('soundAlerts', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Region & Localization</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="region" className="text-sm font-medium">
              Region
            </Label>
            <p className="text-xs text-muted-foreground">
              Used for emergency numbers and defaults
            </p>
            <Select
              value={settings.region}
              onValueChange={(value) => updateSetting('region', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="GL">Global/Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Personal Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="pdName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="pdName"
              type="text"
              value={settings.personalDetails.fullName}
              onChange={(e) => updatePersonalDetails('fullName', e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <Label htmlFor="pdBloodGroup" className="text-sm font-medium">
              Blood Group
            </Label>
            <Select
              value={settings.personalDetails.bloodGroup || 'UNKNOWN'}
              onValueChange={(value) => updatePersonalDetails('bloodGroup', value === 'UNKNOWN' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unknown" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNKNOWN">Unknown</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pdNotes" className="text-sm font-medium">
              Medical Notes
            </Label>
            <Textarea
              id="pdNotes"
              value={settings.personalDetails.medicalNotes}
              onChange={(e) => updatePersonalDetails('medicalNotes', e.target.value)}
              placeholder="Allergies, medications, conditions, etc."
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MapPin className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Location</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="locationSharing" className="text-sm font-medium">
                Location Sharing
              </Label>
              <p className="text-xs text-muted-foreground">
                Share location in emergency alerts
              </p>
            </div>
            <Switch
              id="locationSharing"
              checked={settings.locationSharing}
              onCheckedChange={(checked) => updateSetting('locationSharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoLocation" className="text-sm font-medium">
                Auto-detect Location
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically get current location
              </p>
            </div>
            <Switch
              id="autoLocation"
              checked={settings.autoLocation}
              onCheckedChange={(checked) => updateSetting('autoLocation', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Emergency</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="emergencyDelay" className="text-sm font-medium">
              SOS Activation Delay
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Delay before sending emergency alerts
            </p>
            <Select
              value={settings.emergencyDelay.toString()}
              onValueChange={(value) => updateSetting('emergencyDelay', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Immediate</SelectItem>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customEmergencyNumber" className="text-sm font-medium">
              Emergency Call Number
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Leave blank to use your region default
            </p>
            <Input
              id="customEmergencyNumber"
              type="tel"
              value={settings.customEmergencyNumber}
              onChange={(e) => updateSetting('customEmergencyNumber', e.target.value.replace(/\s+/g, ''))}
              placeholder={(() => {
                const r = (settings.region || 'IN').toUpperCase();
                if (r === 'US') return '911';
                if (r === 'UK') return '999';
                return '112';
              })()}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlarmClock className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Deterrent Alarm</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 size={18} />
              <Label htmlFor="alarmVolume" className="text-sm font-medium">Volume</Label>
            </div>
            <div className="w-40">
              <Slider
                id="alarmVolume"
                value={[settings.alarmVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(val) => updateSetting('alarmVolume', Math.max(0, Math.min(1, val[0] ?? 0)))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap size={18} />
              <Label htmlFor="alarmFlash" className="text-sm font-medium">Flash Screen</Label>
            </div>
            <Switch
              id="alarmFlash"
              checked={settings.alarmFlash}
              onCheckedChange={(checked) => updateSetting('alarmFlash', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alarmVibrate" className="text-sm font-medium">Vibrate</Label>
            </div>
            <Switch
              id="alarmVibrate"
              checked={settings.alarmVibrate}
              onCheckedChange={(checked) => updateSetting('alarmVibrate', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="text-empowerment" size={24} />
          <h3 className="font-semibold text-lg">Data Management</h3>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={exportData}
            variant="outline"
            className="w-full"
          >
            Export My Data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            onClick={handleImportClick}
            variant="outline"
            className="w-full"
          >
            Import Data (JSON)
          </Button>
          
          <Button
            onClick={clearAllData}
            variant="destructive"
            className="w-full"
          >
            <Trash2 size={16} className="mr-2" />
            Clear All Data
          </Button>
        </div>
      </Card>

      <Card className="glass-card p-6 bg-gradient-empowerment text-empowerment-foreground">
        <h3 className="font-semibold mb-2">About EmpowHER</h3>
        <p className="text-sm mb-3">
          Version 1.0 - Women's Safety Progressive Web App
        </p>
        <p className="text-xs opacity-90">
          Developed by Guardian Angels Team. Your safety is our priority.
        </p>
      </Card>
    </div>
  );
};