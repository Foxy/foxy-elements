import type { Rule } from '../types';

function zoom(parsedValue: (Rule | Rule[])[]): string {
  const zooms = new Set<string>();
  const maybeAdd = (rule: Rule) => {
    let rel: string;

    if (typeof rule.name === 'string') {
      rel = rule.path;
    } else {
      const separatorIndex = rule.path.lastIndexOf(':');
      if (separatorIndex === -1) return;
      rel = rule.path.substring(0, separatorIndex);
    }

    if (rel.length > 0) zooms.add(rel);
  };

  for (const ruleOrGroup of parsedValue) {
    if (Array.isArray(ruleOrGroup)) {
      for (const rule of ruleOrGroup) maybeAdd(rule);
    } else {
      maybeAdd(ruleOrGroup);
    }
  }

  return Array.from(zooms).join();
}

export { zoom };
