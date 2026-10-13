import { useState } from "react";
import waterFormOne from "../../images/waterv1.png";
import waterFormTwo from "../../images/waterv2.png";
import waterFormThree from "../../images/waterv3.png";
import melodyFormOne from "../../images/melody1.png";
import melodyFormTwo from "../../images/melody2.png";
import melodyFormThree from "../../images/melody3.png";

const companionForms = {
  water: {
    images: [waterFormOne, waterFormTwo, waterFormThree],
    names: ["Waterling", "Waterling · first evolution", "Tide guardian", "Tide dragon"],
    growing: "A little waterling is growing",
  },
  melody: {
    images: [melodyFormOne, melodyFormTwo, melodyFormThree],
    names: ["Melody", "Melody · sweet friend", "Melody · flower keeper", "Melody · blossom guardian"],
    growing: "Melody is getting ready to bloom",
  },
};

export function getWaterPetProgress(xp = 0, companion = "water") {
  const family = companionForms[companion] || companionForms.water;
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = Math.floor(safeXp / 100) + 1;
  const stage = level >= 15 ? 3 : level >= 10 ? 2 : level >= 5 ? 1 : 0;
  const milestones = [5, 10, 15];
  const nextMilestone = milestones.find((milestone) => level < milestone) || null;
  const milestoneXp = nextMilestone ? (nextMilestone - 1) * 100 : null;
  const previousMilestoneXp = nextMilestone === 5 ? 0 : nextMilestone ? (nextMilestone - 5) * 100 : 0;
  const progress = nextMilestone
    ? Math.max(0, Math.min(100, ((safeXp - previousMilestoneXp) / Math.max(1, milestoneXp - previousMilestoneXp)) * 100))
    : 100;
  return {
    xp: safeXp,
    level,
    stage,
    image: family.images[Math.max(0, stage - 1)],
    images: family.images,
    name: family.names[stage],
    growingName: family.growing,
    companion,
    nextMilestone,
    xpToNext: nextMilestone ? Math.max(0, milestoneXp - safeXp) : 0,
    progress,
    locked: stage === 0,
  };
}

export function WaterPetCard({ xp, companion, onOpen }) {
  const pet = getWaterPetProgress(xp, companion);
  const companionLabel = pet.companion === "melody" ? "Melody" : "water pet";
  return (
    <section className="water-pet-card" aria-label={`Your evolving ${companionLabel}`}>
      <div className={`water-pet-card-art ${pet.locked ? "is-growing" : ""}`}>
        <img src={pet.image} alt={pet.locked ? `Your ${companionLabel} is growing toward its first evolution` : pet.name} />
        {pet.locked && <span className="water-pet-lock-badge">LVL 5</span>}
      </div>
      <div className="water-pet-card-copy">
        <span className="section-kicker">YOUR STUDY COMPANION</span>
        <h2>{pet.locked ? pet.growingName : pet.name}</h2>
        <p>{pet.locked ? "Earn XP to unlock its first evolution at Level 5." : `Level ${pet.level} · ${pet.stage === 3 ? "Final form reached" : `Next evolution at Level ${pet.nextMilestone}`}`}</p>
        <div className="water-pet-progress" role="progressbar" aria-label="Progress to next water pet evolution" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pet.progress}>
          <span style={{ width: `${pet.progress}%` }} />
        </div>
        <small>{pet.nextMilestone ? `${pet.xpToNext} XP to Level ${pet.nextMilestone}` : "All three evolutions unlocked"}</small>
      </div>
      <button type="button" className="water-pet-view-button" onClick={onOpen}>View pet <span aria-hidden="true">↗</span></button>
    </section>
  );
}

export function WaterPetViewer({ xp, companion, onClose }) {
  const pet = getWaterPetProgress(xp, companion);
  const companionLabel = pet.companion === "melody" ? "Melody" : "water pet";
  const [rotation, setRotation] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [dragOrigin, setDragOrigin] = useState(null);

  function startTurn(event) {
    if (event.button !== undefined && event.button !== 0) return;
    setDragOrigin({ x: event.clientX, rotation });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function turn(event) {
    if (!dragOrigin) return;
    setRotation(dragOrigin.rotation + (event.clientX - dragOrigin.x) * 1.15);
  }
  function finishTurn() {
    setDragOrigin(null);
  }

  return (
    <div className="water-pet-viewer-backdrop" onClick={onClose}>
      <section className="water-pet-viewer-dialog" role="dialog" aria-modal="true" aria-labelledby="water-pet-viewer-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="profile-menu-close water-pet-viewer-close" aria-label="Close water pet viewer" onClick={onClose}>×</button>
        <span className="section-kicker">YOUR STUDY COMPANION · LEVEL {pet.level}</span>
        <h2 id="water-pet-viewer-title">{pet.name}</h2>
        <p>{pet.locked ? `Your first form unlocks at Level 5. ${pet.xpToNext} XP to go.` : pet.stage === 3 ? `Your ${companionLabel} has reached its final evolution!` : `Keep earning XP to evolve again at Level ${pet.nextMilestone}.`}</p>
        <div className={`water-pet-turntable ${autoSpin ? "is-auto-spinning" : ""} ${dragOrigin ? "is-dragging" : ""}`} onPointerDown={startTurn} onPointerMove={turn} onPointerUp={finishTurn} onPointerCancel={finishTurn} onKeyDown={(event) => { if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return; event.preventDefault(); setRotation((current) => current + (event.key === "ArrowRight" ? 30 : -30)); }} tabIndex={0} role="img" aria-label={`${pet.name}, drag or use the left and right arrow keys to turn the character`}>
          <div className="water-pet-turntable-rotator" style={autoSpin ? undefined : { transform: `perspective(700px) rotateY(${rotation}deg)` }}>
            <img className="water-pet-turntable-front" src={pet.image} alt="" draggable="false" />
            <img className="water-pet-turntable-back" src={pet.image} alt="" draggable="false" />
          </div>
          <span className="water-pet-spark water-pet-spark-one">✦</span><span className="water-pet-spark water-pet-spark-two">✧</span>
        </div>
        <div className="water-pet-viewer-controls">
          <button type="button" className="profile-save-button" onClick={() => setAutoSpin((current) => !current)}>{autoSpin ? "Pause spin" : "Spin 360°"}</button>
          <span>Drag the pet to turn it</span>
        </div>
        <div className="water-pet-evolution-track" aria-label="Evolution milestones">
          {[5, 10, 15].map((milestone, index) => (
            <div className={pet.level >= milestone ? "is-unlocked" : ""} key={milestone}>
              <span>{pet.level >= milestone ? "✦" : "·"}</span><small>Level {milestone}</small><img src={pet.images[index]} alt="" />
            </div>
          ))}
        </div>
        {pet.locked && <div className="water-pet-unlock-note">{pet.xpToNext} more XP until your {companionLabel}'s first evolution.</div>}
      </section>
    </div>
  );
}
