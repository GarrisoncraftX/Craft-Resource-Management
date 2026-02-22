import type { Asset, Category, RequestableItem, MaintenanceRecord, DisposalRecord, AcquisitionRequest, Manufacturer, ValuationRecord, MaintenanceCost, AssetStats, AssetTrend, AssetCategory,  BaseInventoryItem, PredefinedKit, Supplier, StatusLabel, AssetModel, Location, Depreciation, Department, CustomField, Company, MaintenanceReport, DepreciationReport, AssetAudit } from '@/types/javabackendapi/assetTypes';


export const mockRequestableItems: RequestableItem[] = [
  {
    id: '1',
    image: '📱',
    assetTag: '888255196',
    model: 'iPhone 12',
    modelNo: '4708395437118939',
    assetName: 'iPhone-mobile-7046-80cd-c1fe1b84d816',
    serial: 'a0c7f7f84-2d84-8d67-6ecb9c3fbd16',
    location: 'New Nils',
    status: 'deployable',
    expectedCheckinDate: 'Jan 12, 2025',
    cpu: '6GB RAM',
  },
  {
    id: '2',
    image: '📱',
    assetTag: '1654990322',
    model: 'iPhone 11',
    modelNo: '5466429538486827',
    assetName: 'iPhone-mobile-d5efd89b-34ca-8ec3-4888809901c74',
    serial: 'cfe93abdf-0777-34ca-8ec3-4888809015c74',
    location: 'North Derickfort',
    status: 'deployable',
    expectedCheckinDate: 'Mar 5, 2025',
    cpu: '4GB RAM',
  },
  {
    id: '3',
    image: '📱',
    assetTag: '1011481556',
    model: 'iPhone 12',
    modelNo: '4708395437118939',
    assetName: 'iPhone-mobile-dbc819dd-1498-360c-b27c-171be0236689',
    serial: 'dbc819dd-1498-360c-b27c-1b6b26d0236689',
    location: 'Alycefurt',
    status: 'deployable',
    expectedCheckinDate: 'Feb 20, 2025',
    cpu: '6GB RAM',
  },
];

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Gleichner, Runolfsson and Howell',
    email: 'info@company1.com',
    image: '🏢',
    assets: 143,
    licenses: 0,
    accessories: 0,
    components: 0,
  },
  {
    id: '2',
    name: 'Bogan-Lesch',
    email: 'info@bogan.com',
    image: '🏢',
    assets: 137,
    licenses: 0,
    accessories: 0,
    components: 0,
  },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Desktops', image: '💻', type: 'Asset', qty: 90, acceptance: true, useDefaultEULA: false },
  { id: 2, name: 'Office Software', image: '📊', type: 'License', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 3, name: 'Graphics Software', image: '🎨', type: 'License', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 4, name: 'RAM', image: '⚡', type: 'Component', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 5, name: 'HDD/SSD', image: '💾', type: 'Component', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 6, name: 'Printer Ink', image: '🖨️', type: 'Consumable', qty: 1, acceptance: true, useDefaultEULA: false },
  { id: 7, name: 'Printer Paper', image: '📄', type: 'Consumable', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 8, name: 'Mouse', image: '🖱️', type: 'Accessory', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 9, name: 'Keyboards', image: '⌨️', type: 'Accessory', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 10, name: 'Conference Phones', image: '☎️', type: 'Asset', qty: 0, acceptance: true, useDefaultEULA: false },
  { id: 11, name: 'VOIP Phones', image: '📞', type: 'Asset', qty: 70, acceptance: true, useDefaultEULA: false },
  { id: 12, name: 'Displays', image: '🖥️', type: 'Asset', qty: 40, acceptance: true, useDefaultEULA: false },
  { id: 13, name: 'Mobile Phone', image: '📱', type: 'Asset', qty: 67, acceptance: true, useDefaultEULA: false },
  { id: 14, name: 'Tablets', image: '📲', type: 'Asset', qty: 40, acceptance: true, useDefaultEULA: false },
  { id: 15, name: 'Laptops', image: '💻', type: 'Asset', qty: 2290, acceptance: true, useDefaultEULA: true },
  { id: 16, name: 'GSMR', image: '📡', type: 'Asset', qty: 2, acceptance: true, useDefaultEULA: true },
  { id: 17, name: 'Dockstation TBT 3', image: '🔌', type: 'Accessory', qty: 1, acceptance: true, useDefaultEULA: true },
];


