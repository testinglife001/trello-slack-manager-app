// ✳️ Presence Dot
export default function PresenceDot({ online }) {
  return (
    <span className={`presence ${online ? "on" : "off"}`} />
  );
}
