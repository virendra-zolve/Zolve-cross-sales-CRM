// Partner Management - API Implementation
// In-memory mock, mirrors the LeadsDatabase pattern.

import {
  PartnerMaster,
  PartnerCommissionConfig,
  CommissionTier,
  PartnerDocument,
  PartnerDocumentStatus,
  PartnerApprovalAction,
  PartnerApprovalActionType,
  PartnerPerformance,
  BdPartnerMetrics,
} from '../types/partner';
import { ApiResponse } from '../types/normalized';
import { validatePartnerMaster } from '../utils/partnerValidation';
import { validateSlabs } from '../utils/commissionSlabs';
import {
  nextStatusForDecision,
  mandatoryDocsApproved,
  canSubmit,
  canResubmit,
  WorkflowDecision,
} from '../utils/partnerWorkflow';
import {
  calculatePartnerPerformance,
  calculateBdPartnerMetrics,
  PartnerLeadRecord,
  PartnerTransactionRecord,
} from '../utils/partnerMetrics';

type CreatePartnerInput = Omit<
  PartnerMaster,
  'id' | 'partnerCode' | 'status' | 'createdAt' | 'updatedAt'
> & { submit?: boolean };

type CommissionInput = Omit<PartnerCommissionConfig, 'id' | 'tiers'> & {
  tiers: Omit<CommissionTier, 'id' | 'commissionId'>[];
};

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function err<T>(code: string, message: string): ApiResponse<T> {
  return { success: false, error: { code, message }, timestamp: new Date().toISOString() };
}

export class PartnersDatabase {
  private partners: Map<string, PartnerMaster> = new Map();
  private commissions: Map<string, PartnerCommissionConfig> = new Map();
  private tiers: Map<string, CommissionTier> = new Map();
  private documents: Map<string, PartnerDocument> = new Map();
  private approvalHistory: Map<string, PartnerApprovalAction> = new Map();

  private partnerIdCounter = 1;
  private partnerCodeCounter = 1;
  private entityIdCounters: Record<string, number> = {};

  private generateId(prefix: string): string {
    if (!this.entityIdCounters[prefix]) this.entityIdCounters[prefix] = 1;
    return `${prefix}${this.entityIdCounters[prefix]++}`;
  }

  private generatePartnerId(): string {
    return `P${String(this.partnerIdCounter++).padStart(5, '0')}`;
  }

  private generatePartnerCode(): string {
    let code: string;
    do {
      code = `PC${String(this.partnerCodeCounter++).padStart(5, '0')}`;
    } while (this.isPartnerCodeTaken(code));
    return code;
  }

  private isPartnerCodeTaken(code: string): boolean {
    for (const p of this.partners.values()) {
      if (p.partnerCode === code) return true;
    }
    return false;
  }

  private recordHistory(
    partnerId: string,
    action: PartnerApprovalActionType,
    actor: string,
    actorRole: PartnerApprovalAction['actorRole'],
    comment?: string
  ): void {
    const id = this.generateId('PAH');
    this.approvalHistory.set(id, {
      id,
      partnerId,
      timestamp: new Date().toISOString(),
      action,
      actor,
      actorRole,
      comment,
    });
  }

  // ========== CRUD + workflow ==========

  createPartner(input: CreatePartnerInput): ApiResponse<PartnerMaster> {
    const errors = validatePartnerMaster(input);
    if (errors.length > 0) {
      return err('VALIDATION_ERROR', errors.map((e) => `${e.field}: ${e.message}`).join('; '));
    }

    const now = new Date().toISOString();
    const id = this.generatePartnerId();
    const status = input.submit ? 'Pending Head Approval' : 'Draft';

    const partner: PartnerMaster = {
      ...input,
      id,
      partnerCode: undefined, // generated only on activation
      status,
      createdAt: now,
      updatedAt: now,
    };
    delete (partner as Partial<CreatePartnerInput>).submit;

    this.partners.set(id, partner);
    this.recordHistory(id, input.submit ? 'submitted' : 'submitted', input.bdOwnerName || input.bdOwnerId, 'BD');
    return ok(partner);
  }

  getPartner(id: string): ApiResponse<PartnerMaster> {
    const p = this.partners.get(id);
    if (!p) return err('NOT_FOUND', `Partner ${id} not found`);
    return ok(p);
  }

  listPartners(): ApiResponse<PartnerMaster[]> {
    return ok(Array.from(this.partners.values()));
  }

