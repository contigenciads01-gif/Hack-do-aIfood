export const brandPacks: Record<string, { cues: string; cores: string; evitar: string; logo: string }> = {
  "Hamburgueria": {
    "cues": "pão brioche brilhante, carne suculenta com queijo derretendo, camadas visíveis em ângulo de 3/4 ou corte lateral, tábua escura ou papel manteiga.",
    "cores": "vermelho, amarelo mostarda, preto, madeira.",
    "evitar": "ketchup escorrendo em excesso, alface murcha, ingredientes que não estão no lanche.",
    "logo": "tipografia robusta, símbolo de pão, chama ou brasa, selo ou carimbo."
  },
  "Pizzaria": {
    "cues": "queijo esticando, borda dourada, fatia sendo levantada, tábua de madeira ou caixa de pizza aberta.",
    "cores": "vermelho tomate, verde manjericão, creme, madeira.",
    "evitar": "pizza queimada, cobertura diferente da que a loja vende, excesso de óleo.",
    "logo": "forno, fatia, tipografia artesanal ou clássica."
  },
  "Açaí e sobremesas geladas": {
    "cues": "copo ou tigela com camadas definidas, frutas frescas, textura gelada com leve brilho, colher à vista.",
    "cores": "roxo, verde, rosa, branco.",
    "evitar": "derretido demais, cores artificiais, coberturas que não estão no pedido.",
    "logo": "fruta ou copo estilizado, tipografia arredondada e alegre."
  },
  "Japonesa": {
    "cues": "peças alinhadas, peixe fresco com brilho, arroz definido, hashi, prato escuro e fosco.",
    "cores": "preto, vermelho, branco, dourado discreto.",
    "evitar": "peças diferentes das vendidas, molho em excesso, ambientação que sugira restaurante de luxo se a loja é de entrega popular.",
    "logo": "traço limpo, símbolo minimalista, carimbo (hanko)."
  },
  "Marmitaria e comida caseira": {
    "cues": "marmita aberta com divisão clara dos itens, arroz e feijão soltos, cores naturais, vapor leve.",
    "cores": "verde, laranja, marrom, branco.",
    "evitar": "porção maior que a real, acompanhamentos que não vão na marmita.",
    "logo": "panela, colher, tipografia amigável e legível."
  },
  "Doces e bolos": {
    "cues": "fatia ou unidade em primeiro plano, corte mostrando o recheio, fundo claro, luz suave.",
    "cores": "rosa, creme, chocolate, dourado.",
    "evitar": "brilho artificial, decoração que a loja não faz, tamanho exagerado.",
    "logo": "confeito, laço, tipografia delicada ou manuscrita."
  },
  "Padaria e café": {
    "cues": "pães dourados, café com vapor, tábua ou cesto, luz de manhã.",
    "cores": "marrom, creme, verde, laranja queimado.",
    "evitar": "produtos que a loja não faz, aparência fria ou sem vida.",
    "logo": "espiga de trigo, xícara, carimbo artesanal."
  },
  "Lanches e salgados": {
    "cues": "salgado dourado e crocante, recheio à mostra, porção em cestinha ou papel.",
    "cores": "amarelo, vermelho, marrom, branco.",
    "evitar": "óleo escorrendo, empilhar mais unidades do que o pedido.",
    "logo": "tipografia forte, símbolo simples e popular."
  },
  "Saudável e fit": {
    "cues": "ingredientes frescos e coloridos, bowl bem organizado, luz natural, fundo claro.",
    "cores": "verde, branco, laranja, madeira clara.",
    "evitar": "alegações de saúde na imagem, porções irreais, folhas murchas.",
    "logo": "folha ou grão estilizado, traço leve, tipografia limpa."
  },
  "Árabe": {
    "cues": "esfihas e kibes alinhados, pão sírio, ervas frescas, bandeja de metal ou madeira.",
    "cores": "terracota, verde oliva, dourado, creme.",
    "evitar": "estereótipos exagerados, acompanhamentos que não vão no pedido.",
    "logo": "padrão geométrico, caligrafia estilizada com leitura fácil em português."
  },
  "Churrasco e espetos": {
    "cues": "carne com marcas de grelha, brasa ao fundo, tábua de madeira, ponto da carne visível.",
    "cores": "vermelho escuro, preto, laranja brasa, madeira.",
    "evitar": "carne crua ou seca demais, fumaça exagerada.",
    "logo": "brasa, espeto, selo de carimbo."
  },
  "Sorveteria": {
    "cues": "bolas definidas, casquinha ou copo, cores vivas, ambiente claro.",
    "cores": "rosa, azul claro, amarelo, branco.",
    "evitar": "sorvete derretido, sabores que a loja não tem.",
    "logo": "casquinha estilizada, tipografia divertida."
  },
  "Bebidas": {
    "cues": "copo ou garrafa com gotas de condensação, gelo, fatia da fruta, fundo limpo.",
    "cores": "cores da bebida, branco, azul gelo.",
    "evitar": "marcas de terceiros visíveis, copo vazio ou sujo.",
    "logo": "copo ou gota estilizados, tipografia limpa."
  },
  "Mercado e conveniência": {
    "cues": "produtos organizados, embalagem frontal visível, fundo neutro.",
    "cores": "verde, amarelo, branco.",
    "evitar": "logotipos de terceiros em destaque, desordem.",
    "logo": "carrinho ou cesta, tipografia direta."
  },
  "Outro (qualquer comércio)": {
    "cues": "produto em destaque, fundo limpo, luz suave, foco no que é vendido.",
    "cores": "derive da marca da loja; se não houver, use duas cores de contraste e um neutro.",
    "evitar": "elementos que a loja não vende, excesso de decoração.",
    "logo": "símbolo simples que funcione pequeno, tipografia legível."
  }
};
export const photoStyles: Record<string,string> = {
  "Escuro cinematográfico": "fundo escuro fosco quase preto, luz lateral quente com contraluz suave, contraste médio-alto, sombras profundas com detalhe, profundidade de campo rasa e leve vapor se o prato for quente.",
  "Claro de cardápio": "fundo claro e neutro, luz natural difusa de janela, sombras suaves, cores naturais e fiéis, aparência limpa de cardápio profissional.",
  "Vermelho iFood": "fundo ou superfície em vermelho vivo (#EA1D2C) como cor de apoio, luz limpa e brilhante, contraste vibrante, sem logotipos ou elementos de marcas de terceiros.",
  "Personalizado": "usa o texto do campo estilo_livre."
};