export const mockCustomFields: CustomField[] = [
  {
    id: 1,
    name: 'IMEI',
    helpText: 'The IMEI number for this device.',
    format: 'regex:/^[0-9]{15}$/',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'text',
    fieldsets: ['Mobile Devices'],
  },
  {
    id: 2,
    name: 'Phone Number',
    helpText: 'Enter the phone number for this device.',
    format: 'ANY',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'text',
    fieldsets: [],
  },
  {
    id: 3,
    name: 'RAM',
    helpText: 'The amount of RAM this device has.',
    format: 'ANY',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'text',
    fieldsets: ['Laptops and Desktops'],
  },
  {
    id: 4,
    name: 'CPU',
    helpText: 'The speed of the processor on this device',
    format: 'ANY',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: true,
    element: 'text',
    fieldsets: ['Laptops and Desktops'],
  },
  {
    id: 5,
    name: 'MAC Address',
    helpText: 'The MAC address for this device.',
    format: 'regex:/^([0-9a-fA-F]{2}(-|:)?){5}([0-9a-fA-F]{2})$/',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'text',
    fieldsets: ['Laptops and Desktops'],
  },
  {
    id: 6,
    name: 'Test Encrypted',
    helpText: 'This is a sample encrypted field.',
    format: 'ANY',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'text',
    fieldsets: ['Laptops and Desktops', 'Mobile Devices'],
  },
  {
    id: 7,
    name: 'Test Checkbox',
    helpText: 'This is a sample checkbox.',
    format: 'ANY',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'checkbox',
    fieldsets: ['Laptops and Desktops', 'Mobile Devices'],
  },
  {
    id: 8,
    name: 'Test Radio',
    helpText: 'This is a sample radio.',
    format: 'ANY',
    isSortable: false,
    isSearchable: false,
    isFilterable: false,
    isRequired: false,
    isListColumn: false,
    element: 'radio',
    fieldsets: ['Laptops and Desktops', 'Mobile Devices'],
  },
];

export const mockStatusLabels: StatusLabel[] = [
  { id: 1, name: 'Broken - Not Fixable', statusType: 'Undeployable', assets: 0, chartColor: '🔴', showInSideNav: false, defaultLabel: false },
  { id: 2, name: 'Ready to Deploy', statusType: 'Deployable', assets: 2499, chartColor: '🟢', showInSideNav: true, defaultLabel: true },
  { id: 3, name: 'Archived', statusType: 'Archived', assets: 50, chartColor: '🔲', showInSideNav: false, defaultLabel: false },
  { id: 4, name: 'Broken', statusType: 'Undeployable', assets: 0, chartColor: '🔴', showInSideNav: false, defaultLabel: false },
  { id: 5, name: 'Pending', statusType: 'Pending', assets: 50, chartColor: '🟠', showInSideNav: true, defaultLabel: false },
  { id: 6, name: 'Deployed', statusType: 'Undeployable', assets: 0, chartColor: '🔴', showInSideNav: false, defaultLabel: false },
  { id: 7, name: 'Undeployable', statusType: 'Undeployable', assets: 0, chartColor: '🔴', showInSideNav: false, defaultLabel: false },
];

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Human Resources',
    image: '👥',
    manager: 'East Harley',
    location: 'East Harley',
    assets: 333,
  },
  {
    id: '2',
    name: 'Engineering',
    image: '⚙️',
    manager: 'East Luigtown',
    location: 'East Luigtown',
    assets: 344,
  },
  {
    id: '3',
    name: 'Marketing',
    image: '📊',
    manager: 'East Luigtown',
    location: 'East Luigtown',
    assets: 320,
  },
  {
    id: '4',
    name: 'Client Services',
    image: '💼',
    manager: 'Hodkiewiczfurt',
    location: 'Hodkiewiczfurt',
    assets: 316,
  },
  {
    id: '5',
    name: 'Product Management',
    image: '📦',
    manager: 'Lake Neldamouth',
    location: 'Lake Neldamouth',
    assets: 352,
  },
  {
    id: '6',
    name: 'Dept of Silly Walks',
    image: '🚶',
    manager: 'Jarvisfurt',
    location: 'Jarvisfurt',
    assets: 344,
  },
];

