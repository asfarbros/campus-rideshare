import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCalendarData } from "../utils/calendarUtils";
import { Calendar as CalendarIcon, Info, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

function HostellerCalendar() {
  const navigate = useNavigate();
  const calendarData = getCalendarData();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Check if a specific date has an event
  const getEventForDate = (day) => {
    // Note: months are 0-indexed in JS dates, but string dates usually 1-indexed (e.g. 2026-08-15)
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

    const holiday = calendarData.holidays.find(h => h.date === dateStr);
    if (holiday) return { type: 'holiday', name: holiday.name };

    const milestone = calendarData.milestones.find(m => m.date === dateStr);
    if (milestone) return { type: 'milestone', name: milestone.name };

    // Check exams (range)
    const exam = calendarData.exams.find(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
    if (exam) return { type: 'exam', name: exam.name };

    return null;
  };

  const handleDateClick = (day) => {
    const event = getEventForDate(day);
    if (event?.type === 'exam') {
      toast.error("You shouldn't travel during exams! 📚");
      return;
    }

    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
    
    // Redirect to browse posts with this date prefilled
    navigate(`/hosteller/browse?date=${dateStr}`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <CalendarIcon className="w-8 h-8 text-indigo-600" />
        <h2 className="text-3xl font-extrabold text-gray-800">
          Academic Travel Calendar
        </h2>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-8 flex gap-3 shadow-sm border border-blue-100">
        <Info className="w-6 h-6 flex-shrink-0" />
        <p>
          Click on any highlighted holiday or event to immediately search for hosteller travel companions on that exact date.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-lg font-bold transition-colors"
          >
            &larr; Prev
          </button>
          <h3 className="text-2xl font-bold text-gray-800">
            {months[selectedMonth]} {selectedYear}
          </h3>
          <button 
            onClick={handleNextMonth}
            className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-lg font-bold transition-colors"
          >
            Next &rarr;
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-gray-500 text-sm">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
          <div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {paddingArray.map((_, i) => (
            <div key={`pad-${i}`} className="h-24 bg-gray-50 rounded-xl opacity-50"></div>
          ))}
          
          {daysArray.map(day => {
            const event = getEventForDate(day);
            
            let bgClass = "bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md cursor-pointer";
            let textClass = "text-gray-700";
            
            if (event?.type === 'holiday') {
              bgClass = "bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-400 cursor-pointer shadow-sm";
              textClass = "text-red-700 font-bold";
            } else if (event?.type === 'exam') {
              bgClass = "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 cursor-pointer shadow-sm";
              textClass = "text-yellow-700 font-bold";
            } else if (event?.type === 'milestone') {
              bgClass = "bg-purple-50 border-purple-200 hover:bg-purple-100 cursor-pointer shadow-sm";
              textClass = "text-purple-700 font-bold";
            }

            return (
              <div 
                key={day} 
                onClick={() => handleDateClick(day)}
                className={`h-24 p-2 rounded-xl border flex flex-col transition-all duration-200 ${bgClass}`}
              >
                <span className={`text-lg ${textClass}`}>{day}</span>
                {event && (
                  <span className={`text-[10px] sm:text-xs mt-1 leading-tight line-clamp-2 ${textClass}`}>
                    {event.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-200 border border-red-400"></div>
          <span className="text-sm font-medium text-gray-600">Holidays / Long Weekends</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-200 border border-yellow-400"></div>
          <span className="text-sm font-medium text-gray-600">Exams (CATs & End Sem)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-200 border border-purple-400"></div>
          <span className="text-sm font-medium text-gray-600">Important Milestones</span>
        </div>
      </div>
    </div>
  );
}

export default HostellerCalendar;
