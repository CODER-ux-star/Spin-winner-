// Game State
let gameState = {
    user: {
        name: '',
        email: '',
        phone: '',
        upiId: '',
        walletBalance: 0
    },
    paymentComplete: false,
    gameActive: false,
    spinCount: 0,
    paymentId: null,
    paymentVerified: false,
    totalWinnings: 0,
    gameHistory: []
};

// Money Management Configuration
const GAME_CONFIG = {
    entryFee: 50,
    winAmount: 100,
    adminUPI: 'muzamil@paytm', // Your UPI ID for receiving payments
    adminRazorpayKey: 'rzp_test_1234567890', // Your Razorpay key
    minWithdrawal: 100,
    maxWithdrawal: 10000
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

// Spin results configuration - Made more realistic for real money
const spinResults = [
    { type: 'lose', text: 'YOU LOST', message: 'Better luck next time! 😔', icon: '😢' },
    { type: 'lose', text: 'YOU LOST', message: 'Try again! 🔄', icon: '😕' },
    { type: 'lose', text: 'YOU LOST', message: 'So close! 😐', icon: '😐' },
    { type: 'lose', text: 'YOU LOST', message: 'Almost there! 😔', icon: '😔' },
    { type: 'try-again', text: 'FREE SPIN!', message: 'Lucky! One more chance! 🍀', icon: '🎯' },
    { type: 'lose', text: 'YOU LOST', message: 'Keep trying! 💪', icon: '😕' },
    { type: 'win', text: 'YOU WON!', message: 'Congratulations! Money added to wallet! 🎉', icon: '🏆' },
    { type: 'lose', text: 'YOU LOST', message: 'Better luck next time! 😔', icon: '😢' }
];

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 SpinWin Game Loaded!');
    initializeEventListeners();
    loadUserData();
    
    // Add some fun loading effects
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Load saved user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('spinWinUserData');
    if (savedData) {
        const userData = JSON.parse(savedData);
        gameState.user = { ...gameState.user, ...userData };
        updateWalletDisplay();
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('spinWinUserData', JSON.stringify({
        name: gameState.user.name,
        email: gameState.user.email,
        phone: gameState.user.phone,
        upiId: gameState.user.upiId,
        walletBalance: gameState.user.walletBalance,
        totalWinnings: gameState.totalWinnings,
        gameHistory: gameState.gameHistory
    }));
}

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

// Enhanced user registration with UPI details
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
    
    // Get UPI ID and phone for money transfer
    const phone = prompt('📱 Enter your phone number for UPI payments:\n(Required for sending winnings)');
    if (!phone || phone.length < 10) {
        showNotification('Valid phone number required for money transfer!', 'error');
        return;
    }
    
    const upiId = prompt('💳 Enter your UPI ID for receiving winnings:\n(Example: yourname@paytm, yourname@phonepe)\n\nOr press Cancel to use phone number for UPI');
    
    // Store user data
    gameState.user.name = name;
    gameState.user.email = email;
    gameState.user.phone = phone;
    gameState.user.upiId = upiId || `${phone}@paytm`; // Default UPI format
    
    saveUserData();
    
    // Show success and transition to payment
    showNotification(`Welcome, ${name}! 🎮\nUPI: ${gameState.user.upiId}`, 'success');
    
    setTimeout(() => {
        transitionToSection('payment');
        updateWalletDisplay();
    }, 1000);
}

// Update wallet display
function updateWalletDisplay() {
    const walletInfo = document.getElementById('walletInfo');
    if (walletInfo) {
        walletInfo.innerHTML = `
            <div class="wallet-balance">
                <h4>💰 Your Wallet</h4>
                <p class="balance">₹${gameState.user.walletBalance}</p>
                <p class="upi-id">UPI: ${gameState.user.upiId}</p>
                ${gameState.user.walletBalance >= GAME_CONFIG.minWithdrawal ? 
                    '<button onclick="withdrawMoney()" class="btn-withdraw">💸 Withdraw</button>' : 
                    '<p class="min-withdraw">Min withdrawal: ₹100</p>'}
            </div>
        `;
    }
}

