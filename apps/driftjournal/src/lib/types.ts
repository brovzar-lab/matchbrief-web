export interface VoiceThought {
  id: string;
  text: string;
  recordedAt: string;
  duration: number;
  clusterId: string;
  clusterConfidence: number;
}

export interface ThemeCluster {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  emoji: string;
  thoughts: VoiceThought[];
}

export interface ResurfacedThought {
  thought: VoiceThought;
  relevanceScore: number;
  reason: string;
}
