import React, { useState, useEffect, useRef } from 'react';

/**
 * HogwartsExperience — Modern React Component Implementation
 * 
 * Demonstrates how this multi-scene interactive wizarding application
 * is architected using modern React patterns:
 * - State-driven scene routing (Platform, Marauder's Map, Owlery, Staircase, Room of Requirement)
 * - HTML5 Canvas refs for wand sparklers and atmospheric ember particles
 * - HTML5 Web Audio ref for loop management and interaction triggers
 * - Modal state for reading authentic wizarding owl letters
 */
export default function HogwartsExperience() {
  const [currentScene, setCurrentScene] = useState('platform'); // 'platform' | 'typing' | 'map' | 'owlery' | 'staircase' | 'room'
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [unlockedScenes, setUnlockedScenes] = useState(new Set(['platform']));
  const [activeLetter, setActiveLetter] = useState(null);
  const [letters, setLetters] = useState([]);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize letters from data store or API
  useEffect(() => {
    if (window.HOGWARTS_LETTERS) {
      setLetters(window.HOGWARTS_LETTERS);
    }
  }, []);

  // Canvas wand sparkle follower
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const colors = [
      'rgba(240,204,122,',
      'rgba(200,165,105,',
      'rgba(255,240,170,',
      'rgba(180,132,62,'
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      if (Math.random() < 0.45) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -Math.random() * 2.2 - 0.7,
          radius: Math.random() * 2.8 + 1,
          alpha: 0.88,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
    }
  };

  const handleEnterPlatform = () => {
    if (audioRef.current && !isAudioPlaying) {
      audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
    }
    setCurrentScene('typing');
    setTimeout(() => {
      setCurrentScene('map');
      setUnlockedScenes(prev => new Set([...prev, 'map']));
    }, 4500);
  };

  const navigateScene = (sceneName) => {
    setCurrentScene(sceneName);
    setUnlockedScenes(prev => new Set([...prev, sceneName]));
  };

  return (
    <div className="hogwarts-app-container">
      {/* Background Audio */}
      <audio ref={audioRef} src="assets/theme.mp3" loop preload="auto" />

      {/* Wand Sparkle Canvas */}
      <canvas ref={canvasRef} className="magic-canvas-overlay" />

      {/* Ambient Audio Toggle */}
      <button 
        onClick={toggleAudio} 
        className="magic-audio-toggle" 
        aria-label="Toggle Atmosphere Music"
      >
        {isAudioPlaying ? '🔊 Music: On' : '🔇 Music: Muted'}
      </button>

      {/* Scene 1: Platform 9¾ */}
      {currentScene === 'platform' && (
        <section className="scene-platform">
          <div className="platform-card">
            <h1 className="platform-title">Hogwarts Express</h1>
            <p className="platform-sub">Platform 9¾ · King's Cross Station</p>
            <button onClick={handleEnterPlatform} className="btn-begin-journey">
              Begin the Journey &rarr;
            </button>
          </div>
        </section>
      )}

      {/* Scene 2: Marauder's Map */}
      {currentScene === 'map' && (
        <section className="scene-map">
          <header className="map-nav-header">
            <span className="map-tag">The Marauder's Map</span>
            <div className="map-node-buttons">
              <button onClick={() => navigateScene('owlery')} className="map-node-btn">
                🦉 The Owlery
              </button>
              <button onClick={() => navigateScene('staircase')} className="map-node-btn">
                🖼️ Moving Staircase
              </button>
              <button onClick={() => navigateScene('room')} className="map-node-btn">
                ✨ Room of Requirement
              </button>
            </div>
          </header>
        </section>
      )}

      {/* Scene 3: Owlery & Letters */}
      {currentScene === 'owlery' && (
        <section className="scene-owlery">
          <button onClick={() => setCurrentScene('map')} className="btn-back-to-map">
            &larr; Return to Map
          </button>
          <div className="letters-grid">
            {letters.map((ltr, idx) => (
              <div 
                key={idx} 
                className="letter-envelope-card"
                onClick={() => setActiveLetter(ltr)}
              >
                <div className="envelope-seal">H</div>
                <h3>{ltr.from}</h3>
                <p>{ltr.head || ltr.date}</p>
              </div>
            ))}
          </div>

          {/* Letter Reader Modal */}
          {activeLetter && (
            <div className="letter-modal-overlay" onClick={() => setActiveLetter(null)}>
              <div className="parchment-letter-modal" onClick={e => e.stopPropagation()}>
                <header className="letter-header">
                  <h2>{activeLetter.head}</h2>
                  <span className="letter-date">{activeLetter.date}</span>
                </header>
                <div className="letter-body">
                  <p>{activeLetter.body}</p>
                </div>
                <footer className="letter-footer">
                  <p>— {activeLetter.sig || activeLetter.from}</p>
                  <button onClick={() => setActiveLetter(null)} className="btn-close-letter">
                    Close Letter
                  </button>
                </footer>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
