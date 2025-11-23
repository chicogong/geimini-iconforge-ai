export enum IconStyle {
  FLAT = 'Flat Design',
  THREE_D = '3D Render',
  GRADIENT = 'Gradient',
  PIXEL = 'Pixel Art',
  OUTLINE = 'Line Art',
  NEUMORPHIC = 'Neumorphic',
  ISOMETRIC = 'Isometric',
  HAND_DRAWN = 'Hand Drawn',
  METAL = 'Metallic Chrome',
  GLASS = 'Glassmorphism'
}

export enum AspectRatio {
  SQUARE = '1:1',
}

export interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;        // The specific, enhanced prompt used for generation
  originalPrompt: string; // The original user input
  style: IconStyle;
  createdAt: number;
}

export interface GenerationConfig {
  prompt: string;
  style: IconStyle;
  count: number;
}