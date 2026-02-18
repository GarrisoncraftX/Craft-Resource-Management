import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Eye, Pencil, Trash2, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchEmployees } from '@/services/api';
import type { Person } from '@/types/javabackendapi/assetTypes';
import { mockPeople } from '@/services/mockData/assets';

export const PeopleView: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(mockPeople);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const filter = params.get('filter');
    if (filter) setActiveFilter(filter);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const employees = await fetchEmployees();
        if (!cancelled && Array.isArray(employees) && employees.length > 0) {
          const mapped: Person[] = employees.map((emp) => ({
            id: emp.id,
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A',
            email: emp.email || '',
            employeeNumber: emp.employeeNumber || emp.id?.toString(),
            title: emp.jobTitle || emp.title,
            department: emp.department?.name || emp.departmentName,
            location: emp.location?.name || emp.locationName,
            role: emp.role?.name || emp.roleName || 'Employee',
            isAdmin: emp.role?.name === 'Admin' || emp.roleName === 'Admin',
            isDeleted: emp.isActive === 0 || emp.status === 'Inactive',
            loginEnabled: emp.isActive === 1,
            lastLogin: emp.lastLogin,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt,
            assets: 0,
            licenses: 0
          }));
          setPeople(mapped);
        }
      } catch (err) {
        console.warn('Failed to fetch employees, using mock data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPeople = (() => {
    switch (activeFilter) {
      case 'admin-users':
        return people.filter(p => p.isAdmin);
      case 'asset-personnel':
        return people.filter(p => !p.isAdmin && !p.isDeleted);
      case 'deleted-users':
        return people.filter(p => p.isDeleted);
      default:
        return people;
    }
  })();

  const columns: ColumnDef<Person>[] = [
    { key: 'id', header: 'ID', accessor: (r) => r.id, defaultVisible: false },
    { key: 'avatar', header: 'Avatar', accessor: (r) => <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div>, defaultVisible: true },
    { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span>, defaultVisible: true },
    { key: 'firstName', header: 'First Name', accessor: (r) => r.firstName, defaultVisible: false },
    { key: 'lastName', header: 'Last Name', accessor: (r) => r.lastName, defaultVisible: false },
    { key: 'displayName', header: 'Display Name', accessor: (r) => r.displayName || '-', defaultVisible: false },
    { key: 'company', header: 'Company', accessor: (r) => r.company || '-', defaultVisible: false },
    { key: 'employeeNumber', header: 'Employee Number', accessor: (r) => r.employeeNumber || '-', defaultVisible: true },
    { key: 'title', header: 'Title', accessor: (r) => r.title || '-', defaultVisible: true },
    { key: 'vipUser', header: 'VIP user', accessor: (r) => r.vipUser ? 'Yes' : 'No', defaultVisible: false },
    { key: 'remote', header: 'Remote', accessor: (r) => r.remote ? 'Yes' : 'No', defaultVisible: false },
    { key: 'email', header: 'Email', accessor: (r) => <span className="text-sky-600 hover:underline cursor-pointer">{r.email}</span>, defaultVisible: true },
    { key: 'phone', header: 'Phone', accessor: (r) => r.phone || '-', defaultVisible: false },
    { key: 'mobile', header: 'Mobile', accessor: (r) => r.mobile || '-', defaultVisible: false },
    { key: 'website', header: 'Website', accessor: (r) => r.website || '-', defaultVisible: false },
    { key: 'address', header: 'Address', accessor: (r) => r.address || '-', defaultVisible: false },
    { key: 'city', header: 'City', accessor: (r) => r.city || '-', defaultVisible: false },
    { key: 'state', header: 'State', accessor: (r) => r.state || '-', defaultVisible: false },
    { key: 'country', header: 'Country', accessor: (r) => r.country || '-', defaultVisible: false },
    { key: 'zip', header: 'Zip', accessor: (r) => r.zip || '-', defaultVisible: false },
    { key: 'language', header: 'Language', accessor: (r) => r.language || '-', defaultVisible: false },
    { key: 'department', header: 'Department', accessor: (r) => r.department || '-', defaultVisible: true },
    { key: 'departmentManager', header: 'Department Manager', accessor: (r) => r.departmentManager || '-', defaultVisible: false },
    { key: 'location', header: 'Location', accessor: (r) => r.location || '-', defaultVisible: true },
    { key: 'manager', header: 'Manager', accessor: (r) => r.manager || '-', defaultVisible: false },
    { key: 'assets', header: 'Assets', accessor: (r) => r.assets || 0, defaultVisible: true },
    { key: 'licenses', header: 'Licenses', accessor: (r) => r.licenses || 0, defaultVisible: true },
    { key: 'consumables', header: 'Consumables', accessor: (r) => r.consumables || 0, defaultVisible: false },
    { key: 'accessories', header: 'Accessories', accessor: (r) => r.accessories || 0, defaultVisible: false },
    { key: 'managedUsers', header: 'Managed Users', accessor: (r) => r.managedUsers || 0, defaultVisible: false },
    { key: 'managedLocations', header: 'Managed Locations', accessor: (r) => r.managedLocations || 0, defaultVisible: false },
    { key: 'notes', header: 'Notes', accessor: (r) => r.notes || '-', defaultVisible: false },
    { key: 'groups', header: 'Groups', accessor: (r) => r.groups || '-', defaultVisible: false },
    { key: 'ldapEnabled', header: 'LDAP enabled', accessor: (r) => r.ldapEnabled ? 'Yes' : 'No', defaultVisible: false },
    { key: 'twoFADeviceEnrolled', header: '2FA Device Enrolled', accessor: (r) => r.twoFADeviceEnrolled ? 'Yes' : 'No', defaultVisible: false },
    { key: 'twoFAActive', header: '2FA Active', accessor: (r) => r.twoFAActive ? 'Yes' : 'No', defaultVisible: false },
    { key: 'loginEnabled', header: 'Login Enabled', accessor: (r) => r.loginEnabled ? 'Yes' : 'No', defaultVisible: false },
    { key: 'autoAssignLicenses', header: 'Auto-Assign Licenses', accessor: (r) => r.autoAssignLicenses ? 'Yes' : 'No', defaultVisible: false },
    { key: 'createdBy', header: 'Created By', accessor: (r) => r.createdBy || '-', defaultVisible: false },
    { key: 'createdAt', header: 'Created At', accessor: (r) => r.createdAt || '-', defaultVisible: false },
    { key: 'updatedAt', header: 'Updated At', accessor: (r) => r.updatedAt || '-', defaultVisible: false },
    { key: 'startDate', header: 'Start Date', accessor: (r) => r.startDate || '-', defaultVisible: false },
    { key: 'endDate', header: 'End Date', accessor: (r) => r.endDate || '-', defaultVisible: false },
    { key: 'lastLogin', header: 'Last Login', accessor: (r) => r.lastLogin || '-', defaultVisible: false },
  ];

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-3xl lg:text-2xl sm:text-sm font-bold tracking-tight">People</h1>
          </div>
        </div>

        <AssetDataTable
          data={filteredPeople}
          columns={columns}
          viewType="people"
          actions={(row) => (
            <>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>View Person</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit Person</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Delete Person</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        />
      </div>
    </div>
  );
};
