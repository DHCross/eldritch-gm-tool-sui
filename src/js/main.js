// Main JavaScript file for the landing page
document.addEventListener('DOMContentLoaded', function() {
    // Add any interactive features for the main page
    console.log('Eldritch RPG GM Tools Suite loaded');
    
    // Add smooth scrolling for navigation
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading states for tool links
    const toolLinks = document.querySelectorAll('.tool-card .btn');
    toolLinks.forEach(link => {
        link.addEventListener('click', function() {
            this.textContent = 'Loading...';
            this.style.pointerEvents = 'none';
        });
    });
});

// Utility functions
const EldritchGMTools = {
    version: '1.0.0',
    
    // Common utility functions that can be shared across tools
    rollDice: function(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },
    
    rollMultipleDice: function(count, sides) {
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += this.rollDice(sides);
        }
        return total;
    },
    
    randomChoice: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    formatOutput: function(text) {
        return text.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EldritchGMTools;
}