import React from 'react';

export function AmbientLighting() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Luz vermelha difusa no topo centro/direita (glow principal do restaurante) */}
      <div className="absolute top-[-10%] right-[15%] h-[480px] w-[560px] rounded-full bg-[#EA1D2C]/15 blur-[130px] animate-ambient-pulse-slow" />

      {/* Luz vermelha sutil no centro-baixo (reflexo na mesa e celular) */}
      <div className="absolute top-[35%] right-[28%] h-[320px] w-[360px] rounded-full bg-[#EA1D2C]/10 blur-[100px] animate-ambient-drift" />

      {/* Luz vermelha no canto superior esquerdo (reflexo discreto na área de login) */}
      <div className="absolute top-[-5%] left-[-5%] h-[360px] w-[400px] rounded-full bg-[#EA1D2C]/[0.07] blur-[110px]" />

      {/* Brilho pulsante suave no centro para sensação de iluminação cinematográfica */}
      <div className="absolute bottom-[5%] right-[10%] h-[300px] w-[420px] rounded-full bg-[#FF2E3E]/[0.08] blur-[90px] animate-ambient-pulse-glow" />

      {/* Linha de reflexo sutil diagonal no topo esquerdo (estilo neon cinematográfico da referência) */}
      <div className="absolute top-0 left-0 w-48 h-96 opacity-30 bg-gradient-to-br from-[#EA1D2C]/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
