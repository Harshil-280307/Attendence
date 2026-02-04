document.addEventListener('DOMContentLoaded', async function () {
  const tableBody = document.getElementById('attendanceTable');
  const viewDate = document.getElementById('viewDate');

  const today = Storage.getCurrentDate();
  viewDate.textContent = `Date: ${today}`;

  // Load team
  const teamRes = await fetch('team.json');
  const members = await teamRes.json();

  // ✅ CORRECT attendance source
  const attendance = Storage.getAttendanceRecords();

  tableBody.innerHTML = '';

  members.forEach(member => {
    const record = attendance.find(
      a => a.userId === member.id && a.date === today
    );

    let timeIn = '-';
    let timeOut = '-';
    let status = 'Absent';

    if (record && record.timeIn) {
      timeIn = record.timeIn;
      status = 'Present';
    }

    if (record && record.timeOut) {
      timeOut = record.timeOut;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${member.name}</td>
      <td>${member.role}</td>
      <td>${timeIn}</td>
      <td>${timeOut}</td>
      <td>
        <span style="color:${status === 'Present' ? 'green' : 'red'}">
          ${status}
        </span>
      </td>
    `;

    tableBody.appendChild(row);
  });
});
