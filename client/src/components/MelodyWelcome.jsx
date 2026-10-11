import melodyStudyImage from "../../images/melody-study.jpg";

export default function MelodyWelcome() {
  return (
    <section className="melody-welcome" aria-label="A little study inspiration">
      <div className="melody-welcome-copy">
        <span className="melody-welcome-kicker">A LITTLE STUDY MAGIC</span>
        <h2>Make room for a brighter study day</h2>
        <p>Take a breath, find your focus, and keep moving toward your nursing goals.</p>
      </div>
      <div className="melody-welcome-art">
        <img src={melodyStudyImage} alt="My Melody sitting on a cloud beneath a rainbow" />
      </div>
      <span className="melody-orb melody-orb-one" aria-hidden="true" />
      <span className="melody-orb melody-orb-two" aria-hidden="true" />
    </section>
  );
}