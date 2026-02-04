document.addEventListener('DOMContentLoaded', function() {
  const memberSelect = document.getElementById('memberSelect');
  const currentDateInput = document.getElementById('currentDate');
  const timeInBtn = document.getElementById('timeInBtn');
  const timeOutBtn = document.getElementById('timeOutBtn');
  const reportTextarea = document.getElementById('reportText');
  const statusDiv = document.getElementById('attendanceStatus');
  const confirmMemberBtn = document.getElementById('confirmMemberBtn');
  const changeMemberBtn = document.getElementById('changeMemberBtn');
  const memberSelectionDiv = document.getElementById('memberSelection');
  const attendanceActionsDiv = document.getElementById('attendanceActions');

  let currentAttendance = null;
  let selectedMember = null;
  let currentUserId = localStorage.getItem('currentUserId');

  function init() {
    currentDateInput.value = Storage.getCurrentDate();
    loadTeamMembers();
    
    if (currentUserId) {
      selectedMember = Storage.getTeamMember(currentUserId);
      if (selectedMember) {
        loadUserAttendance();
      } else {
        localStorage.removeItem('currentUserId');
        showMemberSelection();
      }
    } else {
      showMemberSelection();
    }
  }

  function showMemberSelection() {
    memberSelectionDiv.style.display = 'block';
    attendanceActionsDiv.style.display = 'none';
  }

  function showAttendanceActions() {
    memberSelectionDiv.style.display = 'none';
    attendanceActionsDiv.style.display = 'block';
    document.getElementById('currentUserName').textContent = selectedMember.name;
    document.getElementById('currentUserRole').textContent = selectedMember.role;
  }

  function loadTeamMembers() {
    const members = Storage.getTeamMembers();
    
    if (members.length === 0) {
      memberSelect.innerHTML = '<option value="">No team members available</option>';
      confirmMemberBtn.disabled = true;
      return;
    }

    memberSelect.innerHTML = '<option value="">-- Select Your Name --</option>' +
      members.map(m => `<option value="${m.id}">${escapeHtml(m.name)} (${escapeHtml(m.role)})</option>`).join('');
    
    if (currentUserId) {
      memberSelect.value = currentUserId;
    }
  }

  confirmMemberBtn.addEventListener('click', function() {
    const memberId = memberSelect.value;
    
    if (!memberId) {
      showAlert('Please select your name from the list', 'danger');
      return;
    }

    currentUserId = memberId;
    localStorage.setItem('currentUserId', memberId);
    selectedMember = Storage.getTeamMember(memberId);
    
    loadUserAttendance();
  });

  changeMemberBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to switch to a different user? This will change who is logged in on this device.')) {
      showMemberSelection();
    }
  });

  function loadUserAttendance() {
    showAttendanceActions();
    const date = currentDateInput.value;
    currentAttendance = Storage.getAttendanceByUserAndDate(currentUserId, date);
    updateUI();
  }

  function updateUI() {
    if (!currentAttendance) {
      timeInBtn.disabled = false;
      timeOutBtn.disabled = true;
      reportTextarea.disabled = true;
      reportTextarea.value = '';
      
      const shiftInfo = selectedMember ? 
        `<div class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">
          Your shift: ${selectedMember.shiftStart} - ${selectedMember.shiftEnd}
        </div>` : '';
      
      statusDiv.innerHTML = `
        <div class="alert alert-warning">
          No attendance record for today. Click "Time In" to start your shift.
        </div>
        ${shiftInfo}
      `;
    } else if (currentAttendance.timeIn && !currentAttendance.timeOut) {
      timeInBtn.disabled = true;
      timeOutBtn.disabled = false;
      reportTextarea.disabled = false;
      reportTextarea.value = currentAttendance.report || '';
      
      const isLate = Storage.compareTime(currentAttendance.timeIn, selectedMember.shiftStart) > 0;
      const lateWarning = isLate ? 
        `<div style="color: var(--warning); margin-top: 0.5rem;">⚠️ You clocked in late today</div>` : '';
      
      statusDiv.innerHTML = `
        <div class="alert alert-success">
          <strong>Time In:</strong> ${currentAttendance.timeIn} (Shift starts: ${selectedMember.shiftStart})${lateWarning}<br>
          Please complete your daily work report before clocking out.
        </div>
      `;
    } else if (currentAttendance.timeOut) {
      timeInBtn.disabled = true;
      timeOutBtn.disabled = true;
      reportTextarea.disabled = true;
      reportTextarea.value = currentAttendance.report || '';
      
      const isOvertime = Storage.compareTime(currentAttendance.timeOut, selectedMember.shiftEnd) > 0;
      const overtimeNote = isOvertime ? 
        `<div style="color: var(--warning); margin-top: 0.5rem;">⏰ Overtime recorded</div>` : '';
      
      statusDiv.innerHTML = `
        <div class="alert alert-success">
          <strong>Time In:</strong> ${currentAttendance.timeIn}<br>
          <strong>Time Out:</strong> ${currentAttendance.timeOut} (Shift ends: ${selectedMember.shiftEnd})${overtimeNote}<br>
          Attendance completed for today. See you tomorrow! 👋
        </div>
      `;
    }
  }

  timeInBtn.addEventListener('click', function() {
    if (!selectedMember) {
      showAlert('Please select a team member', 'danger');
      return;
    }

    const date = currentDateInput.value;
    const timeIn = Storage.getCurrentTime();

    currentAttendance = {
      userId: selectedMember.id,
      date: date,
      timeIn: timeIn,
      timeOut: null,
      report: ''
    };

    Storage.saveAttendance(currentAttendance);
    showAlert('Time In recorded successfully!', 'success');
    updateUI();
  });

  timeOutBtn.addEventListener('click', function() {
    if (!selectedMember || !currentAttendance) {
      showAlert('Please clock in first', 'danger');
      return;
    }

    const report = reportTextarea.value.trim();
    
    if (!report) {
      showAlert('Please fill in your daily work report before clocking out', 'danger');
      reportTextarea.focus();
      return;
    }

    const timeOut = Storage.getCurrentTime();
    
    currentAttendance.timeOut = timeOut;
    currentAttendance.report = report;

    Storage.saveAttendance(currentAttendance);
    showAlert('Time Out recorded successfully!', 'success');
    updateUI();
  });

  function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
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
