// 📁 PlaybackControls.jsx
export default function PlaybackControls({
  playing,
  setPlaying,
  index,
  max,
  jump
}) {
  return (
    <div className="playback-controls">
      <button onClick={() => setPlaying(p => !p)}>
        {playing ? "Pause" : "Play"}
      </button>

      <input
        type="range"
        min={0}
        max={max}
        value={index}
        onChange={e => jump(Number(e.target.value))}
      />

      <span>
        {index} / {max}
      </span>
    </div>
  );
}
