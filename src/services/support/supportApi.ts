import apiClient from "../client";
import { SUPPORT_ROUTES } from "../routes";
import { unwrap } from "../unwrap";

export type TicketStatus = "Open" | "On Hold" | "Escalated" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface TicketRequester {
  name: string;
  email: string;
  isYou: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  statusType: string;
  priority: TicketPriority | null;
  channel: string | null;
  createdTime: string;
  dueDate: string | null;
  requester: TicketRequester | null;
}

export interface TicketComment {
  id: string;
  content: string;
  isPublic: boolean;
  commenterName: string | null;
  commentedTime: string;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  isPublic: boolean;
  createdTime: string;
  href: string;
}

export interface SupportTicketDetail extends SupportTicket {
  description: string;
  comments: TicketComment[];
  attachments: TicketAttachment[];
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  priority: TicketPriority;
  attachments?: File[];
}

export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  const response = await apiClient.get(SUPPORT_ROUTES.TICKETS);
  return unwrap<SupportTicket[]>(response.data) ?? [];
};

export const getSupportTicketDetail = async (id: string): Promise<SupportTicketDetail> => {
  const response = await apiClient.get(SUPPORT_ROUTES.TICKET(id));
  return unwrap<SupportTicketDetail>(response.data);
};

export const createSupportTicket = async (payload: CreateTicketPayload): Promise<SupportTicket> => {
  const form = new FormData();
  form.append("subject", payload.subject);
  form.append("description", payload.description);
  form.append("priority", payload.priority);
  for (const file of payload.attachments ?? []) {
    form.append("attachments", file);
  }
  const response = await apiClient.post(SUPPORT_ROUTES.TICKETS, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap<SupportTicket>(response.data);
};

export const replyToTicket = async (id: string, content: string): Promise<TicketComment> => {
  const response = await apiClient.post(SUPPORT_ROUTES.REPLIES(id), { content });
  return unwrap<TicketComment>(response.data);
};

export interface ReportErrorPayload {
  correlationId?: string;
  errorCode?: string;
  errorMessage?: string;
  whatHappened?: string;
  url?: string;
}

export interface ReportErrorResult {
  /** True when an open ticket for this error already existed and we attached to
   * it instead of creating a new one ("we're already aware"). */
  deduped: boolean;
  ticketNumber: string;
  ticketId: string;
}

export const reportErrorTicket = async (payload: ReportErrorPayload): Promise<ReportErrorResult> => {
  const response = await apiClient.post(SUPPORT_ROUTES.REPORT_ERROR, payload);
  return unwrap<ReportErrorResult>(response.data);
};
