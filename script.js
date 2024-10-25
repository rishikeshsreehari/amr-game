class StoryGame {
    constructor() {
        // Game state
        this.currentScene = 0;
        this.daysPassed = 0;
        this.metrics = {
            bacterialCount: 10,
            mutationLevel: "Low",
            healthStatus: 100,
            infectionSeverity: "Low",
            superbugProbability: 5,
            antibioticEfficacy: 90
        };
        this.treatmentHistory = [];
        this.consecutiveSkips = 0;

        // Story scenes
        this.scenes = [
            {
                id: "feeling-unwell",
                narrative: "You wake up feeling a little under the weather. You have a slight fever and a scratchy throat.",
                prompt: "I'm feeling a bit down. Am I sick?",
                choices: [
                    {
                        text: "Wait and see how I feel tomorrow",
                        nextScene: 1,
                        effect: () => {
                            this.updateMetrics({
                                bacterialCount: "+20",
                                healthStatus: "-5"
                            });
                        }
                    }
                ]
            },
            {
                id: "worsening-symptoms",
                narrative: "By evening, your symptoms have worsened. You're now feeling tired and feverish.",
                prompt: "I'm feeling really sick. Should I see a doctor?",
                choices: [
                    {
                        text: "Stay at home",
                        nextScene: 2,
                        effect: () => {
                            this.updateMetrics({
                                bacterialCount: "+50",
                                healthStatus: "-15",
                                infectionSeverity: "Moderate"
                            });
                        }
                    },
                    {
                        text: "Go see a doctor",
                        nextScene: 3,
                        effect: () => {
                            this.updateMetrics({
                                healthStatus: "-5"
                            });
                        }
                    },
                    {
                        text: "Visit a pharmacist",
                        nextScene: 3,
                        effect: () => {
                            this.updateMetrics({
                                bacterialCount: "+30",
                                healthStatus: "-10"
                            });
                        }
                    }
                ]
            },
            {
                id: "doctor-visit",
                narrative: "The doctor diagnoses a bacterial infection and prescribes a 7-day course of antibiotics.",
                prompt: "What should I do with the prescription?",
                choices: [
                    {
                        text: "Take the medicine as prescribed",
                        nextScene: 4,
                        effect: () => {
                            this.showTreatmentPanel();
                        }
                    },
                    {
                        text: "Try alternative remedies instead",
                        nextScene: 5,
                        effect: () => {
                            this.updateMetrics({
                                bacterialCount: "+100",
                                healthStatus: "-20",
                                infectionSeverity: "Severe"
                            });
                        }
                    }
                ]
            }
        ];

        // Initialize UI references
        this.initializeUI();
        
        // Start game timer
        this.startTimer();
    }

    initializeUI() {
        this.elements = {
            narrativeText: document.getElementById('narrative-text'),
            choicesContainer: document.getElementById('choices-container'),
            bacterialCount: document.getElementById('bacterialCount'),
            mutationLevel: document.getElementById('mutationLevel'),
            healthStatus: document.getElementById('healthStatus'),
            infectionSeverity: document.getElementById('infectionSeverity'),
            superbugProbability: document.getElementById('superbugProbability'),
            antibioticEfficacy: document.getElementById('antibioticEfficacy'),
            treatmentPanel: document.getElementById('treatment-panel'),
            timer: document.getElementById('timer'),
            bacteriaContainer: document.getElementById('bacteria-container')
        };
    }

    startTimer() {
        setInterval(() => {
            this.daysPassed++;
            this.elements.timer.textContent = this.daysPassed;
            this.updateByTime();
        }, 2000);
    }

    updateByTime() {
        // Natural progression of infection
        if (this.consecutiveSkips > 0) {
            const growthRate = 1.1 + (this.consecutiveSkips * 0.1);
            this.metrics.bacterialCount *= growthRate;
            this.metrics.antibioticEfficacy = Math.max(0, this.metrics.antibioticEfficacy - 2);
        }

        this.updateSeverityAndMutation();
        this.checkGameStatus();
        this.updateDisplay();
    }

    updateSeverityAndMutation() {
        // Update infection severity
        if (this.metrics.bacterialCount > 200) {
            this.metrics.infectionSeverity = "Critical";
            this.metrics.healthStatus -= 10;
        } else if (this.metrics.bacterialCount > 100) {
            this.metrics.infectionSeverity = "Severe";
            this.metrics.healthStatus -= 5;
        } else if (this.metrics.bacterialCount > 50) {
            this.metrics.infectionSeverity = "Moderate";
            this.metrics.healthStatus -= 3;
        }

        // Update mutation level
        if (this.metrics.bacterialCount > 150 && this.consecutiveSkips > 2) {
            this.metrics.mutationLevel = "High";
            this.metrics.superbugProbability += 5;
        } else if (this.metrics.bacterialCount > 75) {
            this.metrics.mutationLevel = "Moderate";
            this.metrics.superbugProbability += 2;
        }

        // Enforce limits
        this.metrics.healthStatus = Math.max(0, Math.min(100, this.metrics.healthStatus));
        this.metrics.superbugProbability = Math.min(100, this.metrics.superbugProbability);
    }

    showScene(sceneIndex) {
        const scene = this.scenes[sceneIndex];
        if (!scene) return;

        this.currentScene = sceneIndex;
        this.elements.narrativeText.textContent = scene.narrative + "\n\n" + scene.prompt;
        
        // Clear and update choices
        this.elements.choicesContainer.innerHTML = '';
        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'button';
            button.textContent = choice.text;
            button.onclick = () => this.makeChoice(choice);
            this.elements.choicesContainer.appendChild(button);
        });
    }

    makeChoice(choice) {
        if (choice.effect) {
            choice.effect();
        }
        
        this.showScene(choice.nextScene);
        this.updateDisplay();
    }

    showTreatmentPanel() {
        this.elements.treatmentPanel.classList.remove('hidden');
    }

    applyAntibiotic(dose) {
        const effectiveness = this.metrics.antibioticEfficacy / 100;
        
        if (dose === 'low') {
            this.metrics.bacterialCount *= (0.8 * effectiveness);
            this.metrics.antibioticEfficacy -= 5;
            this.metrics.superbugProbability += 2;
            this.showMessage("You've taken a low dose. It might not be enough to completely clear the infection.");
        } else if (dose === 'high') {
            this.metrics.bacterialCount *= (0.5 * effectiveness);
            this.metrics.antibioticEfficacy -= 10;
            this.metrics.superbugProbability += 10;
            this.showMessage("You've taken a high dose. While more effective, it increases the risk of resistance.");
        }

        this.consecutiveSkips = 0;
        this.metrics.healthStatus = Math.min(100, this.metrics.healthStatus + 5);
        this.treatmentHistory.push({ day: this.daysPassed, dose: dose });
        
        this.updateDisplay();
        this.checkGameStatus();
    }

    skipDose() {
        this.consecutiveSkips++;
        this.showMessage("You've skipped a dose. The bacteria will continue to multiply.", true);
        this.updateDisplay();
    }

    updateMetrics(changes) {
        for (const [key, value] of Object.entries(changes)) {
            if (typeof value === 'string') {
                if (value.startsWith('+')) {
                    this.metrics[key] += parseInt(value.substring(1));
                } else if (value.startsWith('-')) {
                    this.metrics[key] -= parseInt(value.substring(1));
                } else {
                    this.metrics[key] = value;
                }
            } else {
                this.metrics[key] = value;
            }
        }
        this.updateDisplay();
    }

    updateDisplay() {
        // Update metrics display
        this.elements.bacterialCount.textContent = Math.round(this.metrics.bacterialCount);
        this.elements.mutationLevel.textContent = this.metrics.mutationLevel;
        this.elements.healthStatus.textContent = Math.round(this.metrics.healthStatus) + '%';
        this.elements.infectionSeverity.textContent = this.metrics.infectionSeverity;
        this.elements.superbugProbability.textContent = Math.round(this.metrics.superbugProbability) + '%';
        this.elements.antibioticEfficacy.textContent = Math.round(this.metrics.antibioticEfficacy) + '%';

        // Update bacteria visualization
        this.updateBacteriaDisplay();
    }

    updateBacteriaDisplay() {
        this.elements.bacteriaContainer.innerHTML = '';
        
        // Scale down bacterial count for visualization
        const visualBacteriaCount = Math.min(50, Math.floor(this.metrics.bacterialCount / 4));
        
        for (let i = 0; i < visualBacteriaCount; i++) {
            const bacteria = document.createElement('div');
            bacteria.className = 'bacteria';
            
            // Color based on mutation level
            bacteria.style.backgroundColor = 
                this.metrics.mutationLevel === "High" ? "#ff4500" :
                this.metrics.mutationLevel === "Moderate" ? "#ff6b6b" : "#ff9999";
            
            bacteria.style.left = Math.random() * 90 + '%';
            bacteria.style.top = Math.random() * 90 + '%';
            
            this.elements.bacteriaContainer.appendChild(bacteria);
        }
    }

    showMessage(message, isWarning = false) {
        this.elements.narrativeText.textContent = message;
        if (isWarning) {
            this.elements.narrativeText.classList.add('warning');
        } else {
            this.elements.narrativeText.classList.remove('warning');
        }
    }

    checkGameStatus() {
        if (this.metrics.healthStatus <= 0) {
            this.endGame('health');
        } else if (this.metrics.superbugProbability >= 90) {
            this.endGame('superbug');
        } else if (this.metrics.bacterialCount < 5 && this.metrics.healthStatus > 80) {
            this.endGame('success');
        }
    }

    endGame(reason) {
        const endingPanel = document.getElementById('ending-panel');
        const endingTitle = document.getElementById('ending-title');
        const endingDescription = document.getElementById('ending-description');

        const endings = {
            health: {
                title: "Game Over - Critical Health Condition",
                description: "Your health has deteriorated too much. The infection became too severe to manage."
            },
            superbug: {
                title: "Game Over - Superbug Emerged",
                description: "A resistant superbug has developed. This makes the infection extremely difficult to treat."
            },
            success: {
                title: "Congratulations - Perfect Recovery!",
                description: "You've successfully managed the infection while minimizing antibiotic resistance!"
            }
        };

        endingTitle.textContent = endings[reason].title;
        endingDescription.textContent = endings[reason].description;
        endingPanel.classList.remove('hidden');

        // Disable all game controls
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => button.disabled = true);
    }

    showMessage(message, isWarning = false) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = isWarning ? 'message warning' : 'message';
        
        this.elements.narrativeText.appendChild(messageElement);
        
        // Auto-remove message after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new StoryGame();
    game.showScene(0);

    // Add global handlers for treatment buttons
    window.applyAntibiotic = (dose) => game.applyAntibiotic(dose);
    window.skipDose = () => game.skipDose();
});