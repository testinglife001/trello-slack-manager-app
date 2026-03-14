import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';

const days = [
  { date: '10 Tue', tasks: [
    { title: 'Analysis proposals and choose 2-3 best candidates', time: '9:00 - 10:00', type: 'Operational' },
    { title: 'Executive meeting', time: '11:00 - 12:00', type: 'Important' },
    { title: 'Prepare the information about the webinar and pass it to Sofia', time: '13:00 - 15:00', type: 'Operational' },
    { title: 'Get ready for the executive meeting', time: '16:00 - 17:00', type: 'Important' },
    { title: 'Reach Consensus on campaign messaging', time: '17:30 - 18:30', type: 'Important' },
  ]},
  { date: '11 Wed', tasks: [
    { title: 'Check resumes and test assignments from candidates', time: '8:30 - 11:30', type: 'Operational' },
    { title: 'Discuss design drafts and make a decision', time: '12:00 - 14:00', type: 'Design' },
    { title: 'Check new Google Events', time: '14:30 - 15:00', type: 'Operational' },
  ]},
  { date: '12 Thu', tasks: [
    { title: '1-to-1 with Sofia', time: '9:00 - 10:00', type: 'Operational' },
    { title: 'Analyze the ROI of marketing campaigns', time: '11:00 - 13:00', type: 'Marketing' },
    { title: 'Weekly team meeting', time: '14:00 - 15:30', type: 'Operational' },
  ]},
  { date: '13 Fri', tasks: [
    { title: 'Webinar: Resources', time: '10:00 - 11:30', type: 'Design' },
    { title: 'Sign the contract and NDA', time: '12:00 - 12:30', type: 'Operational' },
    { title: 'Check articles: The Power of SEO', time: '14:00 - 15:00', type: 'Marketing' },
    { title: 'Approve banners', time: '16:00 - 17:00', type: 'Design' },
  ]},
];

const CalendarView = () => {
  return (
    <div className="flex-1 overflow-auto bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800">April</h2>
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-500"><ChevronLeft size={18} /></button>
            <button className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-500"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors">Month</button>
          <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md transition-colors">Week</button>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors">Day</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 divide-x divide-gray-100 min-w-[1000px]">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="p-4 text-center border-b border-gray-50 sticky top-0 bg-white z-10">
              <span className={clsx(
                "text-sm font-bold",
                day.date.includes('10') ? "text-blue-600" : "text-gray-700"
              )}>
                {day.date}
              </span>
            </div>
            <div className="flex-1 p-2 space-y-2 bg-gray-50/30">
              {day.tasks.map((task, tIdx) => (
                <div key={tIdx} className={clsx(
                  "p-3 rounded-xl border border-gray-200/50 shadow-sm cursor-pointer hover:shadow-md transition-all group",
                  task.type === 'Operational' && "bg-blue-50/50 border-blue-100",
                  task.type === 'Important' && "bg-orange-50/50 border-orange-100",
                  task.type === 'Design' && "bg-pink-50/50 border-pink-100",
                  task.type === 'Marketing' && "bg-purple-50/50 border-purple-100",
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                       <Clock size={12} className="text-gray-300" />
                       <span>{task.time}</span>
                    </div>
                    <button className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 leading-relaxed">
                    {task.title}
                  </h4>
                  <div className="mt-3 flex items-center justify-between">
                     <div className={clsx(
                       "w-1.5 h-1.5 rounded-full",
                       task.type === 'Operational' && "bg-blue-400",
                       task.type === 'Important' && "bg-orange-400",
                       task.type === 'Design' && "bg-pink-400",
                       task.type === 'Marketing' && "bg-purple-400",
                     )} />
                     <div className="w-5 h-5 rounded-full bg-white border border-gray-100 shadow-sm overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${tIdx + 10}`} alt="" />
                     </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-blue-200 hover:text-blue-400 hover:bg-white transition-all">
                <Plus size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
