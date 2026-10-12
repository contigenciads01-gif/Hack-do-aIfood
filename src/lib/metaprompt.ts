import { templates } from '@/data/metaprompts';
import { brandPacks, photoStyles } from '@/data/brand-packs';
import { commonFields, promptFields, toolTemplates, formatNames } from '@/data/prompt-fields';

export type Values = Record<string, string | string[] | boolean | number>;

export const filled = (v: unknown) =>
  Array.isArray(v)
    ? v.length > 0
    : typeof v === 'string'
      ? v.trim().length > 0
      : v !== undefined && v !== null && v !== false;

export function listText(v: unknown): string {
  if (Array.isArray(v)) {
    return v.length > 1 ? `${v.slice(0, -1).join(', ')} e ${v[v.length - 1]}` : v[0] || '';
  }
  return typeof v === 'boolean' ? (v ? 'sim' : '') : String(v ?? '');
}

export function renderTemplate(template: string, values: Values): string {
  let text = template;
  const block = /{{#if\s+([^{}]+)}}((?:(?!{{#if)[\s\S])*?){{\/if}}/g;

  while (/{{#if/.test(text)) {
    const next = text.replace(block, (_, condition: string, body: string) => {
      const parts = condition.trim().split('=');
      const key = parts[0]?.trim() || '';
      const rest = parts.slice(1);
      const value = key ? values[key] : undefined;
      const expected = rest.join('=');
      const ok = rest.length
        ? expected === ''
          ? !filled(value)
          : Array.isArray(value)
            ? value.includes(expected)
            : String(value ?? '') === expected
        : filled(value);
      return ok ? body : '';
    });
    if (next === text) break;
    text = next;
  }

  return text
    .replace(/{{\s*([^{}]+)\s*}}/g, (_, key: string) => listText(values[key.trim()]))
    .replace(/{{[^}]*}}/g, '')
    .split('\n')
    .filter((line) => line.trim())
    .join('\n')
    .trim();
}

export function buildMetaprompt(toolId: string, values: Values, company: Values = {}) {
  const id = templates[toolId] ? toolId : toolTemplates[toolId] || 'T1';
  const data: Values = { ...company, ...values };
  const catKey = String(data['categoria'] || '');
  const pack = brandPacks[catKey] || brandPacks['Outro (qualquer comércio)'];

  const estiloVal = String(data['estilo'] || '');
  Object.assign(data, {
    cues_categoria: pack?.cues,
    cores_categoria: pack?.cores,
    evitar_categoria: pack?.evitar,
    logo_categoria: pack?.logo,
    estilo_desc:
      data['estilo'] === 'Personalizado'
        ? data['estilo_livre']
        : photoStyles[estiloVal] || '',
  });

  const fields = [...commonFields, ...(promptFields[id] || [])];
  const missing = fields
    .filter(
      (f) =>
        f.required &&
        (!f.when || (f.when[0] ? data[f.when[0]] === f.when[1] : true)) &&
        !filled(data[f.key]),
    )
    .map((f) => f.key);

  if (
    ((id === 'T1' && data['modo'] === 'aprimorar') ||
      (id === 'T3' && data['origem'] === 'adaptar')) &&
    !filled(data['imagem'])
  ) {
    missing.push('imagem');
  }

  const invalid = fields
    .filter((f) => {
      const val = data[f.key];
      if (!filled(val)) return false;
      const len = Array.isArray(val) ? val.length : String(val).length;
      if (f.max && len > f.max) return true;
      if (f.type === 'number') {
        const num = Number(val);
        if (!Number.isFinite(num) || num < 0) return true;
        if (
          ['comissao', 'outras_taxas', 'margem_alvo'].includes(f.key) &&
          num > 100
        )
          return true;
        if (['max_palavras', 'preco_atual'].includes(f.key) && num <= 0)
          return true;
      }
      return false;
    })
    .map((f) => f.key);

  const optionalMissing = fields
    .filter(
      (f) =>
        !f.required &&
        (!f.when || (f.when[0] ? data[f.when[0]] === f.when[1] : true)) &&
        !filled(data[f.key]),
    )
    .map((f) => f.key);

  const summary = [
    formatNames[id] ||
      String(
        data['nome_prato'] ||
          data['prato_ou_tema'] ||
          data['prato'] ||
          'Direção para sua loja',
      ),
    String(data['estilo'] || data['tom'] || data['objetivo'] || 'Identidade e posicionamento'),
    Array.isArray(data['ingredientes'])
      ? `${data['ingredientes'].length} ingredientes reais`
      : String(data['nome_loja'] || 'Dados da empresa'),
  ];

  return {
    text: renderTemplate(templates[id] || '', data),
    missing: [...new Set(missing)],
    optionalMissing,
    invalid,
    summary,
  };
}
