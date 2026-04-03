import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import HanziWriter from 'hanzi-writer';

interface KanjiWriterProps {
    character: string;
    size?: number;
    onStrokeComplete?: (strokeNum: number) => void;
    onComplete?: () => void;
}

export interface KanjiWriterHandle {
    animateCharacter: () => void;
    pauseAnimation: () => void;
    resumeAnimation: () => void;
    cancelAnimation: () => void;
}

const KanjiWriter = forwardRef<KanjiWriterHandle, KanjiWriterProps>(({
    character,
    size = 200,
    onStrokeComplete,
    onComplete
}, ref) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const writerRef = useRef<HanziWriter | null>(null);

    useEffect(() => {
        if (!targetRef.current || !character) return;

        // Clear previous writer if exists
        if (targetRef.current) {
            targetRef.current.innerHTML = '';
        }
        writerRef.current = null;

        // Initialize HanziWriter
        const writer = HanziWriter.create(targetRef.current, character, {
            width: size,
            height: size,
            padding: 5,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 200,
            strokeColor: '#EE0000',
            outlineColor: '#CCCCCC',
            drawingColor: '#000000',
            showCharacter: false,
            showOutline: true
        });

        // Event listeners
        if (onStrokeComplete) {
            writer.on('strokeComplete', onStrokeComplete);
        }

        if (onComplete) {
            writer.on('complete', onComplete);
        }

        writerRef.current = writer;

        // Start animation automatically
        const timer = setTimeout(() => {
            if (writerRef.current) {
                // Use animate() instead of animateCharacter()
                writerRef.current.animateCharacter();
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            // Clean up by clearing the element
            if (targetRef.current) {
                targetRef.current.innerHTML = '';
            }
            writerRef.current = null;
        };
    }, [character, size, onStrokeComplete, onComplete]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        animateCharacter: () => {
            if (writerRef.current) {
                writerRef.current.animateCharacter();
            }
        },
        pauseAnimation: () => {
            if (writerRef.current) {
                writerRef.current.pauseAnimation();
            }
        },
        resumeAnimation: () => {
            if (writerRef.current) {
                writerRef.current.resumeAnimation();
            }
        },
        cancelAnimation: () => {
            if (writerRef.current) {
                writerRef.current.cancelAnimation();
            }
        }
    }), []);

    return <div ref={targetRef} style={{ display: 'inline-block' }} />;
});

KanjiWriter.displayName = 'KanjiWriter';

export default KanjiWriter;
