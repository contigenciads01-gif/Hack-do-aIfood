import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Camera, ImagePlus, FileText, Sparkles, FolderOpen, Globe, CreditCard, Store, ArrowRight, Upload, Download, X, AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { creditBalance, creditHistory, packages } from '@/data/mock';
import { PastePhotoButton } from '@/components/workspace/paste-photo';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/data';
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

export const tools = [
  { to: '/foto', title: 'Tirar foto do prato', icon: Camera, description: 'Use a câmera ou envie a foto do seu prato.', cost: 'Grátis', steps: ['Uma foto do seu prato.', 'Nenhuma IA nesta etapa.', 'Sua última foto, pronta para as ferramentas.'], next: '/imagem' },
  { to: '/imagem', title: 'Gerar imagem', icon: ImagePlus, description: 'Envie a foto e os ingredientes. A IA cria a imagem pronta para o iFood.', cost: 'Grátis', steps: ['Foto e ingredientes.', 'Uma imagem no formato escolhido.', 'Uma imagem para baixar.'], next: '/descricao' },
  { to: '/descricao', title: 'Descrição para o iFood', icon: FileText, description: 'Foto, ingredientes e dados da loja viram um título e uma descrição.', cost: 'Grátis', steps: ['Foto, ingredientes e dados da loja.', 'Título e descrição do prato.', 'Texto pronto para copiar.'], next: '/pagina' },
  { to: '/branding', title: 'Cérebro de marca', icon: Sparkles, description: 'Transforme os dados públicos da sua empresa em direção de marca.', cost: 'Grátis', steps: ['Dados públicos da empresa.', 'Um prompt de identidade e posicionamento.', 'Um prompt para colar no ChatGPT.'], next: '/pagina' },
  { to: '/materiais', title: 'Meus materiais', icon: FolderOpen, description: 'Seus materiais, disponíveis para baixar ou copiar novamente.', cost: 'Grátis', steps: ['Nada: seus materiais ficam reunidos aqui.', 'Nenhuma IA nesta etapa.', 'Seus arquivos e textos.'], next: '/pagina' },
  { to: '/pagina', title: 'Minha página', icon: Globe, description: 'Reúna seus links em uma página da sua loja.', cost: 'Grátis', steps: ['Blocos, links e visual da empresa.', 'Sugestões para o visual.', 'Link público e QR code.'], next: undefined },
] as const;
export function ToolPage({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof Camera; children: ReactNode }) {
 return <main className="tool-page"><div className="page-heading"><span className="icon-tile"><Icon/></span><div><h1>{title}</h1><p>{description}</p></div></div>{children}</main>;
}
function readLastPhoto() { try { return localStorage.getItem('hdi_last_photo') || ''; } catch { return ''; } }
export function PlaceholderPage({ path }: { path: string }) {
 const tool = tools.find(t => t.to === path);
 const [photo, setPhoto] = useState('');
 useEffect(() => { setPhoto(readLastPhoto()); }, []);
 if (!tool) return null;
 const savePhoto = (file?: File) => { if (!file) return; if (!file.type.startsWith('image/')) { toast.error('Escolha uma imagem.'); return; } if (file.size > 3 * 1024 * 1024) { toast.error('Envie uma imagem de até 3 MB.'); return; } const reader = new FileReader(); reader.onload = () => { if (typeof reader.result !== 'string') return; try { localStorage.setItem('hdi_last_photo', reader.result); setPhoto(reader.result); toast.success('Última foto salva neste navegador.'); } catch { toast.error('Não há espaço para salvar esta foto no navegador.'); } }; reader.readAsDataURL(file); };
 return <ToolPage title={tool.title} description={tool.description} icon={tool.icon}>
 {path === '/foto' && <section className="tool-card"><h2>Foto do prato</h2><div className="photo-upload">{photo ? <img src={photo} alt="Última foto do prato"/> : <Camera size={40}/>}<div className="flex flex-wrap gap-3 justify-center"><Button asChild variant="outline"><label><Upload/>Enviar foto<input className="sr-only" type="file" accept="image/*" onChange={e => savePhoto(e.target.files?.[0])}/></label></Button><Button asChild variant="outline"><label><Camera/>Abrir câmera<input className="sr-only" type="file" accept="image/*" capture="environment" onChange={e => savePhoto(e.target.files?.[0])}/></label></Button><PastePhotoButton onPhoto={savePhoto}/></div></div></section>}
 <div className="tool-grid"><section className="tool-card"><h2>Como funciona</h2><div className="steps">{tool.steps.map((step,i) => <div key={step}><span className="step-number">{i+1}</span><div><h3>{['Você envia','A IA faz','Você recebe'][i]}</h3><p>{step}</p></div></div>)}</div></section><section className="tool-card"><h2>Custo</h2><p className="cost-value">{tool.cost}</p><p>{path === '/foto' ? 'A foto fica apenas neste navegador.' : 'Em breve · nenhuma cobrança nesta prévia.'}</p></section></div>
 {path === '/materiais' && <section className="tool-card empty-state"><FolderOpen/><h2>Nenhum material gerado ainda</h2><p>Seus resultados aparecerão aqui.</p></section>}
 {path === '/foto' ? <div className="prompt-actions"><span>Usar em:</span><Button asChild variant="outline"><Link to="/imagem">Gerar imagem<ArrowRight/></Link></Button><Button asChild variant="outline"><Link to="/descricao">Descrição<ArrowRight/></Link></Button></div> : tool.next && <Button asChild className="next-step"><Link to={tool.next}>Próximo passo<ArrowRight/></Link></Button>}
 </ToolPage>;
}
export function StudioPage() { return <ToolPage title="Estúdio" description="Da foto do prato à sua divulgação." icon={ImagePlus}><div className="studio-grid">{tools.slice(0,5).map((t,i) => <Button asChild variant="ghost" className="studio-card" key={t.to}><Link to={t.to}><span className="step-number">{i<4 ? i+1 : <FolderOpen/>}</span><div><h2>{t.title}</h2><p>{t.cost}</p></div><ArrowRight/></Link></Button>)}</div></ToolPage>; }
export function AccountPage() {
  const [exitDialog, setExitDialog] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Você saiu da sua conta.');
    navigate({ to: '/' });
  };

  return (
    <ToolPage title="Conta" description="Seu acesso e sua empresa." icon={Store}>
      <div className="account-lines">
        <Button asChild variant="outline">
          <Link to="/creditos">
            <CreditCard />
            Créditos
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/empresa">
            <Store />
            Minha empresa
            <ArrowRight />
          </Link>
        </Button>
        <Button variant="outline" className="text-rose-400 hover:text-rose-300" onClick={() => setExitDialog(true)}>
          <LogOut />
          Sair da conta
        </Button>
      </div>

      <AlertDialog open={exitDialog} onOpenChange={setExitDialog}>
        <AlertDialogContent className="border-white/15 bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair da sua conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Você precisará do seu @usuario e senha para entrar novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA1D2C] text-white hover:bg-[#ff3b4b]"
              onClick={handleLogout}
            >
              Sair da conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ToolPage>
  );
}

