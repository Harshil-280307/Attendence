document.addEventListener('DOMContentLoaded', async function () {
  const totalMembersEl = document.getElementById('totalMembers');
  const presentTodayEl = document.getElementById('presentToday');
  const absentTodayEl = document.getElementById('absentToday');
  const currentDateEl = document.getElementById('currentDate');

  async function updateDashboard() {
    // Load team
    const teamRes = await fetch('team.json');
    const members = await teamRes.json();

    // Get today
    const today = Storage.getCurrentDate();
    const attendance = Storage.getAttendanceRecords();

    // Count present
    const presentCount = attendance.filter(
      a => a.date === today && a.timeIn
    ).length;

    // ⏰ Current time check
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 3:00 PM = 15:00
    const isAfterThreePM =
      currentHour > 15 || (currentHour === 15 && currentMinute >= 0);

    // Count absent only after 3 PM
    const absentCount = isAfterThreePM
      ? members.length - presentCount
      : 0;

    // Update UI
    totalMembersEl.textContent = members.length;
    presentTodayEl.textContent = presentCount;
    absentTodayEl.textContent = absentCount;
    currentDateEl.textContent = now.toDateString();
  }

  updateDashboard();
});
