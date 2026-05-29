const AI_STEPS = {
  TRANSCRIBING: { id: 'transcribing', label: 'Transcrevendo áudio...', icon: '🎙️' },
  INTERPRETING: { id: 'interpreting', label: 'Interpretando seu sonho...', icon: '🔮' },
  ANALYZING: { id: 'analyzing', label: 'Analisando emoções...', icon: '💫' },
  NUMEROLOGY: { id: 'numerology', label: 'Calculando numerologia...', icon: '🔢' },
  IMAGE: { id: 'image', label: 'Gerando imagem do sonho...', icon: '🎨' },
  SPIRITUAL: { id: 'spiritual', label: 'Conectando mensagem espiritual...', icon: '✨' },
  COMPLETE: { id: 'complete', label: 'Sonho interpretado!', icon: '✅' },
  ERROR: { id: 'error', label: 'Erro na interpretação', icon: '❌' },
};

const AI_STEP_ORDER = [
  AI_STEPS.TRANSCRIBING,
  AI_STEPS.INTERPRETING,
  AI_STEPS.ANALYZING,
  AI_STEPS.NUMEROLOGY,
  AI_STEPS.SPIRITUAL,
  AI_STEPS.IMAGE,
  AI_STEPS.COMPLETE,
];

class AIService {
  constructor() {
    this.useRealAI = false;
    this.currentStep = null;
    this.onStepChange = null;
  }

  setStepCallback(callback) {
    this.onStepChange = callback;
  }

  setUseRealAI(value) {
    this.useRealAI = value;
  }

  updateStep(stepId) {
    const step = Object.values(AI_STEPS).find(s => s.id === stepId);
    if (step && this.onStepChange) {
      this.currentStep = step;
      this.onStepChange(step);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async processDream(text, options = {}) {
    const steps = options.steps || AI_STEP_ORDER.filter(s => s.id !== 'image');

    for (const step of steps) {
      this.updateStep(step.id);
      await this.sleep(options.simulateDelay ? 1500 : 500);

      if (step.id === 'image' && !options.generateImage) {
        continue;
      }
    }

    return true;
  }

  async interpretWithMock(text) {
    await this.sleep(800);
    this.updateStep('interpreting');
    await this.sleep(1200);
    this.updateStep('analyzing');
    await this.sleep(800);
    this.updateStep('numerology');
    await this.sleep(600);
    this.updateStep('spiritual');
    await this.sleep(400);
    this.updateStep('complete');

    const palestras = [
      'Este sonho pode refletir situações da sua vida em que você se sente pressionado ou perseguido.',
      'O ato de fugir ou ser perseguido frequentemente representa medos não enfrentados.',
      'Este padrão aparece quando você sente que não tem controle sobre certos aspectos da sua vida.',
      'Emocionalmente, este sonho pode indicar que você está carregando ansiedade relacionada ao futuro.',
    ];

    return {
      interpretation: palestras.join(' '),
      emotions: ['introspecção', 'reflexão'],
      spiritualMessage: 'Confie no seu processo interior. A resposta que você busca já existe dentro de você.',
      energy: 'Transformação',
      numerology: {
        vibration: 7,
        energy: 22,
        frequency: '528Hz',
        chakra: 'Terceiro Olho',
        planet: 'Netuno',
        luckyNumbers: {
          megaSena: [3, 7, 12, 23, 34, 45],
          quina: [5, 12, 23, 34, 45],
          lotofacil: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
      },
    };
  }

  async analyzeAudio(audioBlob) {
    this.updateStep('transcribing');
    await this.sleep(2000);
    return 'transcribed text';
  }

  getSteps() {
    return AI_STEPS;
  }

  getStepOrder(includeImage = false) {
    if (includeImage) return AI_STEP_ORDER;
    return AI_STEP_ORDER.filter(s => s.id !== 'image');
  }
}

const aiService = new AIService();
export default aiService;
export { AI_STEPS, AI_STEP_ORDER };