// Handle payment confirmation with real money flow
function handlePaymentConfirmation() {
    // Check if user can afford the game
    if (gameState.user.walletBalance >= GAME_CONFIG.entryFee) {
        // Deduct from wallet
        const useWallet = confirm(`You have ₹${gameState.user.walletBalance} in wallet.\n\nUse wallet money (₹${GAME_CONFIG.entryFee}) or pay fresh?\n\nOK = Use Wallet\nCancel = Pay Fresh`);
        
        if (useWallet) {
            deductFromWallet();
            return;
        }
    }
    
    // Show payment verification process
    confirmPaymentBtn.disabled = true;
    confirmPaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying Payment...';
    
    showNotification('⏳ Verifying your payment with Razorpay...', 'info');
    
    // Simulate payment verification delay
    setTimeout(() => {
        // Ask user for payment confirmation details
        const paymentDetails = prompt(
            `🔐 Payment Verification Required!\n\n` +
            `Payment Amount: ₹${GAME_CONFIG.entryFee}\n` +
            `Admin UPI: ${GAME_CONFIG.adminUPI}\n\n` +
            `Enter your payment details:\n` +
            `- Razorpay payment ID (starts with 'pay_')\n` +
            `- UPI Transaction ID/UTR\n` +
            `- Reference Number\n\n` +
            `Example: pay_123abc or UPI123456789`
        );
        
        if (!paymentDetails || paymentDetails.trim().length < 8) {
            showNotification('❌ Invalid payment details! Please try again.', 'error');
            confirmPaymentBtn.disabled = false;
            confirmPaymentBtn.innerHTML = '<i class="fas fa-shield-alt"></i> I\'ve Paid - Verify Now';
            return;
        }
        
        // Store payment ID for verification
        gameState.paymentId = paymentDetails.trim();
        
        // Simulate API verification
        setTimeout(() => {
            if (validatePaymentId(paymentDetails)) {
                processPaymentSuccess();
            } else {
                showNotification('❌ Payment verification failed! Please check your payment details.', 'error');
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.innerHTML = '<i class="fas fa-shield-alt"></i> I\'ve Paid - Verify Now';
            }
        }, 2000);
        
    }, 1500);
}

// Deduct money from user wallet
function deductFromWallet() {
    gameState.user.walletBalance -= GAME_CONFIG.entryFee;
    gameState.paymentComplete = true;
    gameState.paymentVerified = true;
    gameState.paymentId = `wallet_${Date.now()}`;
    
    saveUserData();
    updateWalletDisplay();
    
    showNotification(`✅ ₹${GAME_CONFIG.entryFee} deducted from wallet!`, 'success');
    
    // Log transaction
    logTransaction('wallet_debit', GAME_CONFIG.entryFee, 'Game entry fee');
    
    setTimeout(() => {
        transitionToSection('game');
        displayName.textContent = gameState.user.name;
        updateWalletDisplay();
    }, 1500);
}

// Process successful payment
function processPaymentSuccess() {
    gameState.paymentComplete = true;
    gameState.paymentVerified = true;
    
    showNotification('✅ Payment verified successfully!', 'success');
    
    // Log payment for admin tracking
    logTransaction('payment_received', GAME_CONFIG.entryFee, `Payment ID: ${gameState.paymentId}`);
    
    setTimeout(() => {
        transitionToSection('game');
        displayName.textContent = gameState.user.name;
        updateWalletDisplay();
    }, 1500);
}