  updatePartner(id: string, patch: Partial<PartnerMaster>): ApiResponse<PartnerMaster> {
    const existing = this.partners.get(id);
    if (!existing) return err('NOT_FOUND', `Partner ${id} not found`);
    if (existing.status !== 'Draft' && existing.status !== 'Review Required') {
      return err('INVALID_TRANSITION', `Cannot edit a partner in status "${existing.status}"`);
    }
    const merged = { ...existing, ...patch, id: existing.id, updatedAt: new Date().toISOString() };
    const errors = validatePartnerMaster(merged);
    if (errors.length > 0) {
      return err('VALIDATION_ERROR', errors.map((e) => `${e.field}: ${e.message}`).join('; '));
    }
    this.partners.set(id, merged);
    return ok(merged);
  }

  submitPartner(id: string, actor = 'BD'): ApiResponse<PartnerMaster> {
    const p = this.partners.get(id);
    if (!p) return err('NOT_FOUND', `Partner ${id} not found`);
    if (!canSubmit(p.status)) {
      return err('INVALID_TRANSITION', `Cannot submit a partner in status "${p.status}"`);
    }
    p.status = 'Pending Head Approval';
    p.updatedAt = new Date().toISOString();
    this.partners.set(id, p);
    this.recordHistory(id, 'submitted', actor, 'BD');
    return ok(p);
  }

  resubmitPartner(id: string, actor = 'BD'): ApiResponse<PartnerMaster> {
    const p = this.partners.get(id);
    if (!p) return err('NOT_FOUND', `Partner ${id} not found`);
    if (!canResubmit(p.status)) {
      return err('INVALID_TRANSITION', `Cannot resubmit a partner in status "${p.status}"`);
    }
    p.status = 'Pending Head Approval';
    p.updatedAt = new Date().toISOString();
    this.partners.set(id, p);
    this.recordHistory(id, 'resubmitted', actor, 'BD');
    return ok(p);
  }

  reviewPartner(
    id: string,
    decision: WorkflowDecision,
    actor: string,
    comment?: string
  ): ApiResponse<PartnerMaster> {
    const p = this.partners.get(id);
    if (!p) return err('NOT_FOUND', `Partner ${id} not found`);

    const docsApproved = mandatoryDocsApproved(this.getPartnerDocuments(id));
    const transition = nextStatusForDecision(p.status, decision, docsApproved);
    if (transition.error) {
      const code = decision === 'approve' && !docsApproved ? 'MANDATORY_DOCS_MISSING' : 'INVALID_TRANSITION';
      return err(code, transition.error);
    }

    p.status = transition.nextStatus;
    p.updatedAt = new Date().toISOString();

    if (p.status === 'Active' && !p.partnerCode) {
      p.partnerCode = this.generatePartnerCode();
    }

    const actionMap: Record<WorkflowDecision, PartnerApprovalActionType> = {
      approve: 'approved',
      reject: 'rejected',
      review_required: 'review_required',
    };
    this.partners.set(id, p);
    this.recordHistory(id, actionMap[decision], actor, 'Head', comment);
    return ok(p);
  }

