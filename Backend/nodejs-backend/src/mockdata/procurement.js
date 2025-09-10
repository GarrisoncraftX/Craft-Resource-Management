// Mock data for procurement management
const mockVendors = [
  {
    id: "V_001",
    name: "ABC Supplies Ltd",
    contact_person: "John Smith",
    email: "john@abcsupplies.com",
    phone: "+231-555-0101",
    address: "123 Business St, Monrovia, Liberia",
    category: "Office Supplies",
    tax_id: "TAX123456",
    registration_number: "REG789012",
    status: "active",
    created_at: "2023-01-15T10:00:00Z",
  },
  {
    id: "V_002",
    name: "Tech Solutions Inc",
    contact_person: "Sarah Johnson",
    email: "sarah@techsolutions.com",
    phone: "+231-555-0102",
    address: "456 Technology Ave, Monrovia, Liberia",
    category: "IT Equipment",
    tax_id: "TAX234567",
    registration_number: "REG890123",
    status: "active",
    created_at: "2023-02-20T14:30:00Z",
  },
  {
    id: "V_003",
    name: "Construction Masters",
    contact_person: "Michael Brown",
    email: "michael@constructionmasters.com",
    phone: "+231-555-0103",
    address: "789 Builder Rd, Monrovia, Liberia",
    category: "Construction",
    tax_id: "TAX345678",
    registration_number: "REG901234",
    status: "active",
    created_at: "2023-03-10T09:15:00Z",
  },
]

const mockProcurementRequests = [
  {
    id: "PR_001",
    title: "Office Supplies for Q1 2024",
    description: "Stationery, paper, and basic office materials for the first quarter",
    estimated_amount: 5000.0,
    department_id: 1,
    requested_by: "550e8400-e29b-41d4-a716-446655440000",
    priority: "medium",
    status: "pending",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    department_name: "Human Resources",
    first_name: "John",
    last_name: "Doe",
    employee_id: "EMP001",
  },
  {
    id: "PR_002",
    title: "IT Equipment Upgrade",
    description: "Laptops, monitors, and networking equipment for IT department",
    estimated_amount: 25000.0,
    department_id: 2,
    requested_by: "550e8400-e29b-41d4-a716-446655440001",
    priority: "high",
    status: "approved",
    created_at: "2024-01-14T14:30:00Z",
    updated_at: "2024-01-16T09:45:00Z",
    department_name: "Finance",
    first_name: "Jane",
    last_name: "Smith",
    employee_id: "EMP002",
  },
  {
    id: "PR_003",
    title: "Vehicle Maintenance Services",
    description: "Quarterly maintenance for government fleet vehicles",
    estimated_amount: 8000.0,
    department_id: 7,
    requested_by: "550e8400-e29b-41d4-a716-446655440002",
    priority: "medium",
    status: "draft",
    created_at: "2024-01-18T11:20:00Z",
    updated_at: "2024-01-18T11:20:00Z",
    department_name: "Transportation",
    first_name: "Michael",
    last_name: "Johnson",
    employee_id: "EMP003",
  },
]

const mockProcurementItems = [
  {
    id: "PRI_001_1",
    request_id: "PR_001",
    item_name: "A4 Paper",
    description: "White A4 copy paper, 80gsm",
    quantity: 100,
    unit_price: 5.0,
    total_price: 500.0,
    specifications: "80gsm, white, standard size",
  },
  {
    id: "PRI_001_2",
    request_id: "PR_001",
    item_name: "Ballpoint Pens",
    description: "Blue ink ballpoint pens",
    quantity: 200,
    unit_price: 0.5,
    total_price: 100.0,
    specifications: "Blue ink, medium tip",
  },
  {
    id: "PRI_002_1",
    request_id: "PR_002",
    item_name: "Laptop Computers",
    description: "Business laptops with Windows 11",
    quantity: 10,
    unit_price: 800.0,
    total_price: 8000.0,
    specifications: "Intel i5, 8GB RAM, 256GB SSD, Windows 11",
  },
  {
    id: "PRI_002_2",
    request_id: "PR_002",
    item_name: "External Monitors",
    description: "24-inch LED monitors",
    quantity: 10,
    unit_price: 200.0,
    total_price: 2000.0,
    specifications: "24-inch, 1920x1080, LED backlight",
  },
]

const mockTenders = [
  {
    id: "T_001",
    title: "Construction Services for New Office Building",
    description: "Design and construction of a new 3-story office building",
    tender_type: "construction",
    estimated_value: 500000.0,
    submission_deadline: "2024-03-01T23:59:59Z",
    opening_date: "2024-03-02T10:00:00Z",
    status: "open",
    created_by: "550e8400-e29b-41d4-a716-446655440000",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "T_002",
    title: "Annual IT Support Services",
    description: "Comprehensive IT support and maintenance services",
    tender_type: "services",
    estimated_value: 75000.0,
    submission_deadline: "2024-02-15T23:59:59Z",
    opening_date: "2024-02-16T14:00:00Z",
    status: "closed",
    created_by: "550e8400-e29b-41d4-a716-446655440001",
    created_at: "2024-01-10T09:30:00Z",
  },
]