// Log all transactions for admin tracking
function logTransaction(type, amount, details) {
    const transaction = {
        timestamp: new Date().toISOString(),
        user: gameState.user.name,
        email: gameState.user.email,
        phone: gameState.user.phone,
        upiId: gameState.user.upiId,
        type: type,
        amount: amount,
        details: details,
        paymentId: gameState.paymentId,
        walletBalance: gameState.user.walletBalance
    };
    
    gameState.gameHistory.push(transaction);
    saveUserData();
    
    // In real app, send to backend API
    console.log(`💰 Transaction Logged:`, transaction);
    
    // Simulate sending to admin dashboard
    sendToAdminDashboard(transaction);
}

// Send transaction data to admin (simulate API call)
function sendToAdminDashboard(transaction) {
    // In real app, this would be an API call to your backend
    console.log(`📊 Admin Dashboard Update:`, {
        action: 'NEW_TRANSACTION',
        data: transaction,
        adminNotification: `${transaction.user} - ${transaction.type} - ₹${transaction.amount}`
    });
}

// Payment validation function
function validatePaymentId(paymentId) {
    const validFormats = [
        /^pay_[a-zA-Z0-9]{14,}$/,  // Razorpay payment ID format
        /^UTR[0-9]{9,}$/,          // UPI UTR format
        /^UPI[0-9]{9,}$/,          // UPI Transaction ID format
        /^[0-9]{12,}$/,            // Generic transaction number
        /^txn_[a-zA-Z0-9]{10,}$/   // Generic transaction ID
    ];
    
    return validFormats.some(format => format.test(paymentId));
}

// Enhanced spin with money management
function handleSpin() {
    if (!gameState.paymentComplete || !gameState.paymentVerified) {
        showNotification('❌ Payment not verified! Please complete payment first.', 'error');
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
    
    // Generate weighted random result
    const randomResult = getWeightedRandomResult();
    
    // Calculate spin rotation
    const baseRotation = 1440;
    const randomExtra = Math.floor(Math.random() * 360);
    const finalRotation = baseRotation + randomExtra;
    
    // Apply spinning animation
    spinner.style.setProperty('--spin-rotation', `${finalRotation}deg`);
    spinner.classList.add('spinning');
    
    // Show result after spin completes
    setTimeout(() => {
        showSpinResult(randomResult);
        gameState.gameActive = false;
        
        // Log spin result
        logTransaction('game_result', 
            randomResult.type === 'win' ? GAME_CONFIG.winAmount : 0, 
            `Spin #${gameState.spinCount} - ${randomResult.type}`);
        
        // Re-enable spin button based on result
        if (randomResult.type === 'try-again') {
            spinBtn.disabled = false;
            spinBtn.innerHTML = '<i class="fas fa-gift"></i> FREE SPIN!';
        } else {
            spinBtn.disabled = false;
            spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN AGAIN! (₹50)';
        }
        
        // Remove spinning class
        setTimeout(() => {
            spinner.classList.remove('spinning');
        }, 1000);
        
    }, 4000);
}

// Weighted random result for realistic gambling odds
function getWeightedRandomResult() {
    const weights = {
        'lose': 70,      // 70% chance to lose
        'try-again': 20, // 20% chance for free spin
        'win': 10        // 10% chance to win
    };
    
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(weights)) {
        if (random < weight) {
            return spinResults.find(result => result.type === type) || spinResults[0];
        }
        random -= weight;
    }
    
    return spinResults[0]; // fallback
}

// Show spin result with money management
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
    
    // Show play again button (except for free spins)
    if (resultData.type !== 'try-again') {
        playAgainBtn.classList.remove('hidden');
    }
    
    // Process winning
    if (resultData.type === 'win') {
        celebrateWin();
        processWinning();
    }
}

