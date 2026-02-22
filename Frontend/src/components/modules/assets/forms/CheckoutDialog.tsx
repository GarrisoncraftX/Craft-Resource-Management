import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import type { Asset, CheckoutPayload, Location, StatusLabel } from '@/types/javabackendapi/assetTypes';
import type { User } from '@/types/javabackendapi/hrTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type CheckoutToTab = 'user' | 'assets' | 'location';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onSuccess?: (updatedAsset: Asset) => void;
}


interface UnifiedFormData {
  // shared
  assetName: string;
  statusId: string;
  notes: string;

  // checkout mode
  checkoutTo: CheckoutToTab;
  assignedToId: string; // userId OR assetId OR locationId depending on tab
  checkoutDate: string;
  expectedCheckinDate: string;

  // checkin mode
  locationId: string;
  updateDefaultLocation: boolean;
  checkinDate: string;
}

type FormErrors = Record<string, string>;

const todayISO = () => new Date().toISOString().split('T')[0];
const normalizeStatus = (s?: string | null) => (s || '').trim().toLowerCase();

const isAssetCheckedOut = (a: Asset) => {
  const s = normalizeStatus(a.status);
  return (
    s === 'deployed' ||
    s === 'in use' ||
    s === 'checked out' ||
    a.status_id === 2 ||
    !!(a.assigned_to ?? (a as unknown as { assignedToId?: number }).assignedToId)
  );
};

type AssetApiLike = {
  getAllStatusLabels?: () => Promise<StatusLabel[]>;
  getAllLocations?: () => Promise<Location[]>;

  checkoutAsset?: (assetId: number, assignedToId: number, assignedType: string, notes?: string) => Promise<Asset>;

  checkinAssetById?: (assetId: number, payload: unknown) => Promise<Asset>;
  checkinAsset?: ((assetId: number, payload: unknown) => Promise<Asset>) | ((assetTag: string, payload: unknown) => Promise<Asset>);

  updateAsset?: (assetId: number, payload: unknown) => Promise<Asset>;
  updateAssetStatus?: (assetId: number, statusId: number) => Promise<Asset>;
};

