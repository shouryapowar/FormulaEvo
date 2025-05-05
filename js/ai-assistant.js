class FormulaEvoAI {
    constructor() {
      // DOM Elements
      this.elements = {
        container: document.getElementById('ai-assistant'),
        messages: document.querySelector('.ai-messages'),
        input: document.querySelector('.ai-input input'),
        sendBtn: document.getElementById('sendAI'),
        minimizeBtn: document.getElementById('minimizeAI'),
        header: document.querySelector('.ai-header')
      };
  
      // State
      this.isMinimized = false;
      this.isDragging = false;
      this.dragOffset = { x: 0, y: 0 };
  
      // Initialize
      this.init();
    }
  
    init() {
      this.setupEventListeners();
      this.setupDrag();
      this.greet();
      this.checkDarkMode();
    }
  
    setupEventListeners() {
      // Send message on button click or Enter key
      this.elements.sendBtn.addEventListener('click', () => this.handleQuery());
      this.elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleQuery();
      });
  
      // Minimize/maximize toggle
      this.elements.minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMinimize();
      });
  
      // Header click to maximize
      this.elements.header.addEventListener('click', () => {
        if (this.isMinimized) this.toggleMinimize();
      });
    }
  
    setupDrag() {
      const { header, container } = this.elements;
  
      header.addEventListener('mousedown', (e) => {
        if (e.target === this.elements.minimizeBtn) return;
        
        this.isDragging = true;
        this.dragOffset = {
          x: e.clientX - container.getBoundingClientRect().left,
          y: e.clientY - container.getBoundingClientRect().top
        };
        container.style.cursor = 'grabbing';
      });
  
      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        container.style.left = `${e.clientX - this.dragOffset.x}px`;
        container.style.top = `${e.clientY - this.dragOffset.y}px`;
        container.style.right = 'auto';
        container.style.bottom = 'auto';
      });
  
      document.addEventListener('mouseup', () => {
        this.isDragging = false;
        container.style.cursor = 'grab';
      });
    }
  
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      this.elements.container.classList.toggle('minimized');
      this.elements.minimizeBtn.textContent = this.isMinimized ? '+' : '−';
    }
  
    greet() {
      this.addMessage({
        sender: 'ai',
        text: "Hello! I'm DeepSeek, your Formula Evo assistant. Ask me about:",
        html: `
          <ul>
            <li>Driver standings</li>
            <li>Track specifications</li>
            <li>Data upload help</li>
            <li>Team analytics</li>
          </ul>
          <p>Try: <em>"Show Alex Carter's stats"</em> or <em>"What's the track length?"</em></p>
        `
      });
    }
  
    async handleQuery() {
      const query = this.elements.input.value.trim();
      if (!query) return;
  
      this.addMessage({ sender: 'user', text: query });
      this.elements.input.value = '';
  
      const typingId = this.showTyping();
      
      try {
        const response = await this.processQuery(query);
        this.addMessage({ sender: 'ai', text: response });
      } catch (error) {
        this.addMessage({ 
          sender: 'ai', 
          text: "Sorry, I encountered an error processing your request."
        });
        console.error("AI Error:", error);
      } finally {
        this.removeTyping(typingId);
      }
    }
  
    showTyping() {
      const id = 'typing-' + Date.now();
      this.elements.messages.innerHTML += `
        <div class="ai-message typing" id="${id}">
          <img src="images/ai-avatar.png" alt="AI">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      this.scrollToBottom();
      return id;
    }
  
    removeTyping(id) {
      const element = document.getElementById(id);
      if (element) element.remove();
    }
  
    addMessage({ sender, text, html }) {
      const messageClass = sender === 'ai' ? 'ai-message' : 'user-message';
      this.elements.messages.innerHTML += `
        <div class="${messageClass}">
          ${sender === 'ai' ? '<img src="images/ai-avatar.png" alt="AI">' : ''}
          <div class="message-text">${html || text}</div>
        </div>
      `;
      this.scrollToBottom();
    }
  
    scrollToBottom() {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
  
    checkDarkMode() {
      const isDark = document.documentElement.classList.contains('dark-mode');
      if (isDark) {
        this.elements.container.classList.add('dark-mode');
      }
    }
  
    async processQuery(query) {
      // Connect to your actual data sources
      const drivers = await this.fetchDrivers();
      const trackInfo = await this.fetchTrackInfo();
      
      query = query.toLowerCase();
      
      // Driver queries
      if (query.includes('driver') || query.includes('standings')) {
        return this.handleDriverQuery(query, drivers);
      }
      
      // Track queries
      if (query.includes('track') || query.includes('circuit')) {
        return this.handleTrackQuery(query, trackInfo);
      }
      
      // Data upload help
      if (query.includes('upload') || query.includes('excel')) {
        return this.handleUploadQuery();
      }
      
      // Default response
      return this.defaultResponse();
    }
  
    async fetchDrivers() {
      try {
        const response = await fetch('/api/drivers');
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        return [];
      }
    }
  
    async fetchTrackInfo() {
      try {
        const response = await fetch('/api/track');
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch track info:", error);
        return {};
      }
    }
  
    handleDriverQuery(query, drivers) {
      const name = this.extractName(query);
      if (name && drivers.length > 0) {
        const driver = drivers.find(d => 
          d.name.toLowerCase().includes(name.toLowerCase()));
        
        return driver ? this.formatDriverResponse(driver) 
                     : `Driver "${name}" not found. Try "current standings".`;
      }
      
      return this.formatStandingsResponse(drivers);
    }
  
    formatDriverResponse(driver) {
      return `
        <strong>${driver.name}</strong> (${driver.team}):
        <ul>
          <li>Position: ${driver.position}</li>
          <li>Points: ${driver.points}</li>
          <li>Best Lap: ${driver.bestLap}</li>
          <li>Consistency: ${driver.consistency}%</li>
          <li>Status: <span style="color:${this.getStatusColor(driver.status)}">${driver.status}</span></li>
        </ul>
      `;
    }
  
    formatStandingsResponse(drivers) {
      if (!drivers || drivers.length === 0) {
        return "Couldn't load driver data. Please try again later.";
      }
      
      let html = `<strong>Current Top 5 Drivers:</strong><ol>`;
      drivers.slice(0, 5).forEach(driver => {
        html += `<li>${driver.name} - ${driver.points} points</li>`;
      });
      html += `</ol>`;
      return html;
    }
  
    handleTrackQuery(query, track) {
      if (!track || !track.length) {
        return "Our track is 1.2km long with 12 corners and 4 configurations.";
      }
      
      return `
        <strong>Formula Evo Track:</strong>
        <ul>
          <li>Length: ${track.length}</li>
          <li>Corners: ${track.corners}</li>
          <li>Configurations: ${track.configurations}</li>
          <li>Lap Record: ${track.record}</li>
        </ul>
        <p>See <a href="/track" style="color:var(--accent)">track page</a> for details.</p>
      `;
    }
  
    handleUploadQuery() {
      return `
        <strong>Data Upload Instructions:</strong>
        <ol>
          <li>Download our <a href="/data/template.xlsx" download>Excel template</a></li>
          <li>Fill in driver statistics</li>
          <li>Upload via the <a href="/drivers" style="color:var(--accent)">Drivers page</a></li>
        </ol>
        <p>Need the current data? <button class="export-btn">Export Current Standings</button></p>
      `;
    }
  
    defaultResponse() {
      return `
        I can help with:
        <ul>
          <li><strong>Driver stats:</strong> "Show Alex Carter's lap times"</li>
          <li><strong>Track info:</strong> "What's the corner count?"</li>
          <li><strong>Data management:</strong> "How to upload Excel data"</li>
        </ul>
      `;
    }
  
    extractName(query) {
      const patterns = [
        /(?:show|stats|about|how is|tell me about)\s(.+)/i,
        /(?:driver|racer)\s(.+)/i
      ];
      
      for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match) return match[1].trim();
      }
      
      return null;
    }
  
    getStatusColor(status) {
      const colors = {
        'F4 Scouted': '#00ff00',
        'Progressing': '#ffff00',
        'Developing': '#ff9900',
        'Rookie': '#ff6600'
      };
      return colors[status] || '#ffffff';
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const aiAssistant = new FormulaEvoAI();
    
    // Make available globally if needed
    window.FormulaEvoAI = aiAssistant;
  });