export function CompanyPage() {
  const { data: company, isLoading } = useCompany();

  return (
    <ToolPage title="Minha empresa" description="Dados públicos e identidade da sua loja." icon={Store}>
      {isLoading ? (
        <section className="tool-card">
          <p>Carregando dados da empresa...</p>
        </section>
      ) : !company ? (
        <section className="tool-card empty-state">
          <Store size={40} />
          <h2>Empresa ainda não cadastrada</h2>
          <p>Complete seu perfil para que a IA personalize todos os seus prompts.</p>
          <Button asChild className="mt-4 bg-[#EA1D2C] hover:bg-[#ff3b4b]">
            <Link to="/cadastro">Cadastrar minha empresa</Link>
          </Button>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="tool-card">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {company.tem_logo && company.logo_path ? (
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-1">
                    <img src={company.logo_path} alt={company.nome} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EA1D2C] text-xl font-black text-white">
                    {company.nome.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{company.nome}</h2>
                  <p className="text-sm font-semibold text-[#EA1D2C]">{company.categoria}</p>
                  {company.cidade && <p className="text-xs text-white/60">{company.cidade}</p>}
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/cadastro">Editar cadastro completo</Link>
              </Button>
            </div>

            {company.slogan && (
              <p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 italic text-sm text-white/80">
                "{company.slogan}"
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
              <div>
                <span className="text-xs font-semibold uppercase text-white/50">WhatsApp</span>
                <p className="text-sm font-medium">{company.whatsapp || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-white/50">Instagram</span>
                <p className="text-sm font-medium">{company.instagram || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-white/50">Horário</span>
                <p className="text-sm font-medium">{company.horario || 'Não informado'}</p>
              </div>
            </div>

            {company.cores && company.cores.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold uppercase text-white/50">Paleta de cores</span>
                <div className="mt-2 flex gap-2">
                  {company.cores.map((c, i) => (
                    <div
                      key={i}
                      className="h-8 w-12 rounded-lg border border-white/20 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </ToolPage>
  );
}
export function CreditsPage() { const [recharge,setRecharge] = useState(false); return <ToolPage title="Meus créditos" description="Saldo e opções para criar seus materiais." icon={CreditCard}><section className="tool-card balance-card"><div><span className="example-label">Dados de exemplo</span><h2>Você tem {creditBalance} créditos</h2><div className="credit-squares">{Array.from({length:5},(_,i) => <span key={i}/>)}</div></div><Button onClick={() => { setRecharge(true); document.getElementById('packages')?.scrollIntoView({behavior:'smooth'}); }}>Recarregar créditos</Button></section><section><h2 className="section-title">Como usar seus créditos</h2><div className="tool-grid three-columns">{['Foto do prato com IA','Descrição para o iFood','Branding e posicionamento'].map((title,i) => <div className="tool-card" key={title}><span className="icon-tile">{i===0 ? <ImagePlus/> : i===1 ? <FileText/> : <Sparkles/>}</span><h3 className="mt-4">{title}</h3><p className="cost-value">1 crédito</p></div>)}</div></section><section className="tool-card"><h2>Histórico de consumo</h2><p>Exemplos de consumo, não vinculados à sua conta.</p><div className="table-scroll"><table><thead><tr>{['DATA','AÇÃO','CRÉDITOS','SALDO'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{creditHistory.map(r => <tr key={r.date}><td>{r.date}</td><td>{r.action}</td><td>{r.credits}</td><td>{r.balance}</td></tr>)}</tbody></table></div></section><section id="packages"><h2 className="section-title">Planos e recargas</h2><p className="mb-4">Pacotes de exemplo · compras ainda indisponíveis.</p>{recharge && <p className="notice mb-4" role="status">Escolha um pacote para consultar os valores. Esta prévia não realiza pagamentos.</p>}<div className="tool-grid three-columns">{packages.map(p => <div className="tool-card package-card" key={p.name}>{p.popular && <span className="example-label">Mais popular</span>}<h3>{p.name}</h3><p>{p.credits} créditos</p><strong className="package-price">{p.price}</strong><Button variant="outline" onClick={() => toast('Compra indisponível nesta prévia. Nenhum pagamento foi realizado.')}>Comprar</Button></div>)}</div></section><section className="tool-card"><h2>Recarga imediata via PIX</h2><p>O contato oficial do suporte ainda não foi informado.</p><Button variant="outline" disabled className="mt-4">Chamar no WhatsApp</Button></section></ToolPage>; }
export function ImagePage() {
 const [photo,setPhoto] = useState(''); const [ingredients,setIngredients] = useState<string[]>([]); const [entry,setEntry] = useState(''); const [format,setFormat] = useState('Foto do prato 1:1'); const [style,setStyle] = useState('Escuro cinematográfico'); const [notice,setNotice] = useState(''); const fileRef = useRef<HTMLInputElement>(null);
 const add = (text: string) => { const additions = text.split(',').map(s => s.trim()).filter(Boolean); setIngredients(old => Array.from(new Set([...old,...additions]))); setEntry(''); };
 const upload = (file?: File) => { if (!file) return; if (!file.type.startsWith('image/')) { toast.error('Escolha uma imagem.'); return; } if(file.size>10*1024*1024) {toast.error('Envie uma imagem de até 10 MB.');return;} const reader = new FileReader(); reader.onload = () => { if(typeof reader.result === 'string') setPhoto(reader.result); }; reader.readAsDataURL(file); };
 return <ToolPage title="Gerar imagem do prato" description="Envie a foto e os ingredientes. A IA cria a imagem pronta para o iFood." icon={ImagePlus}><span className="example-label">Prévia · geração com IA ainda não ativada</span><div className="tool-grid"><section className="tool-card"><h2><span className="step-number">1</span>Foto base de referência</h2><div className="photo-upload">{photo ? <img src={photo} alt="Foto base de referência"/> : <ImagePlus size={40}/>}<input ref={fileRef} className="sr-only" type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])}/><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload/>Enviar foto</Button><PastePhotoButton onPhoto={upload}/><Button variant="ghost" onClick={() => { const last=readLastPhoto(); if(last) setPhoto(last); else toast('Nenhuma última foto salva. Use Tirar foto do prato primeiro.'); }}>Usar minha última foto</Button></div></section><section className="tool-card"><h2><span className="step-number">2</span>Ingredientes no prato</h2><div className="ingredient-tags">{ingredients.map(item => <span key={item}>{item}<Button variant="ghost" className="tag-remove" aria-label={`Remover ${item}`} onClick={() => setIngredients(old => old.filter(t => t!==item))}><X/></Button></span>)}</div><label className="field-label">Ingredientes<input value={entry} onChange={e => { if(e.target.value.includes(',')) add(e.target.value); else setEntry(e.target.value); }} onKeyDown={e => {if(e.key==='Enter'){e.preventDefault();add(entry);}}} onBlur={() => {if(entry.trim()) add(entry);}} placeholder="Ex.: pão, carne, queijo"/></label><label className="field-label">Observações do cenário (opcional)<textarea placeholder="Ex.: prato branco sobre uma mesa de madeira" rows={4}/></label></section><section className="tool-card"><h2><span className="step-number">3</span>Formato do criativo</h2><div className="choice-stack" role="group" aria-label="Formato do criativo">{['Foto do prato 1:1','Banner do cardápio','Ícone da loja'].map((f,i) => <Button key={f} variant="outline" aria-pressed={format===f} className={format===f?'selected-choice':''} onClick={() => setFormat(f)}><ImagePlus/><span>{f}<small>{['Quadrado · proporção 1:1','1600 × 400 px','500 × 500 px'][i]}</small></span></Button>)}</div></section><section className="tool-card"><h2><span className="step-number">4</span>Estilo fotográfico</h2><div className="choice-stack" role="group" aria-label="Estilo fotográfico">{['Escuro cinematográfico','Claro de cardápio','Vermelho iFood'].map(s => <Button key={s} variant="outline" aria-pressed={style===s} className={style===s?'selected-choice':''} onClick={() => setStyle(s)}>{s}</Button>)}</div></section></div><div className="notice"><AlertTriangle/><p>A imagem precisa representar o prato real que você vende.</p></div><Button className="w-full" onClick={() => { if(!photo || !ingredients.length) {setNotice('Envie uma foto e adicione os ingredientes antes de continuar.');return;} setNotice('Geração indisponível nesta prévia visual. Nenhum crédito foi consumido.'); }}>Gerar imagem (1 crédito)</Button>{notice && <p role="status" className="notice">{notice}</p>}<section className="tool-card"><h2>Último resultado</h2><div className="empty-state"><ImagePlus/><p>Nenhuma imagem gerada ainda.</p></div><div className="flex flex-wrap gap-3"><Button variant="outline" disabled><Download/>Baixar</Button><Button asChild variant="outline"><Link to="/descricao">Usar na descrição<ArrowRight/></Link></Button></div></section></ToolPage>;
}
