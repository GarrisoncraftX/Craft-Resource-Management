import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Upload, X, Camera, Image as ImageIcon, File } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Asset, Location } from '@/types/javabackendapi/assetTypes';
import { toast } from 'sonner';
import { assetApiService } from '@/services/javabackendapi/assetApi';

interface AuditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onAudit?: (data: unknown) => void;
}

export const AuditAssetDialog: React.FC<AuditAssetDialogProps> = ({ open, onOpenChange, asset, onAudit }) => {
  const [location, setLocation] = useState('');
  const [updateLocation, setUpdateLocation] = useState(false);
  const [nextAuditDate, setNextAuditDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadLocations();
    }
  }, [open]);

  const loadLocations = async () => {
    try {
      const data = await assetApiService.getAllLocations();
      setLocations(data as unknown as Location[]);
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error('Please select a location');
      return;
    }

    setIsSubmitting(true);
    try {
      const auditData = {
        assetId: asset.id,
        locationId: Number(location),
        updateAssetLocation: updateLocation,
        nextAuditDate: nextAuditDate || null,
        notes: notes || null,
        status: 'submitted',
        images: selectedImages.length > 0 ? JSON.stringify(selectedImages.map(f => f.name)) : null
      };

      await assetApiService.createAssetAudit(auditData);
      toast.success('Asset audited successfully');
      onAudit?.(auditData);
      onOpenChange(false);
      
      // Reset form
      setLocation('');
      setUpdateLocation(false);
      setNextAuditDate('');
      setNotes('');
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Failed to create audit:', error);
      toast.error('Failed to create audit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Audit Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Tag Header */}
          <div className="bg-gray-50 border rounded p-4">
            <p className="text-sm font-semibold text-gray-800">Asset Tag {asset.assetTag || asset.asset_tag || asset.id}</p>
          </div>

          {/* Model */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Model</label>
            <span className="text-sm text-gray-700">{asset.model || asset.assetName || asset.name || 'N/A'}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Location</label>
            <div className="flex items-center gap-2 flex-1">
              <Select value={location} onValueChange={setLocation} disabled={loadingLocations}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={loadingLocations ? "Loading..." : "Select Location"} /></SelectTrigger>
                <SelectContent>
                  {locations.map(l => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white" disabled><Plus className="w-3 h-3 mr-1" /> New</Button>
            </div>
          </div>

          {/* Update Asset Location */}
          <div className="flex items-start gap-4">
            <div className="w-40 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={updateLocation} onCheckedChange={(v) => setUpdateLocation(v as boolean)} />
                <span className="text-sm text-gray-700">Update Asset Location</span>
              </div>
              <p className="text-xs text-gray-500">Checking this box will edit the asset record to reflect this new location. Leaving it unchecked will simply note the location in the audit log.</p>
              <p className="text-xs text-gray-500">Note that if this asset is checked out, it will not change the location of the person, asset or location it is checked out to.</p>
            </div>
          </div>

          {/* Last Audit */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Last Audit</label>
            <span className="text-sm text-gray-700">{asset.lastAuditDate || asset.last_audit_date || 'None'}</span>
          </div>

          {/* Next Audit Date */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Next Audit Date</label>
            <div className="space-y-1">
              <Input type="date" value={nextAuditDate} onChange={(e) => setNextAuditDate(e.target.value)} className="w-56" />
              <p className="text-xs text-sky-600">
                This is usually automatically calculated based on the asset&apos;s last audit date and audit frequency. You can leave this blank or you can manually set this date here if you need to, but it must be later than the last audit date.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-20" />
          </div>

          {/* Upload Images */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Upload Images</label>
            <div className="flex-1 space-y-2">
              <input type="file" ref={cameraInputRef} onChange={handleImageChange} accept="image/*" capture="environment" className="hidden" />
              <input type="file" ref={galleryInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp" multiple className="hidden" />
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative inline-block">
                      <img src={preview} alt={`Audit ${idx + 1}`} className="h-24 w-24 object-cover rounded-md border" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Upload className="w-4 h-4 mr-1" /> Select Files
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" /> Take Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => galleryInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4 mr-2" /> Choose from Gallery
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <File className="w-4 h-4 mr-2" /> Browse Files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-gray-500">Accepted filetypes are jpg, webp, png, gif, svg. Max 25MB per file. Multiple files allowed.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-sky-600 hover:underline">Cancel</button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-1" /> {isSubmitting ? 'Auditing...' : 'Audit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
