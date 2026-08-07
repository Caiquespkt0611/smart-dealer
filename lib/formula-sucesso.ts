// Fórmula do Sucesso — diagnóstico honesto, item por item do formulário de
// avaliação (pptx da Yamaha). Para cada sub-item: onde isso JÁ EXISTE no
// trabalho, e o que fazer para pontuar 5.
// Não é justificativa — é checklist de preparação para a 2ª banca.

export type StatusItem = 'temos' | 'parcial' | 'falta'

export interface ItemFormula {
  item: string          // texto do formulário de avaliação
  status: StatusItem
  onde: string          // onde isso está no trabalho hoje (vazio se falta)
  fazer: string         // orientação concreta para a 2ª banca
}

export interface CriterioFormula {
  criterio: string
  nota1aBanca: number
  itens: ItemFormula[]
}

export const formulaDiagnostico: CriterioFormula[] = [
  {
    criterio: 'Pesquisa',
    nota1aBanca: 3.78,
    itens: [
      {
        item: 'Análises externas foram devidamente realizadas',
        status: 'temos',
        onde: 'Mercado real de emplacamento (5.346 motos Jan–Jul nas áreas da Nippon), 13 áreas da regional mapeadas, dados da Receita/BrasilAPI. Telas Market Share e Performance.',
        fazer: 'Levar 2 prints (Market Share e Performance) e citar as fontes na fala: base de emplacamento Yamaha + Receita Federal.',
      },
      {
        item: 'Análises dos concorrentes foram realizadas',
        status: 'parcial',
        onde: 'Concorrentes do MERCADO: 230 CNPJs mapeados, 175 nomeados, invasão de território por CNPJ. O que não foi feito formalmente: concorrentes da SOLUÇÃO (outros softwares de gestão/CRM para concessionárias).',
        fazer: 'Montar 1 slide de benchmark: 3–4 ferramentas do mercado (ex.: CRMs de concessionária genéricos) × Smart Dealer, mostrando o que só ele tem (regras Yamaha codificadas: carta, Kaizen, K2, circular de campanha). A banca perguntou exatamente isso.',
      },
      {
        item: 'Pesquisas e análises de mercado foram suficientes',
        status: 'temos',
        onde: 'Dados duros: share por segmento/cidade, decomposição mercado×share, DRE (K2), circular de campanha. Tudo com fonte oficial.',
        fazer: 'Na fala, ancorar cada análise na fonte ("isso vem do DRE BMI", "isso vem do emplacamento") — a banca valoriza rastreabilidade.',
      },
      {
        item: 'As hipóteses do trabalho foram claras a partir das análises realizadas',
        status: 'falta',
        onde: 'A hipótese está implícita ("dados integrados → decisão melhor"), mas nunca foi escrita como hipótese testável.',
        fazer: 'Escrever 3 hipóteses no formato "se X, então Y": (1) se o lead é atendido em ≤10 min, a conversão sobe; (2) se o plano de ação nasce dos números, ele é executado (PDCA); (3) se o pós-vendas absorve 65% das despesas, a pressão sobre o varejo cai. Mostrar que o sistema MEDE as três.',
      },
    ],
  },
  {
    criterio: 'Planejamento e Objetivos',
    nota1aBanca: 4.0,
    itens: [
      {
        item: 'O objetivo do trabalho é claro e definido',
        status: 'parcial',
        onde: '"Sistema de gerenciamento inteligente para concessionário e cliente" — claro, mas amplo.',
        fazer: 'Fechar em UMA frase com verbo e alvo: "Aumentar o atingimento de carta e a absorção do pós-vendas da Nippon usando decisão guiada por dados". Repetir a mesma frase em todo material.',
      },
      {
        item: 'O objetivo do trabalho é mensurável',
        status: 'falta',
        onde: 'Os KPIs existem nas telas, mas não há metas-número do PROJETO declaradas.',
        fazer: 'Declarar 3 metas com prazo: (1) carta ≥100% em setembro (campanha em jogo); (2) absorção 65% até dezembro (hoje 49,4%); (3) atendimento de lead ≤10 min. O sistema já mede as três — a meta vira compromisso público.',
      },
      {
        item: 'O objetivo foi atingido no prazo',
        status: 'parcial',
        onde: 'As entregas aconteceram (6 módulos em produção), mas sem cronograma formal apresentado.',
        fazer: 'Slide de linha do tempo com datas REAIS das entregas (jun: dashboard/NPS; 21/06: inteligência; 22/06: pós-vendas/CRM/campanhas; ago: performance+PDCA, K2, crédito, campanha). O histórico existe — é só mostrar.',
      },
      {
        item: 'Os KPIs estão alinhados com os objetivos',
        status: 'temos',
        onde: 'Cada tela tem KPI com meta: carta do mês, absorção >65%, PE <50%, lead ≤10 min, NPS 93/87, pontos Kaizen.',
        fazer: 'Mostrar na banca 1 tela por KPI, sempre ligando ao objetivo-frase.',
      },
      {
        item: 'O plano de ação está alinhado com os objetivos',
        status: 'temos',
        onde: 'O PDCA sai do sistema no formato oficial Yamaha, com ações nascidas dos números (ritmo, segmentos, praças, invasão).',
        fazer: 'Gerar o PDCA ao vivo na banca — é o momento mais forte da demonstração.',
      },
      {
        item: 'O objetivo está relacionado aos resultados',
        status: 'parcial',
        onde: 'Resultados do piloto já existem: R$ 7.500 garantidos na campanha, absorção 30%→49%, mercado decomposto.',
        fazer: 'Consolidar num slide "o que o piloto já produziu" com 3 números — e prometer a leitura de setembro (fechamento da campanha) na banca seguinte.',
      },
    ],
  },
  {
    criterio: 'Foco no Cliente',
    nota1aBanca: 3.83,
    itens: [
      {
        item: 'O público alvo (cliente) foi claramente definido',
        status: 'parcial',
        onde: 'Na prática há dois clientes: o concessionário (titular/gerente/vendedor/mecânico — cada um com acesso próprio) e o comprador de moto. Nunca foi formalizado.',
        fazer: 'Slide com as personas: 5 papéis internos (o sistema já tem os 5 perfis de acesso!) + o cliente final. Usar os perfis reais do login como prova.',
      },
      {
        item: 'O posicionamento Yamaha foi claramente definido',
        status: 'falta',
        onde: 'Não há declaração de posicionamento no material.',
        fazer: 'Uma frase: "a Yamaha como a marca que responde o cliente em minutos e acompanha a moto a vida inteira (revisão → recompra)". Amarrar na régua de revisões e no atendimento ≤10 min.',
      },
      {
        item: 'A Yamaha ficou claramente posicionada de forma diferenciada em relação aos concorrentes',
        status: 'parcial',
        onde: 'A diferenciação aparece nos dados (share por segmento vs Honda), mas não como proposta de experiência.',
        fazer: 'Conectar: "a Honda vende mais motos; a Yamaha pode atender melhor" — e o Smart Dealer é a ferramenta dessa diferenciação (tempo de resposta, jornada, pós-vendas).',
      },
      {
        item: 'Existe consistência entre o público alvo e as atividades',
        status: 'temos',
        onde: 'Cada papel vê só o que usa: mecânico → assistente técnico; vendedor → CRM/campanhas/playbook; titular → tudo.',
        fazer: 'Demonstrar trocando de login na banca (30 segundos, efeito grande).',
      },
      {
        item: 'Necessidades e desejos dos clientes foram definidos',
        status: 'parcial',
        onde: 'A dor do "limbo do lead" foi validada pela própria banca (Cintia). Necessidades do cliente final estão implícitas nas conversas reais (preço, parcela, aprovação).',
        fazer: 'Listar 5 necessidades com evidência: resposta rápida, transparência de crédito, lembrete de revisão, oferta certa, acompanhamento pós-venda. Cada uma com a tela que atende.',
      },
      {
        item: 'Os principais fatores de compra dos clientes foram definidos',
        status: 'falta',
        onde: 'As conversas reais de WhatsApp (formato Motoryama) mostram os fatores — parcela, aprovação de crédito, entrada — mas nunca foram tabulados.',
        fazer: 'Tabular 20–30 conversas do piloto: % que pergunta parcela, % travado em crédito, % que pede foto/ficha técnica. Vira slide "fatores de compra medidos, não achados".',
      },
      {
        item: 'Os 7 passos foram claramente descritos',
        status: 'falta',
        onde: 'A jornada dos 7 passos da venda Yamaha não foi mapeada no material.',
        fazer: 'Mapear os 7 passos (recepção → sondagem → apresentação → test-ride → negociação → fechamento → entrega/pós) e marcar ONDE o Smart Dealer atua em cada um. 1 slide resolve.',
      },
      {
        item: 'Pesquisas com clientes foram realizadas',
        status: 'falta',
        onde: 'Nenhuma pesquisa direta com clientes finais foi feita pelo grupo (o NPS é da Yamaha, não do projeto).',
        fazer: 'AÇÃO DE MAIOR IMPACTO NA NOTA: entrevistar 5–10 clientes da Nippon (2 perguntas: como foi ser atendido? o que faria voltar?) e citar as falas na banca. Custa uma tarde.',
      },
    ],
  },
  {
    criterio: 'Pensar Fora da Caixa',
    nota1aBanca: 4.33,
    itens: [
      {
        item: 'O trabalho é revolucionário e capaz de mudar o comportamento do cliente',
        status: 'parcial',
        onde: 'A régua de revisão com disparo WhatsApp muda a relação pós-venda; o atendimento monitorado muda a experiência do lead.',
        fazer: 'Trazer 1 caso real do piloto (um cliente que voltou pela régua) — uma história vale mais que dez telas.',
      },
      {
        item: 'O trabalho é revolucionário e mudou drasticamente o processo',
        status: 'temos',
        onde: 'PDCA de horas para 1 clique; atualização mensal de redigitação para publicação única; crédito de ligação para semáforo. Tabela com/sem no Dossiê.',
        fazer: 'Mostrar a tabela com/sem e cravar: "não digitalizamos o processo antigo — trocamos o processo".',
      },
      {
        item: 'O trabalho gerou uma vantagem competitiva para a Yamaha',
        status: 'temos',
        onde: 'O know-how codificado (dois relógios, decomposição, K2, circulares) — respondendo à pergunta da 1ª banca: a vantagem é o COMO, não o software.',
        fazer: 'Responder a pergunta da banca de frente, com essa formulação, logo no início.',
      },
      {
        item: 'O trabalho resultou em um conhecimento avançado para nosso segmento',
        status: 'temos',
        onde: 'Método replicável: decomposição mercado×share, absorção lida do DRE, PDCA automático — documentado e rodando.',
        fazer: 'Oferecer o método como padrão para a rede (o consultor da regional já usa nas 9 CCYs).',
      },
      {
        item: 'O trabalho gerou grandes receitas',
        status: 'parcial',
        onde: 'R$ 7.500 garantidos + até R$ 100 mil em jogo na campanha; gap de absorção quantificado (~R$ 41 mil/mês de MC).',
        fazer: 'Consolidar em UM número-manchete: "potencial de R$ 400 mil/ano só em prêmios de campanha + R$ 490 mil/ano fechando o gap do K2". Fechamento de setembro vira a prova.',
      },
    ],
  },
  {
    criterio: 'Trabalho em Equipe',
    nota1aBanca: 4.25,
    itens: [
      {
        item: 'O trabalho em equipe realizado pelo grupo foi claramente percebido',
        status: 'parcial',
        onde: 'O grupo funciona (nota 4,25), mas a divisão de papéis não foi explicitada na apresentação.',
        fazer: 'Slide "quem fez o quê" (Caique: dados/consultoria de campo; Klenilson: narrativa/arquitetura; Evandro/João Paulo/Camila: frentes) e revezar a fala na 2ª banca — foi o critério com maior distância para o Top 3 (−0,11).',
      },
      {
        item: 'O trabalho em equipe entre concessionária e grupo foi percebido',
        status: 'temos',
        onde: 'A Nippon paga o piloto (R$ 600/mês), usa no dia a dia e os dados são dela. Orientador Paulo Lopes acompanhando.',
        fazer: 'Gravar 60 segundos do titular da Nippon contando o que mudou — depoimento na 2ª banca vale mais que qualquer slide.',
      },
    ],
  },
  {
    criterio: 'Viabilidade e Impacto',
    nota1aBanca: 4.17,
    itens: [
      {
        item: 'O trabalho é viável para implantação em outras concessionárias',
        status: 'temos',
        onde: 'SaaS sem instalação, R$ 600/mês, banco multi-grupo desde o dia 1 (os 9 grupos da regional já estão na base de varejo/metas).',
        fazer: 'Mostrar a tabela Meta com os 9 grupos no banco: "a estrutura para escalar já existe — falta só o acesso de cada um".',
      },
      {
        item: 'Há possibilidade de bons resultados se o trabalho for implementado em outras concessionárias',
        status: 'parcial',
        onde: 'O método já rodou para outro grupo fora do sistema: os PDCAs da NOBRE MOTOS (Caraguatatuba e Mogi) existem no projeto Performance Concessionário.',
        fazer: 'Levar o PDCA da NOBRE como prova de replicabilidade: "mesmo método, outro grupo, sem mudar uma linha". É o argumento de escala mais barato que temos.',
      },
    ],
  },
]

