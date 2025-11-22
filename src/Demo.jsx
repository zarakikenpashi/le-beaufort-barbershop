import { useState, useRef, useEffect, useCallback } from 'react';

const EMOJIS = [
  { value: 1, label: "😤", description: "Mou-mou, c'était pas ça" },
  { value: 2, label: "🙂", description: "Bon, ça peut aller" },
  { value: 3, label: "😎", description: "Frais p'tit-p'tit" },
  { value: 4, label: "🤩", description: "Très très propre !" },
  { value: 5, label: "🔥", description: "La coupe a parlé !" },
];

const AGE_RANGES = ["Enfant", "Jeune", "Adulte", "Vieux père"];

const REWARDS = [
  { 
    id: 1, 
    title: "Coupe gratuite", 
    description: "Ta prochaine coupe est offerte !", 
    emoji: "✂️",
    color: "from-purple-500 to-purple-700",
    probability: 0.05
  },
  { 
    id: 2, 
    title: "30% de réduction", 
    description: "Sur ta prochaine visite", 
    emoji: "🎉",
    color: "from-green-500 to-green-700",
    probability: 0.10
  },
  { 
    id: 3, 
    title: "Pigmentation offerte", 
    description: "Valable sur ta prochaine coupe", 
    emoji: "🎨",
    color: "from-blue-500 to-blue-700",
    probability: 0.15
  },
  { 
    id: 4, 
    title: "20% de réduction", 
    description: "À utiliser dans les 30 jours", 
    emoji: "💰",
    color: "from-yellow-500 to-yellow-700",
    probability: 0.20
  },
  { 
    id: 5, 
    title: "10% de réduction", 
    description: "Sur ta prochaine prestation", 
    emoji: "🎁",
    color: "from-orange-500 to-orange-700",
    probability: 0.30
  },
  {
    id: 0,
    title: "Pas de chance cette fois !",
    description: "Reviens nous voir bientôt pour une nouvelle chance 🙏",
    emoji: "😔",
    color: "from-gray-500 to-gray-700",
    probability: 0.20 // 20% de chance de ne rien gagner
  }
];

const Banner = () => (
  <div className="bg-linear-to-r from-red-600 to-red-800 text-white py-16 text-center">
    <h1 className="text-4xl font-bold mb-2">BARBER SHOP</h1>
    <p className="text-xl">Évalue ta nouvelle coupe</p>
  </div>
);

const Wrapper = ({ children }) => (
  <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-200 overflow-x-hidden">
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-y-1">
    <label className="font-medium text-gray-700">{label}</label>
    <input
      className="w-full border border-zinc-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      {...props}
    />
  </div>
);

