/**
 * Member registration notifier (browser-safe)
 * ------------------------------------------------------------------
 * On every new registration it POSTs to the server /api/notify-member endpoint,
 * which fans out to Telegram + LINE (when tokens are configured on the server).
 * No tokens live in the browser; the server holds them via env.
 */
export interface NotifyMemberInput {
  member: any;
  user?: any;
}

export async function notifyNewMember(member: any, user?: any): Promise<void> {
  try {
    await fetch('/api/notify-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberCode: member.memberCode,
        name: member.name,
        email: user?.email || member.email,
        phone: user?.phone || member.phone,
        positionId: member.positionId,
        province: member.location?.province,
      }),
    });
  } catch (e: any) {
    console.warn('[notifier] notify skipped:', e?.message || e);
  }
}
