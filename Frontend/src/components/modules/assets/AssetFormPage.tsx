'use client';

import React, { useState } from 'react';
import { ChevronRight, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface AssetFormData {
  // Basic Information
  company: string;
  assetTag: string;
  assetName: string;
  description: string;
  assetClass: string;
  serial: string;
  model: string;
  modelNumber: string;
  manufacturer: string;
  status: string;
  condition: string;
  lifecycleStage: string;
  notes: string;
  defaultLocation: string;
  department: string;
  assignedTo: string;
  requestable: boolean;
  image?: File;

  // Optional Information
  warranty: string;
  expectedCheckinDate: string;
  nextAuditDate: string;
  nextMaintenanceDate: string;
  byod: boolean;

  // Order Related Information
  orderNumber: string;
  purchaseDate: string;
  eolDate: string;
  supplier: string;
  purchaseCost: string;
  currency: string;
  
  // Compliance & Audit
  complianceStatus: string;
  riskRegistryLink: string;
  auditStatus: string;
  
  // Offboarding (for retired assets)
  offboardingStatus: string;
  offboardingDate: string;
  returnedCondition: string;
  
  // Depreciation
  depreciationMethod: string;
  depreciationRate: string;
}

const initialFormData: AssetFormData = {
  company: '',
  assetTag: '',
  assetName: '',
  description: '',
  assetClass: '',
  serial: '',
  model: '',
  modelNumber: '',
  manufacturer: '',
  status: 'Active',
  condition: 'Good',
  lifecycleStage: 'tagged',
  notes: '',
  defaultLocation: '',
  department: '',
  assignedTo: '',
  requestable: false,
  warranty: '',
  expectedCheckinDate: '',
  nextAuditDate: '',
  nextMaintenanceDate: '',
  byod: false,
  orderNumber: '',
  purchaseDate: '',
  eolDate: '',
  supplier: '',
  purchaseCost: '',
  currency: 'EUR',
  complianceStatus: 'compliant',
  riskRegistryLink: '',
  auditStatus: 'pending',
  offboardingStatus: 'active',
  offboardingDate: '',
  returnedCondition: '',
  depreciationMethod: 'straight-line',
  depreciationRate: '20',
};

interface AssetFormPageProps {
  onAssetCreated?: (asset) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AssetFormPage: React.FC<AssetFormPageProps> = ({ onAssetCreated, open, onOpenChange }) => {
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [expandedSections, setExpandedSections] = useState({
    optional: false,
    order: false,
    lifecycle: false,
    offboarding: false,
    depreciation: false,
  });

  if (!open) return null;

  const handleInputChange = (field: keyof AssetFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    if (onAssetCreated) {
      onAssetCreated(formData as any);
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const toggleSection = (section: 'optional' | 'order') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DEMO Banner */}
      <div className="bg-cyan-400 text-white px-4 py-3 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">DEMO MODE: Some features are disabled for this installation.</p>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Assets</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Create New</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Save Button Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">Create New Asset</h1>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save
            </Button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                  <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)}>
                    <SelectTrigger id="company" className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acme">ACME Corp</SelectItem>
                      <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Asset Tag */}
                <div className="space-y-2">
                  <Label htmlFor="assetTag" className="text-sm font-medium text-gray-700">Asset Tag</Label>
                  <Input
                    id="assetTag"
                    value={formData.assetTag}
                    onChange={(e) => handleInputChange('assetTag', e.target.value)}
                    placeholder="CPU207802"
                    className="w-full"
                  />
                </div>

                {/* Serial */}
                <div className="space-y-2">
                  <Label htmlFor="serial" className="text-sm font-medium text-gray-700">Serial</Label>
                  <Input
                    id="serial"
                    value={formData.serial}
                    onChange={(e) => handleInputChange('serial', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium text-gray-700">Model</Label>
                  <div className="flex gap-2">
                    <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                      <SelectTrigger id="model" className="flex-1">
                        <SelectValue placeholder="Select a Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iphone-12">iPhone 12</SelectItem>
                        <SelectItem value="iphone-13">iPhone 13</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      New
                    </Button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="flex gap-2">
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger id="status" className="flex-1">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deployable">Deployable</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      New
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add notes about this asset..."
                  className="w-full min-h-24"
                />
              </div>

              {/* Default Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Default Location</Label>
                <Select value={formData.defaultLocation} onValueChange={(value) => handleInputChange('defaultLocation', value)}>
                  <SelectTrigger id="location" className="w-full">
                    <SelectValue placeholder="Select a Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ny-office">New York Office</SelectItem>
                    <SelectItem value="sf-office">San Francisco Office</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">This is the location of the asset when it is not checked out</p>
              </div>

              {/* Requestable Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="requestable"
                  checked={formData.requestable}
                  onCheckedChange={(checked) => handleInputChange('requestable', checked as boolean)}
                />
                <Label htmlFor="requestable" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Requestable
                </Label>
              </div>

              {/* Upload Image */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">Upload Image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image')?.click()}
                  className="w-full text-center bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                >
                  Select File...
                </Button>
                <p className="text-xs text-gray-500">Accepted Filetypes are jpg, webp, png, gif, svg, and avif. The maximum upload size allowed is 25M.</p>
              </div>
            </div>

            {/* Asset Lifecycle & Compliance Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => toggleSection('lifecycle')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.lifecycle ? 'rotate-90' : ''}`} />
                Asset Lifecycle & Compliance
              </button>

              {expandedSections.lifecycle && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Asset Class */}
                    <div className="space-y-2">
                      <Label htmlFor="assetClass" className="text-sm font-medium text-gray-700">Asset Class</Label>
                      <Select value={formData.assetClass} onValueChange={(value) => handleInputChange('assetClass', value)}>
                        <SelectTrigger id="assetClass" className="w-full">
                          <SelectValue placeholder="Select Asset Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laptop">Laptop</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="server">Server</SelectItem>
                          <SelectItem value="atm">ATM</SelectItem>
                          <SelectItem value="pos">POS Terminal</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="tool">Tool</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lifecycle Stage */}
                    <div className="space-y-2">
                      <Label htmlFor="lifecycleStage" className="text-sm font-medium text-gray-700">Lifecycle Stage</Label>
                      <Select value={formData.lifecycleStage} onValueChange={(value) => handleInputChange('lifecycleStage', value)}>
                        <SelectTrigger id="lifecycleStage" className="w-full">
                          <SelectValue placeholder="Select Stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="procurement">Procurement</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="tagged">Tagged</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in-use">In Use</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                      <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger id="department" className="w-full">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">IT Department</SelectItem>
                          <SelectItem value="hr">HR Department</SelectItem>
                          <SelectItem value="ops">Operations</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned To */}
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700">Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={formData.assignedTo}
                        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                        placeholder="Employee name or ID"
                        className="w-full"
                      />
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="text-sm font-medium text-gray-700">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger id="condition" className="w-full">
                          <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Manufacturer */}
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                        placeholder="Manufacturer name"
                        className="w-full"
                      />
                    </div>

                    {/* Next Maintenance Date */}
                    <div className="space-y-2">
                      <Label htmlFor="nextMaintenance" className="text-sm font-medium text-gray-700">Next Maintenance Date</Label>
                      <Input
                        id="nextMaintenance"
                        type="date"
                        value={formData.nextMaintenanceDate}
                        onChange={(e) => handleInputChange('nextMaintenanceDate', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Compliance Status */}
                    <div className="space-y-2">
                      <Label htmlFor="complianceStatus" className="text-sm font-medium text-gray-700">Compliance Status</Label>
                      <Select value={formData.complianceStatus} onValueChange={(value) => handleInputChange('complianceStatus', value)}>
                        <SelectTrigger id="complianceStatus" className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compliant">Compliant</SelectItem>
                          <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                          <SelectItem value="pending-review">Pending Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Audit Status */}
                    <div className="space-y-2">
                      <Label htmlFor="auditStatus" className="text-sm font-medium text-gray-700">Audit Status</Label>
                      <Select value={formData.auditStatus} onValueChange={(value) => handleInputChange('auditStatus', value)}>
                        <SelectTrigger id="auditStatus" className="w-full">
                          <SelectValue placeholder="Select Audit Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="discrepancy">Discrepancy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Risk Registry Link */}
                    <div className="space-y-2">
                      <Label htmlFor="riskRegistry" className="text-sm font-medium text-gray-700">Risk Registry Link</Label>
                      <Input
                        id="riskRegistry"
                        value={formData.riskRegistryLink}
                        onChange={(e) => handleInputChange('riskRegistryLink', e.target.value)}
                        placeholder="Link to risk register entry"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => toggleSection('optional')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.optional ? 'rotate-90' : ''}`} />
                Optional Information
              </button>

              {expandedSections.optional && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="assetName" className="text-sm font-medium text-gray-700">Asset Name</Label>
                      <Input
                        id="assetName"
                        value={formData.assetName}
                        onChange={(e) => handleInputChange('assetName', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warranty" className="text-sm font-medium text-gray-700">Warranty</Label>
                      <div className="flex gap-2">
                        <Input
                          id="warranty"
                          type="number"
                          value={formData.warranty}
                          onChange={(e) => handleInputChange('warranty', e.target.value)}
                          className="flex-1"
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-600 self-center px-3 py-2 bg-gray-100 rounded">months</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedCheckinDate" className="text-sm font-medium text-gray-700">Expected Checkin Date</Label>
                      <Input
                        id="expectedCheckinDate"
                        type="date"
                        value={formData.expectedCheckinDate}
                        onChange={(e) => handleInputChange('expectedCheckinDate', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextAuditDate" className="text-sm font-medium text-gray-700">Next Audit Date</Label>
                      <Input
                        id="nextAuditDate"
                        type="date"
                        value={formData.nextAuditDate}
                        onChange={(e) => handleInputChange('nextAuditDate', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="byod"
                      checked={formData.byod}
                      onCheckedChange={(checked) => handleInputChange('byod', checked as boolean)}
                    />
                    <Label htmlFor="byod" className="text-sm font-medium text-gray-700 cursor-pointer">
                      BYOD
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">This device is owned by the user</p>
                </div>
              )}
            </div>

            {/* Order Related Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => toggleSection('order')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.order ? 'rotate-90' : ''}`} />
                Order Related Information
              </button>

              {expandedSections.order && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber" className="text-sm font-medium text-gray-700">Order Number</Label>
                      <Input
                        id="orderNumber"
                        value={formData.orderNumber}
                        onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate" className="text-sm font-medium text-gray-700">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eolDate" className="text-sm font-medium text-gray-700">EOL Date</Label>
                      <Input
                        id="eolDate"
                        type="date"
                        value={formData.eolDate}
                        onChange={(e) => handleInputChange('eolDate', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplier" className="text-sm font-medium text-gray-700">Supplier</Label>
                      <div className="flex gap-2">
                        <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
                          <SelectTrigger id="supplier" className="flex-1">
                            <SelectValue placeholder="Select a Supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apple">Apple</SelectItem>
                            <SelectItem value="samsung">Samsung</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="button" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                          New
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseCost" className="text-sm font-medium text-gray-700">Purchase Cost</Label>
                    <div className="flex gap-2">
                      <Input
                        id="purchaseCost"
                        type="number"
                        value={formData.purchaseCost}
                        onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
                        className="flex-1"
                        placeholder="0.00"
                      />
                      <span className="text-sm text-gray-600 self-center px-3 py-2 bg-gray-100 rounded">{formData.currency}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Offboarding & Recovery Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => toggleSection('offboarding')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.offboarding ? 'rotate-90' : ''}`} />
                Offboarding & Recovery
              </button>

              {expandedSections.offboarding && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Offboarding Status */}
                    <div className="space-y-2">
                      <Label htmlFor="offboardingStatus" className="text-sm font-medium text-gray-700">Offboarding Status</Label>
                      <Select value={formData.offboardingStatus} onValueChange={(value) => handleInputChange('offboardingStatus', value)}>
                        <SelectTrigger id="offboardingStatus" className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending-return">Pending Return</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Offboarding Date */}
                    <div className="space-y-2">
                      <Label htmlFor="offboardingDate" className="text-sm font-medium text-gray-700">Offboarding Date</Label>
                      <Input
                        id="offboardingDate"
                        type="date"
                        value={formData.offboardingDate}
                        onChange={(e) => handleInputChange('offboardingDate', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Returned Condition */}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="returnedCondition" className="text-sm font-medium text-gray-700">Returned Condition</Label>
                      <Textarea
                        id="returnedCondition"
                        value={formData.returnedCondition}
                        onChange={(e) => handleInputChange('returnedCondition', e.target.value)}
                        placeholder="Document the condition of the asset upon return..."
                        className="w-full min-h-20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Depreciation & Financial Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => toggleSection('depreciation')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.depreciation ? 'rotate-90' : ''}`} />
                Depreciation & Financial
              </button>

              {expandedSections.depreciation && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Depreciation Method */}
                    <div className="space-y-2">
                      <Label htmlFor="depreciationMethod" className="text-sm font-medium text-gray-700">Depreciation Method</Label>
                      <Select value={formData.depreciationMethod} onValueChange={(value) => handleInputChange('depreciationMethod', value)}>
                        <SelectTrigger id="depreciationMethod" className="w-full">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="straight-line">Straight Line</SelectItem>
                          <SelectItem value="accelerated">Accelerated</SelectItem>
                          <SelectItem value="units-of-production">Units of Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Depreciation Rate */}
                    <div className="space-y-2">
                      <Label htmlFor="depreciationRate" className="text-sm font-medium text-gray-700">Annual Depreciation Rate (%)</Label>
                      <Input
                        id="depreciationRate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.depreciationRate}
                        onChange={(e) => handleInputChange('depreciationRate', e.target.value)}
                        placeholder="20"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Select value={formData.purchaseCost} onValueChange={() => {}}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Go to Previous Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">Go to Previous Page</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetFormPage;
