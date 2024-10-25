let bacterialCount = 10;
let mutationLevel = "Low";
let healthStatus = 100;
let infectionSeverity = "Low";
let superbugProbability = 5;
let daysPassed = 0;

const petriDish = document.querySelector(".petri-dish");
const timerDisplay = document.getElementById("timer");
const bacterialCountDisplay = document.getElementById("bacterialCount");
const mutationLevelDisplay = document.getElementById("mutationLevel");
const healthStatusDisplay = document.getElementById("healthStatus");
const infectionSeverityDisplay = document.getElementById("infectionSeverity");
const superbugProbabilityDisplay = document.getElementById("superbugProbability");

// Progressive timer to represent days passing
function startTimer() {
  setInterval(() => {
    daysPassed++;
    timerDisplay.innerText = daysPassed;

    // Increase bacterial count and mutation over time
    bacterialCount = Math.floor(bacterialCount * 1.1); // 10% growth rate
    mutationLevel = bacterialCount > 30 ? "High" : bacterialCount > 20 ? "Moderate" : "Low";
    
    // Increase infection severity and superbug probability over time
    if (bacterialCount > 30) {
      infectionSeverity = "High";
      healthStatus -= 5;
      superbugProbability += 5;
    } else if (bacterialCount > 20) {
      infectionSeverity = "Moderate";
      healthStatus -= 3;
      superbugProbability += 2;
    }

    // Update all metrics on the screen
    updateMetrics();
    updateBacteria();
  }, 2000); // 1 day every 2 seconds for the sake of simulation speed
}

// Update bacteria display
function updateBacteria() {
  petriDish.innerHTML = ""; // Clear existing bacteria

  // Add bacteria elements based on current count
  for (let i = 0; i < bacterialCount; i++) {
    const bacteria = document.createElement("div");
    bacteria.classList.add("bacteria");
    bacteria.style.top = Math.random() * 80 + "%";
    bacteria.style.left = Math.random() * 80 + "%";

    // Update mutation color based on mutation level
    bacteria.style.backgroundColor =
      mutationLevel === "High" ? "#ff4500" :
      mutationLevel === "Moderate" ? "#ff6b6b" : "#ff9999";

    petriDish.appendChild(bacteria);
  }
}

// Apply antibiotics to reduce bacterial count
function applyAntibiotic(dose) {
  if (dose === "low") {
    bacterialCount = Math.max(bacterialCount - Math.floor(bacterialCount * 0.2), 0);
  } else if (dose === "high") {
    bacterialCount = Math.max(bacterialCount - Math.floor(bacterialCount * 0.5), 0);
    superbugProbability += 10; // High dose increases superbug probability
  }
  healthStatus = Math.min(healthStatus + 5, 100); // Improve health status with treatment
  updateMetrics();
  updateBacteria();
}

// Update all metrics on the screen
function updateMetrics() {
  bacterialCountDisplay.innerText = bacterialCount;
  mutationLevelDisplay.innerText = mutationLevel;
  healthStatusDisplay.innerText = healthStatus + "%";
  infectionSeverityDisplay.innerText = infectionSeverity;
  superbugProbabilityDisplay.innerText = superbugProbability + "%";
}

// Start game functions
startTimer();
updateBacteria();
