import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/lib/data/company';
import { useAuth } from '@/lib/auth';
import { openCompanyEditor } from '@/lib/company-editor-state';

export function BrandProfileBar() {
  const { user } = useAuth();
  const { data: company, isLoading } = useCompany();

  if (!user || isLoading || !company) return null;

  return (
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

      {/* Edit Button -> Opens full CompanyEditorSheet */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => openCompanyEditor('identidade')}
        className="h-8 text-xs font-semibold border-white/20 hover:border-[#EA1D2C] cursor-pointer"
      >
        <Edit2 className="mr-1.5 h-3.5 w-3.5 text-[#EA1D2C]" />
        Editar perfil
      </Button>
    </div>
  );
}
