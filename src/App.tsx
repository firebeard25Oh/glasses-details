import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Glasses,
  ImagePlus,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'

type Screen = 'home' | 'setup' | 'photo' | 'mark' | 'results'
type Point = { x: number; y: number }
type PointKey =
  | 'cardLeft'
  | 'cardRight'
  | 'leftPupil'
  | 'rightPupil'
  | 'noseLeft'
  | 'noseRight'
  | 'lensBottom'

const pointOrder: PointKey[] = [
  'cardLeft',
  'cardRight',
  'leftPupil',
  'rightPupil',
  'noseLeft',
  'noseRight',
  'lensBottom',
]

const pointInfo: Record<PointKey, { short: string; label: string; hint: string }> = {
  cardLeft: {
    short: '1',
    label: 'Left edge of card',
    hint: 'Tap the left edge of the card, halfway down.',
  },
  cardRight: {
    short: '2',
    label: 'Right edge of card',
    hint: 'Tap the right edge of the same card.',
  },
  leftPupil: {
    short: '3',
    label: 'Left pupil',
    hint: 'Place the dot in the center of the pupil.',
  },
  rightPupil: {
    short: '4',
    label: 'Right pupil',
    hint: 'Place the dot in the center of the pupil.',
  },
  noseLeft: {
    short: '5',
    label: 'Left side of bridge',
    hint: 'Mark where the nose meets the inner eye area.',
  },
  noseRight: {
    short: '6',
    label: 'Right side of bridge',
    hint: 'Mark the matching point on the other side.',
  },
  lensBottom: {
    short: '7',
    label: 'Bottom of lens',
    hint: 'With frames on, mark directly below the left pupil.',
  },
}