export const mockDepreciations: Depreciation[] = [
  { id: 1, name: 'Computer Depreciation', term: '36 months', floorValue: 0, assets: 2530, assetModels: 15, licenses: 0 },
  { id: 2, name: 'Display Depreciation', term: '12 months', floorValue: 0, assets: 40, assetModels: 2, licenses: 0 },
  { id: 3, name: 'Furniture Depreciation', term: '24 months', floorValue: 0, assets: 27, assetModels: 1, licenses: 0 },
];

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Joaniefurt',
    image: '📍',
    parent: '0',
    assets: 259,
    licenses: 14,
    accessories: 0,
    components: 0,
    address: '23931 Stamm Locks',
    city: 'Waterston',
    state: 'AL',
  },
  {
    id: '2',
    name: 'Port Kian',
    image: '📍',
    parent: '0',
    assets: 250,
    licenses: 12,
    accessories: 1,
    components: 0,
    address: '562 Rowena Coves Apt. 290',
    city: 'Ryanville',
    state: 'WY',
  },
];

export const mockModels: AssetModel[] = [
  {
    id: '1',
    name: 'Macbook Air',
    image: '💻',
    modelNo: '5575783075815347',
    minQty: 0,
    assets: 50,
    assigned: 8,
    remaining: 42,
    archived: 0,
    category: 'Laptops',
    eolRate: '36 months',
    fieldset: 'Mobile Devices',
  },
  {
    id: '2',
    name: 'Ultrasharp U2415',
    image: '🖥️',
    modelNo: '2395597366246282',
    minQty: 0,
    assets: 20,
    assigned: 7,
    remaining: 13,
    archived: 0,
    category: 'Displays',
    eolRate: '12 months',
    fieldset: 'Mobile Devices',
  },
  {
    id: '3',
    name: 'iPhone 12',
    image: '📱',
    modelNo: '4708395437118939',
    minQty: 0,
    assets: 40,
    assigned: 3,
    remaining: 37,
    archived: 0,
    category: 'Mobile Phone',
    eolRate: '12 months',
    fieldset: 'Laptops and Desktops',
  },
];

export const mockManufacturers: Manufacturer[] = [
  {
    id: '1',
    name: 'Apple',
    image: '🍎',
    url: 'https://apple.com',
    supportUrl: 'https://support.apple.com',
    supportPhone: '248-422-9948',
    supportEmail: 'wcremin@example.org',
    assets: 177,
    licenses: 0,
    accessories: 0,
  },
  {
    id: '2',
    name: 'Microsoft',
    image: '◻️',
    url: 'https://microsoft.com',
    supportUrl: 'https://support.microsoft.com',
    supportPhone: '435-917-2052',
    supportEmail: 'gardner.wissoky@example.org',
    assets: 50,
    licenses: 1,
    accessories: 0,
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Rode, Orn and Keeling',
    image: '511',
    url: 'https://hickle.org/dolorum-rerum-natus-autem-ad-molltia.html',
    assets: 1,
    components: 2,
    licenses: 0,
    accessories: 0,
    address: '148 Upton Drives',
    city: 'Lake Sadychester',
    state: 'CT',
  },
  {
    id: '2',
    name: 'Bernhard LLC',
    image: '531',
    url: 'https://www.franecki.com/recusandae-eveniet-nisi-repudiandae-expedita-accusamus',
    assets: 1,
    components: 0,
    licenses: 0,
    accessories: 0,
    address: '9906 West Landing Suite 403',
    city: 'Lake Jenachester',
    state: 'KS',
  },
];

