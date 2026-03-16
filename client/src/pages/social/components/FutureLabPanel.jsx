import { Sparkles, Wand2, CalendarRange, Bot } from "lucide-react";

const features = [
  {
    icon: <Wand2 size={15} />,
    title: "AI Caption Variants",
    desc: "Generate tone-specific caption options for each platform.",
  },
  {
    icon: <CalendarRange size={15} />,
    title: "Smart Publishing Slots",
    desc: "Auto-suggest best publish times from historical engagement.",
  },
  {
    icon: <Bot size={15} />,
    title: "Campaign Copilot",
    desc: "Interactive assistant for tasks, briefs, and review checklists.",
  },
];

export default function FutureLabPanel() {
  return (
    <section className="sm-card future-lab">
      <h3>
        <Sparkles size={16} /> Future Lab
      </h3>
      <p className="lead">Futuristic features planned for next iterations.</p>

      <div className="future-list">
        {features.map((f) => (
          <article key={f.title}>
            <div className="title">
              {f.icon}
              <strong>{f.title}</strong>
            </div>
            <p>{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
