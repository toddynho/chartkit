/**
 * Group playground option fields the way chart docs and /playground show them:
 * schema groups, common (essential) options first, the rest behind More options.
 * Parity options the chart does not paint yet stay in the open part of the group.
 */

export interface GroupableOption {
  path: string;
  label: string;
  description: string;
  group: string;
  essential?: boolean;
}

export interface OptionGroupSection {
  id: string;
  label: string;
  /** Shown before More options. Includes every not-yet option in the group. */
  lead: GroupableOption[];
  more: GroupableOption[];
}

export function groupOptions(
  fields: readonly GroupableOption[],
  groups: readonly string[],
  opts: {
    query: string;
    setOnly: boolean;
    isSet: (field: GroupableOption) => boolean;
    isUnsupported: (field: GroupableOption) => boolean;
  },
): OptionGroupSection[] {
  const query = opts.query.trim().toLowerCase();
  const matched = fields.filter((field) => {
    if (query) {
      const haystack = `${field.label} ${field.path} ${field.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (opts.setOnly && !opts.isSet(field) && !opts.isUnsupported(field)) return false;
    return true;
  });
  const sections: OptionGroupSection[] = [];
  for (const name of groups) {
    const items = matched.filter((field) => field.group === name);
    if (!items.length) continue;
    const essentials = items.filter((field) => field.essential);
    let lead: GroupableOption[];
    let more: GroupableOption[];
    if (!essentials.length) {
      lead = items;
      more = [];
    } else {
      lead = items.filter((field) => field.essential || opts.isUnsupported(field));
      more = items.filter((field) => !field.essential && !opts.isUnsupported(field));
    }
    sections.push({ id: name, label: name, lead, more });
  }
  return sections;
}
