import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
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
  Camera,
  FolderOpen,
  Download,
  Image as ImageIcon,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { PlanGate } from './plan-gate';
import { BrandProfileBar } from './brand-profile-bar';
import { FloatingMaterialsButton } from './floating-materials-button';
import { MateriaisExplorer } from './materiais-explorer';
import { usePratos, usePrato, type Prato } from '@/lib/data/pratos';
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

  const [selectedPratoId, setSelectedPratoId] = useState<string | null>(null);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const { prato: selectedPrato, fotos } = usePrato(selectedPratoId || undefined);

  const bestPhotoUrl =
    (fotos && fotos.length > 0 ? (fotos[0].signed_url || fotos[0].storage_path) : '') ||
    image ||
    '';

  const handleSelectPrato = (p: Prato) => {
    setSelectedPratoId(p.id);
    setShowSelectorModal(false);
    setValues((prev) => ({
      ...prev,
      nome_prato: p.nome,
      prato_ou_tema: p.nome,
      prato: p.nome,
    }));
    toast.success(`Prato "${p.nome}" selecionado!`);
  };

  const handleCopyPhoto = async () => {
    if (!bestPhotoUrl) {
      toast.error('Nenhuma foto selecionada para copiar.');
      return;
    }
    try {
      const res = await fetch(bestPhotoUrl);
      const blob = await res.blob();
      let pngBlob = blob;
      if (!blob.type.includes('png')) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = bestPhotoUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const converted = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );
        if (converted) pngBlob = converted;
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          [pngBlob.type]: pngBlob,
        }),
      ]);
      toast.success('Foto copiada! Agora basta colar com Ctrl+V no ChatGPT.');
    } catch (err) {
      console.warn('Clipboard write image failed, falling back to download:', err);
      toast.info('Não foi possível copiar direto. Baixando a foto...');
      handleDownloadPhoto();
    }
  };

  const handleDownloadPhoto = () => {
    if (!bestPhotoUrl) {
      toast.error('Nenhuma foto selecionada.');
      return;
    }
    const link = document.createElement('a');
    link.href = bestPhotoUrl;
    link.download = `foto-${selectedPrato?.nome ? selectedPrato.nome.toLowerCase().replace(/\s+/g, '-') : 'prato'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download da foto iniciado.');
  };

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
        prato_id: selectedPratoId || null,
        tipo: toolId,
      });
      toast.success(
        selectedPrato
          ? `Salvo na pasta "${selectedPrato.nome}" com sucesso!`
          : 'Salvo em Meus materiais.',
      );
    } catch {
      toast.error('Erro ao salvar material.');
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
    <PlanGate toolTitle={currentToolTitle}>
      <ToolPage
        title={currentToolTitle}
        description="Seu próximo material começa com um bom prompt pronto."
        icon={Brain}
      >
        <BrandProfileBar />

        <div className="prompt-dashboard mt-6">
          {/* ═══════ LEFT: DATA ═══════ */}
          <section className="prompt-data">
            <div className="pd-section-header">
              <h2 className="section-title">Dados</h2>
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

            {/* Foto do prato Card (para ferramentas com fotos de comida) */}
            {toolId !== 'branding' && toolId !== 'pagina' && toolId !== 'avaliacoes' && (
              <div className="tool-card pd-card border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="pd-card__title">Foto do prato</h3>
                  {selectedPrato && (
                    <button
                      type="button"
                      onClick={() => setSelectedPratoId(null)}
                      className="text-[11px] text-white/50 hover:text-white/90 underline"
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>

                {selectedPrato ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#EA1D2C] tracking-wider">
                          Prato selecionado
                        </span>
                        <p className="font-semibold text-white text-sm">{selectedPrato.nome}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSelectorModal(true)}
                        className="text-xs rounded-xl border-white/20 h-8"
                      >
                        Trocar prato
                      </Button>
                    </div>

                    {fotos && fotos.length > 0 ? (
                      <div>
                        <p className="text-[11px] text-white/60 mb-2">
                          {fotos.length} de 3 fotos tiradas deste prato:
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {fotos.map((f) => (
                            <div
                              key={f.id}
                              className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40"
                            >
                              <img
                                src={f.signed_url || f.storage_path}
                                alt={`Foto slot ${f.slot}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-bold text-white/90">
                                {f.slot === 1 ? 'De cima' : f.slot === 2 ? 'De lado' : 'Detalhe'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/15 p-3 text-center">
                        <p className="text-xs text-white/60 mb-2">Este prato ainda não tem fotos tiradas.</p>
                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
                          <Link to="/foto">Tirar fotos agora</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-white/60">
                      Escolha um prato cadastrado para usar as fotos e preencher o nome automaticamente, ou envie uma foto nova.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={() => setShowSelectorModal(true)}
                        className="rounded-xl bg-[#EA1D2C] text-white hover:bg-[#ff3b4b] text-xs font-bold gap-2 h-10"
                      >
                        <FolderOpen size={16} />
                        Escolher dos meus materiais
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-xl border-white/20 text-white hover:bg-white/10 text-xs font-semibold gap-2 h-10"
                      >
                        <Link to="/foto">
                          <Camera size={16} />
                          Enviar foto nova
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
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
                  aria-label="Ver e editar prompt pronto"
                  title="Ver e editar prompt pronto"
                  onClick={() => {
                    if (text) setOpen(true);
                    else generate();
                  }}
                >
                  <Brain size={28} />
                </button>

                <div className="pd-brain-info">
                  <h2 className="pd-brain-info__title">
                    {busy ? 'Montando prompt pronto…' : text ? 'Prompt pronto' : 'Seu prompt pronto'}
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

              {text && (
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="text-xs text-white/70 hover:text-white gap-1.5"
                  >
                    <Brain size={14} />
                    Ver e editar texto completo
                  </Button>
                  {text !== original && (
                    <span className="example-label pd-edited-badge">Editado</span>
                  )}
                </div>
              )}
            </div>

            {/* 3-Step Action Panel: Levar para o ChatGPT */}
            <div className="tool-card pd-card border-[#EA1D2C]/40 bg-gradient-to-b from-[#1a1414] to-[#121212]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#EA1D2C]" />
                  Levar para o ChatGPT
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA1D2C] bg-[#EA1D2C]/15 border border-[#EA1D2C]/30 px-2 py-0.5 rounded-full">
                  3 passos
                </span>
              </div>

              <div className="space-y-3">
                {/* Passo 1: Copiar prompt pronto */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EA1D2C] text-xs font-black text-white shrink-0">
                      1
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Copiar prompt pronto</p>
                      <p className="text-[11px] text-white/60">Copia o comando compilado</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!text}
                    onClick={() => copyPrompt(text)}
                    className="rounded-xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-xs font-bold gap-1.5 shrink-0"
                  >
                    <Copy size={14} />
                    Copiar
                  </Button>
                </div>

                {/* Passo 2: Copiar foto (ClipboardItem) com fallback de Baixar fotos */}
                <div className="rounded-xl bg-white/5 p-3 border border-white/10 hover:border-white/20 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EA1D2C] text-xs font-black text-white shrink-0">
                        2
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">Copiar foto</p>
                        <p className="text-[11px] text-white/60">
                          {bestPhotoUrl ? 'Pronta para colar (Ctrl+V)' : 'Nenhuma foto selecionada'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {bestPhotoUrl ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyPhoto}
                            className="rounded-xl border-white/20 text-xs font-bold gap-1.5"
                            title="Copiar imagem para colar com Ctrl+V"
                          >
                            <Copy size={14} />
                            Copiar foto
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadPhoto}
                            className="rounded-xl text-xs text-white/70 hover:text-white gap-1"
                            title="Baixar foto no computador"
                          >
                            <Download size={14} />
                            Baixar
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSelectorModal(true)}
                          className="rounded-xl border-white/20 text-xs"
                        >
                          Selecionar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Passo 3: Abrir o ChatGPT */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EA1D2C] text-xs font-black text-white shrink-0">
                      3
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">Abrir o ChatGPT</p>
                      <p className="text-[11px] text-white/60">Cole a foto e o prompt no chat</p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-white/20 hover:bg-white/10 text-xs font-bold gap-1.5 shrink-0"
                  >
                    <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                      Abrir ChatGPT
                    </a>
                  </Button>
                </div>
              </div>

              {/* Salvar na pasta do prato */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!text}
                  onClick={save}
                  className="rounded-xl border-white/20 text-xs text-white hover:bg-white/10 gap-2 font-semibold"
                >
                  <Save size={14} />
                  {selectedPrato ? `Salvar na pasta "${selectedPrato.nome}"` : 'Salvar em Meus materiais'}
                </Button>
                {selectedPrato && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <Check size={12} /> Na pasta {selectedPrato.nome}
                  </span>
                )}
              </div>
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
            ? 'Montando prompt pronto'
            : issues.length
              ? 'Campos pendentes'
              : text
                ? 'Prompt pronto'
                : ''}
        </div>

        {/* Floating 56px rounded-square button with store logo opening materials selector */}
        <FloatingMaterialsButton onSelectPrato={handleSelectPrato} />

        {/* Selector Modal Dialog for Escolher dos meus materiais */}
        <Dialog open={showSelectorModal} onOpenChange={setShowSelectorModal}>
          <DialogContent
            className="max-w-4xl p-0 border-white/15 bg-[#0f0f10] text-white h-[90vh] sm:h-[80vh] overflow-hidden"
            aria-describedby={undefined}
          >
            <DialogTitle className="sr-only">Seletor de Materiais</DialogTitle>
            <DialogDescription className="sr-only">
              Escolha um prato para anexar às ferramentas.
            </DialogDescription>
            <MateriaisExplorer
              mode="seletor"
              onSelectPrato={handleSelectPrato}
              onClose={() => setShowSelectorModal(false)}
            />
          </DialogContent>
        </Dialog>

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
                Trocar o formato descartará as edições feitas neste prompt pronto.
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
    </PlanGate>
  );
}
