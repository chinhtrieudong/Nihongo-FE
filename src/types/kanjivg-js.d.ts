declare module "kanjivg-js" {
  export interface KanjiData {
    character: string;
    unicode: string;
    variant?: string;
    isVariant: boolean;
    strokes: StrokeData[];
    groups: GroupData[];
    radicalInfo?: RadicalInfo;
    strokeCount: number;
    components?: string[];
  }

  export interface StrokeData {
    strokeNumber: number;
    path: string;
    strokeType: string;
    numberPosition?: {
      x: number;
      y: number;
    };
    groupId?: string;
    isRadicalStroke?: boolean;
  }

  export interface GroupData {
    id: string;
    element?: string;
    radical?: string;
    position?: string;
    childStrokes: number[];
    children: GroupData[];
  }

  export interface RadicalInfo {
    radical: string;
    positions: string[];
    strokeRanges: number[][];
  }

  export interface AnimationOptions {
    strokeDelay: number;
    strokeSpeed?: number;
    animationStartDelay?: number;
    showNumbers: boolean;
    loop: boolean;
    showTrace: boolean;
    animate?: boolean;
    strokeStyling: StrokeStyling;
    radicalStyling?: RadicalStyling;
    traceStyling?: TraceStyling;
    numberStyling?: NumberStyling;
  }

  export interface StrokeStyling {
    strokeColour: string | string[];
    strokeThickness: number;
    strokeRadius: number;
  }

  export interface RadicalStyling {
    radicalColour: string | string[];
    radicalThickness: number;
    radicalRadius: number;
    radicalType?: Array<'general' | 'nelson' | 'tradit'>;
  }

  export interface TraceStyling {
    traceColour: string;
    traceThickness: number;
    traceRadius: number;
  }

  export interface NumberStyling {
    fontColour: string;
    fontWeight: number;
    fontSize: number;
  }

  export interface InfoPanelConfig {
    showInfo: boolean;
    style?: React.CSSProperties;
    location?: 'left' | 'right' | 'top' | 'bottom';
  }

  export interface KanjiCardProps {
    kanji: string | KanjiData;
    animationOptions?: Partial<AnimationOptions>;
    onAnimationComplete?: () => void;
    className?: string;
    infoPanel?: InfoPanelConfig;
  }

  export class KanjiVG {
    constructor();
    getKanji(kanji: string): Promise<KanjiData[]>;
    searchRadical(radical: string): Promise<string[]>;
    getRandom(): Promise<KanjiData>;
  }

  // Note: KanjiCard is not exported from kanjivg-js library
  // The library only provides KanjiVG class for data loading
}