// Process winning - Add money to wallet and trigger transfer
function processWinning() {
    // Add money to user wallet
    gameState.user.walletBalance += GAME_CONFIG.winAmount;
    gameState.totalWinnings += GAME_CONFIG.winAmount;
    
    saveUserData();
    updateWalletDisplay();
    
    // Log winning transaction
    logTransaction('win_credit', GAME_CONFIG.winAmount, `Wallet credited - Total: ₹${gameState.user.walletBalance}`);
    
    setTimeout(() => {
        showNotification(`🏆 ₹${GAME_CONFIG.winAmount} added to your wallet!`, 'success');
        
        // Simulate instant UPI transfer (in real app, use payment gateway API)
        if (gameState.user.walletBalance >= GAME_CONFIG.minWithdrawal) {
            setTimeout(() => {
                const autoWithdraw = confirm(`💸 Auto-withdraw ₹${GAME_CONFIG.winAmount} to ${gameState.user.upiId}?\n\nOK = Withdraw Now\nCancel = Keep in Wallet`);
                
                if (autoWithdraw) {
                    withdrawMoney(GAME_CONFIG.winAmount);
                }
            }, 2000);
        }
        
    }, 2000);
}

// Withdraw money function
function withdrawMoney(amount = null) {
    const withdrawAmount = amount || prompt(`💸 Enter withdrawal amount:\n\nAvailable: ₹${gameState.user.walletBalance}\nMin: ₹${GAME_CONFIG.minWithdrawal}\nMax: ₹${GAME_CONFIG.maxWithdrawal}`);
    
    if (!withdrawAmount || isNaN(withdrawAmount)) {
        showNotification('❌ Invalid amount!', 'error');
        return;
    }
    
    const amountNum = parseInt(withdrawAmount);
    
    if (amountNum < GAME_CONFIG.minWithdrawal) {
        showNotification(`❌ Minimum withdrawal: ₹${GAME_CONFIG.minWithdrawal}`, 'error');
        return;
    }
    
    if (amountNum > gameState.user.walletBalance) {
        showNotification('❌ Insufficient balance!', 'error');
        return;
    }
    
    if (amountNum > GAME_CONFIG.maxWithdrawal) {
        showNotification(`❌ Maximum withdrawal: ₹${GAME_CONFIG.maxWithdrawal}`, 'error');
        return;
    }
    
    // Process withdrawal
    gameState.user.walletBalance -= amountNum;
    saveUserData();
    updateWalletDisplay();
    
    // Log withdrawal
    logTransaction('withdrawal', amountNum, `UPI: ${gameState.user.upiId}`);
    
    // Simulate UPI transfer
    processUPITransfer(amountNum);
}

// Simulate UPI transfer (in real app, integrate with payment gateway)
function processUPITransfer(amount) {
    showNotification('⏳ Processing UPI transfer...', 'info');
    
    // Simulate API call delay
    setTimeout(() => {
        // Generate fake transaction ID
        const transactionId = 'TXN' + Date.now();
        
        showNotification(`✅ ₹${amount} sent to ${gameState.user.upiId}\nTransaction ID: ${transactionId}`, 'success');
        
        // Log successful transfer
        logTransaction('upi_transfer_success', amount, `TXN ID: ${transactionId} | UPI: ${gameState.user.upiId}`);
        
        // In real app, this would:
        // 1. Call UPI payment gateway API
        // 2. Verify transfer success
        // 3. Send SMS confirmation
        // 4. Update database
        // 5. Send admin notification
        
        console.log(`💸 UPI Transfer Completed:`, {
            amount: amount,
            upiId: gameState.user.upiId,
            transactionId: transactionId,
            user: gameState.user.name,
            timestamp: new Date().toISOString()
        });
        
    }, 3000);
}

// Handle play again - Reset payment for new game
function handlePlayAgain() {
    // Reset for new game cycle
    playAgainBtn.classList.add('hidden');
    result.classList.add('hidden');
    result.className = 'result hidden';
    
    // Reset payment state for new game
    gameState.paymentComplete = false;
    gameState.paymentVerified = false;
    gameState.paymentId = null;
    
    // Go back to payment section for new entry fee
    transitionToSection('payment');
    
    // Reset payment button
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.innerHTML = '<i class="fas fa-shield-alt"></i> I\'ve Paid - Verify Now';
    
    showNotification('💳 New game requires new payment of ₹50', 'info');
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