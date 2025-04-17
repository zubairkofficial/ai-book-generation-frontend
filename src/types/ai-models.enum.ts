export enum AIModel {
  FAL_AI_XL = 'fal-ai-xl',
  FAL_AI_V2 = 'fal-ai-v2',
  STABLE_DIFFUSION = 'stable-diffusion',
  STABLE_DIFFUSION_XL = 'stable-diffusion-xl'
}

export const AIModelLabels: Record<AIModel, string> = {
  [AIModel.FAL_AI_XL]: 'FAL AI XL (Latest)',
  [AIModel.FAL_AI_V2]: 'FAL AI V2',
  [AIModel.STABLE_DIFFUSION]: 'Stable Diffusion',
  [AIModel.STABLE_DIFFUSION_XL]: 'Stable Diffusion XL'
}; 

export const AIDomainURLs: Record<AIModel, string> = {
    [AIModel.FAL_AI_XL]: 'https://queue.fal.run/fal-ai/flux-pro/v1.1',
    [AIModel.FAL_AI_V2]: 'https://queue.fal.run/fal-ai/flux-pro/v1.1',
    [AIModel.STABLE_DIFFUSION]: 'https://api.stablediffusionapi.com/v3',
    [AIModel.STABLE_DIFFUSION_XL]: 'https://api.stablediffusionapi.com/v3-xl'
  };