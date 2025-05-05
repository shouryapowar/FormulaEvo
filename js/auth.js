// User Management System
class AuthSystem {
  constructor() {
    this.users = {
      owner: { name: "Admin", role: "owner", avatar: "AO" },
      scout: { name: "F4 Scout", role: "scout", avatar: "FS" },
      guest: { name: "Guest", role: "guest", avatar: "G" }
    };
    this.currentUser = this.users.guest;
  }

  login(role) {
    this.currentUser = this.users[role];
    this.updateUI();
  }

  updateUI() {
    const userPanel = document.getElementById('userPanel');
    if(userPanel) {
      userPanel.innerHTML = `
        <div class="user-avatar">${this.currentUser.avatar}</div>
        <span>${this.currentUser.name}</span>
        ${this.currentUser.role === 'owner' ? 
          '<button id="uploadBtn">Upload Data</button>' : ''}
      `;
    }
    
    if(this.currentUser.role !== 'owner') {
      document.querySelectorAll('.owner-only').forEach(el => {
        el.style.display = 'none';
      });
    }
  }
}

const auth = new AuthSystem();