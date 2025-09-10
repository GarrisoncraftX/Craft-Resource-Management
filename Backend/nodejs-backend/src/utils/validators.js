const Joi = require("joi")

// Common validation schemas
const commonSchemas = {
  id: Joi.number().integer().positive(),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/),
  date: Joi.date().iso(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "PENDING", "APPROVED", "REJECTED", "CANCELLED"),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"),
  pagination: Joi.object({
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(100).default(20),
  }),
}

// Leave request validation schemas
const leaveSchemas = {
  createLeaveRequest: Joi.object({
    leaveTypeId: commonSchemas.id.required(),
    startDate: commonSchemas.date.required(),
    endDate: commonSchemas.date.required(),
    reason: Joi.string().max(500).required(),
    daysRequested: Joi.number().integer().positive().required(),
  }),

  updateLeaveRequest: Joi.object({
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
    reason: Joi.string().max(500).optional(),
    daysRequested: Joi.number().integer().positive().optional(),
  }),

  approveLeaveRequest: Joi.object({
    status: Joi.string().valid("APPROVED", "REJECTED").required(),
    comments: Joi.string().max(500).optional(),
  }),

  leaveType: Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200).optional(),
    maxDaysPerYear: Joi.number().integer().min(0).required(),
    carryForwardAllowed: Joi.boolean().default(false),
    maxCarryForwardDays: Joi.number().integer().min(0).default(0),
    requiresApproval: Joi.boolean().default(true),
    isPaid: Joi.boolean().default(true),
    isActive: Joi.boolean().default(true),
  }),
}

// Procurement validation schemas
const procurementSchemas = {
  createProcurementRequest: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid("GOODS", "SERVICES", "WORKS", "CONSULTANCY").required(),
    estimatedAmount: Joi.number().positive().required(),
    budgetCode: Joi.string().max(50).optional(),
    requiredDate: commonSchemas.date.optional(),
    priority: commonSchemas.priority.default("MEDIUM"),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().max(500).required(),
          quantity: Joi.number().integer().positive().required(),
          unitOfMeasure: Joi.string().max(50).optional(),
          estimatedUnitPrice: Joi.number().positive().optional(),
          specifications: Joi.string().max(1000).optional(),
        }),
      )
      .min(1)
      .required(),
  }),

  updateProcurementRequest: Joi.object({
    title: Joi.string().max(200).optional(),
    description: Joi.string().max(1000).optional(),
    estimatedAmount: Joi.number().positive().optional(),
    budgetCode: Joi.string().max(50).optional(),
    requiredDate: commonSchemas.date.optional(),
    priority: commonSchemas.priority.optional(),
  }),

  vendor: Joi.object({
    companyName: Joi.string().max(200).required(),
    contactPerson: Joi.string().max(100).optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    address: Joi.string().max(500).optional(),
    taxId: Joi.string().max(50).optional(),
    registrationNumber: Joi.string().max(100).optional(),
    category: Joi.string().valid("GOODS", "SERVICES", "WORKS", "CONSULTANCY").required(),
    bankName: Joi.string().max(100).optional(),
    bankAccount: Joi.string().max(50).optional(),
  }),
}

// Public Relations validation schemas
const publicRelationsSchemas = {
  pressRelease: Joi.object({
    title: Joi.string().max(200).required(),
    content: Joi.string().required(),
    summary: Joi.string().max(500).optional(),
    releaseDate: commonSchemas.date.required(),
    embargoDate: commonSchemas.date.optional(),
    category: Joi.string().valid("ANNOUNCEMENT", "EVENT", "POLICY", "EMERGENCY", "ACHIEVEMENT", "OTHER").required(),
    priority: commonSchemas.priority.default("MEDIUM"),
    targetMedia: Joi.string().max(500).optional(),
    contactPerson: Joi.string().max(100).optional(),
    contactPhone: commonSchemas.phone.optional(),
    contactEmail: commonSchemas.email.optional(),
  }),

  mediaContact: Joi.object({
    name: Joi.string().max(100).required(),
    organization: Joi.string().max(200).optional(),
    position: Joi.string().max(100).optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    mediaType: Joi.string().valid("NEWSPAPER", "RADIO", "TELEVISION", "ONLINE", "MAGAZINE", "BLOG").required(),
    beat: Joi.string().max(100).optional(),
    notes: Joi.string().max(500).optional(),
  }),
}

