// Track Animation System
class TrackAnimator {
    constructor() {
        this.cars = [];
        this.trackElements = document.querySelectorAll('.track-animation');
    }

    init() {
        this.trackElements.forEach(track => {
            const carCount = track.dataset.cars || 3;
            for(let i = 0; i < carCount; i++) {
                this.addCar(track, i);
            }
        });
    }

    addCar(trackElement, index) {
        const car = document.createElement('div');
        car.className = 'animated-car';
        car.style.animationDelay = `${index * 2}s`;
        
        // Random car color
        const colors = ['red', 'blue', 'black', 'yellow'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        car.style.backgroundImage = `url('images/cars/car-${randomColor}.png')`;
        
        trackElement.appendChild(car);
        this.cars.push(car);
    }

    adjustSpeed(speed) {
        document.documentElement.style.setProperty('--race-speed', `${speed}s`);
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const animator = new TrackAnimator();
    animator.init();
    
    // Add interactive elements
    document.querySelectorAll('.track-section').forEach(section => {
        section.addEventListener('mouseenter', () => animator.adjustSpeed(5));
        section.addEventListener('mouseleave', () => animator.adjustSpeed(10));
    });
});