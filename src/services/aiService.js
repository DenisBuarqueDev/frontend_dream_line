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
    this.currentStep = null;
    this.onStepChange = null;
  }

  setStepCallback(callback) {
    this.onStepChange = callback;
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