const RadioGroup = ({ label, options, name, value, onChange }) => (
  <div className="flex flex-col gap-y-1">
    <label className="font-medium text-gray-700">{label}</label>
    <div className="grid grid-cols-2 gap-2 py-2 rounded border border-zinc-300 px-3">
      {options.map((option) => (
        <label key={option} className="flex gap-2 items-center cursor-pointer hover:text-red-600">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className="cursor-pointer"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const EmojiRating = ({ emojis, selected, onSelect }) => (
  <div className="flex flex-col gap-y-5 py-8">
    <h3 className="text-lg font-semibold text-center">Note ta nouvelle coupe</h3>
    <div className="flex justify-center flex-wrap gap-2">
      {emojis.map((emoji) => (
        <button
          key={emoji.value}
          onClick={() => onSelect(emoji.value)}
          type="button"
          className={`
            text-3xl transition-all p-3 rounded-full border-2
            ${selected === emoji.value
              ? "scale-110 border-red-500 bg-red-100 shadow-lg"
              : "border-transparent hover:scale-105 hover:bg-gray-100"
            }
          `}
          title={emoji.description}
        >
          {emoji.label}
        </button>
      ))}
    </div>
  </div>
);

// 🎨 COMPOSANT SCRATCH CARD CANVAS AVEC SUPPORT TACTILE
const ScratchCard = ({ width = 280, height = 280, finishPercent = 40, onComplete, brushSize = 25, children }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isCompleteRef = useRef(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Draw scratch layer with silver color
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GRATTE ICI', width / 2, height / 2);
    
    ctx.globalCompositeOperation = 'destination-out';
  }, [width, height]);

  // Check scratch percentage
  const checkScratchPercentage = useCallback(() => {
    if (isCompleteRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        transparent++;
      }
    }

    const percentage = (transparent / total) * 100;

    if (percentage >= finishPercent) {
      isCompleteRef.current = true;
      setIsComplete(true);
      
      if (onComplete) {
        onComplete({ percentage, canvas });
      }
    }
  }, [finishPercent, onComplete]);

  // Scratch function with better mobile support
  const scratch = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width) / dpr;
    const y = (clientY - rect.top) * (canvas.height / rect.height) / dpr;

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
  }, [brushSize]);

  // Event handlers
  const handlePointerDown = useCallback((e) => {
    if (isCompleteRef.current) return;
    
    setIsScratching(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    scratch(clientX, clientY);
  }, [scratch]);

  const handlePointerMove = useCallback((e) => {
    if (!isScratching || isCompleteRef.current) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    scratch(clientX, clientY);
  }, [isScratching, scratch]);

  const handlePointerUp = useCallback(() => {
    if (isScratching) {
      setIsScratching(false);
      setTimeout(checkScratchPercentage, 100);
    }
  }, [isScratching, checkScratchPercentage]);

  // Setup global event listeners
  useEffect(() => {
    if (isScratching) {
      const handleMove = (e) => {
        e.preventDefault();
        handlePointerMove(e);
      };

      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);

      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isScratching, handlePointerMove, handlePointerUp]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-600">Gratte pour découvrir ton prix !</p>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
        }}
        className="border-4 border-gray-300 rounded-lg shadow-xl overflow-hidden"
      >
        {/* Content underneath */}
        <div className="absolute inset-0 w-full h-full">
          {children}
        </div>

        {/* Scratch canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePointerDown(e);
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: isScratching ? 'grabbing' : 'grab',
            opacity: isComplete ? 0 : 1,
            transition: 'opacity 0.3s ease-out',
            pointerEvents: isComplete ? 'none' : 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
};

const WinMessage = ({ reward }) => {
  const [confetti, setConfetti] = useState([]);
  const isWin = reward.id !== 0; // Si c'est pas l'ID 0, c'est un gain

  useEffect(() => {
    if (isWin) {
      const pieces = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
        });
      }
      setConfetti(pieces);
    }
  }, [isWin]);

  return (
    <>
      {isWin && (
        <>
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {confetti.map((piece) => (
              <div
                key={piece.id}
                className="absolute w-2 h-2 animate-fall"
                style={{
                  left: `${piece.x}%`,
                  top: '-10px',
                  backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][piece.id % 5],
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes fall {
              to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }
            .animate-fall {
              animation: fall linear forwards;
            }
          `}</style>
        </>
      )}
      <div className="text-center space-y-6 py-6">
        <div className={`bg-linear-to-r ${reward.color} text-white rounded-lg p-8 shadow-2xl transform ${isWin ? 'scale-105' : ''}`}>
          <div className="text-6xl mb-4">{reward.emoji}</div>
          <h2 className="text-3xl font-bold mb-2">
            {isWin ? '🎉 Félicitations !' : 'Dommage !'}
          </h2>
          <div className="text-2xl font-bold mb-2">{reward.title}</div>
          <p className="text-lg opacity-90">{reward.description}</p>
        </div>
        {!isWin && (
          <p className="text-gray-600 text-sm">
            Continue à nous soutenir et tente ta chance la prochaine fois ! 💪
          </p>
        )}
      </div>
    </>
  );
};

const Button = ({ children, variant = "primary", ...props }) => {
  const baseClasses = "w-full rounded p-3 font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 disabled:hover:bg-black",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:hover:bg-gray-300",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

function Demo() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    ageRange: "",
    whatsapp: "",
    rating: null,
    price: "",
  });
  const [result, setResult] = useState(null);
  const [wonReward, setWonReward] = useState(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRandomReward = () => {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const reward of REWARDS) {
      cumulativeProbability += reward.probability;
      if (random <= cumulativeProbability) {
        return reward;
      }
    }
    return REWARDS[REWARDS.length - 1];
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleScratchComplete = async ({ percentage }) => {
    console.log('Scratched:', percentage.toFixed(2) + '%');
    const reward = getRandomReward();
    setWonReward(reward);
    setResult('win');
    
    // Collecter toutes les données
    const collectedData = {
      nomPrenom: formData.name,
      contact: formData.whatsapp,
      trancheAge: formData.ageRange,
      note: formData.rating,
      noteEmoji: EMOJIS.find(e => e.value === formData.rating)?.label,
      prix: formData.price,
      recompense: reward.title,
      recompenseId: reward.id,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // Afficher les données collectées dans la console
    console.log('📊 Données collectées:', collectedData);
    
    // Ici vous pouvez envoyer les données à votre backend
    // Exemple: await fetch('/api/submissions', { method: 'POST', body: JSON.stringify(collectedData) });
  };

  const handleReset = () => {
    setStep(1);
    setFormData({ name: "", ageRange: "", whatsapp: "", rating: null, price: "" });
    setResult(null);
    setWonReward(null);
  };

  const isStep1Valid = formData.name && formData.ageRange && formData.whatsapp;
  const isStep2Valid = formData.rating !== null && formData.price;

  return (
    <Wrapper>
      <Banner />
      <div className="relative pb-20">
        <div className="absolute inset-0 -top-12">
          <div className="bg-white w-[95%] max-w-md m-auto px-4 py-8 shadow-xl rounded-lg">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      step >= s ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-y-4">
                <Input
                  label="Nom & Prénom"
                  type="text"
                  placeholder="Ton blaze complet"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required
                />

                <RadioGroup
                  label="Tranche d'âge"
                  options={AGE_RANGES}
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={(value) => updateFormData('ageRange', value)}
                />

                <Input
                  label="WhatsApp"
                  type="tel"
                  placeholder="Laisse ton numéro"
                  value={formData.whatsapp}
                  onChange={(e) => updateFormData('whatsapp', e.target.value)}
                  required
                />

                <Button onClick={handleNext} disabled={!isStep1Valid}>
                  Continuer
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-y-4">
                <EmojiRating
                  emojis={EMOJIS}
                  selected={formData.rating}
                  onSelect={(value) => updateFormData('rating', value)}
                />
                <Input
                  label="Prix de ta coupe"
                  type="text"
                  placeholder="Elle t'a couté combien"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handlePrevious}>
                    Retour
                  </Button>
                  <Button onClick={handleNext} disabled={!isStep2Valid}>
                    Continuer
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                {!result && (
                  <>
                    <ScratchCard
                      width={280}
                      height={280}
                      finishPercent={40}
                      brushSize={25}
                      onComplete={handleScratchComplete}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-yellow-400 to-yellow-600 text-6xl">
                        🎁
                      </div>
                    </ScratchCard>
                    <Button variant="secondary" onClick={handlePrevious}>
                      Retour
                    </Button>
                  </>
                )}

                {result === 'win' && wonReward && <WinMessage reward={wonReward} />}

                {result && (
                  <Button onClick={handleReset}>
                    Recommencer
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default Demo;