document.addEventListener('DOMContentLoaded', function() {
  const teamForm = document.getElementById('teamForm');
  const teamTableBody = document.getElementById('teamTableBody');

  function renderTeamList() {
    const members = Storage.getTeamMembers();
    
    if (members.length === 0) {
      teamTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">
            <div class="empty-state">
              <div class="empty-state-icon">👥</div>
              <div class="empty-state-text">No team members yet</div>
              <p>Add your first team member using the form above</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    teamTableBody.innerHTML = members.map(member => `
      <tr>
        <td><strong>${escapeHtml(member.name)}</strong></td>
        <td>${escapeHtml(member.role)}</td>
        <td>${member.shiftStart}</td>
        <td>${member.shiftEnd}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteMember('${member.id}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  teamForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('memberName').value.trim();
    const role = document.getElementById('memberRole').value.trim();
    const shiftStart = document.getElementById('shiftStart').value;
    const shiftEnd = document.getElementById('shiftEnd').value;

    if (!name || !role || !shiftStart || !shiftEnd) {
      showAlert('Please fill in all fields', 'danger');
      return;
    }

    if (Storage.compareTime(shiftStart, shiftEnd) >= 0) {
      showAlert('Shift end time must be after shift start time', 'danger');
      return;
    }

    const member = {
      name,
      role,
      shiftStart,
      shiftEnd
    };

    Storage.addTeamMember(member);
    showAlert('Team member added successfully!', 'success');
    teamForm.reset();
    renderTeamList();
  });

  window.deleteMember = function(id) {
    if (confirm('Are you sure you want to delete this team member?')) {
      Storage.deleteTeamMember(id);
      showAlert('Team member deleted successfully', 'success');
      renderTeamList();
    }
  };

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

  renderTeamList();
});
