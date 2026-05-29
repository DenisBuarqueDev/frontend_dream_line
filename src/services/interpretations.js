export const ELEMENT_COLORS = {
  fire: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626', icon: '🔥' },
  earth: { bg: '#ECF5E7', border: '#22C55E', text: '#16A34A', icon: '🌍' },
  air: { bg: '#E0F2FE', border: '#3B82F6', text: '#2563EB', icon: '🌬️' },
  water: { bg: '#DBEAFE', border: '#0EA5E9', text: '#0284C7', icon: '💧' }
};

export const SIGN_SYMBOLS = {
  'Áries': '♈', 'Touro': '♉', 'Gêmeos': '♊', 'Câncer': '♋',
  'Leão': '♌', 'Virgem': '♍', 'Libra': '♎', 'Escorpião': '♏',
  'Sagitário': '♐', 'Capricórnio': '♑', 'Aquário': '♒', 'Peixes': '♓'
};

export const ELEMENT_DATA = {
  fire: ['Áries', 'Leão', 'Sagitário'],
  earth: ['Touro', 'Virgem', 'Capricórnio'],
  air: ['Gêmeos', 'Libra', 'Aquário'],
  water: ['Câncer', 'Escorpião', 'Peixes']
};

export const MODALITY_DATA = {
  cardinal: ['Áries', 'Câncer', 'Libra', 'Capricórnio'],
  fixed: ['Touro', 'Leão', 'Escorpião', 'Aquário'],
  mutable: ['Gêmeos', 'Virgem', 'Sagitário', 'Peixes']
};

export const PLANET_MEANINGS = {
  sun: { icon: '☀️', name: 'Essência', description: 'Sua identidade e propósito de vida' },
  moon: { icon: '🌙', name: 'Emoções', description: 'Como você sente e processa sentimentos' },
  mercury: { icon: '🗣️', name: 'Comunicação', description: 'Como você se expressa e pensa' },
  venus: { icon: '❤️', name: 'Amor', description: 'Como você ama e se relaciona' },
  mars: { icon: '⚡', name: 'Energia', description: 'Como você age e pursue metas' },
  jupiter: { icon: '🎯', name: 'Crescimento', description: 'Como você expande e evolui' },
  saturn: { icon: '🏛️', name: 'Estrutura', description: 'Suas responsabilidades e limites' },
  uranus: { icon: '⚡', name: 'Inovação', description: 'Sua originalidade e liberdade' },
  neptune: { icon: '✨', name: 'Sonhos', description: 'Sua intuição e espiritualidade' },
  pluto: { icon: '🌑', name: 'Transformação', description: 'Sua regeneração e poder pessoal' }
};

export const SIGN_INTERPRETATIONS = {
  Áries: {
    traits: 'corajoso, pioneiro, impulsivo, competitivo',
    strength: 'liderança natural e determinação',
    challenge: 'impaciência e impetuosidade'
  },
  Touro: {
    traits: 'prático, persistente, paciente, materialista',
    strength: 'estabilidade e apreço pela beleza',
    challenge: 'teimosia e resistência a mudanças'
  },
  Gêmeos: {
    traits: 'curioso, comunicativo, versátil, mental',
    strength: 'adaptabilidade e raciocínio rápido',
    challenge: 'inconstância e superficialidade'
  },
  Câncer: {
    traits: 'emotivo, protetor, intuitivo, caseiro',
    strength: 'empatia profunda e lealdade',
    challenge: 'sensibilidade excessiva e melancolia'
  },
  Leão: {
    traits: 'criativo, generoso, autoconfiante, dramático',
    strength: 'carisma natural e capacidade de inspirar',
    challenge: 'egocentrismo e necessidade de reconhecimento'
  },
  Virgem: {
    traits: 'analítico, organizado, perfeccionista, prestativo',
    strength: 'atenção aos detalhes e pragmatismo',
    challenge: 'crítica excessiva e hipocondria'
  },
  Libra: {
    traits: 'diplomático, harmonioso, social, indeciso',
    strength: 'sensibilidade estética e mediação',
    challenge: 'evitação de conflitos e superficialidade'
  },
  Escorpião: {
    traits: 'intenso, passionado, determinado, reservado',
    strength: 'poder de transformação e profundidade emocional',
    challenge: 'jealousia e tendência ao controle'
  },
  Sagitário: {
    traits: 'otimista, aventureiro, filosófico, direto',
    strength: 'visão de longo prazo e enthusiasm',
    challenge: 'imprudência e honestidade excessiva'
  },
  Capricórnio: {
    traits: 'ambicioso, disciplinado, responsável, cauteloso',
    strength: 'persistência e visão estratégica',
    challenge: 'pessimismo e rigidez'
  },
  Aquário: {
    traits: 'independente, humanitário, original, excêntrico',
    strength: 'inovação e pensamento avançado',
    challenge: 'distanciamento emocional e rebeldia'
  },
  Peixes: {
    traits: 'intuitivo, compassivo, sonhador, artístico',
    strength: 'empatia profunda e criatividade',
    challenge: 'fuga da realidade e indecisão'
  }
};

