
const { DataTypes } = require("sequelize")
const { sequelize } = require("../../config/sequelize")

const ProcurementRequest = sequelize.define("ProcurementRequest", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    estimatedAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: "estimated_amount",
    },
    departmentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "department_id",
    },
    requestedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "requested_by",
    },
    priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "draft",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
    updatedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: "updated_by",
    },
    statusComments: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "status_comments",
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "updated_at",
    },
}, {
    tableName: "procurement_requests",
    timestamps: false,
});

const ProcurementRequestItem = sequelize.define("ProcurementRequestItem", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    requestId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "request_id",
    },
    itemName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "item_name",
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: "unit_price",
    },
    totalPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: "total_price",
    },
    specifications: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "procurement_request_items",
    timestamps: false,
});

const ProcurementApproval = sequelize.define("ProcurementApproval", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    requestId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "request_id",
    },
    approverId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "approver_id",
    },
    approvalLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "approval_level",
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "procurement_approvals",
    timestamps: false,
});

const Vendor = sequelize.define("Vendor", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    contactPerson: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "contact_person",
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    taxId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "tax_id",
    },
    registrationNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "registration_number",
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "active",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "vendors",
    timestamps: false,
});

const Tender = sequelize.define("Tender", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tenderType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "tender_type",
    },
    estimatedValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: "estimated_value",
    },
    submissionDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "submission_deadline",
    },
    openingDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "opening_date",
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "draft",
    },
    createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "created_by",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "tenders",
    timestamps: false,
});

const Bid = sequelize.define("Bid", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    tenderId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "tender_id",
    },
    vendorId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "vendor_id",
    },
    bidAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: "bid_amount",
    },
    submissionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "submission_date",
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "submitted",
    },
    bidDocumentUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "bid_document_url",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "bids",
    timestamps: false,
});

const Contract = sequelize.define("Contract", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    tenderId: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "tender_id",
    },
    vendorId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "vendor_id",
    },
    contractNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: "contract_number",
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "start_date",
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "end_date",
    },
    value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "draft",
    },
    contractDocumentUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "contract_document_url",
    },
    createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "created_by",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "contracts",
    timestamps: false,
});

const BidEvaluationCommittee = sequelize.define("BidEvaluationCommittee", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    tenderId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "tender_id",
    },
    memberUserId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "member_user_id",
    },
    role: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "bid_evaluation_committees",
    timestamps: false,
});

const BidEvaluation = sequelize.define("BidEvaluation", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    bidId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "bid_id",
    },
    evaluatorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "evaluator_id",
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "bid_evaluations",
    timestamps: false,
});

const ContractAmendment = sequelize.define("ContractAmendment", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    contractId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "contract_id",
    },
    amendmentNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "amendment_number",
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "start_date",
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "end_date",
    },
    valueChange: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: "value_change",
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "pending",
    },
    createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "created_by",
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
}, {
    tableName: "contract_amendments",
    timestamps: false,
});

const AuditLog = sequelize.define("AuditLog", {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    entityType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "entity_type",
    },
    entityId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "entity_id",
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "user_id",
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "audit_logs",
    timestamps: false,
});

Tender.hasMany(BidEvaluationCommittee, { foreignKey: "tender_id" });
BidEvaluationCommittee.belongsTo(Tender, { foreignKey: "tender_id" });

Bid.hasMany(BidEvaluation, { foreignKey: "bid_id" });
BidEvaluation.belongsTo(Bid, { foreignKey: "bid_id" });

Contract.hasMany(ContractAmendment, { foreignKey: "contract_id" });
ContractAmendment.belongsTo(Contract, { foreignKey: "contract_id" });

module.exports = {
    ProcurementRequest,
    ProcurementRequestItem,
    ProcurementApproval,
    Vendor,
    Tender,
    Bid,
    Contract,
    BidEvaluationCommittee,
    BidEvaluation,
    ContractAmendment,
    AuditLog,
};