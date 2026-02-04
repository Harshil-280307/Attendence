document.addEventListener('DOMContentLoaded', function() {
  const dailyDateInput = document.getElementById('dailyDate');
  const generateDailyBtn = document.getElementById('generateDailyBtn');
  const dailyReportDiv = document.getElementById('dailyReport');

  const monthlyMonthInput = document.getElementById('monthlyMonth');
  const generateMonthlyBtn = document.getElementById('generateMonthlyBtn');
  const monthlyReportDiv = document.getElementById('monthlyReport');

  function init() {
    dailyDateInput.value = Storage.getCurrentDate();
    
    const today = new Date();
    const monthValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    monthlyMonthInput.value = monthValue;
  }

  generateDailyBtn.addEventListener('click', function() {
    const date = dailyDateInput.value;
    if (!date) {
      showAlert('Please select a date', 'danger', 'dailyAlert');
      return;
    }
    generateDailyReport(date);
  });

  generateMonthlyBtn.addEventListener('click', function() {
    const month = monthlyMonthInput.value;
    if (!month) {
      showAlert('Please select a month', 'danger', 'monthlyAlert');
      return;
    }
    const [year, monthNum] = month.split('-').map(Number);
    generateMonthlyReport(year, monthNum);
  });

  function generateDailyReport(date) {
    const members = Storage.getTeamMembers();
    const attendanceRecords = Storage.getAttendanceByDate(date);

    if (members.length === 0) {
      dailyReportDiv.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">No team members found</div>
          <p>Add team members first to view attendance reports</p>
        </div>
      `;
      return;
    }

    const reportData = members.map(member => {
      const attendance = attendanceRecords.find(a => a.userId === member.id);
      
      if (!attendance || !attendance.timeIn) {
        return {
          name: member.name,
          timeIn: '-',
          timeOut: '-',
          late: false,
          overtime: false,
          status: 'Absent',
          report: '-'
        };
      }

      const isLate = Storage.compareTime(attendance.timeIn, member.shiftStart) > 0;
      const isOvertime = attendance.timeOut ? 
        Storage.compareTime(attendance.timeOut, member.shiftEnd) > 0 : false;

      return {
        name: member.name,
        timeIn: attendance.timeIn,
        timeOut: attendance.timeOut || '-',
        late: isLate,
        overtime: isOvertime,
        status: 'Present',
        report: attendance.report || '-'
      };
    });

    const presentCount = reportData.filter(d => d.status === 'Present').length;
    const absentCount = reportData.filter(d => d.status === 'Absent').length;
    const lateCount = reportData.filter(d => d.late).length;

    dailyReportDiv.innerHTML = `
      <div class="stats-grid mb-2">
        <div class="stat-card">
          <div class="stat-label">Total Members</div>
          <div class="stat-value">${members.length}</div>
        </div>
        <div class="stat-card" style="border-left-color: var(--success)">
          <div class="stat-label">Present</div>
          <div class="stat-value" style="color: var(--success)">${presentCount}</div>
        </div>
        <div class="stat-card" style="border-left-color: var(--danger)">
          <div class="stat-label">Absent</div>
          <div class="stat-value" style="color: var(--danger)">${absentCount}</div>
        </div>
        <div class="stat-card" style="border-left-color: var(--warning)">
          <div class="stat-label">Late Arrivals</div>
          <div class="stat-value" style="color: var(--warning)">${lateCount}</div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
              <th>Late</th>
              <th>Overtime</th>
              <th>Daily Report</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(data => `
              <tr>
                <td><strong>${escapeHtml(data.name)}</strong></td>
                <td>${data.timeIn}</td>
                <td>${data.timeOut}</td>
                <td>
                  <span class="badge ${data.status === 'Present' ? 'badge-success' : 'badge-danger'}">
                    ${data.status}
                  </span>
                </td>
                <td>
                  <span class="badge ${data.late ? 'badge-warning' : 'badge-secondary'}">
                    ${data.late ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span class="badge ${data.overtime ? 'badge-warning' : 'badge-secondary'}">
                    ${data.overtime ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style="max-width: 300px;">${escapeHtml(data.report)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function generateMonthlyReport(year, month) {
    const members = Storage.getTeamMembers();
    const attendanceRecords = Storage.getAttendanceByMonth(year, month);
    const daysInMonth = Storage.getDaysInMonth(year, month);

    if (members.length === 0) {
      monthlyReportDiv.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-text">No team members found</div>
          <p>Add team members first to view monthly reports</p>
        </div>
      `;
      return;
    }

    const reportData = members.map(member => {
      const memberRecords = attendanceRecords.filter(a => a.userId === member.id && a.timeIn);
      
      let presentDays = 0;
      let lateDays = 0;
      let overtimeDays = 0;

      memberRecords.forEach(record => {
        if (record.timeIn) {
          presentDays++;
          
          if (Storage.compareTime(record.timeIn, member.shiftStart) > 0) {
            lateDays++;
          }
          
          if (record.timeOut && Storage.compareTime(record.timeOut, member.shiftEnd) > 0) {
            overtimeDays++;
          }
        }
      });

      const absentDays = daysInMonth - presentDays;

      return {
        name: member.name,
        role: member.role,
        totalDays: daysInMonth,
        presentDays,
        absentDays,
        lateDays,
        overtimeDays,
        attendanceRate: ((presentDays / daysInMonth) * 100).toFixed(1)
      };
    });

    const totalPresent = reportData.reduce((sum, d) => sum + d.presentDays, 0);
    const totalAbsent = reportData.reduce((sum, d) => sum + d.absentDays, 0);
    const avgAttendance = (reportData.reduce((sum, d) => sum + parseFloat(d.attendanceRate), 0) / members.length).toFixed(1);

    monthlyReportDiv.innerHTML = `
      <div class="stats-grid mb-2">
        <div class="stat-card">
          <div class="stat-label">Working Days</div>
          <div class="stat-value">${daysInMonth}</div>
        </div>
        <div class="stat-card" style="border-left-color: var(--success)">
          <div class="stat-label">Total Present</div>
          <div class="stat-value" style="color: var(--success)">${totalPresent}</div>
        </div>
        <div class="stat-card" style="border-left-color: var(--danger)">
          <div class="stat-label">Total Absent</div>
          <div class="stat-value" style="color: var(--danger)">${totalAbsent}</div>
        </div>
        <div class="stat-card" style="border-left-color: var(--primary)">
          <div class="stat-label">Avg Attendance</div>
          <div class="stat-value" style="color: var(--primary)">${avgAttendance}%</div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Working Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late Count</th>
              <th>Overtime Count</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map(data => `
              <tr>
                <td><strong>${escapeHtml(data.name)}</strong></td>
                <td>${escapeHtml(data.role)}</td>
                <td>${data.totalDays}</td>
                <td>
                  <span class="badge badge-success">${data.presentDays}</span>
                </td>
                <td>
                  <span class="badge ${data.absentDays > 0 ? 'badge-danger' : 'badge-secondary'}">
                    ${data.absentDays}
                  </span>
                </td>
                <td>
                  <span class="badge ${data.lateDays > 0 ? 'badge-warning' : 'badge-secondary'}">
                    ${data.lateDays}
                  </span>
                </td>
                <td>
                  <span class="badge ${data.overtimeDays > 0 ? 'badge-warning' : 'badge-secondary'}">
                    ${data.overtimeDays}
                  </span>
                </td>
                <td>
                  <strong style="color: ${data.attendanceRate >= 90 ? 'var(--success)' : data.attendanceRate >= 70 ? 'var(--warning)' : 'var(--danger)'}">
                    ${data.attendanceRate}%
                  </strong>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function showAlert(message, type, elementId) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';

    setTimeout(() => {
      alertDiv.style.display = 'none';
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  init();
});
