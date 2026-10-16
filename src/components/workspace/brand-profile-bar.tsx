import { useState } from 'react';
import { Store, Edit2, Palette, Sparkles, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useCompany, useSaveCompany } from '@/lib/data/company';
import { uploadCompanyLogo } from '@/lib/data/storage';
import { useAuth } from '@/lib/auth';
import { LogoStudioModal } from '@/components/brand/LogoStudioModal';

export function BrandProfileBar() {
  const { user } = useAuth();
  const { data: company, isLoading } = useCompany();
  const saveCompanyMutation = useSaveCompany();

  const [editOpen, setEditOpen] = useState(false);
  const [showLogoStudio, setShowLogoStudio] = useState(false);
  const [nome, setNome] = useState('');
  const [slogan, setSlogan] = useState('');
  const [cores, setCores] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('#EA1D2C');
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    if (company) {
      setNome(company.nome || '');
      setSlogan(company.slogan || '');
      setCores(company.cores || ['#EA1D2C', '#181818']);
    }
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error('Informe o nome da empresa.');
      return;
    }

    setSaving(true);
    try {
      await saveCompanyMutation.mutateAsync({
        nome: nome.trim(),
        slogan: slogan.trim(),
        cores,
      });
      toast.success('Perfil da marca atualizado! Os próximos prompts usarão estes dados.');
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file || !user?.id) return;
    try {
      toast.loading('Enviando nova logo...', { id: 'upload-logo' });
      const { path } = await uploadCompanyLogo(file, user.id);
      await saveCompanyMutation.mutateAsync({
        tem_logo: true,
        logo_path: path,
      });
      toast.success('Logo atualizada com sucesso!', { id: 'upload-logo' });
    } catch {
      toast.error('Erro ao enviar imagem da logo.', { id: 'upload-logo' });
    }
  };

  if (!user || isLoading || !company) return null;

  return (
    <>
      {/* Compact Brand Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141414] px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo or initials (sem círculo) */}
          {company.tem_logo && company.logo_path ? (
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black/60 p-0.5">
              <img
                src={company.logo_path}
                alt={company.nome}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EA1D2C] text-xs font-black text-white">
              {company.nome.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Name & Category */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">{company.nome}</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70">
              {company.categoria}
            </span>
          </div>

          {/* Palette Squares */}
          {company.cores && company.cores.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/10">
              {company.cores.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-xs border border-white/20"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpen}
          className="h-8 text-xs font-semibold border-white/20 hover:border-[#EA1D2C]"
        >
          <Edit2 className="mr-1.5 h-3.5 w-3.5 text-[#EA1D2C]" />
          Editar perfil
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-white/15 bg-[#141414] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Perfil da marca</DialogTitle>
            <DialogDescription className="text-white/60">
              Altere a identidade da sua loja. As mudanças são aplicadas na hora em todos os prompts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Nome da loja
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Slogan
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Ex.: O autêntico sabor na brasa"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-none"
              />
            </div>

            {/* Logo Change */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Trocar logo
              </label>
              <div className="mt-1 flex flex-wrap items-center gap-2.5">
                <Button asChild size="sm" variant="outline" className="text-xs border-white/20">
                  <label className="cursor-pointer">
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Enviar logo (Arquivo)
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                    />
                  </label>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLogoStudio(true)}
                  className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-xl gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Criar logo (Estúdio)
                </Button>
                {company.tem_logo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await saveCompanyMutation.mutateAsync({
                        tem_logo: false,
                        logo_path: null,
                      });
                      toast.success('Definido como sem logo.');
                    }}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Usar sem logo
                  </Button>
                )}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Cores principais da marca
              </label>
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {cores.map((c, i) => (
                  <div
                    key={i}
                    className="group relative flex items-center gap-1.5 rounded-lg border border-white/20 px-2 py-1 bg-black/40 text-xs"
                  >
                    <span className="h-3.5 w-3.5 rounded-xs" style={{ backgroundColor: c }} />
                    <span className="font-mono">{c}</span>
                    <button
                      type="button"
                      onClick={() => setCores(cores.filter((_, idx) => idx !== i))}
                      className="text-white/40 hover:text-white ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border border-white/20 bg-transparent p-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!cores.includes(newColor)) {
                        setCores([...cores, newColor]);
                      }
                    }}
                    className="text-xs h-8 px-2 border-white/20"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="border-white/20"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#EA1D2C] font-bold hover:bg-[#ff3b4b]">
                {saving ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Estúdio de Criação de Logo Modal */}
      <LogoStudioModal
        open={showLogoStudio}
        onOpenChange={setShowLogoStudio}
        defaultStoreName={company.nome}
        defaultNiche={company.categoria}
        onSelectPalette={(paletteColors) => {
          setCores(paletteColors);
          toast.success('Paleta de cores aplicada ao formulário!');
        }}
      />
    </>
  );
}