export const PLANET_IN_SIGN_INTERPRETATIONS = {
  sun: {
    Áries: 'Você nasceu para ser um pioneiro. Sua energia natural é de liderança e você não tem medo de abrir novos caminhos.',
    Touro: 'Você busca estabilidade e prazer na vida. Seu senso de valor próprio está ligado ao que você constrói e possui.',
    Gêmeos: 'Sua mente é curiosa e versátil. Você se expressa com facilidade e gosta de aprender e compartilhar conhecimento.',
    Câncer: 'Suas emoções são profundas e você tem forte conexão com família e lar. Sua identidade está entrelaçada com seus vínculos afetivos.',
    Leão: 'Você nasceu para brilhar. Sua essência é criativa, autoconfiante e você tem um coração generoso que busca reconhecimento.',
    Virgem: 'Você busca perfectionismo em tudo que faz. Sua identidade está ligada ao serviço e à análise crítica.',
    Libra: 'Você busca harmonia e beleza em todas as áreas. Seu eu está em constante equilíbrio entre relationships e ideais.',
    Escorpião: 'Você tem uma força interior poderosa. Sua identidade é marcada por transformação e profundidade emocional.',
    Sagitário: 'Você nasceu para explorar e expandir horizontes. Sua essência é otimista, aventureira e filosófica.',
    Capricórnio: 'Você é ambicioso e disciplinado. Sua identidade está ligada às conquistas materiais e status social.',
    Aquário: 'Você é único e original. Sua essência busca liberdade, inovação e contribui para o bem maior.',
    Peixes: 'Você é intuitivo e sonhador. Sua identidade está ligada ao mundo espiritual e à compaixão universal.'
  },
  moon: {
    Áries: 'Você sente tudo com intensidade e urgência. Suas emoções são fogo - nascem rapidamente e podem arder com força.',
    Touro: 'Você precisa de estabilidade emocional e segurança material. Comfort e routines são essenciais para seu bem-estar.',
    Gêmeos: 'Sua vida emocional é mental e curiosa. Você procesa sentimentos através de comunicação e variety.',
    Câncer: 'Você é profundamente emocional e intuitivo. Família e lar são seu refúgio, e você sente com empatia rara.',
    Leão: 'Você precisa de amor, atenção e reconhecimento emocional. Seus sentimentos são dramáticos e generosos.',
    Virgem: 'Você procesa emoções através da análise. Pode ter dificuldade em se permitir sentir sem entender o porquê.',
    Libra: 'Você busca harmonia emocional em relationships. Suas emoções são influenciadas pelo outro e você evita conflitos.',
    Escorpião: 'Você sente com profundidade extrema e intensidade. Suas emoções são transformadoras e podem ser obsessivas.',
    Sagitário: 'Você processa emoções através de experiências e aventuras. Sua lua busca liberdade emocional e expansão.',
    Capricórnio: 'Você é reservado emocionalmente e busca segurança através de conquistas. Pode ter dificuldade em se permitir ser vulnerável.',
    Aquário: 'Você tem uma relação única com suas emoções - intelectualiza feelings e valoriza liberdade emocional.',
    Peixes: 'Você é extremamente sensível e empático. Suas emoções são intuitivas e você absorve os sentimentos dos outros.'
  },
  mercury: {
    Áries: 'Você comunica de forma direta e assertiva. Seu discurso é enérgico e você não teme expressar suas opiniões.',
    Touro: 'Você fala de forma prática e fundamentada. Sua comunicação é paciente, mas pode ser teimosa quando убежден.',
    Gêmeos: 'Você é um comunicador nato. Fala com facilidade, agility mental e gosta de trocar ideias variadas.',
    Câncer: 'Você comunica de forma emotiva e intuitiva. Suas palavras carregam sentimentos e você é muito perceptivo.',
    Leão: 'Sua comunicação é dramática e expressiva. Você gosta de ser o centro das atenções quando fala.',
    Virgem: 'Você é analítico e preciso na comunicação. Tem facilidade com detalhes e crítica construtiva.',
    Libra: 'Você busca comunicação harmoniosa e diplomata. Gosta de mediçar e evitar confrontos diretos.',
    Escorpião: 'Sua comunicação é intensa e perspicaz. Você sabe o que dizer para impactar e pode ser sarcástico.',
    Sagitário: 'Você comunica com enthusiasm e honesty brutal. Gosta de discutir filosofia e ampliar horizontes.',
    Capricórnio: 'Você comunica de forma estratégica e objetivos. Fala pouco, mas quando fala, suas palavras têm peso.',
    Aquário: 'Sua comunicação é original e inovadora. Você compartilha ideias únicas e desafia convenções.',
    Peixes: 'Você comunica de forma intuitiva e às vezes confusa. Suas palavras carregam profundidade espiritual.'
  },
  venus: {
    Áries: 'Você ama com paixão e competitividade. Relationships são uma aventura e você gosta de perseguir.',
    Touro: 'Você ama com sensualidade e constância. Beleza, conforto e loyalty são essenciais em seus vínculos.',
    Gêmeos: 'Você ama com curiosidade e versatilidad. Gosta de conversas intelectuales e variety emocional.',
    Câncer: 'Você ama com profundidade emocional e lealdade. Família e伴侣 são seu mundo, e você se entrega fully.',
    Leão: 'Você ama com intensidade e generosidade. Precisa de admiração e gosta de mimos e demonstrations públicas.',
    Virgem: 'Você ama de forma prática e demonstra affection através de acts de serviço. Pode ser crítico.',
    Libra: 'Você ama buscando harmonia e beleza. Relationships são essenciais e você evita conflitos a todo custo.',
    Escorpião: 'Você ama com intensidade transformadora. Suas connections são profundas e você não faz nada pela metade.',
    Sagitário: 'Você ama com liberdade e optimism. Não suporta limitaciones e busca experiências compartilhadas.',
    Capricórnio: 'Você ama de forma sólida e comprometida. Status e stability são importantes em seus vínculos.',
    Aquário: 'Você ama de forma única e independent. Valorie intellectual connection e pode parecer distante.',
    Peixes: 'Você ama de forma romântica e idealista. Se entrega completamente e busca almas gêmeas.'
  },
  mars: {
    Áries: 'Você age com impulso e pioneirismo. Seu drive é de liderança e você vai direto ao ponto.',
    Touro: 'Você age com persistência e determinação. Quando quer algo, não desiste facilmente.',
    Gêmeos: 'Você age com mental agility e curiosity. Gosta de múltiplas frentes e variety.',
    Câncer: 'Você age guiado pelas emoções e protectiveness. Defende sua família com unhas e dentes.',
    Leão: 'Você age com confidence e dramatic flair. Gosta de ser o protagonista e brilhar em tudo que faz.',
    Virgem: 'Você age com precision e análisis. Metódico e trabalhador, busca perfectionismo.',
    Libra: 'Você tem dificuldade em agir de forma agressiva. Prefere Diplomacy e pode evitar confrontos.',
    Escorpião: 'Você age com intensidade estratégica. Quando quer algo, não mede esforços para alcançar.',
    Sagitário: 'Você age com enthusiasm e adventure. Gosta de desafios e supera obstáculos com optimism.',
    Capricórnio: 'Você age com ambição e disciplina. Trabalha duro para conquistar objetivos de longo prazo.',
    Aquário: 'Você age de forma original e inesperada. Gosta de desafiar regras e inovar.',
    Peixes: 'Você age de forma intuitiva e às vezes indireta. Pode ter difficulty em se afirmar.'
  }
};

