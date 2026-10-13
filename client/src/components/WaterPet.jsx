import { useState } from "react";
import waterFormOne from "../../images/waterv1.png";
import waterFormTwo from "../../images/waterv2.png";
import waterFormThree from "../../images/waterv3.png";
import melodyFormOne from "../../images/melody1.png";
import melodyFormTwo from "../../images/melody2.png";
import melodyFormThree from "../../images/melody3.png";
import foxFormOne from "../../images/fox1.png";
import foxFormTwo from "../../images/fox2.png";
import foxFormThree from "../../images/fox3.png";

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
  fox: {
    images: [foxFormOne, foxFormTwo, foxFormThree],
    names: ["Fox cub", "Fox cub · swift step", "Moon fox", "Star fox"],
    growing: "A little fox is getting ready to grow",
  },
};

export function getCompanionProgress(xp = 0, companion = "water") {
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

export function CompanionCard({ xp, companion, onOpen }) {
  const pet = getCompanionProgress(xp, companion);
  const companionLabel = pet.companion === "melody" ? "Melody" : pet.companion === "fox" ? "fox" : "Waterling";
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
        <div className="water-pet-progress" role="progressbar" aria-label="Progress to next companion evolution" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pet.progress}>
          <span style={{ width: `${pet.progress}%` }} />
        </div>
        <small>{pet.nextMilestone ? `${pet.xpToNext} XP to Level ${pet.nextMilestone}` : "All three evolutions unlocked"}</small>
      </div>
      <button type="button" className="water-pet-view-button" onClick={onOpen}>View pet <span aria-hidden="true">↗</span></button>
    </section>
  );
}

export function CompanionInteraction({ xp, companion, onClose }) {
  const pet = getCompanionProgress(xp, companion);
  const companionLabel = pet.companion === "melody" ? "Melody" : pet.companion === "fox" ? "fox" : "Waterling";
  const [reaction, setReaction] = useState({ text: "Your study buddy is happy to see you!", key: 0 });
  const [lastAction, setLastAction] = useState("");
  const reactions = {
    water: { pet: ["Splish! That tickles!", "A happy little splash!", "Waterling wiggles with joy!"], play: ["That was so fun!", "Splash race next?", "Waterling does a tiny flip!"], chat: ["Keep going, you’re doing great!", "Let’s learn something new!", "I’m cheering for you!"], treat: ["Nom nom, thank you!", "A tasty little treat!", "Best study break ever!"] },
    melody: { pet: ["Hehe, that feels lovely!", "Melody gives you a hug!", "A happy little twirl!"], play: ["Let’s play together!", "Melody dances with joy!", "That was wonderful!"], chat: ["You’re doing your best!", "I believe in you!", "One step at a time, okay?"], treat: ["Thank you, friend!", "Melody loves it!", "A sweet treat for a sweet day!"] },
    fox: { pet: ["The fox gives a happy nuzzle!", "A soft, fluffy tail wag!", "Your fox leans into your hand!"], play: ["Zoom! The fox races in a circle!", "Catch me if you can!", "Your fox does a playful pounce!"], chat: ["You’re clever and capable!", "I’ll keep you company!", "Ready for another study quest?"], treat: ["Crunch! A delicious snack!", "Your fox happily munches!", "That’s my favorite treat!"] },
  };

  function interact(action) {
    const options = reactions[pet.companion]?.[action] || reactions.water[action];
    const message = options[Math.floor(Math.random() * options.length)];
    setLastAction(action);
    setReaction((current) => ({ text: message, key: current.key + 1 }));
  }

  return (
    <div className="companion-interaction-backdrop" onClick={onClose}>
      <section className="companion-interaction-dialog" role="dialog" aria-modal="true" aria-labelledby="companion-interaction-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="profile-menu-close companion-interaction-close" aria-label="Close pet interactions" onClick={onClose}>×</button>
        <span className="section-kicker">YOUR STUDY COMPANION · LEVEL {pet.level}</span>
        <h2 id="companion-interaction-title">Spend a moment with {pet.name}</h2>
        <p>{pet.locked ? `${pet.xpToNext} XP until the first evolution. Your buddy is already here for you.` : pet.stage === 3 ? `Your ${companionLabel} has reached its final evolution!` : `Keep earning XP to evolve again at Level ${pet.nextMilestone}.`}</p>
        <div className="companion-interaction-stage">
          <div className="companion-reaction-bubble" key={reaction.key} role="status">{reaction.text}</div>
          <button type="button" key={`${lastAction}-${reaction.key}`} className={`companion-interaction-sprite ${lastAction ? `action-${lastAction}` : ""}`} onClick={() => interact("pet")} aria-label={`Pet ${pet.name}`}>
            <img src={pet.image} alt={pet.name} draggable="false" />
            <span className="companion-sprite-spark">✦</span>
          </button>
        </div>
        <div className="companion-interaction-actions" aria-label="Interact with your pet">
          <button type="button" onClick={() => interact("pet")}>♡ <span>Pet</span></button>
          <button type="button" onClick={() => interact("play")}>✦ <span>Play</span></button>
          <button type="button" onClick={() => interact("chat")}>☁ <span>Chat</span></button>
          <button type="button" onClick={() => interact("treat")}>✿ <span>Give a treat</span></button>
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
