document.addEventListener('DOMContentLoaded', function() {
  const totalMembersEl = document.getElementById('totalMembers');
  const presentTodayEl = document.getElementById('presentToday');
  const absentTodayEl = document.getElementById('absentToday');
  const currentDateEl = document.getElementById('currentDate');

  function updateDashboard() {
    const members = Storage.getTeamMembers();
    const today = Storage.getCurrentDate();
    const todayAttendance = Storage.getAttendanceByDate(today);

    const presentCount = todayAttendance.filter(a => a.timeIn).length;
    const absentCount = members.length - presentCount;

    totalMembersEl.textContent = members.length;
    presentTodayEl.textContent = presentCount;
    absentTodayEl.textContent = absentCount;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    currentDateEl.textContent = dateStr;
  }

  updateDashboard();
});