export const mockAssets: Asset[] = [
  {
    id: 1,
    assetTag: 'AST001',
    assetName: 'Dell Laptop OptiPlex 7090',
    description: 'IT Equipment',
    location: 'IT Department',
    status: 'Ready to Deploy',
    purchaseDate: '2023-06-15',
    purchaseCost: '1200',
    currentValue: 1100,
    model: 'OptiPlex 7090',
    serial: 'DL001',
    company: '1',
    manufacturer: '2'
  },
  {
    id: 2,
    assetTag: 'AST002',
    assetName: 'Conference Room Table',
    description: 'Furniture',
    location: 'Meeting Room A',
    status: 'Deployed',
    purchaseDate: '2022-03-20',
    purchaseCost: '800',
    currentValue: 650,
    model: 'Conference Table',
    serial: 'CT002',
    company: '1'
  },
  {
    id: 3,
    assetTag: 'AST003',
    assetName: 'Industrial Printer HP LaserJet',
    description: 'Office Equipment',
    location: 'Admin Office',
    status: 'Pending',
    purchaseDate: '2023-01-10',
    purchaseCost: '1500',
    currentValue: 1200,
    model: 'LaserJet Pro',
    serial: 'HP003',
    company: '2',
    manufacturer: '2'
  },
  {
    id: 4,
    assetTag: 'AST004',
    assetName: 'Server Rack Dell PowerEdge',
    description: 'IT Infrastructure',
    location: 'Server Room',
    status: 'Deployed',
    purchaseDate: '2023-08-20',
    purchaseCost: '5000',
    currentValue: 4200,
    model: 'PowerEdge R740',
    serial: 'SR004',
    company: '1',
    manufacturer: '2'
  },
  {
    id: 5,
    assetTag: 'AST005',
    assetName: 'Vehicle - Toyota Camry',
    description: 'Transportation',
    location: 'Parking Lot A',
    status: 'Archived',
    purchaseDate: '2022-11-10',
    purchaseCost: '25000',
    currentValue: 18000,
    model: 'Camry 2022',
    serial: 'TC005',
    company: '2'
  }
];

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    asset: 'Generator',
    type: 'Inspection',
    maintenanceDate: '2024-02-05',
    performedBy: 'Power Systems',
    status: 'Scheduled',
    description: 'Routine inspection'
  },
  {
    id: 2,
    asset: 'AC Unit',
    type: 'Repair',
    maintenanceDate: '2024-01-25',
    performedBy: 'HVAC Services',
    status: 'In Progress',
    description: 'Cooling system repair'
  },
  {
    id: 3,
    asset: 'Dell Laptop OptiPlex 7090',
    type: 'Preventive',
    maintenanceDate: '2024-02-10',
    performedBy: 'IT Support',
    status: 'Completed',
    description: 'Software updates and hardware check'
  }
];

export const mockDisposalRecords: DisposalRecord[] = [
  {
    id: 1,
    asset: 'Old Printer',
    method: 'Auction',
    disposalDate: '2024-01-28',
    status: 'Pending Approval',
    proceeds: 0
  },
  {
    id: 2,
    asset: 'Damaged Chair',
    method: 'Scrap',
    disposalDate: '2024-01-18',
    status: 'Completed',
    proceeds: 10
  },
  {
    id: 3,
    asset: 'Old Server Equipment',
    method: 'Recycling',
    disposalDate: '2024-02-01',
    status: 'In Progress',
    proceeds: 150
  }
];

export const mockAcquisitionRequests: AcquisitionRequest[] = [
  {
    id: 'AQ-001',
    item: 'Laptops (10)',
    department: 'IT',
    amount: 15000,
    status: 'Pending',
    requestedBy: 'John Tech',
    date: '2024-01-20',
    priority: 'High',
    justification: 'Replacement for outdated equipment'
  },
  {
    id: 'AQ-002',
    item: 'Office Chairs (25)',
    department: 'HR',
    amount: 3750,
    status: 'Approved',
    requestedBy: 'Jane HR',
    date: '2024-01-22',
    priority: 'Medium',
    justification: 'Ergonomic upgrade for staff comfort'
  },
  {
    id: 'AQ-003',
    item: 'Network Equipment',
    department: 'IT',
    amount: 8500,
    status: 'Completed',
    requestedBy: 'Mike Network',
    date: '2024-01-15',
    priority: 'High',
    justification: 'Infrastructure upgrade for better connectivity'
  }
];

export const mockValuationRecords: ValuationRecord[] = [
  {
    id: 1,
    assetId: 1,
    assetName: 'Dell Laptop OptiPlex 7090',
    previousValue: 1200,
    currentValue: 1100,
    valuationDate: '2024-01-15',
    valuationMethod: 'Depreciation',
    valuedBy: 'Asset Manager',
    notes: 'Standard depreciation applied'
  },
  {
    id: 2,
    assetId: 4,
    assetName: 'Server Rack Dell PowerEdge',
    previousValue: 4500,
    currentValue: 4200,
    valuationDate: '2024-01-20',
    valuationMethod: 'Market Value',
    valuedBy: 'External Appraiser',
    notes: 'Market assessment based on current technology standards'
  }
];

export const mockAssetStats: AssetStats = {
  totalAssets: mockAssets.length,
  activeAssets: mockAssets.filter(a => a.status === 'Active').length,
  maintenanceAssets: mockAssets.filter(a => a.status === 'Maintenance').length,
  disposedAssets: mockDisposalRecords.filter(d => d.status === 'Completed').length,
  totalValue: mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
  depreciationRate: 8.5
};

