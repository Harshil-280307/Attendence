// Holds team members loaded from team.json
let teamMembers = [];

document.addEventListener('DOMContentLoaded', function () {
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
  const alertDiv = document.getElementById('alertMessage');

  let currentAttendance = null;
  let selectedMember = null;
  let currentUserId = localStorage.getItem('currentUserId');

  // -------- INIT --------
  async function init() {
    currentDateInput.value = Storage.getCurrentDate();
    await loadTeamMembers();

    if (currentUserId) {
      selectedMember = teamMembers.find(m => m.id === currentUserId);
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

  // -------- UI TOGGLES --------
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

  // -------- LOAD TEAM FROM JSON --------
  async function loadTeamMembers() {
    try {
      const response = await fetch('team.json');
      teamMembers = await response.json();

      if (!teamMembers.length) {
        memberSelect.innerHTML = '<option value="">No team members available</option>';
        confirmMemberBtn.disabled = true;
        return;
      }

      memberSelect.innerHTML =
        '<option value="">-- Select Your Name --</option>' +
        teamMembers.map(m =>
          `<option value="${m.id}">
            ${escapeHtml(m.name)} (${escapeHtml(m.role)})
          </option>`
        ).join('');

      if (currentUserId) {
        memberSelect.value = currentUserId;
      }

    } catch (error) {
      console.error(error);
      memberSelect.innerHTML = '<option value="">Failed to load team</option>';
      confirmMemberBtn.disabled = true;
    }
  }

  // -------- CONFIRM MEMBER --------
  confirmMemberBtn.addEventListener('click', function () {
    const memberId = memberSelect.value;

    if (!memberId) {
      showAlert('Please select your name', 'danger');
      return;
    }

    currentUserId = memberId;
    localStorage.setItem('currentUserId', memberId);
    selectedMember = teamMembers.find(m => m.id === memberId);
    loadUserAttendance();
  });

  changeMemberBtn.addEventListener('click', function () {
    showMemberSelection();
  });

  // -------- LOAD ATTENDANCE --------
  function loadUserAttendance() {
    showAttendanceActions();
    const date = currentDateInput.value;
    currentAttendance = Storage.getAttendanceByUserAndDate(currentUserId, date);
    updateUI();
  }

  // -------- UPDATE UI --------
  function updateUI() {
    if (!currentAttendance) {
      timeInBtn.disabled = false;
      timeOutBtn.disabled = true;
      reportTextarea.disabled = true;
      reportTextarea.value = '';

      statusDiv.innerHTML = `
        <div class="alert alert-warning">
          No attendance for today. Click "Time In" to start.
        </div>
        <div class="text-muted">
          Your shift: ${selectedMember.shiftStart} - ${selectedMember.shiftEnd}
        </div>
      `;
    } 
    else if (currentAttendance.timeIn && !currentAttendance.timeOut) {
      timeInBtn.disabled = true;
      timeOutBtn.disabled = false;
      reportTextarea.disabled = false;
      reportTextarea.value = currentAttendance.report || '';

      statusDiv.innerHTML = `
        <div class="alert alert-success">
          <strong>Time In:</strong> ${currentAttendance.timeIn}<br>
          Please fill work report before Time Out.
        </div>
      `;
    } 
    else {
      timeInBtn.disabled = true;
      timeOutBtn.disabled = true;
      reportTextarea.disabled = true;
      reportTextarea.value = currentAttendance.report || '';

      statusDiv.innerHTML = `
        <div class="alert alert-success">
          <strong>Time In:</strong> ${currentAttendance.timeIn}<br>
          <strong>Time Out:</strong> ${currentAttendance.timeOut}<br>
          Attendance completed for today.
        </div>
      `;
    }
  }

  // -------- TIME IN --------
timeInBtn.addEventListener('click', function () {
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


  // -------- TIME OUT --------
  timeOutBtn.addEventListener('click', function () {
    const report = reportTextarea.value.trim();

    if (!report) {
      showAlert('Work report is required before Time Out', 'danger');
      return;
    }

    currentAttendance.timeOut = Storage.getCurrentTime();
    currentAttendance.report = report;

    Storage.saveAttendance(currentAttendance);
    showAlert('Time Out recorded successfully!', 'success');
    updateUI();
  });

  // -------- ALERT --------
  function showAlert(message, type) {
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    setTimeout(() => alertDiv.style.display = 'none', 3000);
  }

  // -------- SAFE TEXT --------
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  init();
});
