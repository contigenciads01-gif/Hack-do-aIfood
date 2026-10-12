import { useRef } from 'react';
import { Camera,Upload,Copy,Download,ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PastePhotoButton } from './paste-photo';
import { toast } from 'sonner';
export async function optimizedImage(source:string):Promise<Blob> {
 const image=new Image();image.src=source;await image.decode();
 const canvas=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Imagem indisponível');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Não foi possível otimizar a imagem.')),'image/jpeg',0.85));
}
export function PromptImage({image,onChange}:{image:string;onChange:(image:string)=>void}) {
 const input=useRef<HTMLInputElement>(null);const camera=useRef<HTMLInputElement>(null);
 const receive=async(file?:File)=>{if(!file)return;if(!file.type.startsWith('image/')){toast.error('Escolha uma imagem.');return;}if(file.size>15*1024*1024){toast.error('Envie uma imagem de até 15 MB.');return;}try{const source=URL.createObjectURL(file);let blob:Blob;try{blob=await optimizedImage(source);}finally{URL.revokeObjectURL(source);}const reader=new FileReader();reader.onload=()=>{if(typeof reader.result==='string')onChange(reader.result);};reader.readAsDataURL(blob);}catch{toast.error('Não foi possível abrir esta imagem.');}};
 const copy=async()=>{try{const img=new Image();img.src=image;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d');if(!ctx)throw new Error();ctx.drawImage(img,0,0);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(),'image/png'));await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast.success('Imagem copiada.');}catch{toast.error('Não foi possível copiar a imagem. Baixe e anexe no ChatGPT.');}};
 const download=async()=>{try{const blob=await optimizedImage(image);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='imagem-empresa-otimizada.jpg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{toast.error('Não foi possível baixar a imagem.');}};
 return <div id="field-imagem"><h3>Imagem da empresa</h3><div className="photo-upload mt-4">{image?<img src={image} alt="Imagem da empresa"/>:<ImagePlus size={40}/>}<input ref={input} className="sr-only" type="file" accept="image/*" onChange={e=>receive(e.target.files?.[0])}/><input ref={camera} className="sr-only" type="file" accept="image/*" capture="environment" onChange={e=>receive(e.target.files?.[0])}/><div className="prompt-actions"><Button variant="outline" onClick={()=>input.current?.click()}><Upload/>Enviar</Button><Button variant="outline" onClick={()=>camera.current?.click()}><Camera/>Câmera</Button><PastePhotoButton onPhoto={receive}/></div></div>{image&&<div className="prompt-actions mt-4"><Button variant="outline" onClick={copy}><Copy/>Copiar imagem</Button><Button variant="outline" onClick={download}><Download/>Baixar imagem otimizada</Button></div>}<p className="mt-3">Anexe esta imagem no ChatGPT junto com o prompt.</p></div>;
}
