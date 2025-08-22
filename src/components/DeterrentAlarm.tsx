import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { AlarmClock, Volume2, Zap, ArrowLeft } from 'lucide-react';

export interface DeterrentAlarmHandle {
  start: () => void;
  stop: () => void;
}

interface DeterrentAlarmProps {
  onBack?: () => void;
  showUI?: boolean; // if false, acts as invisible controller with overlays only
}

export const DeterrentAlarm = forwardRef<DeterrentAlarmHandle, DeterrentAlarmProps>(
({ onBack, showUI = true }: DeterrentAlarmProps, ref) => {
  const { toast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [flashScreen, setFlashScreen] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [volume, setVolume] = useState<number>(0.9);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);
  const vibrateIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Load persisted alarm preferences from appSettings
    try {
      const saved = JSON.parse(localStorage.getItem('appSettings') || '{}');
      if (typeof saved.alarmVolume === 'number') setVolume(saved.alarmVolume);
      if (typeof saved.alarmFlash === 'boolean') setFlashScreen(saved.alarmFlash);
      if (typeof saved.alarmVibrate === 'boolean') setVibrate(saved.alarmVibrate);
    } catch {}

    return () => {
      stopAlarm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAlarm = async () => {
    if (isRunning) return;
    try {
      // Pull latest preferences from settings right before starting
      let useVol = volume;
      let useFlash = flashScreen;
      let useVibrate = vibrate;
      try {
        const saved = JSON.parse(localStorage.getItem('appSettings') || '{}');
        if (typeof saved.alarmVolume === 'number') useVol = Math.max(0, Math.min(1, saved.alarmVolume));
        if (typeof saved.alarmFlash === 'boolean') useFlash = !!saved.alarmFlash;
        if (typeof saved.alarmVibrate === 'boolean') useVibrate = !!saved.alarmVibrate;
        // sync state for UI/overlay
        setVolume(useVol);
        setFlashScreen(useFlash);
        setVibrate(useVibrate);
      } catch {}
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = useVol; // initial volume (from latest settings)

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;

      // Siren sweep between 600-1400 Hz
      let f = 600;
      let dir = 1; // 1 up, -1 down
      sirenIntervalRef.current = window.setInterval(() => {
        f += dir * 35;
        if (f >= 1400) { dir = -1; f = 1400; }
        if (f <= 600) { dir = 1; f = 600; }
        try {
          osc.frequency.setValueAtTime(f, ctx.currentTime);
        } catch {}
      }, 40);

      if (useVibrate && navigator.vibrate) {
        navigator.vibrate([200, 80]);
        vibrateIntervalRef.current = window.setInterval(() => {
          navigator.vibrate([200, 80]);
        }, 300);
      }

      setIsRunning(true);
      toast({ title: 'Deterrent alarm ON', description: 'Tap STOP to end the alarm.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Audio not allowed', description: 'Please interact with the page and try again.', variant: 'destructive' });
    }
  };

  const stopAlarm = () => {
    if (sirenIntervalRef.current) {
      window.clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (vibrateIntervalRef.current) {
      window.clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if (navigator.vibrate) navigator.vibrate(0);

    try {
      oscRef.current?.stop();
    } catch {}

    try {
      gainRef.current?.disconnect();
      oscRef.current?.disconnect();
    } catch {}

    try {
      audioCtxRef.current?.close();
    } catch {}

    audioCtxRef.current = null;
    oscRef.current = null;
    gainRef.current = null;
    setIsRunning(false);
  };

  useImperativeHandle(ref, () => ({ start: startAlarm, stop: stopAlarm }), [startAlarm]);

  const handleVolumeChange = (val: number[]) => {
    const v = Math.max(0, Math.min(1, val[0] ?? 0));
    setVolume(v);
    if (gainRef.current) {
      gainRef.current.gain.value = v;
    }
  };

  return (
    <div className="space-y-6">
      {showUI && (
        <>
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-2"><ArrowLeft className="mr-2" size={16} />Back</Button>
            <h2 className="text-xl font-semibold text-empowerment flex items-center">
              <AlarmClock className="mr-2" /> Deterrent Alarm
            </h2>
          </div>

          <Card className="glass-card p-5 text-center">
            <div className="space-y-4">
              <Button
                className={`w-full h-14 ${isRunning ? 'bg-destructive hover:bg-destructive/90' : 'empowerment-button'} text-white`}
                onClick={isRunning ? stopAlarm : startAlarm}
              >
                {isRunning ? 'STOP ALARM' : 'START ALARM'}
              </Button>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 size={18} /><span className="text-sm">Volume</span>
                </div>
                <div className="w-40">
                  <Slider defaultValue={[volume]} value={[volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap size={18} /><span className="text-sm">Flash Screen</span>
                </div>
                <Switch checked={flashScreen} onCheckedChange={setFlashScreen} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Vibrate</span>
                </div>
                <Switch checked={vibrate} onCheckedChange={setVibrate} />
              </div>
            </div>
            </div>
          </Card>
        </>
      )}

      {/* Full-screen flashing overlay */}
      {isRunning && flashScreen && (
        <div
          aria-hidden
          className="fixed inset-0 z-50 pointer-events-none mix-blend-multiply"
          style={{ animation: 'emp_flash 0.9s linear infinite', background: 'rgba(239, 68, 68, 0.55)' }}
        />
      )}

      {/* Floating STOP button while running */}
      {isRunning && (
        <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center">
          <Button onClick={stopAlarm} className="bg-destructive hover:bg-destructive/90 text-white shadow-lg">
            STOP ALARM
          </Button>
        </div>
      )}

      {/* Keyframes for flashing */}
      <style>{`
        @keyframes emp_flash {
          0% { opacity: 0.15; }
          50% { opacity: 0.9; }
          100% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
});
