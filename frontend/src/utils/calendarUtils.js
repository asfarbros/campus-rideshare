import calendarData from "../data/academicCalendar.json";

export const getUpcomingHolidays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return calendarData.holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= today && holidayDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getUpcomingMilestones = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
  
    return calendarData.milestones.filter(milestone => {
      const milestoneDate = new Date(milestone.date);
      return milestoneDate >= today && milestoneDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Generates a smart travel alert based on proximity to holidays, long weekends, or end of semester
export const getTravelAlerts = () => {
  const upcomingHolidays = getUpcomingHolidays();
  const upcomingMilestones = getUpcomingMilestones();
  const alerts = [];

  // Check milestones first (End of semester is a big deal)
  for (let milestone of upcomingMilestones) {
    if (milestone.name.includes("Last Working Day")) {
        alerts.push({
            type: "urgent",
            icon: "🚨",
            title: "End of Semester Rush!",
            description: `The last working day is ${new Date(milestone.date).toLocaleDateString()}. Train/bus tickets will sell out fast! Find a ride companion now.`
        });
    }
  }

  // Check holidays and consecutive long weekends
  // For simplicity, we just look at the nearest holiday
  if (upcomingHolidays.length > 0) {
      const nextHoliday = upcomingHolidays[0];
      const holidayDate = new Date(nextHoliday.date);
      const dayOfWeek = holidayDate.getDay(); // 0 = Sunday, 1 = Monday, 5 = Friday

      const dateString = holidayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      let isLongWeekend = false;
      let title = `Upcoming Holiday (${dateString})`;
      let description = `${nextHoliday.name} is on ${holidayDate.toLocaleDateString()}. Planning to go home?`;

      // Check if it forms a long weekend
      if (dayOfWeek === 1 || dayOfWeek === 5) {
          isLongWeekend = true;
          title = `🔥 3-Day Weekend! (${dateString})`;
          description = `${nextHoliday.name} falls on a ${dayOfWeek === 1 ? 'Monday' : 'Friday'}, giving you a long weekend! Post your travel plans early.`;
      } else if (dayOfWeek === 2 || dayOfWeek === 4) {
          // If it's a Tuesday or Thursday, students might take a day off for a 4 day weekend
          isLongWeekend = true;
          title = `✨ Possible 4-Day Weekend! (${dateString})`;
          description = `${nextHoliday.name} is on a ${dayOfWeek === 2 ? 'Tuesday' : 'Thursday'}. Perfect time for a trip home!`;
      }

      // If we have a long weekend or it's within 14 days, push the alert
      const timeDiff = holidayDate.getTime() - new Date().getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (isLongWeekend || daysDiff <= 14) {
          alerts.push({
              type: isLongWeekend ? "success" : "info",
              icon: isLongWeekend ? "🔥" : "🌴",
              title,
              description
          });
      }
  }

  return alerts;
};

export const getCalendarData = () => calendarData;