  getApprovalHistory(partnerId: string): ApiResponse<PartnerApprovalAction[]> {
    const list = Array.from(this.approvalHistory.values())
      .filter((a) => a.partnerId === partnerId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return ok(list);
  }

  // ========== Commission ==========

  setCommission(partnerId: string, config: CommissionInput): ApiResponse<PartnerCommissionConfig> {
    if (!this.partners.has(partnerId)) {
      return err('NOT_FOUND', `Partner ${partnerId} not found`);
    }

    const commissionId = this.generateId('PCM');
    const tiers: CommissionTier[] = config.tiers.map((t, idx) => ({
      ...t,
      id: this.generateId('PCT'),
      commissionId,
      slabIndex: idx,
    }));

    const slabErrors = validateSlabs(tiers);
    if (slabErrors.length > 0) {
      return err('SLAB_INVALID', slabErrors.map((e) => `${e.field}: ${e.message}`).join('; '));
    }

    // Deactivate any existing active config for the same product (one active per product).
    for (const c of this.commissions.values()) {
      if (c.partnerId === partnerId && c.product === config.product && c.status === 'Active') {
        c.status = 'Inactive';
        this.commissions.set(c.id, c);
      }
    }

    const commission: PartnerCommissionConfig = {
      ...config,
      id: commissionId,
      partnerId,
      status: config.status || 'Active',
      tiers,
    };
    this.commissions.set(commissionId, commission);
    for (const t of tiers) this.tiers.set(t.id, t);
    return ok(commission);
  }

  getCommissions(partnerId: string): ApiResponse<PartnerCommissionConfig[]> {
    const list = Array.from(this.commissions.values()).filter((c) => c.partnerId === partnerId);
    return ok(list);
  }

  deleteCommission(commissionId: string): ApiResponse<{ id: string }> {
    const c = this.commissions.get(commissionId);
    if (!c) return err('NOT_FOUND', `Commission ${commissionId} not found`);
    // Cascade delete tiers
    for (const t of Array.from(this.tiers.values())) {
      if (t.commissionId === commissionId) this.tiers.delete(t.id);
    }
    this.commissions.delete(commissionId);
    return ok({ id: commissionId });
  }

  // ========== Documents ==========

  addDocument(
    partnerId: string,
    doc: Omit<PartnerDocument, 'id' | 'partnerId' | 'status' | 'uploadedAt'> & {
      status?: PartnerDocumentStatus;
    }
  ): ApiResponse<PartnerDocument> {
    if (!this.partners.has(partnerId)) {
      return err('NOT_FOUND', `Partner ${partnerId} not found`);
    }
    const id = this.generateId('PDOC');
    const document: PartnerDocument = {
      ...doc,
      id,
      partnerId,
      status: doc.status || 'Uploaded',
      uploadedAt: new Date().toISOString(),
    };
    this.documents.set(id, document);
    return ok(document);
  }

  reviewDocument(
    docId: string,
    status: 'Approved' | 'Rejected',
    reviewer: string,
    rejectionReason?: string
  ): ApiResponse<PartnerDocument> {
    const doc = this.documents.get(docId);
    if (!doc) return err('NOT_FOUND', `Document ${docId} not found`);
    if (status === 'Rejected' && !rejectionReason?.trim()) {
      return err('VALIDATION_ERROR', 'Rejection reason is required when rejecting a document');
    }
    doc.status = status;
    doc.reviewedBy = reviewer;
    doc.reviewedAt = new Date().toISOString();
    doc.rejectionReason = status === 'Rejected' ? rejectionReason : undefined;
    this.documents.set(docId, doc);
    return ok(doc);
  }

  getPartnerDocuments(partnerId: string): PartnerDocument[] {
    return Array.from(this.documents.values()).filter((d) => d.partnerId === partnerId);
  }

  listDocuments(partnerId: string): ApiResponse<PartnerDocument[]> {
    return ok(this.getPartnerDocuments(partnerId));
  }

  // ========== Migration ==========

  bulkCreatePartners(
    rows: Array<{
      master: Omit<PartnerMaster, 'id' | 'partnerCode' | 'status' | 'createdAt' | 'updatedAt'>;
      commissions?: CommissionInput[];
    }>,
    actor = 'System'
  ): ApiResponse<PartnerMaster[]> {
    const created: PartnerMaster[] = [];
    const now = new Date().toISOString();

    for (const row of rows) {
      const errors = validatePartnerMaster(row.master);
      if (errors.length > 0) {
        return err(
          'VALIDATION_ERROR',
          `Row for "${row.master.legalBusinessName}": ${errors.map((e) => e.field).join(', ')}`
        );
      }

      const id = this.generatePartnerId();
      const partner: PartnerMaster = {
        ...row.master,
        id,
        status: 'Active', // bypass approval
        partnerCode: this.generatePartnerCode(),
        createdAt: now,
        updatedAt: now,
      };
      this.partners.set(id, partner);
      this.recordHistory(id, 'migrated', actor, 'System');

      for (const config of row.commissions || []) {
        const res = this.setCommission(id, config);
        if (!res.success) {
          return err('SLAB_INVALID', `Commission import failed for ${partner.legalBusinessName}: ${res.error?.message}`);
        }
      }
      created.push(partner);
    }

    return ok(created);
  }

  // ========== Metrics ==========

  getPartnerPerformance(
    partnerId: string,
    leads: PartnerLeadRecord[],
    txns: PartnerTransactionRecord[],
    commissionPaid = 0
  ): ApiResponse<PartnerPerformance> {
    if (!this.partners.has(partnerId)) {
      return err('NOT_FOUND', `Partner ${partnerId} not found`);
    }
    const commissions = Array.from(this.commissions.values());
    const perf = calculatePartnerPerformance(partnerId, leads, txns, commissions, commissionPaid);
    return ok(perf);
  }

  getBdMetrics(
    bdOwnerId: string,
    leadsByPartnerId: Record<string, number>,
    partnerLogins = 0
  ): ApiResponse<BdPartnerMetrics> {
    const partners = Array.from(this.partners.values());
    const metrics = calculateBdPartnerMetrics(bdOwnerId, partners, leadsByPartnerId, partnerLogins);
    return ok(metrics);
  }
}

export const partnersDb = new PartnersDatabase();
