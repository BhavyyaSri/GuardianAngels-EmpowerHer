import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnsafeReport {
  id: string;
  location: string;
  description: string;
  category: string;
  timestamp: string;
  coordinates?: { lat: number; lng: number };
}

interface ReportUnsafeAreaProps {
  onBack: () => void;
}

export const ReportUnsafeArea = ({ onBack }: ReportUnsafeAreaProps) => {
  const [reports, setReports] = useState<UnsafeReport[]>([]);
  const [newReport, setNewReport] = useState({
    location: '',
    description: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const savedReports = localStorage.getItem('unsafeAreaReports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const coordsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setCurrentLocation(coordsString);
        setNewReport(prev => ({ ...prev, location: coordsString || prev.location }));
      });
    }
  };

  const submitReport = async () => {
    if (!newReport.location || !newReport.description || !newReport.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const report: UnsafeReport = {
      id: Date.now().toString(),
      ...newReport,
      timestamp: new Date().toISOString(),
    };

    const updatedReports = [...reports, report];
    localStorage.setItem('unsafeAreaReports', JSON.stringify(updatedReports));
    setReports(updatedReports);

    setNewReport({ location: '', description: '', category: '' });

    toast({
      title: "Report Submitted",
      description: "Thank you for helping make our community safer.",
    });

    setIsSubmitting(false);
  };

  const categories = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'poor-lighting', label: 'Poor Lighting' },
    { value: 'isolated', label: 'Isolated Area' },
    { value: 'suspicious-activity', label: 'Suspicious Activity' },
    { value: 'unsafe-infrastructure', label: 'Unsafe Infrastructure' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold text-empowerment">Report Unsafe Area</h1>
      </div>

      <Card className="glass-card p-6">
        <p className="text-sm text-muted-foreground mb-6">
          Help other women stay safe by reporting areas that feel unsafe or concerning.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={newReport.category} onValueChange={(value) => setNewReport({ ...newReport, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                value={newReport.location}
                onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                placeholder="Street address or landmark"
                className="flex-1"
              />
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <MapPin size={16} />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={newReport.description}
              onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
              placeholder="Describe what makes this area feel unsafe..."
              rows={4}
            />
          </div>

          <Button
            onClick={submitReport}
            disabled={isSubmitting}
            className="w-full empowerment-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </Card>

      {reports.length > 0 && (
        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <AlertTriangle size={16} className="mr-2 text-warning" />
            Your Reports ({reports.length})
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {reports.slice(-5).reverse().map((report) => (
              <Card key={report.id} className="p-3 bg-card-elevated">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium capitalize">
                    {report.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock size={12} className="mr-1" />
                    {new Date(report.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{report.location}</p>
                <p className="text-sm">{report.description}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};