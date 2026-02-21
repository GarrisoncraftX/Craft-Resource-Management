'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetApiService } from '@/services/api/assetApiService';
import type { Asset } from '@/types/asset';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckinPayload {
  name?: string;
  status: string;
  location: string;
  checkinDate: string;
  notes?: string;
  updateDefaultLocation?: boolean;
}

export const CheckoutForm: React.FC = () => {
  const { assetTag } = useParams<{ assetTag: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CheckinPayload>({
    name: '',
    status: '',
    location: '',
    checkinDate: new Date().toISOString().split('T')[0],
    notes: '',
    updateDefaultLocation: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!assetTag) {
        setLoading(false);
        return;
      }

      try {
        const [assetData, statusesData, locationsData] = await Promise.all([
          assetApiService.getAssetByTag(assetTag),
          assetApiService.getStatuses(),
          assetApiService.getLocations(),
        ]);

        setAsset(assetData);
        setStatuses(statusesData);
        setLocations(locationsData);

        if (assetData) {
          setFormData((prev) => ({
            ...prev,
            name: assetData.assetName || '',
            location: assetData.location || '',
          }));
        }
      } catch (error) {
        console.error('[v0] Failed to load data:', error);
        toast.error('Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assetTag]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.checkinDate) newErrors.checkinDate = 'Checkin date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      await assetApiService.checkinAsset(assetTag, formData);
      toast.success('Asset checked in successfully');
      navigate(`/assets/hardware`);
    } catch (error) {
      console.error('[v0] Checkin failed:', error);
      toast.error('Failed to check in asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CheckinPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6 text-center text-gray-500">
        Asset not found
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkin Asset</h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Tag {asset.assetTag}</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Read-only fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={asset.category || ''}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={asset.name || ''}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Editable fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="flex gap-2">
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`flex-1 border rounded-md px-3 py-2 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                New
              </button>
            </div>
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            <p className="text-xs text-gray-500 mt-2">
              You can choose to check this asset in to a location other than this asset's default location of {asset.defaultLocation} if one is set
            </p>
          </div>

          {/* Location update radio options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!formData.updateDefaultLocation}
                onChange={() => handleInputChange('updateDefaultLocation', false)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Update Asset Location</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.updateDefaultLocation}
                onChange={() => handleInputChange('updateDefaultLocation', true)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Update default location AND actual location</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Checkin Date</label>
            <input
              type="date"
              value={formData.checkinDate}
              onChange={(e) => handleInputChange('checkinDate', e.target.value)}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.checkinDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.checkinDate && <p className="text-red-500 text-sm mt-1">{errors.checkinDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
              placeholder="Add notes about this checkin..."
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-2">
              <select className="border border-gray-300 rounded-md px-3 py-2">
                <option>Return to all Assets</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Checkin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