const getVendors = (filters = {}) => {
  let vendors = [...mockVendors]

  if (filters.category) {
    vendors = vendors.filter((vendor) => vendor.category === filters.category)
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    vendors = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(searchTerm) ||
        vendor.contact_person.toLowerCase().includes(searchTerm) ||
        vendor.email.toLowerCase().includes(searchTerm),
    )
  }

  if (filters.limit) {
    vendors = vendors.slice(0, Number.parseInt(filters.limit))
  }

  return Promise.resolve(vendors)
}

const getProcurementRequests = (filters = {}) => {
  let requests = [...mockProcurementRequests]

  if (filters.status) {
    requests = requests.filter((req) => req.status === filters.status)
  }

  if (filters.departmentId) {
    requests = requests.filter((req) => req.department_id === Number.parseInt(filters.departmentId))
  }

  if (filters.requestedBy) {
    requests = requests.filter((req) => req.requested_by === filters.requestedBy)
  }

  if (filters.priority) {
    requests = requests.filter((req) => req.priority === filters.priority)
  }

  if (filters.limit) {
    requests = requests.slice(0, Number.parseInt(filters.limit))
  }

  return Promise.resolve(requests)
}

const getProcurementRequestById = (id) => {
  const request = mockProcurementRequests.find((req) => req.id === id)
  if (request) {
    const items = mockProcurementItems.filter((item) => item.request_id === id)
    return Promise.resolve({ ...request, items })
  }
  return Promise.resolve(null)
}

const createProcurementRequest = (data) => {
  const newRequest = {
    id: `PR_${Date.now()}`,
    title: data.title,
    description: data.description,
    estimated_amount: data.estimatedAmount,
    department_id: data.departmentId,
    requested_by: data.requestedBy,
    priority: data.priority || "medium",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockProcurementRequests.push(newRequest)

  // Add items if provided
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      const newItem = {
        id: `PRI_${newRequest.id}_${Date.now()}`,
        request_id: newRequest.id,
        item_name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
        specifications: item.specifications || null,
      }
      mockProcurementItems.push(newItem)
    })
  }

  return Promise.resolve(newRequest)
}

const updateRequestStatus = (id, status, updatedBy, comments) => {
  const requestIndex = mockProcurementRequests.findIndex((req) => req.id === id)

  if (requestIndex === -1) {
    return Promise.reject(new Error("Procurement request not found"))
  }

  mockProcurementRequests[requestIndex] = {
    ...mockProcurementRequests[requestIndex],
    status,
    updated_by: updatedBy,
    status_comments: comments,
    updated_at: new Date().toISOString(),
  }

  return Promise.resolve(mockProcurementRequests[requestIndex])
}

const getTenders = (filters = {}) => {
  let tenders = [...mockTenders]

  if (filters.status) {
    tenders = tenders.filter((tender) => tender.status === filters.status)
  }

  if (filters.tenderType) {
    tenders = tenders.filter((tender) => tender.tender_type === filters.tenderType)
  }

  if (filters.limit) {
    tenders = tenders.slice(0, Number.parseInt(filters.limit))
  }

  return Promise.resolve(tenders)
}

const createVendor = (data) => {
  const newVendor = {
    id: `V_${Date.now()}`,
    name: data.name,
    contact_person: data.contactPerson,
    email: data.email,
    phone: data.phone,
    address: data.address,
    category: data.category,
    tax_id: data.taxId,
    registration_number: data.registrationNumber,
    status: "active",
    created_at: new Date().toISOString(),
  }

  mockVendors.push(newVendor)
  return Promise.resolve(newVendor)
}

const getProcurementStatistics = (filters = {}) => {
  let requests = [...mockProcurementRequests]

  if (filters.departmentId) {
    requests = requests.filter((req) => req.department_id === Number.parseInt(filters.departmentId))
  }

  const stats = {
    total_requests: requests.length,
    draft_requests: requests.filter((req) => req.status === "draft").length,
    pending_requests: requests.filter((req) => req.status === "pending").length,
    approved_requests: requests.filter((req) => req.status === "approved").length,
    rejected_requests: requests.filter((req) => req.status === "rejected").length,
    total_estimated_value: requests.reduce((sum, req) => sum + req.estimated_amount, 0),
    avg_estimated_value:
      requests.length > 0 ? requests.reduce((sum, req) => sum + req.estimated_amount, 0) / requests.length : 0,
  }

  return Promise.resolve(stats)
}

module.exports = {
  getVendors,
  getProcurementRequests,
  getProcurementRequestById,
  createProcurementRequest,
  updateRequestStatus,
  getTenders,
  createVendor,
  getProcurementStatistics,
  mockVendors,
  mockProcurementRequests,
  mockProcurementItems,
  mockTenders,
}
