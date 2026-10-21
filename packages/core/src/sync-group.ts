/**
 * Charts that share an `interaction.sync` id. Hover and range are broadcast
 * by x value. `busy` stops a receiver from echoing the event back.
 */
export interface SyncMember {
  hover(key: string): void;
  hide(): void;
  range(from: string, to: string): void;
}

const groups = new Map<string, Set<SyncMember>>();
let busy = false;

export function joinSync(id: string, member: SyncMember): () => void {
  let set = groups.get(id);
  if (!set) {
    set = new Set();
    groups.set(id, set);
  }
  set.add(member);
  return () => {
    set.delete(member);
    if (set.size === 0) groups.delete(id);
  };
}

function each(id: string, from: SyncMember, fn: (member: SyncMember) => void): void {
  if (busy) return;
  const set = groups.get(id);
  if (!set) return;
  busy = true;
  try {
    for (const member of set) if (member !== from) fn(member);
  } finally {
    busy = false;
  }
}

export function syncHover(id: string, from: SyncMember, key: string): void {
  each(id, from, (member) => member.hover(key));
}

export function syncHide(id: string, from: SyncMember): void {
  each(id, from, (member) => member.hide());
}

export function syncRange(id: string, from: SyncMember, fromKey: string, toKey: string): void {
  each(id, from, (member) => member.range(fromKey, toKey));
}
