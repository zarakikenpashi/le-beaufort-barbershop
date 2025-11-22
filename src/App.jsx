import { useState } from "react";
import { Banner } from "./components/Banner"
import { Wrapper } from "./components/Wrapper"
import { ScratchCard } from "./components/ScratchCard";
import Confetti from 'react-confetti'

function App() {
    const emojis = [
        { value: 1, label: "😤", description: "Mou-mou, c'était pas ça" },
        { value: 2, label: "🙂", description: "Bon, ça peut aller" },
        { value: 3, label: "😎", description: "Frais p'tit-p'tit" },
        { value: 4, label: "🤩", description: "Très très propre !" },
        { value: 5, label: "🔥", description: "La coupe a parlé !" },
    ];

    const [selected, setSelected] = useState(null);
    
    const handleSelect = (value) => {
      setSelected(value);
    };


  const [result, setResult] = useState(null);
  const [key, setKey] = useState(0);

  const handleComplete = ({ percentage }) => {
    console.log('Scratched:', percentage.toFixed(2) + '%');
    const hasWon = Math.random() > 0.5;
    setResult(hasWon ? 'win' : 'lose');
  };

  const reset = () => {
    setResult(null);
    setKey(prev => prev + 1);
  };



  return (
    <Wrapper>
      <Banner />
      <div className="relative">
        <div className="absolute inset-0 -top-12">
          <div className="bg-white w-[300px] lg:w-1/3 m-auto p-4 shadow rounded">
            {/* Header Area */}
            <h1>CORTE C/ PIGMENTAÇÃO | CUT WITH PIGMENTATION ( TOPIC )</h1>
            {/* Form Area */}
            <div className="form-area">
              <form action="">
                {/* STEP 1 */}
                <div className="step_1">
                  <div className="flex flex-col gap-y-4 pt-4">
                      <div className="flex flex-col gap-y-1">
                          <label>Nom & Prénom</label>
                          <input 
                            type="text" 
                            placeholder="Ton blaze complet"
                            className="w-full border border-zinc-300 px-2 py-2 rounded" 
                          />
                      </div>

                      <div className="flex flex-col gap-y-1">
                          <label>Tranche d'âge</label>
                          <div className="grid grid-cols-2 xl:grid-cols-4 px-2 py-2">
                            <div className="flex gap-2 items-center">
                              <input type="radio" />
                              <label htmlFor="">Enfant</label>
                            </div>
                            <div className="flex gap-2 items-center">
                              <input type="radio" />
                              <label htmlFor="">Jeune</label>
                            </div>
                              <div className="flex gap-2 items-center">
                              <input type="radio" />
                              <label htmlFor="">Adulte</label>
                            </div>
                            <div className="flex gap-2 items-center">
                              <input type="radio" />
                              <label htmlFor="">Vieux père</label>
                            </div>
                          </div>
                      </div>

                      <div className="flex flex-col gap-y-1">
                          <label>WhatsApp</label>
                          <input 
                            type="text" 
                            placeholder="Laisse ton numéro"
                            className="w-full border border-zinc-300 px-2 py-2 rounded" 
                          />
                      </div>

                      <button className="bg-black rounded p-2 text-white cursor-pointer">
                        Continuer
                      </button>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="step_2">
                  <h3 className="">Note ta nouvelle coupe</h3>
                    <div className="flex flex-col gap-y-5 py-8">
                      <div className="flex flex-wrap">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji.value}
                            onClick={() => handleSelect(emoji.value)}
                            type="button"
                            className={`
                                text-3xl transition-all p-2 rounded-full border
                                ${selected === emoji.value
                                    ? "scale-110 border-red-500 bg-red-100"
                                    : "border-transparent hover:scale-105 hover:bg-gray-100"
                                }
                            `}
                            title={emoji.description}
                          >
                            {emoji.label}
                          </button>
                        ))}
                      </div>
                      <button className="bg-black rounded p-2 text-white cursor-pointer">
                        Continuer
                      </button>
                    </div>
                </div>
                
                {/* STEP 3 */}
                <div className="step_3">
                  <ScratchCard
                    width={280}
                    height={280}
                    finishPercent={40}
                    brushSize={30}
                    onComplete={handleComplete}
                    customBrush={{ color: '#FFD700' }}
                    image="https://assets.codepen.io/4175254/apple-gift-card.png"
                  />

                  {result && (
                    <div className="text-center space-y-2">
                      <p className={`text-2xl font-bold ${result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                        {
                        result === 'win' 
                        ? <Win /> 
                        : '😔 Try Again'}
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </div>
            </div>
        </div>
      </div>
    </Wrapper>
  )
}

export default App


function Win() {
  return(
    <>
      <Confetti />
      <h1>🎉 You got a $50 Apple gift card!</h1>
    </>
  )
}