// Planning & Development validation schemas
const planningSchemas = {
  project: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().max(1000).optional(),
    projectType: Joi.string().valid("INFRASTRUCTURE", "SOCIAL", "ECONOMIC", "ENVIRONMENTAL", "GOVERNANCE").required(),
    priority: commonSchemas.priority.default("MEDIUM"),
    startDate: commonSchemas.date.optional(),
    plannedEndDate: commonSchemas.date.optional(),
    budget: Joi.number().positive().optional(),
    location: Joi.string().max(500).optional(),
    beneficiaries: Joi.number().integer().min(0).default(0),
    projectManagerId: commonSchemas.id.optional(),
  }),

  developmentPermit: Joi.object({
    applicantName: Joi.string().max(200).required(),
    propertyAddress: Joi.string().max(500).required(),
    developmentType: Joi.string()
      .valid("RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "MIXED_USE", "INFRASTRUCTURE")
      .required(),
    permitType: Joi.string().valid("BUILDING", "SUBDIVISION", "ZONING", "ENVIRONMENTAL", "DEMOLITION").required(),
    proposedStartDate: commonSchemas.date.optional(),
    proposedCompletionDate: commonSchemas.date.optional(),
    estimatedCost: Joi.number().positive().optional(),
    landArea: Joi.number().positive().optional(),
    buildingArea: Joi.number().positive().optional(),
    floors: Joi.number().integer().positive().default(1),
    units: Joi.number().integer().positive().default(1),
    feeAmount: Joi.number().positive().required(),
  }),
}

// Transportation validation schemas
const transportationSchemas = {
  driver: Joi.object({
    employeeId: commonSchemas.id.optional(),
    licenseNumber: Joi.string().max(50).required(),
    licenseClass: Joi.string().max(20).required(),
    licenseExpiry: commonSchemas.date.required(),
    medicalCertificateExpiry: commonSchemas.date.optional(),
    yearsExperience: Joi.number().integer().min(0).default(0),
    violationsCount: Joi.number().integer().min(0).default(0),
    lastTrainingDate: commonSchemas.date.optional(),
    nextTrainingDate: commonSchemas.date.optional(),
  }),

  vehicle: Joi.object({
    vehicleNumber: Joi.string().max(50).required(),
    make: Joi.string().max(50).required(),
    model: Joi.string().max(50).required(),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .required(),
    color: Joi.string().max(30).optional(),
    engineNumber: Joi.string().max(100).optional(),
    chassisNumber: Joi.string().max(100).optional(),
    fuelType: Joi.string().valid("PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "LPG").required(),
    seatingCapacity: Joi.number().integer().positive().optional(),
    loadCapacity: Joi.number().positive().optional(),
    purchaseDate: commonSchemas.date.optional(),
    purchaseCost: Joi.number().positive().optional(),
    currentValue: Joi.number().positive().optional(),
    insuranceExpiry: commonSchemas.date.optional(),
    registrationExpiry: commonSchemas.date.optional(),
    currentMileage: Joi.number().integer().min(0).default(0),
    assignedDriverId: commonSchemas.id.optional(),
  }),

  maintenance: Joi.object({
    vehicleId: commonSchemas.id.required(),
    maintenanceType: Joi.string().valid("ROUTINE", "REPAIR", "INSPECTION", "EMERGENCY").required(),
    description: Joi.string().max(1000).required(),
    scheduledDate: commonSchemas.date.optional(),
    mileageAtService: Joi.number().integer().min(0).optional(),
    cost: Joi.number().min(0).default(0),
    serviceProvider: Joi.string().max(100).optional(),
    partsReplaced: Joi.string().max(500).optional(),
    nextServiceMileage: Joi.number().integer().min(0).optional(),
    notes: Joi.string().max(500).optional(),
  }),

  fuelRecord: Joi.object({
    vehicleId: commonSchemas.id.required(),
    driverId: commonSchemas.id.required(),
    fuelDate: commonSchemas.date.required(),
    fuelType: Joi.string().valid("PETROL", "DIESEL", "CNG", "LPG").required(),
    quantity: Joi.number().positive().required(),
    unitPrice: Joi.number().positive().required(),
    mileageAtFill: Joi.number().integer().min(0).optional(),
    fuelStation: Joi.string().max(100).optional(),
    receiptNumber: Joi.string().max(100).optional(),
  }),
}

// Query parameter validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
  }),

  dateRange: Joi.object({
    startDate: commonSchemas.date.optional(),
    endDate: commonSchemas.date.optional(),
  }),

  status: Joi.object({
    status: commonSchemas.status.optional(),
  }),
}

// Parameter validation schemas
const paramSchemas = {
  id: Joi.object({
    id: commonSchemas.id.required(),
  }),
}

module.exports = {
  commonSchemas,
  leaveSchemas,
  procurementSchemas,
  publicRelationsSchemas,
  planningSchemas,
  transportationSchemas,
  querySchemas,
  paramSchemas,
}
