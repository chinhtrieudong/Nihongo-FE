import React, { useRef } from 'react';
import KanjiWriter, { KanjiWriterHandle } from './kanji-writer';

// Example 1: Basic usage without ref
function BasicExample() {
    return (
        <div>
            <h2>Basic Example</h2>
            <KanjiWriter 
                character="学"
                onComplete={() => console.log('Animation complete!')}
                onStrokeComplete={(strokeNum) => console.log(`Stroke ${strokeNum} complete`)}
            />
        </div>
    );
}

// Example 2: Advanced usage with ref for manual control
function AdvancedExample() {
    const kanjiRef = useRef<KanjiWriterHandle>(null);
    
    const handleAnimate = () => {
        kanjiRef.current?.animateCharacter();
    };
    
    const handlePause = () => {
        kanjiRef.current?.pauseAnimation();
    };
    
    const handleResume = () => {
        kanjiRef.current?.resumeAnimation();
    };
    
    const handleCancel = () => {
        kanjiRef.current?.cancelAnimation();
    };
    
    return (
        <div>
            <h2>Advanced Example with Controls</h2>
            <KanjiWriter 
                ref={kanjiRef}
                character="書"
                size={250}
                onComplete={() => console.log('Done!')}
            />
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleAnimate}>Animate Again</button>
                <button onClick={handlePause}>Pause</button>
                <button onClick={handleResume}>Resume</button>
                <button onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
}

// Example 3: Multiple characters
function MultipleCharactersExample() {
    const characters = ['日', '月', '火', '水', '木', '金', '土'];
    
    return (
        <div>
            <h2>Multiple Characters</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {characters.map((char) => (
                    <KanjiWriter 
                        key={char}
                        character={char}
                        size={150}
                    />
                ))}
            </div>
        </div>
    );
}

// Main App component
function App() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Kanji Writer Examples</h1>
            <BasicExample />
            <hr style={{ margin: '30px 0' }} />
            <AdvancedExample />
            <hr style={{ margin: '30px 0' }} />
            <MultipleCharactersExample />
        </div>
    );
}

export default App;
