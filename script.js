// Game State
let gameState = {
    user: {
        name: '',
        email: ''
    },
    paymentComplete: false,
    gameActive: false,
    spinCount: 0
};

// DOM Elements
const registrationSection = document.getElementById('registrationSection');
const paymentSection = document.getElementById('paymentSection');
const gameSection = document.getElementById('gameSection');
const userForm = document.getElementById('userForm');
const confirmPaymentBtn = document.getElementById('confirmPayment');
const spinBtn = document.getElementById('spinBtn');
const playAgainBtn = document.getElementById('playAgain');
const spinner = document.getElementById('spinner');
const result = document.getElementById('result');
const displayName = document.getElementById('displayName');

// Spin results configuration
const spinResults = [
    { type: 'win', text: 'YOU WON!', message: 'Congratulations! 🎉 You won real money!', icon: '🏆' },
    { type: 'lose', text: 'YOU LOST', message: 'Better luck next time! 😔 Try again?', icon: '😢' },
    { type: 'try-again', text: 'TRY AGAIN', message: 'Free spin! 🔄 Spin once more!', icon: '🎯' }
];

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 SpinWin Game Loaded!');
    initializeEventListeners();
    
    // Add some fun loading effects
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Event Listeners
function initializeEventListeners() {
    // User registration form
    userForm.addEventListener('submit', handleUserRegistration);
    
    // Payment confirmation
    confirmPaymentBtn.addEventListener('click', handlePaymentConfirmation);
    
    // Spinner button
    spinBtn.addEventListener('click', handleSpin);
    
    // Play again button
    playAgainBtn.addEventListener('click', handlePlayAgain);
    
    // Add enter key support for forms
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (!registrationSection.classList.contains('hidden')) {
                e.preventDefault();
                userForm.dispatchEvent(new Event('submit'));
            }
        }
    });
}

// Handle user registration
function handleUserRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    // Validation
    if (!name || !email) {
        showNotification('Please fill in all fields!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email!', 'error');
        return;
    }
    
    // Store user data
    gameState.user.name = name;
    gameState.user.email = email;
    
    // Show success and transition to payment
    showNotification(`Welcome, ${name}! 🎮`, 'success');
    
    setTimeout(() => {
        transitionToSection('payment');
    }, 1000);
}

// Handle payment confirmation
function handlePaymentConfirmation() {
    // In a real app, you'd verify payment via webhook/API
    // For demo, we'll simulate payment confirmation
    
    showNotification('Payment confirmed! 💳✅', 'success');
    gameState.paymentComplete = true;
    
    setTimeout(() => {
        transitionToSection('game');
        displayName.textContent = gameState.user.name;
    }, 1500);
}

// Handle spin action
function handleSpin() {
    if (!gameState.paymentComplete) {
        showNotification('Please complete payment first!', 'error');
        return;
    }
    
    if (gameState.gameActive) {
        return; // Prevent multiple spins
    }
    
    gameState.gameActive = true;
    gameState.spinCount++;
    
    // Disable spin button
    spinBtn.disabled = true;
    spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SPINNING...';
    
    // Hide previous result
    result.classList.add('hidden');
    result.className = 'result hidden';
    
    // Generate random result
    const randomResult = spinResults[Math.floor(Math.random() * spinResults.length)];
    
    // Calculate spin rotation (multiple full rotations + final position)
    const baseRotation = 1440; // 4 full rotations
    const randomExtra = Math.floor(Math.random() * 360);
    const finalRotation = baseRotation + randomExtra;
    
    // Apply spinning animation
    spinner.style.setProperty('--spin-rotation', `${finalRotation}deg`);
    spinner.classList.add('spinning');
    
    // Show result after spin completes
    setTimeout(() => {
        showSpinResult(randomResult);
        gameState.gameActive = false;
        
        // Re-enable spin button
        spinBtn.disabled = false;
        spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN AGAIN!';
        
        // Remove spinning class
        setTimeout(() => {
            spinner.classList.remove('spinning');
        }, 1000);
        
    }, 4000); // Match CSS animation duration
}

// Show spin result
function showSpinResult(resultData) {
    const resultIcon = result.querySelector('.result-icon');
    const resultText = result.querySelector('.result-text');
    const resultMessage = result.querySelector('.result-message');
    
    // Set result content
    resultIcon.textContent = resultData.icon;
    resultText.textContent = resultData.text;
    resultMessage.textContent = resultData.message;
    
    // Add appropriate class for styling
    result.classList.add(`${resultData.type}-result`);
    result.classList.remove('hidden');
    
    // Show play again button
    playAgainBtn.classList.remove('hidden');
    
    // Log result for admin (in real app, send to backend)
    console.log(`🎰 Spin Result: ${resultData.type} | User: ${gameState.user.name} | Spin #${gameState.spinCount}`);
    
    // Add some celebration effects for wins
    if (resultData.type === 'win') {
        celebrateWin();
    }
}

// Handle play again
function handlePlayAgain() {
    // Reset for new game cycle
    playAgainBtn.classList.add('hidden');
    result.classList.add('hidden');
    result.className = 'result hidden';
    
    // Reset button text
    spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN NOW!';
    
    // Optionally require new payment for each spin
    // transitionToSection('payment');
    
    showNotification('Ready for another spin! 🎯', 'info');
}

// Section transitions
function transitionToSection(section) {
    // Hide all sections
    registrationSection.classList.add('hidden');
    paymentSection.classList.add('hidden');
    gameSection.classList.add('hidden');
    
    // Show target section with delay for smooth transition
    setTimeout(() => {
        switch(section) {
            case 'payment':
                paymentSection.classList.remove('hidden');
                break;
            case 'game':
                gameSection.classList.remove('hidden');
                break;
            default:
                registrationSection.classList.remove('hidden');
        }
    }, 300);
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        minWidth: '300px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        background: type === 'success' ? 'linear-gradient(135deg, #56ab2f, #a8e6cf)' :
                   type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ff8e8e)' :
                   'linear-gradient(135deg, #74b9ff, #0984e3)'
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 4000);
}

function removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function celebrateWin() {
    // Create confetti effect
    createConfetti();
    
    // Add victory sound effect (if you want to add audio)
    // playSound('victory');
    
    // Animate the win result
    setTimeout(() => {
        result.style.animation = 'bounceIn 0.6s ease-out, pulse 2s infinite';
    }, 500);
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: confetti-fall 3s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }, i * 50);
    }
}

// Add confetti animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .notification {
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 15px;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Additional game features
function getGameStats() {
    return {
        totalSpins: gameState.spinCount,
        userName: gameState.user.name,
        userEmail: gameState.user.email,
        gameStarted: gameState.paymentComplete
    };
}

// Export for potential external use
window.SpinWinGame = {
    getStats: getGameStats,
    resetGame: () => location.reload(),
    version: '1.0.0'
};

console.log('🎰 SpinWin Game by Muzamil - Ready to play!');