// Chart data for asset analytics
export const mockAssetsByCategory: AssetCategory[] = [
  { category: 'IT Equipment', count: 15, value: 18500 },
  { category: 'Furniture', count: 25, value: 12000 },
  { category: 'Vehicles', count: 8, value: 145000 },
  { category: 'Machinery', count: 12, value: 85000 },
  { category: 'Office Equipment', count: 18, value: 22000 }
];

export const mockAssetTrends: AssetTrend[] = [
  { month: 'Jan', acquisitions: 12, disposals: 3, value: 285000 },
  { month: 'Feb', acquisitions: 8, disposals: 5, value: 287000 },
  { month: 'Mar', acquisitions: 15, disposals: 2, value: 295000 },
  { month: 'Apr', acquisitions: 10, disposals: 4, value: 298000 },
  { month: 'May', acquisitions: 18, disposals: 6, value: 305000 },
  { month: 'Jun', acquisitions: 14, disposals: 3, value: 312000 }
];

export const mockMaintenanceCosts: MaintenanceCost[] = [
  { month: 'Jan', preventive: 2500, corrective: 1800, emergency: 500 },
  { month: 'Feb', preventive: 2200, corrective: 2100, emergency: 800 },
  { month: 'Mar', preventive: 2800, corrective: 1500, emergency: 300 },
  { month: 'Apr', preventive: 2600, corrective: 1900, emergency: 600 },
  { month: 'May', preventive: 3000, corrective: 1700, emergency: 400 },
  { month: 'Jun', preventive: 2900, corrective: 2000, emergency: 700 }
];

