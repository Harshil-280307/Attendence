const Storage = {
  KEYS: {
    TEAM: 'attendance_team_members',
    ATTENDANCE: 'attendance_records'
  },

  getTeamMembers() {
    const data = localStorage.getItem(this.KEYS.TEAM);
    return data ? JSON.parse(data) : [];
  },

  saveTeamMembers(members) {
    localStorage.setItem(this.KEYS.TEAM, JSON.stringify(members));
  },

  addTeamMember(member) {
    const members = this.getTeamMembers();
    member.id = this.generateId();
    members.push(member);
    this.saveTeamMembers(members);
    return member;
  },

  deleteTeamMember(id) {
    let members = this.getTeamMembers();
    members = members.filter(m => m.id !== id);
    this.saveTeamMembers(members);
  },

  getTeamMember(id) {
    const members = this.getTeamMembers();
    return members.find(m => m.id === id);
  },

  getAttendanceRecords() {
    const data = localStorage.getItem(this.KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  saveAttendanceRecords(records) {
    localStorage.setItem(this.KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getAttendanceByDate(date) {
    const records = this.getAttendanceRecords();
    return records.filter(r => r.date === date);
  },

  getAttendanceByUserAndDate(userId, date) {
    const records = this.getAttendanceRecords();
    return records.find(r => r.userId === userId && r.date === date);
  },

  saveAttendance(attendance) {
    const records = this.getAttendanceRecords();
    const existingIndex = records.findIndex(
      r => r.userId === attendance.userId && r.date === attendance.date
    );

    if (existingIndex >= 0) {
      records[existingIndex] = attendance;
    } else {
      records.push(attendance);
    }

    this.saveAttendanceRecords(records);
  },

  getAttendanceByMonth(year, month) {
    const records = this.getAttendanceRecords();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    return records.filter(r => r.date.startsWith(monthStr));
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  getCurrentDate() {
    return this.formatDate(new Date());
  },

  getCurrentTime() {
    return this.formatTime(new Date());
  },

  compareTime(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return mins1 - mins2;
  },

  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
};
