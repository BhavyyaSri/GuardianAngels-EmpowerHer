import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SOSButtonProps {
  onSOSTrigger: () => void;
}

export const SOSButton = ({ onSOSTrigger }: SOSButtonProps) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const { toast } = useToast();
  const [awaitingCall, setAwaitingCall] = useState(false);
  const [isDelaying, setIsDelaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [region, setRegion] = useState<string>('IN');

  const getEmergencyNumber = (r: string) => {
    switch ((r || '').toUpperCase()) {
      case 'US': return '911';
      case 'UK': return '999';
      case 'IN': return '112';
      default: return '112';
    }
  };

  const getRegionFromSettings = () => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.region === 'string') return parsed.region;
      }
    } catch {}
    return 'IN';
  };

  const getPreferredEmergencyNumber = () => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const custom = String(parsed.customEmergencyNumber || '').trim();
        if (custom.length > 0) return custom;
        const r = typeof parsed.region === 'string' ? parsed.region : region;
        return getEmergencyNumber(r || 'IN');
      }
    } catch {}
    return getEmergencyNumber(region || 'IN');
  };

  const getPersonalDetailsText = (): string => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (!saved) return '';
      const parsed = JSON.parse(saved);
      const pd = parsed?.personalDetails || {};
      const parts: string[] = [];
      const name = String(pd.fullName || '').trim();
      const blood = String(pd.bloodGroup || '').trim();
      const notes = String(pd.medicalNotes || '').trim();
      if (name) parts.push(`👤 Name: ${name}`);
      if (blood) parts.push(`🩸 Blood group: ${blood}`);
      if (notes) parts.push(`📝 Notes: ${notes}`);
      return parts.length ? parts.join('\n') : '';
    } catch {
      return '';
    }
  };

  // Load delay from Settings (localStorage) on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.emergencyDelay === 'number') {
          setDelaySeconds(parsed.emergencyDelay);
        }
        if (typeof parsed.region === 'string') {
          setRegion(parsed.region);
        }
      }
    } catch (e) {
      console.warn('Failed to read appSettings:', e);
    }
  }, []);

  const formatTimestamp = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const HH = pad(d.getHours());
    const MM = pad(d.getMinutes());
    const SS = pad(d.getSeconds());
    return `${dd}/${mm}/${yyyy}, ${HH}:${MM}:${SS}`;
  };

  const executeSOS = async () => {
    setIsTriggering(true);
    
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = formatTimestamp(new Date());
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          
          const emergencyNumber = getPreferredEmergencyNumber();
          const pdText = getPersonalDetailsText();
          const emergencyMessage = `🚨 EMERGENCY ALERT 🚨
I am in danger and need immediate help.

📍 My location: ${locationUrl}
🕐 Time: ${timestamp}${pdText ? `\n\n${pdText}` : ''}

Please contact me immediately or send help to my location.
☎️ Emergency number: ${emergencyNumber}`;

          // Get emergency contacts from localStorage
          const contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
          
          if (contacts.length === 0) {
            toast({
              title: "⚠️ No Emergency Contacts",
              description: "Please add emergency contacts in settings first.",
              variant: "destructive"
            });
            // Even without contacts, allow proceeding to call 112
            setAwaitingCall(true);
            setIsTriggering(false);
            return;
          }

          const phoneRecipients: string[] = contacts.filter((c: any) => c.phone).map((c: any) => c.phone);
          const isAndroid = /android/i.test(navigator.userAgent);
          const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
          const smsSeparator = isAndroid ? ';' : ','; // Android prefers ';' for multiple recipients
          const phoneNumbers = phoneRecipients.join(smsSeparator);
          const emails = contacts.filter((c: any) => c.email).map((c: any) => c.email).join(',');

          // 1) Open SMS first to ensure it is not blocked by subsequent deep-links
          if (phoneNumbers) {
            const bodyDelimiter = isIOS ? '&' : '?';
            const smsUrl = `sms:${phoneNumbers}${bodyDelimiter}body=${encodeURIComponent(emergencyMessage)}`;
            try {
              window.location.href = smsUrl; // open Messages app
              toast({
                title: "SMS step opened",
                description: `Send the message, then return and tap 'Call ${getPreferredEmergencyNumber()} Now'.`,
              });
              setAwaitingCall(true);
            } catch (e) {
              console.error('Failed to open SMS:', e);
              toast({
                title: "SMS Open Failed",
                description: "Could not open the SMS app. You can still place the call.",
                variant: "destructive"
              });
              setAwaitingCall(true);
            }
          } else {
            toast({
              title: "No phone numbers",
              description: "No contact numbers available. You can still place the call.",
            });
            setAwaitingCall(true);
          }

          // Optional: prepare email link but do not open automatically to avoid blocking
          if (emails) {
            // Keep for future enhancement (manual email step if needed)
          }

          onSOSTrigger();
        }, (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Cannot get your location. Please enable location services.",
            variant: "destructive"
          });
          // Allow user to proceed with emergency call even if location failed
          setAwaitingCall(true);
        });
      } else {
        toast({
          title: "Geolocation Not Supported",
          description: "Your browser doesn't support location services.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('SOS Error:', error);
      toast({
        title: "SOS Error",
        description: "Failed to trigger SOS. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsTriggering(false), 2000);
    }
  };

  const handleSOSClick = () => {
    if (isTriggering || awaitingCall || isDelaying) return;
    // Ensure we use the freshest delay from Settings
    let currentDelay = delaySeconds;
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.emergencyDelay === 'number') {
          currentDelay = parsed.emergencyDelay;
          setDelaySeconds(parsed.emergencyDelay);
        }
      }
    } catch {}

    if (currentDelay <= 0) {
      // Immediate trigger
      executeSOS();
      return;
    }

    setIsDelaying(true);
    setRemainingSeconds(currentDelay);
    toast({
      title: 'SOS arming',
      description: `SOS will trigger in ${currentDelay}s. Tap Cancel to stop.`,
    });
  };

  const cancelDelay = () => {
    setIsDelaying(false);
    setRemainingSeconds(0);
    setIsTriggering(false);
    setAwaitingCall(false);
    toast({ title: 'SOS canceled', description: 'You canceled the SOS sequence.' });
  };

  useEffect(() => {
    if (!isDelaying) return;
    if (remainingSeconds <= 0) {
      setIsDelaying(false);
      // Proceed to execute SOS after delay
      executeSOS();
      return;
    }
    const t = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isDelaying, remainingSeconds]);

  const handleCallNow = () => {
    try {
      const num = getPreferredEmergencyNumber();
      window.location.href = `tel:${num}`;
      toast({
        title: 'Dialer opened',
        description: `Proceeding to call ${num}.`,
      });
    } catch (e) {
      console.error('Failed to open dialer:', e);
      toast({
        title: 'Call Failed',
        description: 'Could not open the phone dialer.',
        variant: 'destructive',
      });
    } finally {
      setAwaitingCall(false);
    }
  };

  // Always-visible quick actions
  const buildEmergencyMessage = async (): Promise<{ message: string; phoneNumbers: string; emails: string; }> => {
    const contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    const phoneRecipients: string[] = contacts.filter((c: any) => c.phone).map((c: any) => c.phone);
    const isAndroid = /android/i.test(navigator.userAgent);
    const smsSeparator = isAndroid ? ';' : ',';
    const phoneNumbers = phoneRecipients.join(smsSeparator);
    const emails = contacts
      .filter((c: any) => c.email)
      .map((c: any) => String(c.email).trim())
      .filter((e: string) => e.length > 0)
      .join(',');

    let locationUrl = 'Location unavailable';
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('no-geo'));
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = pos.coords;
      locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch {}

    const timestamp = formatTimestamp(new Date());
    const emergencyNumber = getPreferredEmergencyNumber();
    const pdText = getPersonalDetailsText();
    const personalSection = pdText ? `\n\n${pdText}` : '';
    const message = `🚨 EMERGENCY ALERT 🚨\nI am in danger and need immediate help.\n\n📍 My location: ${locationUrl}\n🕐 Time: ${timestamp}${personalSection}\n\nPlease contact me immediately or send help to my location.\n☎️ Emergency number: ${emergencyNumber}`;
    return { message, phoneNumbers, emails };
  };

  const handleQuickSms = async () => {
    const { message, phoneNumbers } = await buildEmergencyMessage();
    if (!phoneNumbers) {
      toast({ title: 'No phone numbers', description: 'Please add emergency contact numbers.' });
      return;
    }
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    const bodyDelimiter = isIOS ? '&' : '?';
    const smsUrl = `sms:${phoneNumbers}${bodyDelimiter}body=${encodeURIComponent(message)}`;
    try {
      window.location.href = smsUrl;
      toast({ title: 'SMS composer opened', description: 'Review and send your message.' });
    } catch (e) {
      console.error('Failed to open SMS:', e);
      toast({ title: 'SMS Open Failed', description: 'Could not open the SMS app.', variant: 'destructive' });
    }
  };

  const handleQuickCall = () => {
    handleCallNow();
  };

  const handleQuickEmail = async () => {
    const { message, emails } = await buildEmergencyMessage();
    if (!emails) {
      toast({ title: 'No emails', description: 'Please add contact emails.' });
      return;
    }
    // Copy message to clipboard as a fallback for mail clients that ignore body
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: 'Opening email...', description: 'Message copied to clipboard in case the body is empty.' });
    } catch {
      toast({ title: 'Opening email...', description: 'If the body is empty, paste the message manually.' });
    }
    // Use CRLF and header-style recipients (?to=) for broad client compatibility (notably Linux mailto handlers)
    const emailBody = message.replace(/\n/g, '\r\n');
    const mailto = `mailto:?to=${encodeURIComponent(emails)}&subject=${encodeURIComponent('Emergency Alert')}&body=${encodeURIComponent(emailBody)}`;
    try {
      window.location.href = mailto;
      // no-op toast here because some clients navigate away; we already showed a toast above
    } catch (e) {
      console.error('Failed to open email:', e);
      toast({ title: 'Email Open Failed', description: 'Could not open the email client.', variant: 'destructive' });
    }
  };

  const handleCopyLocationLink = async () => {
    let locationUrl: string | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('no-geo'));
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = pos.coords;
      locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch (e) {
      console.warn('Could not get location to copy:', e);
    }

    if (!locationUrl) {
      toast({ title: 'Location unavailable', description: 'Enable location and try again.', variant: 'destructive' });
      return;
    }

    try {
      await navigator.clipboard.writeText(locationUrl);
      toast({ title: 'Location copied', description: 'Current location link copied to clipboard.' });
    } catch (e) {
      console.error('Clipboard error:', e);
      toast({ title: 'Copy failed', description: 'Could not copy the location link.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Button
        onClick={handleSOSClick}
        disabled={isTriggering || isDelaying || awaitingCall}
        className={`
          w-48 h-48 rounded-full emergency-button text-white font-bold text-xl
          ${isTriggering ? 'pulse-emergency' : ''}
        `}
      >
        <div className="flex flex-col items-center space-y-3">
          <AlertTriangle size={48} />
          <span>{
            isTriggering
              ? 'SENDING...'
              : isDelaying
                ? `ARMING ${remainingSeconds}s`
                : awaitingCall
                  ? 'AWAITING CALL'
                  : 'SOS'
          }</span>
          <span className="text-sm font-normal">EMERGENCY</span>
        </div>
      </Button>
      
      <div className="text-center max-w-sm">
        <p className="text-muted-foreground text-sm">
          Press the SOS button to send your location to emergency contacts and call for help
        </p>
        <div className="flex justify-center space-x-4 mt-3 text-xs text-muted-foreground">
          <button type="button" onClick={handleQuickCall} className="flex items-center space-x-1 hover:text-empowerment cursor-pointer">
            <Phone size={12} />
            <span>Call</span>
          </button>
          <button type="button" onClick={handleQuickSms} className="flex items-center space-x-1 hover:text-empowerment cursor-pointer">
            <MessageSquare size={12} />
            <span>SMS</span>
          </button>
          <button type="button" onClick={handleQuickEmail} className="flex items-center space-x-1 hover:text-empowerment cursor-pointer">
            <Mail size={12} />
            <span>Email</span>
          </button>
          <button type="button" onClick={handleCopyLocationLink} className="flex items-center space-x-1 hover:text-empowerment cursor-pointer">
            <MapPin size={12} />
            <span>Location</span>
          </button>
        </div>
        {isDelaying && (
          <div className="mt-4 flex flex-col items-center space-y-2">
            <div className="text-sm">SOS will trigger in {remainingSeconds}s</div>
            <Button onClick={cancelDelay} variant="outline" className="border-destructive text-destructive">
              Cancel SOS
            </Button>
          </div>
        )}
        {awaitingCall && (
          <div className="mt-4 flex flex-col items-center space-y-2">
            <Button onClick={handleCallNow} className="empowerment-button">
              <Phone size={16} className="mr-2" /> {`Call ${getPreferredEmergencyNumber()} Now`}
            </Button>
            <p className="text-xs text-muted-foreground">
              After sending the SMS, tap to place the emergency call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};