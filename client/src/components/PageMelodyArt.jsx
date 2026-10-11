import melodyPathImage from "../../images/melody-3.jpg";
import melodyQuizImage from "../../images/melody-2.jpg";
import melodyProgressImage from "../../images/melody-study.jpg";

const pageArt = {
  path: {
    image: melodyPathImage,
    label: "YOUR NEXT LITTLE WIN",
    message: "One study unit at a time brings your goals closer.",
    alt: "My Melody smiling with a strawberry",
  },
  quiz: {
    image: melodyQuizImage,
    label: "READY WHEN YOU ARE",
    message: "Take a quick quiz and celebrate what you already know.",
    alt: "My Melody cheering you on",
  },
  chart: {
    image: melodyProgressImage,
    label: "LOOK AT YOU GROW",
    message: "Every session and quiz adds up to real progress.",
    alt: "My Melody on a cloud beneath a rainbow",
  },
};

export default function PageMelodyArt({ page }) {
  const art = pageArt[page];
  if (!art) return null;

  return (
    <aside className={`page-melody-design page-melody-${page}`} aria-label={art.label}>
      <div><span>{art.label}</span><p>{art.message}</p></div>
      <img src={art.image} alt={art.alt} />
    </aside>
  );
}