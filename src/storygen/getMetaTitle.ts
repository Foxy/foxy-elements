import { pascalCase } from 'change-case';

export function getMetaTitle(localName: string): string {
  const name = pascalCase(localName.replace('foxy-', ''));
  const category = localName.split('-').pop() ?? '';
  const knownSections: Record<string, string> = {
    table: 'Tables',
    form: 'Forms',
    card: 'Cards',
  };

  return `${knownSections[category] ?? 'Other'} / ${name}`;
}
