import { useEffect, useRef, useState } from 'react';
import {
  Brain,
  Copy,
  ExternalLink,
  Save,
  AlertTriangle,
  X,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { buildMetaprompt, type Values } from '@/lib/metaprompt';
import {
  commonFields,
  promptFields,
  toolTitles,
  toolTemplates,
  formatNames,
  type Field,
} from '@/data/prompt-fields';
import { brandPacks } from '@/data/brand-packs';
import { PromptImage } from './prompt-image';
import { BrainPanel, copyPrompt } from './brain-panel';
import { ToolPage } from './pages';
import {
  useCompany,
  usePromptDraft,
  useSavePromptDraft,
  useSaveMaterial,
} from '@/lib/data';

/* ─── Field control ─── */
function FieldControl({
  field,
  value,
  onChange,
  category,
}: {
  field: Field;
  value: Values[string];
  onChange: (v: Values[string]) => void;
  category: string;
}) {
  const [entry, setEntry] = useState('');
  const options =
    field.key === 'categoria' ? Object.keys(brandPacks) : field.options || [];
  const suggestions =
    field.key === 'ingredientes'
      ? brandPacks[category]?.cues.split(',').slice(0, 3) || []
      : options;

  const add = (text: string) => {
    const values = Array.isArray(value) ? value : [];
    const next = Array.from(
      new Set([
        ...values,
        ...text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ]),
    );
    if (field.max && next.length > field.max) {
      toast.error(`Escolha até ${field.max} itens.`);
      return;
    }
    onChange(next);
    setEntry('');
  };

  /* select */
  if (field.type === 'select') {
    return (
      <div className="prompt-field" id={`field-${field.key}`}>
        <label htmlFor={`input-${field.key}`} className="prompt-field__label">
          {field.label}
          {field.required && <span className="prompt-field__required">*</span>}
        </label>
        <div className="prompt-field__select-wrap">
          <select
            id={`input-${field.key}`}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            className="prompt-field__select"
          >
            <option value="">Selecionar</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o === 'aprimorar'
                  ? 'Aprimorar minha foto'
                  : o === 'criar'
                    ? 'Criar a partir da descrição'
                    : o === 'adaptar'
                      ? 'Adaptar minha logo atual'
                      : o}
              </option>
            ))}
          </select>
          <ChevronDown className="prompt-field__select-icon" />
        </div>
        {field.hint && <small className="prompt-field__hint">{field.hint}</small>}
      </div>
    );
  }

  /* checkbox */
  if (field.type === 'checkbox') {
    return (
      <div className="prompt-field prompt-field--checkbox" id={`field-${field.key}`}>
        <label htmlFor={`input-${field.key}`} className="prompt-field__checkbox-label">
          <span className={`prompt-field__check-box ${value ? 'prompt-field__check-box--on' : ''}`}>
            {value && <Check size={14} />}
          </span>
          <input
            id={`input-${field.key}`}
            type="checkbox"
            className="sr-only"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>
            {field.label}
            {field.required && <span className="prompt-field__required">*</span>}
          </span>
        </label>
        {field.hint && <small className="prompt-field__hint">{field.hint}</small>}
      </div>
    );
  }

  /* list (tags) */
  if (field.type === 'list') {
    return (
      <div className="prompt-field" id={`field-${field.key}`}>
        <label htmlFor={`input-${field.key}`} className="prompt-field__label">
          {field.label}
          {field.required && <span className="prompt-field__required">*</span>}
        </label>

        {(Array.isArray(value) ? value : []).length > 0 && (
          <div className="prompt-field__tags">
            {(Array.isArray(value) ? value : []).map((v) => (
              <span key={v} className="prompt-field__tag">
                {v}
                <button
                  type="button"
                  className="prompt-field__tag-remove"
                  aria-label={`Remover ${v}`}
                  onClick={() =>
                    onChange((Array.isArray(value) ? value : []).filter((i) => i !== v))
                  }
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          id={`input-${field.key}`}
          className="prompt-field__input"
          value={entry}
          placeholder="Adicionar item"
          onChange={(e) =>
            e.target.value.includes(',') ? add(e.target.value) : setEntry(e.target.value)
          }
          onBlur={() => {
            if (entry.trim()) add(entry);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(entry);
            }
          }}
        />

        {suggestions.length > 0 && (
          <div className="prompt-field__suggestions">
            {suggestions.map((s) => (
              <button
                type="button"
                key={s}
                className="prompt-field__pill"
                onClick={() => add(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {field.hint && <small className="prompt-field__hint">{field.hint}</small>}
      </div>
    );
  }

  /* textarea */
  if (field.type === 'textarea') {
    return (
      <div className="prompt-field" id={`field-${field.key}`}>
        <label htmlFor={`input-${field.key}`} className="prompt-field__label">
          {field.label}
          {field.required && <span className="prompt-field__required">*</span>}
        </label>
        <textarea
          id={`input-${field.key}`}
          className="prompt-field__textarea"
          rows={3}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.hint && <small className="prompt-field__hint">{field.hint}</small>}
      </div>
    );
  }

  /* default: text / number */
  return (
    <div className="prompt-field" id={`field-${field.key}`}>
      <label htmlFor={`input-${field.key}`} className="prompt-field__label">
        {field.label}
        {field.required && <span className="prompt-field__required">*</span>}
      </label>
      <input
        id={`input-${field.key}`}
        className="prompt-field__input"
        type={field.type === 'number' ? 'number' : 'text'}
        min={field.type === 'number' ? 0 : undefined}
        step={field.type === 'number' ? 'any' : undefined}
        maxLength={field.max}
        value={String(value ?? '')}
        placeholder={
          ['cores_preferidas', 'cores_marca'].includes(field.key)
            ? brandPacks[category]?.cores
            : undefined
        }
        onChange={(e) => onChange(e.target.value)}
      />
      {field.hint && <small className="prompt-field__hint">{field.hint}</small>}
    </div>
  );
}

/* ─── Format card ─── */
function FormatCard({
  id,
  name,
  spec,
  active,
  onClick,
}: {
  id: string;
  name: string;
  spec: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`format-card ${active ? 'format-card--active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className={`format-card__radio ${active ? 'format-card__radio--on' : ''}`}>
        {active && <span className="format-card__radio-dot" />}
      </span>
      <div className="format-card__text">
        <span className="format-card__name">{name}</span>
        <span className="format-card__spec">{spec}</span>
      </div>
    </button>
  );
}

const FORMAT_SPECS: Record<string, string> = {
  T1: 'Quadrado 1:1 · 1200 × 1200',
  T2: 'Horizontal 16:9 · 1600 × 900',
  T3: 'Quadrado · 500 × 500, PNG',
};

/* ─── Dashboard ─── */
export function PromptDashboard({ toolId }: { toolId: string }) {
  const { data: company } = useCompany();
  const { data: draft } = usePromptDraft(toolId);
  const saveDraftMutation = useSavePromptDraft(toolId);
  const saveMaterialMutation = useSaveMaterial();

  const [template, setTemplate] = useState(toolTemplates[toolId]);
  const [values, setValues] = useState<Values>({});
  const [image, setImage] = useState('');
  const [text, setText] = useState('');
  const [original, setOriginal] = useState('');
  const [summary, setSummary] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [formatToSwitch, setFormatToSwitch] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const defaults = (id: string) =>
    Object.fromEntries(
      (promptFields[id] || [])
        .filter((f) => f.default !== undefined)
        .map((f) => [f.key, f.default || '']),
    );

  /* ─ hydrate draft & company ─ */
  useEffect(() => {
    const id = draft?.template || toolTemplates[toolId];
    setTemplate(id);

    const companyValues: Values = company
      ? {
          nome_loja: company.nome,
          categoria: company.categoria,
          cidade: company.cidade || '',
          whatsapp: company.whatsapp || '',
          instagram: company.instagram || '',
        }
      : {};

    const templateId = id || 'T1';
    setValues({ ...defaults(templateId), ...companyValues, ...(draft?.values || {}) });
    setText(draft?.texto || '');
    setOriginal(draft?.original || '');
    setSummary(draft?.summary || []);
    setReady(true);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toolId, draft, company]);

  /* ─ persist draft to database via mutation ─ */
  useEffect(() => {
    if (!ready) return;
    const saveTimer = setTimeout(() => {
      saveDraftMutation.mutate({
        template: template || 'T1',
        values,
        texto: text,
        original,
        summary,
      });
    }, 800);
    return () => clearTimeout(saveTimer);
  }, [ready, toolId, template, values, text, original, summary]);

  const activeTemplate = template || 'T1';
  const built = buildMetaprompt(activeTemplate, { ...values, imagem: !!image });
  const fields = [...commonFields, ...(promptFields[activeTemplate] || [])];

  const labels = (keys: string[]) =>
    keys.map((key) => ({
      key,
      label: key === 'imagem' ? 'Imagem da empresa' : fields.find((f) => f.key === key)?.label || key,
    }));

  const goField = (key: string) => {
    setTimeout(() => {
      document.getElementById(`field-${key}`)?.scrollIntoView({ block: 'center', behavior: 'auto' });
      document.getElementById(`input-${key}`)?.focus();
    }, 100);
  };

  const generate = () => {
    if (built.missing.length || built.invalid.length) {
      setIssues([...built.missing, ...built.invalid]);
      return;
    }
    setIssues([]);
    setBusy(true);
    timer.current = setTimeout(() => {
      setText(built.text);
      setOriginal(built.text);
      setSummary(built.summary);
      setBusy(false);
    }, 900);
  };

  const save = async () => {
    try {
      await saveMaterialMutation.mutateAsync({
        tool: toolId,
        template: activeTemplate,
        title: String(
          values['nome_prato'] ||
            values['prato_ou_tema'] ||
            values['prato'] ||
            values['nome_loja'] ||
            toolTitles[toolId] ||
            toolId,
        ),
        text,
        original,
        summary,
      });
      toast.success('Salvo em Meus materiais.');
    } catch {
      toast.error('Erro ao salvar em Meus materiais.');
    }
  };

  const confirmSwitchFormat = (newFormat: string) => {
    setTemplate(newFormat);
    setValues((v) => ({ ...defaults(newFormat), ...v }));
    setText('');
    setOriginal('');
    setIssues([]);
    setFormatToSwitch(null);
  };

  const currentToolTitle = toolTitles[toolId] || toolId;

  return (
    <ToolPage
      title={currentToolTitle}
      description="Seu próximo material começa com um bom prompt."
      icon={Brain}
    >
      <div className="prompt-dashboard">
        {/* ═══════ LEFT: DATA ═══════ */}
        <section className="prompt-data">
          <div className="pd-section-header">
            <h2 className="section-title">Dados</h2>
            <span className="example-label">Grátis</span>
          </div>

          {/* Format picker (imagem tool only) */}
          {toolId === 'imagem' && (
            <div className="tool-card pd-card">
              <h3 className="pd-card__title">Formato</h3>
              <div className="pd-formats">
                {Object.entries(formatNames).map(([id, name]) => (
                  <FormatCard
                    key={id}
                    id={id}
                    name={name}
                    spec={FORMAT_SPECS[id] || ''}
                    active={template === id}
                    onClick={() => {
                      if (text !== original) {
                        setFormatToSwitch(id);
                      } else {
                        confirmSwitchFormat(id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Company fields */}
          <div className="tool-card pd-card">
            <h3 className="pd-card__title">Empresa</h3>
            <div className="pd-fields">
              {commonFields.map((field) => (
                <FieldControl
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ''}
                  category={String(values['categoria'] || '')}
                  onChange={(v) => setValues((old) => ({ ...old, [field.key]: v }))}
                />
              ))}
            </div>
          </div>

          {/* Image upload (not for avaliacoes/promocoes) */}
          {toolId !== 'avaliacoes' && toolId !== 'promocoes' && (
            <div className="tool-card pd-card">
              <PromptImage image={image} onChange={setImage} />
            </div>
          )}

          {/* Tool-specific fields */}
          <div className="tool-card pd-card">
            <h3 className="pd-card__title">
              {toolId === 'branding' ? 'Público, visual e posicionamento' : 'Seu material'}
            </h3>
            <div className="pd-fields">
              {(promptFields[activeTemplate] || [])
                .filter((f: Field) => !f.when || (f.when[0] ? values[f.when[0]] === f.when[1] : true))
                .map((field: Field) => (
                  <FieldControl
                    key={field.key}
                    field={field}
                    value={values[field.key] ?? ''}
                    category={String(values['categoria'] || '')}
                    onChange={(v) => setValues((old) => ({ ...old, [field.key]: v }))}
                  />
                ))}
            </div>
          </div>

          {/* Validation issues */}
          {issues.length > 0 && (
            <div className="pd-notice pd-notice--warn" role="alert">
              <AlertTriangle size={20} />
              <div>
                <strong>Confira estes campos:</strong>
                <div className="pd-notice__links">
                  {labels(issues).map((f) => (
                    <button
                      type="button"
                      className="pd-notice__link"
                      key={f.key}
                      onClick={() => goField(f.key)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate CTA */}
          <Button className="pd-generate-btn" disabled={busy} onClick={generate}>
            <Sparkles size={18} />
            Gerar prompt
          </Button>
        </section>

        {/* ═══════ RIGHT: RESULT ═══════ */}
        <section className="prompt-result">
          <h2 className="section-title">Resultado</h2>

          {/* Brain preview card */}
          <div className="tool-card pd-card pd-result-card">
            <div className="pd-brain-hero">
              <button
                type="button"
                className={`pd-brain-icon ${busy ? 'pd-brain-icon--pulse' : ''} ${text ? 'pd-brain-icon--ready' : ''}`}
                aria-label="Ver e editar metaprompt"
                title="Ver e editar metaprompt"
                onClick={() => {
                  if (text) setOpen(true);
                  else generate();
                }}
              >
                <Brain size={28} />
              </button>

              <div className="pd-brain-info">
                <h2 className="pd-brain-info__title">
                  {busy ? 'Montando metaprompt…' : text ? 'Metaprompt pronto' : 'Seu metaprompt'}
                </h2>

                {busy ? (
                  <div className="pd-brain-loading">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : text ? (
                  <div className="pd-brain-summary">
                    {summary.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="pd-brain-placeholder">
                    Preencha os campos e clique em <strong>Gerar prompt</strong>.
                  </p>
                )}
              </div>
            </div>

            {/* Actions when prompt is ready */}
            {text && (
              <>
                <div className="pd-result-actions">
                  <Button variant="outline" onClick={() => setOpen(true)}>
                    <Brain size={16} />
                    Ver e editar
                  </Button>
                  <Button onClick={() => copyPrompt(text)}>
                    <Copy size={16} />
                    Copiar prompt
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} />
                      Abrir ChatGPT
                    </a>
                  </Button>
                  <Button variant="outline" onClick={save}>
                    <Save size={16} />
                    Salvar
                  </Button>
                </div>
                {text !== original && (
                  <span className="example-label pd-edited-badge">Editado</span>
                )}
              </>
            )}
          </div>

          {/* How-to card */}
          <div className="tool-card pd-card">
            <h2 className="pd-card__title">Como usar no ChatGPT</h2>
            <div className="pd-steps">
              {['Anexe a imagem', 'Cole o prompt', 'Peça ajustes na mesma conversa'].map(
                (step, i) => (
                  <div className="pd-step" key={step}>
                    <span className="pd-step__number">{i + 1}</span>
                    <p className="pd-step__text">{step}</p>
                  </div>
                ),
              )}
            </div>
            <p className="pd-how-tip">
              Recomendamos o ChatGPT porque aceita foto anexada, edita imagem e permite ajustes na
              mesma conversa.
            </p>
          </div>

          {/* iFood notice */}
          {toolId === 'imagem' && (
            <div className="pd-notice pd-notice--warn">
              <AlertTriangle size={20} />
              <p>
                O iFood aceita imagens feitas ou melhoradas com IA apenas se representarem fielmente
                o prato que você entrega, e orienta sinalizar o uso de IA. Confira as regras atuais
                no seu Portal do Parceiro.
              </p>
            </div>
          )}

          {/* Page preview teaser */}
          {toolId === 'pagina' && (
            <div className="tool-card pd-card">
              <h2 className="pd-card__title">Blocos e visual da página</h2>
              <p>Prévia visual em breve. O prompt de texto e visual já pode ser copiado.</p>
            </div>
          )}
        </section>
      </div>

      {/* Screen-reader live region */}
      <div className="sr-only" aria-live="polite">
        {busy
          ? 'Montando metaprompt'
          : issues.length
            ? 'Campos pendentes'
            : text
              ? 'Metaprompt pronto'
              : ''}
      </div>

      {/* Brain editor sheet */}
      <BrainPanel
        open={open}
        onOpenChange={setOpen}
        title={currentToolTitle}
        text={text}
        original={original}
        onChange={setText}
        missing={labels([...built.missing, ...built.optionalMissing])}
        onField={goField}
        onRegenerate={() => {
          setText(built.text);
          setOriginal(built.text);
          setSummary(built.summary);
        }}
      />

      {/* Format Switch Confirmation AlertDialog */}
      <AlertDialog
        open={!!formatToSwitch}
        onOpenChange={(open) => !open && setFormatToSwitch(null)}
      >
        <AlertDialogContent className="border-white/15 bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Trocar formato?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Trocar o formato descartará as edições feitas neste metaprompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA1D2C] text-white hover:bg-[#ff3b4b]"
              onClick={() => formatToSwitch && confirmSwitchFormat(formatToSwitch)}
            >
              Confirmar troca
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ToolPage>
  );
}
