import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Upload, X } from 'lucide-react';
import type { Asset } from '@/types/javabackendapi/assetTypes';
import { mockLocations } from '@/services/mockData/assets';
import { toast } from 'sonner';
import { uploadAssetImage } from '@/services/javabackendapi/assetApi';

interface AuditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onAudit?: (data) => void;
}

export const AuditAssetDialog: React.FC<AuditAssetDialogProps> = ({ open, onOpenChange, asset, onAudit }) => {
  const [location, setLocation] = useState('');
  const [updateLocation, setUpdateLocation] = useState(false);
  const [nextAuditDate, setNextAuditDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload jpg, webp, png, gif, svg, or avif.');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error('File size must be less than 25MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    try {
      await uploadAssetImage(asset.id, selectedImage);
      toast.success('Audit image uploaded successfully');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAudit?.({ assetId: asset.id, location, updateLocation, nextAuditDate, notes });
    toast.success('Asset audited successfully');
    onOpenChange(false);
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
            <p className="text-sm font-semibold text-gray-800">Asset Tag {asset.assetTag || asset.id}</p>
          </div>

          {/* Model */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Model</label>
            <span className="text-sm text-gray-700">{asset.assetName || asset.description || 'N/A'}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Location</label>
            <div className="flex items-center gap-2 flex-1">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select Location" /></SelectTrigger>
                <SelectContent>
                  {mockLocations.map(l => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
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
            <span className="text-sm text-gray-700">{asset.lastAuditDate || 'None'}</span>
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

          {/* Upload Image - Now functional */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Upload Image</label>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                className="hidden"
                id="audit-image-upload"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Audit preview" className="h-24 w-24 object-cover rounded-md border" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label htmlFor="audit-image-upload">
                  <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" /> Select File
                  </Button>
                </label>
              )}
              {selectedImage && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white ml-2"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              )}
              <p className="text-xs text-gray-500">Accepted filetypes are jpg, webp, png, gif, svg, and avif. The maximum upload size allowed is 25M. You can find audit images in the asset&apos;s history tab.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-sky-600 hover:underline">Cancel</button>
            <div className="flex items-center gap-2">
              <Select defaultValue="return">
                <SelectTrigger className="w-44"><SelectValue placeholder="Return to all Assets" /></SelectTrigger>
                <SelectContent><SelectItem value="return">Return to all Assets</SelectItem></SelectContent>
              </Select>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-4 h-4 mr-1" /> Audit</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