export function resumoDiagnostico() {
  const todos = formulaDiagnostico.flatMap(c => c.itens)
  return {
    total: todos.length,
    temos: todos.filter(i => i.status === 'temos').length,
    parcial: todos.filter(i => i.status === 'parcial').length,
    falta: todos.filter(i => i.status === 'falta').length,
  }
}

// As 5 ações de maior impacto na nota, em ordem de prioridade
export const prioridadesBanca = [
  { acao: 'Pesquisa com 5–10 clientes reais da Nippon (2 perguntas, uma tarde)', criterio: 'Foco no Cliente', porque: 'Único critério com dois sub-itens zerados (pesquisas e fatores de compra) — e o de nota mais baixa depois de Pesquisa.' },
  { acao: 'Escrever as 3 hipóteses testáveis + 3 metas-número com prazo', criterio: 'Pesquisa + Planejamento', porque: 'Transforma "sistema bonito" em "experimento com resultado" — linguagem que a banca usa.' },
  { acao: 'Mapear os 7 passos da venda e onde o sistema atua em cada um', criterio: 'Foco no Cliente', porque: 'Item explícito do formulário que hoje está em branco. 1 slide resolve.' },
  { acao: 'Depoimento de 60s do titular da Nippon em vídeo', criterio: 'Equipe + Viabilidade', porque: 'Prova o "concessionária + grupo" e humaniza — Equipe foi a maior distância para o Top 3.' },
  { acao: 'Benchmark de 3–4 soluções concorrentes × Smart Dealer', criterio: 'Pesquisa + Fora da Caixa', porque: 'A banca perguntou "qual a exclusividade?" — responder com tabela, não com discurso.' },
] as const
