export enum AIModel {
  FLUX_DEV = 'flux-dev'
}

export const AIModelLabels: Record<AIModel, string> = {
  [AIModel.FLUX_DEV]: 'Flux Dev (Default)'
};

export const AIDomainURLs: Record<AIModel, string> = {
  [AIModel.FLUX_DEV]: 'https://queue.fal.run/fal-ai/flux/dev'
};