export const mockPeople = [
  { id: 1, firstName: 'John', lastName: 'Doe', name: 'John Doe', email: 'john.doe@company.com', employeeNumber: 'EMP001', title: 'Software Engineer', department: 'IT', location: 'New York', assets: 2, licenses: 3, role: 'Employee', isAdmin: false, isDeleted: false, loginEnabled: true, lastLogin: '2024-01-15 10:30 AM', createdAt: '2023-01-10', updatedAt: '2024-01-15' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', email: 'jane.smith@company.com', employeeNumber: 'EMP002', title: 'HR Manager', department: 'Human Resources', location: 'San Francisco', assets: 1, licenses: 5, role: 'Admin', isAdmin: true, isDeleted: false, loginEnabled: true, lastLogin: '2024-01-14 2:15 PM', createdAt: '2022-06-15', updatedAt: '2024-01-14' },
  { id: 3, firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson', email: 'mike.johnson@company.com', employeeNumber: 'EMP003', title: 'Finance Analyst', department: 'Finance', location: 'Chicago', assets: 1, licenses: 2, role: 'Employee', isAdmin: false, isDeleted: false, loginEnabled: false, lastLogin: '2024-01-10 9:00 AM', createdAt: '2023-03-20', updatedAt: '2024-01-10' },
  { id: 4, firstName: 'Sarah', lastName: 'Williams', name: 'Sarah Williams', email: 'sarah.williams@company.com', employeeNumber: 'EMP004', title: 'Marketing Director', department: 'Marketing', location: 'Los Angeles', assets: 3, licenses: 4, role: 'Admin', isAdmin: true, isDeleted: false, loginEnabled: true, lastLogin: '2024-01-15 11:45 AM', createdAt: '2022-09-01', updatedAt: '2024-01-15' },
  { id: 5, firstName: 'Robert', lastName: 'Brown', name: 'Robert Brown', email: 'robert.brown@company.com', employeeNumber: 'EMP005', title: 'Sales Representative', department: 'Sales', location: 'Boston', assets: 2, licenses: 2, role: 'Employee', isAdmin: false, isDeleted: true, loginEnabled: false, lastLogin: '2023-12-20 3:30 PM', createdAt: '2023-05-10', updatedAt: '2023-12-20' }
];

export const mockLicenses = [
  { id: 1, name: 'Photoshop', productKey: '0281cda-...', expirationDate: '—', licensedToEmail: 'vsteuber@example.net', licensedTo: 'Adobe', manufacturer: 'Adobe', minQty: 10, total: 10, avail: 10 },
  { id: 2, name: 'InDesign', productKey: '0c700f45-...', expirationDate: '—', licensedToEmail: 'liza65@example.com', licensedTo: 'Adobe', manufacturer: 'Adobe', minQty: 10, total: 10, avail: 8 },
  { id: 3, name: 'Acrobat', productKey: '644532b9-...', expirationDate: '—', licensedToEmail: 'bquitzon@example.com', licensedTo: 'Adobe', manufacturer: 'Adobe', minQty: 10, total: 10, avail: 10 },
  { id: 4, name: 'Office', productKey: '07be4282-...', expirationDate: '—', licensedToEmail: 'zakary.wunsch@example.com', licensedTo: 'Microsoft', manufacturer: 'Microsoft', minQty: 20, total: 20, avail: 15 }
];

export const mockAccessories: BaseInventoryItem[] = [
  { id: 1, name: 'USB-C Cable', category: 'Cables', modelNo: 'USB-C-100', location: 'Storage Room A', minQty: 20, total: 50, avail: 35, checkedOut: 15, unitCost: 15, manufacturer: 'Anker', supplier: 'Tech Supply Co' },
  { id: 2, name: 'Wireless Mouse', category: 'Peripherals', modelNo: 'WM-500', location: 'IT Department', minQty: 10, total: 30, avail: 22, checkedOut: 8, unitCost: 25, manufacturer: 'Logitech', supplier: 'Office Depot' }
];

export const mockConsumables: BaseInventoryItem[] = [
  { id: 1, category: 'Office Supplies', modelNo: 'INK-BK-500', itemNo: 'CONS-001', location: 'Supply Closet', minQty: 10, total: 50, remaining: 32, unitCost: 45, manufacturer: 'HP', supplier: 'Staples' },
  { id: 2, category: 'Cleaning', modelNo: 'CLN-WIPE-100', itemNo: 'CONS-002', location: 'Janitorial', minQty: 20, total: 100, remaining: 75, unitCost: 12, manufacturer: 'Clorox', supplier: 'Amazon Business' }
];

export const mockComponents: BaseInventoryItem[] = [
  { id: 1, name: 'RAM Module 16GB', category: 'Memory', modelNo: 'DDR4-16GB', serial: 'RAM123456', location: 'IT Storage', minQty: 5, total: 20, remaining: 14, unitCost: 85, manufacturer: 'Crucial', supplier: 'Newegg' },
  { id: 2, name: 'SSD 1TB', category: 'Storage', modelNo: 'SSD-1TB-NVMe', serial: 'SSD789012', location: 'IT Storage', minQty: 3, total: 15, remaining: 10, unitCost: 120, manufacturer: 'Samsung', supplier: 'B&H Photo' }
];

export const mockPredefinedKits: PredefinedKit[] = [
  { id: 1, name: 'New Employee Starter Kit', createdBy: 'Admin', createdAt: '2023-05-10', updatedAt: '2024-01-15' },
  { id: 2, name: 'Remote Worker Package', createdBy: 'IT Manager', createdAt: '2023-08-20', updatedAt: '2024-01-10' },
  { id: 3, name: 'Developer Workstation', createdBy: 'Tech Lead', createdAt: '2023-11-05', updatedAt: '2024-01-12' }
];

export const mockMaintenanceReports: MaintenanceReport[] = [
  { id: 1, company: 'Bogan-Lesch', assetTag: 'AST001', assetName: 'Dell Laptop OptiPlex 7090', supplier: 'Bernhard LLC', assetMaintenanceType: 'Preventive', title: 'Software Update', startDate: '2024-01-15', completionDate: '2024-01-16', assetMaintenanceTime: 1, cost: 150, location: 'IT Department', defaultLocation: 'IT Department', warranty: '2025-06-15', createdBy: 'John Tech', notes: 'Routine maintenance' },
  { id: 2, company: 'Gleichner, Runolfsson and Howell', assetTag: 'AST003', assetName: 'Industrial Printer HP LaserJet', supplier: 'Rode, Orn and Keeling', assetMaintenanceType: 'Corrective', title: 'Printer Repair', startDate: '2024-01-20', completionDate: '2024-01-22', assetMaintenanceTime: 2, cost: 350, location: 'Admin Office', defaultLocation: 'Admin Office', warranty: '2024-12-10', createdBy: 'Jane Admin', notes: 'Fixed paper jam issue' },
  { id: 3, company: 'Bogan-Lesch', assetTag: 'AST004', assetName: 'Server Rack Dell PowerEdge', supplier: 'Bernhard LLC', assetMaintenanceType: 'Inspection', title: 'Server Health Check', startDate: '2024-02-01', completionDate: '2024-02-01', assetMaintenanceTime: 0, cost: 200, location: 'Server Room', defaultLocation: 'Server Room', warranty: '2026-08-20', createdBy: 'Mike Network', notes: 'All systems operational' },
];

export const mockDepreciationReports: DepreciationReport[] = [
  { id: 1, company: 'Bogan-Lesch', category: 'Laptops', assetTag: 'AST001', model: 'OptiPlex 7090', modelNo: 'OPT7090', serial: 'SN123456', depreciation: 'Computer Depreciation', numberOfMonths: 36, status: 'Active', checkedOut: 'John Doe', location: 'IT Department', manufacturer: 'Dell', supplier: 'Bernhard LLC', purchaseDate: '2023-06-15', currency: 'USD', purchaseCost: 1200, orderNumber: 'PO-2023-001', eol: '2026-06-15', currentValue: 1100, monthlyDepreciation: 33.33, diff: 100, warrantyExpires: '2025-06-15' },
  { id: 2, company: 'Gleichner, Runolfsson and Howell', category: 'Displays', assetTag: 'AST006', model: 'Ultrasharp U2415', modelNo: 'U2415', serial: 'SN789012', depreciation: 'Display Depreciation', numberOfMonths: 12, status: 'Active', checkedOut: 'Jane Smith', location: 'Marketing', manufacturer: 'Dell', supplier: 'Rode, Orn and Keeling', purchaseDate: '2023-08-10', currency: 'USD', purchaseCost: 450, orderNumber: 'PO-2023-045', eol: '2025-08-10', currentValue: 380, monthlyDepreciation: 37.5, diff: 70, warrantyExpires: '2024-08-10' },
  { id: 3, company: 'Bogan-Lesch', category: 'Mobile Phone', assetTag: 'AST007', model: 'iPhone 12', modelNo: 'A2172', serial: 'SN345678', depreciation: 'Computer Depreciation', numberOfMonths: 36, status: 'Active', checkedOut: 'Mike Johnson', location: 'Sales', manufacturer: 'Apple', supplier: 'Bernhard LLC', purchaseDate: '2023-03-20', currency: 'USD', purchaseCost: 999, orderNumber: 'PO-2023-012', eol: '2026-03-20', currentValue: 750, monthlyDepreciation: 27.75, diff: 249, warrantyExpires: '2024-03-20' },
];

export const mockActivities = [
  { id: 1, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'UPDATE', item: 'GSMR Handy #GSMR - GSMR', target: '' },
  { id: 2, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'CHECKOUT', item: '#205390976 - Macbook Pro 13"', target: '📍 Gerlachbury' },
  { id: 3, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'CHECKOUT', item: '#1460542631 - Macbook Pro 13"', target: '📍 Gerlachbury' },
  { id: 4, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'CHECKOUT', item: '#247822320 - Macbook Pro 13"', target: '📍 Gerlachbury' },
  { id: 5, date: 'Tue Feb 17, 2026 6:35AM', createdBy: 'Admin User', action: 'AUDIT', item: '#444620233 - iPhone 12', target: '' },
];

export const mockDashboardLocations = [
  { name: 'NL Leipzig', count: 2, assigned: 0 },
  { name: 'Damarisstad', count: 251, assigned: 0 },
  { name: 'Huelsborough', count: 236, assigned: 12 },
  { name: 'New Nils', count: 262, assigned: 12 },
  { name: 'North Derickfort', count: 231, assigned: 9 },
  { name: 'Gerlachbury', count: 289, assigned: 15 },
  { name: 'Port Elsie', count: 266, assigned: 11 },
  { name: 'Allanport', count: 261, assigned: 12 },
];

export const mockAssetAudits: AssetAudit[] = [
  {
    id: 1,
    assetId: 1,
    auditedBy: 1,
    auditDate: new Date().toISOString(),
    locationId: 7,
    updateAssetLocation: true,
    nextAuditDate: '2027-02-23',
    notes: 'Sample audit record',
    status: 'submitted',
    images: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assetTag: 'AST001',
    assetName: 'Dell Laptop OptiPlex 7090',
    modelName: 'OptiPlex 7090',
    locationName: 'UNILAK Kigali Main Campus'
  }
];