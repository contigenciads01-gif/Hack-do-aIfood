import { useState, useEffect } from 'react';

export type CompanyEditorSection = 'identidade' | 'contato' | 'localizacao' | 'negocio';

let globalOpenState = false;
let globalSection: CompanyEditorSection = 'identidade';
const listeners = new Set<() => void>();

export function openCompanyEditor(section: CompanyEditorSection = 'identidade') {
  globalSection = section;
  globalOpenState = true;
  listeners.forEach((l) => l());
}

export function closeCompanyEditor() {
  globalOpenState = false;
  listeners.forEach((l) => l());
}

export function useCompanyEditorState() {
  const [open, setOpen] = useState(globalOpenState);
  const [section, setSection] = useState<CompanyEditorSection>(globalSection);

  useEffect(() => {
    const handler = () => {
      setOpen(globalOpenState);
      setSection(globalSection);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    open,
    section,
    setOpen: (val: boolean) => {
      if (!val) closeCompanyEditor();
      else openCompanyEditor(section);
    },
    setSection: (s: CompanyEditorSection) => {
      globalSection = s;
      setSection(s);
    },
    openEditor: openCompanyEditor,
    closeEditor: closeCompanyEditor,
  };
}
