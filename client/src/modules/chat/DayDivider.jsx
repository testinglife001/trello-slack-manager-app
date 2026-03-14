// modules/chat/DayDivider.jsx
import dayjs from "dayjs";

export default function DayDivider({ date }) {
  return (
    <div className="day-divider">
      {dayjs(date).format("DD MMM YYYY")}
    </div>
  );
}