const parsePositiveInt = (value: string): number | null => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;
  return n;
};

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onOpenChange, asset, onSuccess }) => {
  const api = assetApiService as unknown as AssetApiLike;

  const mode = useMemo<'checkout' | 'checkin'>(() => {
    if (!asset) return 'checkout';
    return isAssetCheckedOut(asset) ? 'checkin' : 'checkout';
  }, [asset]);

  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<StatusLabel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [readyToDeployStatus, setReadyToDeployStatus] = useState<StatusLabel | null>(null);
  const [deployedStatus, setDeployedStatus] = useState<StatusLabel | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [footerReturnTo, setFooterReturnTo] = useState('Return to all Assets');
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<UnifiedFormData>({
    assetName: '',
    statusId: '',
    notes: '',

    checkoutTo: 'user',
    assignedToId: '',
    checkoutDate: todayISO(),
    expectedCheckinDate: '',

    locationId: '',
    updateDefaultLocation: false,
    checkinDate: todayISO(),
  });

  useEffect(() => {
    const load = async () => {
      if (!open) return;
      setLoading(true);
      setErrors({});
      try {
        const [usersData, statusesData, locationsData] = await Promise.all([
          hrApiService.listEmployees().catch(() => [] as User[]),
          api.getAllStatusLabels ? api.getAllStatusLabels().catch(() => [] as StatusLabel[]) : Promise.resolve([] as StatusLabel[]),
          api.getAllLocations ? api.getAllLocations().catch(() => [] as Location[]) : Promise.resolve([] as Location[]),
        ]);

        setUsers(usersData || []);
        setStatuses(statusesData || []);
        setLocations(locationsData || []);

        const rtdStatus = (statusesData || []).find((s) => normalizeStatus(s.name) === 'ready to deploy');
        const depStatus = (statusesData || []).find((s) => normalizeStatus(s.name) === 'deployed');
        setReadyToDeployStatus(rtdStatus || null);
        setDeployedStatus(depStatus || null);

        if (asset) {
          const preName = (asset.assetName || asset.asset_name || asset.name || '') as string;

          let preselectedStatusId = '';
          if (mode === 'checkout' && rtdStatus) {
            preselectedStatusId = String(rtdStatus.id);
          } else if (mode === 'checkin') {
            const matchStatus = (statusesData || []).find((s) => normalizeStatus(s.name) === normalizeStatus(asset.status || ''));
            preselectedStatusId = matchStatus ? String(matchStatus.id) : '';
          }

          setFormData((prev) => ({
            ...prev,
            assetName: preName,
            statusId: preselectedStatusId,
            notes: '',
            checkoutTo: 'user',
            assignedToId: '',
            checkoutDate: todayISO(),
            expectedCheckinDate: '',
            locationId: '',
            updateDefaultLocation: false,
            checkinDate: todayISO(),
          }));
        }
      } catch (e) {
        console.error('[CheckoutDialog] load failed:', e);
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, asset?.id]);

  const setField = <K extends keyof UnifiedFormData>(key: K, value: UnifiedFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!asset?.id) next.asset = 'Asset is missing';

    if (!formData.statusId) next.statusId = 'Status is required';
    if (!formData.notes) {
      // notes optional (no error)
    }

    if (mode === 'checkout') {
      if (!formData.checkoutDate) next.checkoutDate = 'Checkout date is required';
      if (!formData.assignedToId) next.assignedToId = 'Selection is required';

      if (formData.checkoutTo !== 'user') {
        const n = parsePositiveInt(formData.assignedToId);
        if (!n) next.assignedToId = 'Please select a valid item';
      } else {
        const n = parsePositiveInt(formData.assignedToId);
        if (!n) next.assignedToId = 'Please select a valid user';
      }
    }

    if (mode === 'checkin') {
      if (!formData.locationId) next.locationId = 'Location is required';
      if (!formData.checkinDate) next.checkinDate = 'Checkin date is required';
      const loc = parsePositiveInt(formData.locationId);
      if (!loc) next.locationId = 'Please select a valid location';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const close = () => {
    onOpenChange(false);
    setErrors({});
    setSubmitting(false);
    setFooterReturnTo('Return to all Assets');
  };

  const tryUpdateStatus = async (assetId: number, statusId: number) => {
    try {
      if (api.updateAssetStatus) {
        return await api.updateAssetStatus(assetId, statusId);
      }
      if (api.updateAsset) {
        return await api.updateAsset(assetId, { statusId });
      }
    } catch {
      // ignore
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !asset?.id) return;

    setSubmitting(true);
    try {
      const assetId = Number(asset.id);
      const statusIdNum = parsePositiveInt(formData.statusId);

      if (mode === 'checkout') {
        if (!api.checkoutAsset) throw new Error('checkoutAsset not available');

        const assignedToNum = parsePositiveInt(formData.assignedToId);
        if (!assignedToNum) throw new Error('Invalid assignee');

        const assignedType =
          formData.checkoutTo === 'user' ? 'user' : formData.checkoutTo === 'assets' ? 'asset' : 'location';

        const payload: CheckoutPayload = {
          assignedToId: assignedToNum,
          assignedType,
          checkoutDate: formData.checkoutDate,
          expectedReturnDate: formData.expectedCheckinDate || undefined,
          notes: formData.notes || undefined,
        };

        let updated = await api.checkoutAsset(assetId, payload.assignedToId, payload.assignedType, payload.notes);

        if (deployedStatus) {
          const maybe = await tryUpdateStatus(assetId, deployedStatus.id);
          if (maybe) updated = maybe;
        } else if (statusIdNum) {
          const maybe = await tryUpdateStatus(assetId, statusIdNum);
          if (maybe) updated = maybe;
        }

        toast.success(`Asset ${asset.assetTag || asset.asset_tag} checked out successfully`);
        onSuccess?.(updated);
        close();
        return;
      }

      // CHECKIN
      const checkinPayload = {
        name: formData.assetName || undefined,
        statusId: statusIdNum || undefined,
        locationId: parsePositiveInt(formData.locationId) || undefined,
        checkinDate: formData.checkinDate,
        notes: formData.notes || undefined,
        updateDefaultLocation: formData.updateDefaultLocation,
      };

      let updatedAsset: Asset | null = null;

      if (api.checkinAssetById) {
        updatedAsset = await api.checkinAssetById(assetId, checkinPayload);
      } else if (api.checkinAsset) {
        // try by id first; if it fails, try by tag
        try {
          updatedAsset = await (api.checkinAsset as (id: number, payload: unknown) => Promise<Asset>)(assetId, checkinPayload);
        } catch {
          updatedAsset = await (api.checkinAsset as (tag: string, payload: unknown) => Promise<Asset>)(String(asset.assetTag), checkinPayload);
        }
      } else {
        throw new Error('checkin API not available');
      }

      toast.success(`Asset ${asset.assetTag || asset.asset_tag} checked in successfully`);
      onSuccess?.(updatedAsset);
      close();
    } catch (error) {
      console.error('[CheckoutDialog] submit failed:', error);
      toast.error(mode === 'checkout' ? 'Failed to check out asset' : 'Failed to check in asset');
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === 'checkout' ? 'Check Out Asset' : 'Check In Asset';

  const assetTagDisplay = (asset?.assetTag || asset?.asset_tag || asset?.id || '') as string | number;
  const categoryDisplay = (asset?.category || (asset)?.description || 'Laptops') as string;
  const modelDisplay = ((asset)?.model || (asset)?.model_no || (asset)?.name || '') as string;

  const checkoutTabButton = (tab: CheckoutToTab, label: string) => {
    const active = formData.checkoutTo === tab;
    return (
      <button
        type="button"
        onClick={() => {
          setField('checkoutTo', tab);
          setField('assignedToId', '');
        }}
        className={`px-3 py-2 text-sm font-medium rounded-md border ${
          active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!asset ? (
          <div className="p-4 text-sm text-gray-600">No asset selected.</div>
        ) : loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Top read-only summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">Asset Tag</span>
                <span className="text-sm font-mono">{assetTagDisplay}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">Category</span>
                <span className="text-sm">{categoryDisplay}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">Model</span>
                <span className="text-sm">{modelDisplay || '—'}</span>
              </div>
            </div>

            {/* Asset Name field (both modes) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'checkout' ? 'Asset Name' : 'Name'}
              </label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) => setField('assetName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder={mode === 'checkout' ? 'Asset name' : 'Name'}
              />
            </div>

            {/* Shared field: Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.statusId}
                onChange={(e) => setField('statusId', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${errors.statusId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Status</option>
                {mode === 'checkout' ? (
                  readyToDeployStatus ? (
                    <option key={readyToDeployStatus.id} value={readyToDeployStatus.id}>
                      {readyToDeployStatus.name}
                    </option>
                  ) : (
                    statuses.filter((s) => normalizeStatus(s.name) === 'ready to deploy').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  )
                ) : (
                  statuses
                    .filter((s) => normalizeStatus(s.name) !== 'ready to deploy')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                )}
              </select>
              {errors.statusId && <p className="text-red-500 text-sm mt-1">{errors.statusId}</p>}
            </div>

            {/* MODE: CHECKOUT */}
            {mode === 'checkout' ? (
              <>
                {/* Checkout to tabs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Checkout to</label>
                  <div className="flex flex-wrap gap-2">
                    {checkoutTabButton('user', 'User')}
                    {checkoutTabButton('assets', 'Assets')}
                    {checkoutTabButton('location', 'Location')}
                  </div>

                  <div className="mt-3">
                    {formData.checkoutTo === 'user' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.assignedToId}
                          onChange={(e) => setField('assignedToId', e.target.value)}
                          className={`w-full border rounded-md px-3 py-2 ${errors.assignedToId ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Select a user</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.firstName} {u.lastName} ({u.email})
                            </option>
                          ))}
                        </select>
                        {errors.assignedToId && <p className="text-red-500 text-sm mt-1">{errors.assignedToId}</p>}
                      </div>
                    )}

                    {formData.checkoutTo === 'assets' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Asset (ID) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.assignedToId}
                          onChange={(e) => setField('assignedToId', e.target.value)}
                          className={`w-full border rounded-md px-3 py-2 ${errors.assignedToId ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Enter target asset ID"
                        />
                        {errors.assignedToId && <p className="text-red-500 text-sm mt-1">{errors.assignedToId}</p>}
                      </div>
                    )}

                    {formData.checkoutTo === 'location' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.assignedToId}
                          onChange={(e) => setField('assignedToId', e.target.value)}
                          className={`w-full border rounded-md px-3 py-2 ${errors.assignedToId ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Select a location</option>
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                        {errors.assignedToId && <p className="text-red-500 text-sm mt-1">{errors.assignedToId}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkout Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checkout Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.checkoutDate}
                    onChange={(e) => setField('checkoutDate', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${errors.checkoutDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.checkoutDate && <p className="text-red-500 text-sm mt-1">{errors.checkoutDate}</p>}
                </div>

                {/* Expected Checkin Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Checkin Date</label>
                  <input
                    type="date"
                    value={formData.expectedCheckinDate}
                    onChange={(e) => setField('expectedCheckinDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="YYYY-MM-DD"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select Date (YYYY-MM-DD)</p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
                    placeholder="Add notes about this checkout..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.locationId}
                      onChange={(e) => setField('locationId', e.target.value)}
                      className={`flex-1 border rounded-md px-3 py-2 ${errors.locationId ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select a Location</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      New
                    </button>
                  </div>
                  {errors.locationId && <p className="text-red-500 text-sm mt-1">{errors.locationId}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    You can choose to check this asset in to a location other than this asset&apos;s default location if one is set
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!formData.updateDefaultLocation}
                      onChange={() => setField('updateDefaultLocation', false)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Update Asset Location</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.updateDefaultLocation}
                      onChange={() => setField('updateDefaultLocation', true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Update default location AND actual location</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checkin Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.checkinDate}
                    onChange={(e) => setField('checkinDate', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${errors.checkinDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.checkinDate && <p className="text-red-500 text-sm mt-1">{errors.checkinDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
                    placeholder="Add notes about this checkin..."
                  />
                </div>
              </>
            )}

            {/* Footer (both) */}
            <div className="pt-4 border-t space-y-3">
              {mode === 'checkout' && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>This user will be emailed with a link to confirm acceptance of this item.</p>
                  <p>This user will be emailed a copy of the EULA with the footer....</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button type="button" variant="outline" onClick={close} disabled={submitting}>
                  Cancel
                </Button>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <select
                    value={footerReturnTo}
                    onChange={(e) => setFooterReturnTo(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option>Return to all Assets</option>
                  </select>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={mode === 'checkout' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {mode === 'checkout' ? 'Check Out' : 'Check In'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};