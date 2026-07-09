"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SlideOver } from "@/src/components/ui/overlays/SlideOver";
import { Button } from "@/src/components/ui/inputs/Button";
import { LifeBuoy, Paperclip, Send, Download } from "lucide-react";
import { TicketStatusBadge, TicketPriorityBadge } from "./TicketStatusBadge";
import { useSupportTicketDetail } from "@/src/hooks/data/useSupport";
import { replyToTicket } from "@/src/services/support/supportApi";

interface TicketDetailSlideOverProps {
  ticketId: string | null;
  onClose: () => void;
}

export function TicketDetailSlideOver({ ticketId, onClose }: TicketDetailSlideOverProps) {
  const { detail, isLoading, refetch } = useSupportTicketDetail(ticketId);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!ticketId || !reply.trim()) return;
    setSending(true);
    try {
      await replyToTicket(ticketId, reply.trim());
      setReply("");
      await refetch();
    } catch (err) {
      toast.error("Failed to send reply", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSending(false);
    }
  };

  const canReply = !!detail && detail.status !== "Closed";

  return (
    <SlideOver
      isOpen={!!ticketId}
      onClose={onClose}
      title={detail?.subject}
      subtitle={detail ? `Ticket ${detail.ticketNumber}` : "Support ticket"}
      icon={<LifeBuoy size={16} className="text-info-400" />}
      width="md"
    >
      {isLoading || !detail ? (
        <p className="text-xs text-muted-foreground px-5 py-6">Loading ticket…</p>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-2">
              <TicketStatusBadge status={detail.status} />
              <TicketPriorityBadge priority={detail.priority} />
              <span className="text-xs text-muted-foreground ml-auto">{new Date(detail.createdTime).toLocaleString()}</span>
            </div>

            <div className="bg-(--custom-table-bg) border border-(--custom-table-border) rounded-lg p-3.5">
              <p className="text-xs text-foreground whitespace-pre-wrap">{detail.description}</p>
            </div>

            {detail.attachments.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Attachments</p>
                <div className="space-y-1.5">
                  {detail.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/10 border border-border/30 text-xs text-foreground hover:bg-muted/20 transition-colors"
                    >
                      <Paperclip size={12} className="text-muted-foreground/60 shrink-0" />
                      <span className="flex-1 truncate">{a.name}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{a.size}</span>
                      <Download size={12} className="text-muted-foreground/60 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Conversation</p>
              {detail.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground/60">No replies yet.</p>
              ) : (
                <div className="space-y-3">
                  {detail.comments.map((c) => (
                    <div key={c.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{c.commenterName ?? "Support team"}</span>
                        <span className="text-[11px] text-muted-foreground/60">{new Date(c.commentedTime).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-foreground/85 bg-muted/10 border border-border/20 rounded-lg px-3 py-2 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {canReply ? (
            <div className="shrink-0 border-t border-(--custom-header-input-border) p-4 space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Add a reply…"
                rows={3}
                className="w-full text-xs bg-(--custom-table-bg) border border-(--custom-header-input-border) rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none resize-none focus:border-info-400/50"
              />
              <div className="flex justify-end">
                <Button size="sm" leftIcon={<Send size={13} />} onClick={handleSend} loading={sending} disabled={!reply.trim()}>
                  Send reply
                </Button>
              </div>
            </div>
          ) : (
            <div className="shrink-0 border-t border-(--custom-header-input-border) p-4">
              <p className="text-xs text-muted-foreground text-center">This ticket is closed.</p>
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}
