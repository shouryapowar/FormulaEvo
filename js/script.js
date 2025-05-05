// =============================================
// MAIN SCRIPT FOR FORMULA EVO RACING WEBSITE
// =============================================

// -------------------------
// 1. INITIALIZATION
// -------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all systems
    initNavigation();
    initDriverStandings();
    initExcelUpload();
    initAnimations();
    initAIAssistant();
    
    // Set up event listeners
    setupEventListeners();
});

// -------------------------
// 2. CORE SYSTEMS
// -------------------------

// Navigation System
function initNavigation() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('open');
        });
    }
    
    // Active page highlighting
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Driver Standings System
function initDriverStandings() {
    if (!document.getElementById('driverTable')) return;
    
    // Sample data - in production, this would come from an API
    const drivers = [
        { id: 1, name: "Alex Carter", age: 16, nationality: "GB", team: "Formula Evo", points: 185, bestLap: "48.23s", consistency: 92, status: "F4 Scouted" },
        { id: 2, name: "Luca Moretti", age: 15, nationality: "IT", team: "Formula Evo", points: 172, bestLap: "48.56s", consistency: 89, status: "Progressing" },
        { id: 3, name: "Emma Johansson", age: 16, nationality: "SE", team: "Nordic Racing", points: 168, bestLap: "48.78s", consistency: 87, status: "Progressing" }
    ];
    
    populateDriverTable(drivers);
}

function populateDriverTable(drivers) {
    const tableBody = document.querySelector('#driverTable tbody');
    tableBody.innerHTML = '';
    
    drivers.forEach(driver => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${driver.position || '-'}</td>
            <td>
                ${driver.name}
                <span class="flag-icon flag-${driver.nationality.toLowerCase()}"></span>
            </td>
            <td>${driver.age}</td>
            <td>${driver.team}</td>
            <td>${driver.points}</td>
            <td>${driver.bestLap}</td>
            <td>
                <div class="consistency-bar" style="--value: ${driver.consistency}%">
                    ${driver.consistency}%
                </div>
            </td>
            <td class="status-badge ${driver.status.toLowerCase().replace(' ', '-')}">
                ${driver.status}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Excel Data Processing System
function initExcelUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    if (!uploadBtn) return;
    
    uploadBtn.addEventListener('click', handleExcelUpload);
}

async function handleExcelUpload() {
    const fileInput = document.getElementById('excelUpload');
    if (!fileInput.files.length) {
        alert('Please select an Excel file first');
        return;
    }
    
    const statusElement = document.getElementById('uploadStatus');
    statusElement.innerHTML = '<p class="processing">Processing file...</p>';
    
    try {
        const data = await processExcelFile(fileInput.files[0]);
        populateDriverTable(data);
        statusElement.innerHTML = '<p class="success">Driver data updated successfully!</p>';
    } catch (error) {
        statusElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        console.error('Excel processing error:', error);
    }
}

async function processExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                // Validate and format data
                const processedData = jsonData.map(item => ({
                    position: item.Position || item.Pos || '-',
                    name: item['Driver Name'] || item.Driver || '',
                    nationality: item.Nationality || item.Country || 'N/A',
                    age: item.Age || 0,
                    team: item.Team || 'Independent',
                    points: item.Points || 0,
                    bestLap: item['Best Lap'] || item.Lap || 'N/A',
                    consistency: item.Consistency || 0,
                    status: item.Status || 'Unknown'
                }));
                
                resolve(processedData);
            } catch (error) {
                reject(new Error('Invalid file format'));
            }
        };
        
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsArrayBuffer(file);
    });
}

// Animation System
function initAnimations() {
    // Racing car animation
    const trackElements = document.querySelectorAll('.track-animation');
    trackElements.forEach((track, index) => {
        const carCount = track.dataset.cars || 2;
        for (let i = 0; i < carCount; i++) {
            createRacingCar(track, i, index);
        }
    });
    
    // Scroll animations
    setupScrollAnimations();
}

function createRacingCar(trackElement, carIndex, trackIndex) {
    const car = document.createElement('div');
    car.className = 'race-car';
    
    // Alternate car colors
    const colors = ['red', 'blue', 'black', 'yellow'];
    const color = colors[carIndex % colors.length];
    car.style.backgroundImage = `url('images/cars/car-${color}.png')`;
    
    // Stagger animations
    const delay = carIndex * 0.7 + trackIndex * 0.3;
    car.style.animationDelay = `${delay}s`;
    
    trackElement.appendChild(car);
}

function setupScrollAnimations() {
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.stats-section, .mission-section');
        elements.forEach(el => {
            const position = el.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (position < screenPosition) {
                el.classList.add('animate');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
}

// AI Assistant System
function initAIAssistant() {
    if (!document.getElementById('ai-assistant')) return;
    
    const ai = new FormulaEvoAI();
    window.FE_AI = ai; // Make available globally if needed
}

class FormulaEvoAI {
    constructor() {
        this.elements = {
            container: document.getElementById('ai-assistant'),
            messages: document.querySelector('.ai-messages'),
            input: document.querySelector('.ai-input input'),
            sendBtn: document.getElementById('sendAI'),
            minimizeBtn: document.getElementById('minimizeAI')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.greet();
    }
    
    setupEventListeners() {
        this.elements.sendBtn.addEventListener('click', () => this.handleQuery());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleQuery();
        });
        
        this.elements.minimizeBtn.addEventListener('click', () => {
            this.toggleMinimize();
        });
    }
    
    toggleMinimize() {
        this.elements.container.classList.toggle('minimized');
    }
    
    greet() {
        this.addMessage({
            sender: 'ai',
            text: "Hello! I'm your Formula Evo assistant. Ask me about drivers, track info, or data management."
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
    
    addMessage({ sender, text }) {
        const messageClass = sender === 'ai' ? 'ai-message' : 'user-message';
        this.elements.messages.innerHTML += `
            <div class="${messageClass}">
                ${sender === 'ai' ? '<img src="images/ai-avatar.png" alt="AI">' : ''}
                <div class="message-text">${text}</div>
            </div>
        `;
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
    
    async processQuery(query) {
        // Sample responses - in production, connect to your API
        query = query.toLowerCase();
        
        if (query.includes('driver') || query.includes('standings')) {
            return "Our current leader is Alex Carter with 185 points. Would you like detailed stats?";
        }
        
        if (query.includes('track') || query.includes('circuit')) {
            return "The Formula Evo track is 1.2km with 12 corners and 4 configurations.";
        }
        
        if (query.includes('upload') || query.includes('excel')) {
            return "To upload data: 1) Download our template 2) Fill in driver stats 3) Upload via the Drivers page";
        }
        
        return "I can help with driver stats, track info, or data uploads. Try asking about our current standings!";
    }
}

// -------------------------
// 3. EVENT HANDLERS
// -------------------------
function setupEventListeners() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will contact you soon.');
            this.reset();
        });
    }
    
    // F4 Scout login
    const scoutLogin = document.getElementById('scoutLogin');
    if (scoutLogin) {
        scoutLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            // In production, validate credentials
            alert('Scout login successful! Loading dashboard...');
        });
    }
}

// -------------------------
// 4. UTILITY FUNCTIONS
// -------------------------
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// =============================================
// END OF MAIN SCRIPT
// =============================================