const initialPoints: Record<PointKey, Point> = {
  cardLeft: { x: 34, y: 82 },
  cardRight: { x: 66, y: 82 },
  leftPupil: { x: 40, y: 42 },
  rightPupil: { x: 60, y: 42 },
  noseLeft: { x: 47, y: 48 },
  noseRight: { x: 53, y: 48 },
  lensBottom: { x: 40, y: 57 },
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function FaceGuide({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? 'face-guide compact' : 'face-guide'}
      viewBox="0 0 440 520"
      role="img"
      aria-label="Illustration showing face alignment guides"
    >
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ddaf89" />
          <stop offset="1" stopColor="#bc7e59" />
        </linearGradient>
        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#29443f" />
          <stop offset="1" stopColor="#172d2a" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodOpacity=".16" />
        </filter>
      </defs>
      <ellipse cx="220" cy="492" rx="156" ry="92" fill="url(#shirt)" />
      <path d="M175 365h90v90c-25 20-65 20-90 0z" fill="url(#skin)" />
      <ellipse cx="220" cy="245" rx="125" ry="158" fill="url(#skin)" />
      <path
        d="M97 229c-9-75 24-165 119-168 91-3 134 70 126 159-20-35-24-80-49-100-35 29-105 43-170 31-7 17-13 49-26 78z"
        fill="#36271f"
      />
      <path d="M113 207c-24-9-30 20-16 47 8 16 20 18 29 13zM327 207c24-9 30 20 16 47-8 16-20 18-29 13z" fill="#c48865" />
      <path d="M147 226c19-14 44-14 61 0M232 226c19-14 44-14 61 0" fill="none" stroke="#6d4334" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="178" cy="244" rx="9" ry="10" fill="#2b201c" />
      <ellipse cx="262" cy="244" rx="9" ry="10" fill="#2b201c" />
      <path d="M220 243c-8 36-14 66 3 72 10 4 20 1 25-5" fill="none" stroke="#9d5e43" strokeWidth="6" strokeLinecap="round" />
      <path d="M177 346c26 22 60 23 88-2" fill="none" stroke="#784334" strokeWidth="7" strokeLinecap="round" />
      <g fill="none" stroke="#193d38" strokeWidth="8" filter="url(#shadow)">
        <rect x="126" y="212" width="91" height="69" rx="27" />
        <rect x="223" y="212" width="91" height="69" rx="27" />
        <path d="M217 235c3-7 8-11 13 0M126 231l-30-8M314 231l30-8" />
      </g>
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M178 174v140M262 174v140" opacity=".6" strokeDasharray="5 9" />
        <path d="M112 244h216" opacity=".8" strokeDasharray="6 9" />
      </g>
      <g fill="#fff">
        <circle cx="178" cy="244" r="5" />
        <circle cx="262" cy="244" r="5" />
      </g>
      <g transform="translate(139 405)" filter="url(#shadow)">
        <rect width="162" height="102" rx="9" fill="#d5d7c9" />
        <rect x="13" y="14" width="35" height="26" rx="4" fill="#afb4a2" />
        <path d="M14 64h78M14 76h56" stroke="#8b9181" strokeWidth="5" strokeLinecap="round" />
        <circle cx="134" cy="73" r="15" fill="#f46e43" />
        <circle cx="119" cy="73" r="15" fill="#e8a03f" fillOpacity=".82" />
      </g>
    </svg>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [photo, setPhoto] = useState<string | null>(null)
  const [withFrames, setWithFrames] = useState(true)
  const [currentPoint, setCurrentPoint] = useState(0)
  const [points, setPoints] = useState(initialPoints)
  const [stageRatio, setStageRatio] = useState(1)
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const goHome = () => {
    setScreen('home')
    setCurrentPoint(0)
  }

  const loadPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result))
      setCurrentPoint(0)
      setScreen('mark')
    }
    reader.readAsDataURL(file)
  }

  const placePoint = (event: PointerEvent<HTMLDivElement>) => {
    if (currentPoint >= pointOrder.length) return
    const box = event.currentTarget.getBoundingClientRect()
    setStageRatio(box.width / box.height)
    const point = {
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    }
    const key = pointOrder[currentPoint]
    setPoints((existing) => ({ ...existing, [key]: point }))
    setCurrentPoint((index) => Math.min(index + 1, pointOrder.length))
  }

  const resetPoints = () => {
    setPoints(initialPoints)
    setCurrentPoint(0)
  }

  const scaledDistance = (a: Point, b: Point) =>
    distance({ x: a.x * stageRatio, y: a.y }, { x: b.x * stageRatio, y: b.y })
  const scale = 85.6 / scaledDistance(points.cardLeft, points.cardRight)
  const pd = scaledDistance(points.leftPupil, points.rightPupil) * scale
  const bridge = scaledDistance(points.noseLeft, points.noseRight) * scale
  const oc = Math.abs(points.lensBottom.y - points.leftPupil.y) * scale

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={goHome} aria-label="Specs home">
          <span className="brand-mark"><Glasses size={22} strokeWidth={2.4} /></span>
          <span>Specs</span>
        </button>
        {screen === 'home' ? (
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#measurements">What we measure</a>
            <a href="#accuracy">Accuracy</a>
          </nav>
        ) : (
          <div className="progress-wrap" aria-label="Measurement progress">
            <span>{screen === 'results' ? 'Complete' : 'Measurement'}</span>
            <div className="progress-track">
              <i style={{ width: `${({ setup: 20, photo: 45, mark: 75, results: 100 } as Record<string, number>)[screen] ?? 0}%` }} />
            </div>
          </div>
        )}
        <button className="header-help" aria-label="Help">
          <CircleHelp size={19} />
          <span>Help</span>
        </button>
      </header>

      <main>
        {screen === 'home' && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={15} /> Camera-guided fitting</div>
                <h1>Glasses measurements,<br /><em>made simple.</em></h1>
                <p className="hero-lede">
                  Get the key fit measurements you need using only your phone, a standard card, and about two minutes.
                </p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => setScreen('setup')}>
                    Start measurement <ArrowRight size={18} />
                  </button>
                  <span><Lock size={14} /> Your photos stay on this device</span>
                </div>
                <div className="quick-facts">
                  <div><strong>~2 min</strong><span>to complete</span></div>
                  <div><strong>3</strong><span>fit measurements</span></div>
                  <div><strong>No app</strong><span>download needed</span></div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-orbit orbit-one" />
                <div className="visual-orbit orbit-two" />
                <div className="scan-card">
                  <div className="scan-status"><span><i /> Face aligned</span><Check size={15} /></div>
                  <FaceGuide />
                  <div className="measurement-chip chip-pd"><span>PD</span><strong>63.5</strong><small>mm</small></div>
                  <div className="measurement-chip chip-oc"><span>OC</span><strong>29</strong><small>mm</small></div>
                  <div className="scan-caption"><Target size={16} /><span>Keep your head straight and look ahead</span></div>
                </div>
              </div>
            </section>

            <section className="how-section" id="how-it-works">
              <div className="section-heading">
                <span>Simple by design</span>
                <h2>Three steps. One clear result.</h2>
              </div>
              <div className="step-grid">
                <article>
                  <b>01</b>
                  <div className="step-icon"><Camera /></div>
                  <h3>Take a front-facing photo</h3>
                  <p>Stand in soft, even light and keep your phone level with your eyes.</p>
                </article>
                <article>
                  <b>02</b>
                  <div className="step-icon"><Target /></div>
                  <h3>Mark a few key points</h3>
                  <p>Our guided overlay shows exactly where to tap. A standard card sets the scale.</p>
                </article>
                <article>
                  <b>03</b>
                  <div className="step-icon"><CheckCircle2 /></div>
                  <h3>Review your measurements</h3>
                  <p>See your PD, bridge estimate, and frame-specific optical center height.</p>
                </article>
              </div>
            </section>

            <section className="measurement-section" id="measurements">
              <div>
                <span className="section-kicker">A better fit starts here</span>
                <h2>Know the numbers<br />behind your frames.</h2>
                <p>These measurements help an optician position your lenses and choose frames that sit comfortably.</p>
                <button className="text-button" onClick={() => setScreen('setup')}>Measure now <ChevronRight size={17} /></button>
              </div>
              <div className="metric-list">
                <article><span>01</span><div><h3>Pupillary distance</h3><p>The distance between the centers of your pupils.</p></div><b>PD</b></article>
                <article><span>02</span><div><h3>Nasal bridge estimate</h3><p>A facial fit reference—not the frame's printed DBL.</p></div><b>BW</b></article>
                <article><span>03</span><div><h3>Optical center height</h3><p>Pupil height within a specific frame while worn.</p></div><b>OC</b></article>
              </div>
            </section>

            <section className="accuracy-section" id="accuracy">
              <ShieldCheck size={34} />
              <div><h2>Designed for a useful estimate, not a prescription.</h2><p>For multifocals, prism, strong prescriptions, or safety-critical eyewear, have an optician verify every measurement in person.</p></div>
              <button onClick={() => setScreen('setup')}>Try it now <ArrowRight size={17} /></button>
            </section>
          </>
        )}

        {screen === 'setup' && (
          <section className="flow-screen">
            <button className="back-button" onClick={goHome}><ArrowLeft size={18} /> Back</button>
            <div className="flow-grid">
              <div className="flow-copy">
                <span className="step-label">Step 1 of 3</span>
                <h1>Let’s set up your photo.</h1>
                <p>Good positioning makes the biggest difference. Ask someone to help if you can.</p>
                <div className="instruction-list">
                  <div><span><Camera size={19} /></span><p><strong>Use the rear camera</strong>Hold the phone at eye level, about an arm’s length away.</p></div>
                  <div><span><Target size={19} /></span><p><strong>Look straight ahead</strong>Keep your head level and use soft, even lighting.</p></div>
                  <div><span className="card-mini" /><p><strong>Use a standard bank card</strong>Hold its long edge horizontally against your lower face.</p></div>
                </div>
                <label className="frame-toggle">
                  <input type="checkbox" checked={withFrames} onChange={(event) => setWithFrames(event.target.checked)} />
                  <span className="toggle-ui"><i /></span>
                  <span><strong>I’m wearing the frames I’ll order</strong><small>Required to calculate optical center height</small></span>
                </label>
                <button className="primary-button wide" onClick={() => setScreen('photo')}>I’m ready <ArrowRight size={18} /></button>
              </div>
              <div className="setup-visual">
                <div className="guide-frame">
                  <FaceGuide compact />
                  <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                </div>
                <div className="tip"><CheckCircle2 size={18} /><span>Remove tinted lenses and avoid glare</span></div>
              </div>
            </div>
          </section>
        )}

        {screen === 'photo' && (
          <section className="capture-screen">
            <button className="close-button" onClick={() => setScreen('setup')} aria-label="Close"><X /></button>
            <div className="capture-copy">
              <span className="step-label">Step 2 of 3</span>
              <h1>Add your photo</h1>
              <p>Use your camera or choose a clear, straight-on photo from your library.</p>
            </div>
            <div className="capture-card">
              <div className="camera-preview">
                <FaceGuide compact />
                <div className="face-oval" />
                <span>Align your face within the guide</span>
              </div>
              <div className="capture-actions">
                <button className="primary-button" onClick={() => cameraRef.current?.click()}><Camera size={19} /> Open camera</button>
                <button className="secondary-button" onClick={() => uploadRef.current?.click()}><ImagePlus size={19} /> Choose a photo</button>
                <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={loadPhoto} />
                <input ref={uploadRef} hidden type="file" accept="image/*" onChange={loadPhoto} />
              </div>
            </div>
            <p className="privacy-note"><Lock size={14} /> Your photo is processed locally and is never uploaded.</p>
          </section>
        )}

        {screen === 'mark' && (
          <section className="mark-screen">
            <div className="mark-header">
              <button className="back-button" onClick={() => setScreen('photo')}><ArrowLeft size={18} /> Retake</button>
              <div>
                <span className="step-label">Step 3 of 3</span>
                <h1>Mark the reference points</h1>
                <p>{currentPoint < pointOrder.length ? pointInfo[pointOrder[currentPoint]].hint : 'All points placed. Review the dots or calculate your results.'}</p>
              </div>
              <button className="icon-button" onClick={resetPoints} aria-label="Reset points"><RotateCcw size={18} /></button>
            </div>
            <div className="mark-layout">
              <div className="photo-stage" onPointerDown={placePoint}>
                {photo ? <img src={photo} alt="Your uploaded measurement" /> : <FaceGuide />}
                {pointOrder.map((key, index) => index < currentPoint && (
                  <button
                    key={key}
                    className={`marker ${index === currentPoint - 1 ? 'latest' : ''}`}
                    style={{ left: `${points[key].x}%`, top: `${points[key].y}%` }}
                    aria-label={pointInfo[key].label}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    {pointInfo[key].short}
                  </button>
                ))}
                {currentPoint < pointOrder.length && <div className="tap-prompt">Tap to place point {currentPoint + 1}</div>}
              </div>
              <aside className="point-panel">
                <h2>Reference points</h2>
                <div className="point-list">
                  {pointOrder.map((key, index) => (
                    <button
                      key={key}
                      className={index === currentPoint ? 'active' : index < currentPoint ? 'done' : ''}
                      onClick={() => setCurrentPoint(index)}
                    >
                      <span>{index < currentPoint ? <Check size={15} /> : index + 1}</span>
                      <div><strong>{pointInfo[key].label}</strong><small>{index === currentPoint ? 'Place this point now' : index < currentPoint ? 'Placed' : 'Not placed'}</small></div>
                    </button>
                  ))}
                </div>
                <button
                  className="primary-button wide"
                  disabled={currentPoint < pointOrder.length}
                  onClick={() => setScreen('results')}
                >
                  Calculate results <ArrowRight size={18} />
                </button>
              </aside>
            </div>
          </section>
        )}

        {screen === 'results' && (
          <section className="results-screen">
            <div className="result-intro">
              <span className="success-icon"><Check size={28} /></span>
              <span className="step-label">Measurement complete</span>
              <h1>Your fit measurements</h1>
              <p>Save these numbers to discuss with your eyewear provider.</p>
            </div>
            <div className="result-grid">
              <article className="result-card featured">
                <span>Pupillary distance</span>
                <div><strong>{pd.toFixed(1)}</strong><small>mm</small></div>
                <p>Binocular PD</p>
                <i>Estimated</i>
              </article>
              <article className="result-card">
                <span>Nasal bridge width</span>
                <div><strong>{bridge.toFixed(1)}</strong><small>mm</small></div>
                <p>Facial fit reference</p>
                <i>Estimated</i>
              </article>
              <article className={`result-card ${!withFrames ? 'muted' : ''}`}>
                <span>Optical center height</span>
                {withFrames ? <div><strong>{oc.toFixed(1)}</strong><small>mm</small></div> : <div><strong>—</strong></div>}
                <p>{withFrames ? 'Left lens, from bottom' : 'Requires your chosen frame'}</p>
                <i>{withFrames ? 'Frame-specific' : 'Not measured'}</i>
              </article>
            </div>
            <div className="result-caution">
              <ShieldCheck size={23} />
              <div><strong>Have an optician verify before ordering</strong><p>Photo measurements can shift with camera angle, card position, and frame fit. OC height especially should be checked for each frame.</p></div>
            </div>
            <div className="result-actions">
              <button className="secondary-button" onClick={() => { setScreen('mark'); setCurrentPoint(pointOrder.length) }}><RotateCcw size={18} /> Adjust points</button>
              <button className="primary-button" onClick={goHome}>Done <Check size={18} /></button>
            </div>
          </section>
        )}
      </main>

      {screen === 'home' && (
        <footer>
          <div className="brand"><span className="brand-mark"><Glasses size={20} /></span><span>Specs</span></div>
          <p>Better fit. Clearer vision.</p>
          <span>Measurement estimates only · Not medical advice</span>
        </footer>
      )}
    </div>
  )
}

export default App
