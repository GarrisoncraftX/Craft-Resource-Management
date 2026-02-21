'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assetApiService } from '@/services/api/assetApiService';
import { Loader2, Search } from 'lucide-react';

interface AuditLog {
  id: number;
  createdBy: string;
  item: string;
  location: string;
  lastAudit: string;
  nextAuditDate: string;
  daysToNextAudit: number;
  notes: string;
}

export const AuditReport: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAuditLogs = async () => {
      if (!assetId) {
        setLoading(false);
        return;
      }

      try {
        const logs = await assetApiService.getAssetAuditLog(assetId);
        setAuditLogs(logs);
        setFilteredLogs(logs);
      } catch (error) {
        console.error('[v0] Failed to load audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [assetId]);

  useEffect(() => {
    const filtered = auditLogs.filter((log) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.createdBy.toLowerCase().includes(searchLower) ||
        log.item.toLowerCase().includes(searchLower) ||
        log.location.toLowerCase().includes(searchLower) ||
        log.notes.toLowerCase().includes(searchLower)
      );
    });
    setFilteredLogs(filtered);
  }, [searchTerm, auditLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Report</h2>

      {/* Search Input */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Audit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Next Audit Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days to Next Audit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{log.createdBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.item}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.lastAudit}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.nextAuditDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.daysToNextAudit}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
