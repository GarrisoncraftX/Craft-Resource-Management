const { Op } = require("sequelize");
const { ProcurementRequest, ProcurementRequestItem, ProcurementApproval, Vendor, Tender, Bid, Contract, BidEvaluationCommittee, BidEvaluation, ContractAmendment, AuditLog } = require("./model");
const auditService = require("../audit/service");

class ProcurementService {
    async createProcurementRequest(data) {
        const requestId = `PR_${Date.now()}`;
        const procurementRequest = await ProcurementRequest.create({
            id: requestId,
            title: data.title,
            description: data.description,
            estimatedAmount: data.estimatedAmount,
            departmentId: data.departmentId,
            requestedBy: data.requestedBy,
            priority: data.priority || "medium",
            status: "draft",
            createdAt: new Date(),
        });

        if (data.items && data.items.length > 0) {
            for (const item of data.items) {
                const itemId = `PRI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await ProcurementRequestItem.create({
                    id: itemId,
                    requestId: requestId,
                    itemName: item.name,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity * item.unitPrice,
                    specifications: item.specifications || null,
                    createdAt: new Date(),
                });
            }
        }

        return this.getProcurementRequestById(requestId);
    }

    async submitProcurementRequest(requestId, userId) {
        const request = await ProcurementRequest.findByPk(requestId);
        if (!request) throw new Error("Procurement request not found");
        if (request.status !== "draft") throw new Error("Only draft requests can be submitted");

        request.status = "submitted";
        request.updatedBy = userId;
        request.updatedAt = new Date();
        await request.save();

        await this.recordAuditLog("ProcurementRequest", requestId, "submit", userId, `Request submitted`);

        return request;
    }

    async approveProcurementRequest(requestId, userId) {
        const request = await ProcurementRequest.findByPk(requestId);
        if (!request) throw new Error("Procurement request not found");
        if (request.status !== "submitted") throw new Error("Only submitted requests can be approved");

        request.status = "approved";
        request.updatedBy = userId;
        request.updatedAt = new Date();
        await request.save();

        await auditService.logAction(userId, "APPROVE_PROCUREMENT_REQUEST", {
            requestId,
            status: "approved"
        });

        return request;
    }

    async rejectProcurementRequest(requestId, userId, reason) {
        const request = await ProcurementRequest.findByPk(requestId);
        if (!request) throw new Error("Procurement request not found");
        if (request.status !== "submitted") throw new Error("Only submitted requests can be rejected");

        request.status = "rejected";
        request.statusComments = reason;
        request.updatedBy = userId;
        request.updatedAt = new Date();
        await request.save();

        await auditService.logAction(userId, "REJECT_PROCUREMENT_REQUEST", {
            requestId,
            status: "rejected",
            reason
        });

        return request;
    }

    async createVendor(data) {
        const vendorId = `V_${Date.now()}`;
        const vendor = await Vendor.create({
            id: vendorId,
            name: data.name,
            contactPerson: data.contactPerson,
            email: data.email,
            phone: data.phone,
            address: data.address,
            category: data.category,
            taxId: data.taxId,
            registrationNumber: data.registrationNumber,
            status: "pending",
            createdAt: new Date(),
        });
        return vendor;
    }

    async approveVendor(vendorId, userId) {
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) throw new Error("Vendor not found");
        vendor.status = "approved";
        await vendor.save();

        await this.recordAuditLog("Vendor", vendorId, "approve", userId, "Vendor approved");

        return vendor;
    }

    async blacklistVendor(vendorId, userId) {
        const vendor = await Vendor.findByPk(vendorId);
        if (!vendor) throw new Error("Vendor not found");
        vendor.status = "blacklisted";
        await vendor.save();

        await this.recordAuditLog("Vendor", vendorId, "blacklist", userId, "Vendor blacklisted");

        return vendor;
    }

    async createTender(data) {
        const tenderId = `T_${Date.now()}`;
        const tender = await Tender.create({
            id: tenderId,
            title: data.title,
            description: data.description,
            tenderType: data.tenderType,
            estimatedValue: data.estimatedValue,
            submissionDeadline: data.submissionDeadline,
            openingDate: data.openingDate,
            status: "draft",
            createdBy: data.createdBy,
            createdAt: new Date(),
        });
        return tender;
    }

    async publishTender(tenderId, userId) {
        const tender = await Tender.findByPk(tenderId);
        if (!tender) throw new Error("Tender not found");
        if (tender.status !== "draft") throw new Error("Only draft tenders can be published");

        tender.status = "published";
        await tender.save();

        await this.recordAuditLog("Tender", tenderId, "publish", userId, "Tender published");

        return tender;
    }

    async closeTender(tenderId, userId) {
        const tender = await Tender.findByPk(tenderId);
        if (!tender) throw new Error("Tender not found");
        if (tender.status !== "published") throw new Error("Only published tenders can be closed");

        tender.status = "closed";
        await tender.save();

        await this.recordAuditLog("Tender", tenderId, "close", userId, "Tender closed");

        return tender;
    }

    async createBid(data) {
        const bidId = `B_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const bid = await Bid.create({
            id: bidId,
            tenderId: data.tenderId,
            vendorId: data.vendorId,
            bidAmount: data.bidAmount,
            submissionDate: new Date(),
            status: "submitted",
            bidDocumentUrl: data.bidDocumentUrl || null,
            createdAt: new Date(),
        });
        return bid;
    }

    async evaluateBid(bidId, evaluatorId, score, comments) {
        const bid = await Bid.findByPk(bidId);
        if (!bid) throw new Error("Bid not found");

        const evaluationId = `BE_${Date.now()}`;
        const evaluation = await BidEvaluation.create({
            id: evaluationId,
            bidId,
            evaluatorId,
            score,
            comments,
            createdAt: new Date(),
        });

        await this.recordAuditLog("BidEvaluation", evaluationId, "evaluate", evaluatorId, `Bid evaluated with score ${score}`);

        return evaluation;
    }

    async getEvaluationCommittee(tenderId) {
        return await BidEvaluationCommittee.findAll({
            where: { tenderId },
        });
    }

    async createOrUpdateEvaluationCommittee(data) {
        // For simplicity, delete existing committee members for the tender and add new ones
        await BidEvaluationCommittee.destroy({ where: { tenderId: data.tenderId } });

        const members = data.members || [];
        for (const member of members) {
            const id = `BEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await BidEvaluationCommittee.create({
                id,
                tenderId: data.tenderId,
                memberUserId: member.userId,
                role: member.role,
                createdAt: new Date(),
            });
        }
        return { tenderId: data.tenderId, members };
    }

    async createContract(data) {
        const contractId = `C_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const contract = await Contract.create({
            id: contractId,
            tenderId: data.tenderId || null,
            vendorId: data.vendorId,
            contractNumber: data.contractNumber,
            title: data.title,
            description: data.description || null,
            startDate: data.startDate,
            endDate: data.endDate,
            value: data.value,
            status: "draft",
            contractDocumentUrl: data.contractDocumentUrl || null,
            createdBy: data.createdBy,
            createdAt: new Date(),
        });
        return contract;
    }

    async updateContract(contractId, data) {
        const contract = await Contract.findByPk(contractId);
        if (!contract) throw new Error("Contract not found");

        Object.assign(contract, data);
        await contract.save();

        await this.recordAuditLog("Contract", contractId, "update", data.updatedBy || null, "Contract updated");

        return contract;
    }

    async amendContract(contractId, data, userId) {
        const contract = await Contract.findByPk(contractId);
        if (!contract) throw new Error("Contract not found");

        const amendmentId = `CA_${Date.now()}`;
        const amendment = await ContractAmendment.create({
            id: amendmentId,
            contractId,
            amendmentNumber: data.amendmentNumber,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            valueChange: data.valueChange,
            status: "pending",
            createdBy: userId,
            createdAt: new Date(),
        });

        await this.recordAuditLog("ContractAmendment", amendmentId, "create", userId, "Contract amendment created");

        return amendment;
    }

    async getContractById(id) {
        return await Contract.findByPk(id, {
            include: [{ model: Tender }, { model: Vendor }],
        });
    }

    async getContracts(filters = {}) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.vendorId) {
            where.vendorId = filters.vendorId;
        }
        return await Contract.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: filters.limit ? parseInt(filters.limit) : undefined,
            include: [{ model: Tender }, { model: Vendor }],
        });
    }

    async getProcurementRequestById(id) {
        const request = await ProcurementRequest.findByPk(id, {
            include: [
                { model: ProcurementRequestItem },
                { model: ProcurementApproval },
            ],
        });
        return request;
    }

    async getProcurementRequests(filters = {}) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.departmentId) {
            where.departmentId = filters.departmentId;
        }
        if (filters.requestedBy) {
            where.requestedBy = filters.requestedBy;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.minAmount) {
            where.estimatedAmount = { [Op.gte]: filters.minAmount };
        }
        if (filters.maxAmount) {
            where.estimatedAmount = { [Op.lte]: filters.maxAmount };
        }

        return await ProcurementRequest.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: filters.limit ? parseInt(filters.limit) : undefined,
        });
    }

    async getVendorById(id) {
        return await Vendor.findByPk(id);
    }

    async getVendors(filters = {}) {
        const where = { status: { [Op.not]: "blacklisted" } };
        if (filters.category) {
            where.category = filters.category;
        }
        if (filters.search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filters.search}%` } },
                { contactPerson: { [Op.like]: `%${filters.search}%` } },
                { email: { [Op.like]: `%${filters.search}%` } },
            ];
        }
        return await Vendor.findAll({
            where,
            order: [["name", "ASC"]],
            limit: filters.limit ? parseInt(filters.limit) : undefined,
        });
    }

    async getTenderById(id) {
        return await Tender.findByPk(id);
    }

    async getTenders(filters = {}) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.tenderType) {
            where.tenderType = filters.tenderType;
        }
        return await Tender.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: filters.limit ? parseInt(filters.limit) : undefined,
        });
    }

    async getBidById(id) {
        return await Bid.findByPk(id, {
            include: [{ model: Tender }, { model: Vendor }]
        });
    }

    async getBids(filters = {}) {
        const where = {};
        if (filters.tenderId) {
            where.tenderId = filters.tenderId;
        }
        if (filters.vendorId) {
            where.vendorId = filters.vendorId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        return await Bid.findAll({
            where,
            order: [["submissionDate", "DESC"]],
            limit: filters.limit ? parseInt(filters.limit) : undefined,
            include: [{ model: Tender }, { model: Vendor }]
        });
    }

    async recordAuditLog(entityType, entityId, action, userId, details) {
        await auditService.logAction(userId, action, {
            entityType,
            entityId,
            details
        });
    }

    async getProcurementActivityReport(filters = {}) {
        // For simplicity, return counts of tenders, contracts, bids, and requests
        const tenderCount = await Tender.count();
        const contractCount = await Contract.count();
        const bidCount = await Bid.count();
        const requestCount = await ProcurementRequest.count();

        return {
            tenderCount,
            contractCount,
            bidCount,
            requestCount,
        };
    }

    async getAuditTrails(filters = {}) {
        const where = {};
        if (filters.entityType) {
            where.entityType = filters.entityType;
        }
        if (filters.entityId) {
            where.entityId = filters.entityId;
        }
        if (filters.userId) {
            where.userId = filters.userId;
        }
        if (filters.action) {
            where.action = filters.action;
        }
        if (filters.startDate) {
            where.timestamp = { [Op.gte]: new Date(filters.startDate) };
        }
        if (filters.endDate) {
            where.timestamp = { ...where.timestamp, [Op.lte]: new Date(filters.endDate) };
        }
        return await AuditLog.findAll({
            where,
            order: [["timestamp", "DESC"]],
            limit: filters.limit ? parseInt(filters.limit) : undefined,
        });
    }
}

module.exports = ProcurementService;