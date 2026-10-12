import { describe,it,expect } from 'vitest';
import { buildMetaprompt,renderTemplate } from './metaprompt';
import { templates } from '@/data/metaprompts';
describe('metaprompt engine',()=>{
 it('reports required and conditional image fields',()=>{expect(buildMetaprompt('T1',{modo:'aprimorar'}).missing).toEqual(expect.arrayContaining(['nome_loja','categoria','nome_prato','ingredientes','imagem']));expect(buildMetaprompt('T3',{origem:'criar'}).missing).toContain('simbolo');});
 it('renders lists and list equality',()=>{expect(renderTemplate('{{itens}} {{#if itens=b}}ok{{/if}}',{itens:['a','b','c']})).toBe('a, b e c ok');});
 it('handles empty, false and nested conditions',()=>{expect(renderTemplate('{{#if x=}}vazio{{/if}}{{#if x}}não{{/if}}',{})).toBe('vazio');expect(renderTemplate('{{#if a}}{{#if b=x}}sim{{/if}}{{/if}}',{a:true,b:'x'})).toBe('sim');});
 it('leaves no template placeholders in all nine templates',()=>{for(const id of Object.keys(templates))expect(buildMetaprompt(id,{}).text).not.toContain('{{');});
 it('uses category and custom style without invented facts',()=>{const result=buildMetaprompt('T1',{modo:'criar',nome_loja:'Burgerei',categoria:'Hamburgueria',nome_prato:'Smash',ingredientes:['pão','carne'],estilo:'Personalizado',estilo_livre:'luz de janela'});expect(result.text).toContain('pão e carne');expect(result.text).toContain('luz de janela');expect(result.missing).toEqual([]);});
 it('validates limits and commission without defaulting it',()=>{expect(buildMetaprompt('T9',{}).missing).toContain('comissao');expect(buildMetaprompt('T9',{comissao:'120'}).invalid).toContain('comissao');expect(buildMetaprompt('T2',{pratos_destaque:['a','b','c','d']}).invalid).toContain('pratos_destaque');});
});
