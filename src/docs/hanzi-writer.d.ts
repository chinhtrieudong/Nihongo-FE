declare module 'hanzi-writer' {
  interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    showCharacter?: boolean;
    showOutline?: boolean;
  }

  class HanziWriter {
    static create(element: HTMLElement, character: string, options?: HanziWriterOptions): HanziWriter;
    
    animateCharacter(): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    cancelAnimation(): void;
    
    on(event: 'strokeComplete', callback: (strokeNum: number) => void): void;
    on(event: 'complete', callback: () => void): void;
  }

  export default HanziWriter;
}