export function getSignElement(sign) {
  for (const [element, signs] of Object.entries(ELEMENT_DATA)) {
    if (signs.includes(sign)) return element;
  }
  return null;
}

export function getElementColor(sign) {
  const element = getSignElement(sign);
  return element ? ELEMENT_COLORS[element] : null;
}

export function generateInsights(chartData) {
  const insights = [];
  
  if (!chartData?.planets) return insights;
  
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  
  chartData.planets.forEach(planet => {
    const element = getSignElement(planet.sign);
    if (element) elementCounts[element]++;
    
    for (const [modality, signs] of Object.entries(MODALITY_DATA)) {
      if (signs.includes(planet.sign)) modalityCounts[modality]++;
    }
  });
  
  const dominantElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (dominantElement[1] >= 3) {
    const elementLabels = {
      fire: 'signos de Fogo',
      earth: 'signos de Terra',
      air: 'signos de Ar',
      water: 'signos de Água'
    };
    
    const elementInsights = {
      fire: {
        positive: 'Personalidade intensa e energética',
        text: 'Você tem uma presença marcante. Sua energia é inspiradora e você não passa despercebido.'
      },
      earth: {
        positive: 'Pés no chão e muito prático',
        text: 'Você tem uma base sólida. Pessoas confiam em você por sua estabilidade e pragmatismo.'
      },
      air: {
        positive: 'Mente aberta e comunicativo',
        text: 'Você pensa de forma livre e original. Sua comunicação traz novas perspectivas.'
      },
      water: {
        positive: 'Intuição profunda e sensibilidade',
        text: 'Você sente as coisas profundamente. Sua sensibilidade é um dom que poucos possuem.'
      }
    };
    
    insights.push({
      type: 'positive',
      icon: ELEMENT_COLORS[dominantElement[0]].icon,
      title: `Forte presença de ${elementLabels[dominantElement[0]]}`,
      description: elementInsights[dominantElement[0]].text
    });
  }
  
  const dominantModality = Object.entries(modalityCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (dominantModality[1] >= 4) {
    const modalityInsights = {
      cardinal: 'Você toma a iniciativa facilmente. Gosta de começar projetos e liderar caminhos.',
      fixed: 'Você é consistente e determinado. Quando se compromete, não desiste facilmente.',
      mutable: 'Você se adapta com facilidade. Flexível e capaz de lidar com mudanças.'
    };
    
    insights.push({
      type: 'info',
      icon: '🎯',
      title: `Predominância de energia ${dominantModality[0]}`,
      description: modalityInsights[dominantModality[0]]
    });
  }
  
  const sunElement = getSignElement(chartData.sunSign);
  const moonElement = getSignElement(chartData.moonSign);
  
  if (sunElement && moonElement && sunElement !== moonElement) {
    const combinations = {
      'fire-water': 'Há um equilíbrio entre sua essência (fogo) e suas emoções (água), criando profundidade interior.',
      'fire-earth': 'Sua energia de fogo encontra estabilidade na terra, dando-lhe capacidade de realizar seus sonhos.',
      'fire-air': 'Seu fogo se combina com o ar, alimentando criatividade e comunicação expressiva.',
      'earth-water': 'Sensibilidade profunda combinada com pragmatismo, dando-lhe empatia prática.',
      'earth-air': 'Estabilidade prática aliada à mentalidade开放, equilibrando tradição e inovação.',
      'air-water': 'Mente lógica em harmonia com intuição, dando-lhe perspectivas únicas.'
    };
    
    const key = [sunElement, moonElement].sort().join('-');
    if (combinations[key]) {
      insights.push({
        type: 'info',
        icon: '✨',
        title: 'Equilíbrio Solar-Lunar',
        description: combinations[key]
      });
    }
  }
  
  return insights;
}

export function generateCombinedInterpretation(chartData) {
  if (!chartData) return '';
  
  const sun = chartData.sunSign || '';
  const moon = chartData.moonSign || '';
  const ascendant = chartData.ascendant || '';
  
  const sunTrait = SIGN_INTERPRETATIONS[sun]?.traits || '';
  const sunStrength = SIGN_INTERPRETATIONS[sun]?.strength || '';
  const moonTrait = SIGN_INTERPRETATIONS[moon]?.traits || '';
  const ascendantTrait = SIGN_INTERPRETATIONS[ascendant]?.traits || '';
  
  const interpretations = [
    `Seu Sol em ${sun} revela que ${sunTrait}. Esta é sua essência profunda - o que você realmente é no fundo.`,
    `Com a Lua em ${moon}, você ${moonTrait}. Suas emoções e intuição seguem este padrão, muitas vezes inconscientemente.`,
    `Seu Ascendente em ${ascendant} é como você se apresenta ao mundo. Pessoas te veem como alguém ${ascendantTrait}.`,
    `${sunStrength}. Este é seu superpoder natal.`,
    `A combinação desses três elementos cria uma personalidade que busca equilíbrio entre ação e feeling.`
  ];
  
  return interpretations.join(' ');
}