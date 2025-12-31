/**
 * Methane Gas Gradient Calculator - Web Application
 * Calculates gas gradient in PSI/ft for given pressure and temperature
 */

// Constants
const CONSTANTS = {
    MW_METHANE: 16.04,  // Molecular weight in lb/lb-mol
    R: 10.732,          // Gas constant in psi·ft³/(lb-mol·°R)
    P_CRITICAL: 667.8,  // Critical pressure in psi
    T_CRITICAL_C: -82.6 // Critical temperature in Celsius
};

// Unit conversion factors
const UNIT_CONVERSIONS = {
    pressure: {
        psi: 1,
        bar: 14.5038,
        kPa: 0.145038,
        MPa: 145.038,
        atm: 14.6959
    },
    temperature: {
        // All convert to Celsius first
        C: (val) => val,
        F: (val) => (val - 32) * 5/9,
        K: (val) => val - 273.15,
        R: (val) => (val - 491.67) * 5/9
    },
    gradient: {
        'psi/ft': 1,
        'kPa/m': 0.0226254, // 1 psi/ft = 0.0226254 kPa/m
        'bar/m': 0.0002262,  // 1 psi/ft = 0.0002262 bar/m
        'psi/m': 3.28084,    // 1 psi/ft = 3.28084 psi/m
        'MPa/m': 0.00002262  // 1 psi/ft = 0.00002262 MPa/m
    }
};

/**
 * Calculate compressibility factor (Z) for methane
 * @param {number} pressurePsi - Pressure in PSI
 * @param {number} tempCelsius - Temperature in Celsius
 * @returns {number} Compressibility factor Z
 */
function calculateCompressibilityFactor(pressurePsi, tempCelsius) {
    // Convert to Rankine
    const tempRankine = (tempCelsius + 273.15) * 9/5;
    const tCriticalRankine = (CONSTANTS.T_CRITICAL_C + 273.15) * 9/5;
    
    // Calculate reduced properties
    const pReduced = pressurePsi / CONSTANTS.P_CRITICAL;
    const tReduced = tempRankine / tCriticalRankine;
    
    // Simplified correlation for Z (Dranchuk-Abou-Kassem simplified)
    let z = 1.0 - (0.36 * pReduced / tReduced);
    
    // Ensure Z is within reasonable bounds
    z = Math.max(0.5, Math.min(z, 1.2));
    
    return z;
}

/**
 * Convert Celsius to Rankine
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Rankine
 */
function celsiusToRankine(celsius) {
    return (celsius * 9/5) + 491.67;
}

/**
 * Calculate gas gradient of methane
 * @param {number} pressurePsi - Pressure in PSI
 * @param {number} tempCelsius - Temperature in Celsius
 * @returns {Object} Results object containing gradient and details
 */
function calculateGasGradient(pressurePsi, tempCelsius) {
    // Convert temperature to Rankine
    const tempRankine = celsiusToRankine(tempCelsius);
    
    // Calculate compressibility factor
    const z = calculateCompressibilityFactor(pressurePsi, tempCelsius);
    
    // Calculate gas density using real gas equation
    // ρ = (P × MW) / (Z × R × T)
    const densityLbPerFt3 = (pressurePsi * CONSTANTS.MW_METHANE) / (z * CONSTANTS.R * tempRankine);
    
    // Gas gradient in psi/ft
    const gasGradient = densityLbPerFt3 / 144;
    
    return {
        gradient: gasGradient,
        tempRankine: tempRankine,
        compressibility: z,
        density: densityLbPerFt3
    };
}

/**
 * Convert pressure to PSI
 * @param {number} value - Pressure value
 * @param {string} unit - Source unit
 * @returns {number} Pressure in PSI
 */
function convertPressureToPsi(value, unit) {
    return value * UNIT_CONVERSIONS.pressure[unit];
}

/**
 * Convert temperature to Celsius
 * @param {number} value - Temperature value
 * @param {string} unit - Source unit
 * @returns {number} Temperature in Celsius
 */
function convertTemperatureToCelsius(value, unit) {
    return UNIT_CONVERSIONS.temperature[unit](value);
}

/**
 * Convert gradient from psi/ft to target unit
 * @param {number} gradientPsiFt - Gradient in psi/ft
 * @param {string} targetUnit - Target unit
 * @returns {number} Gradient in target unit
 */
function convertGradient(gradientPsiFt, targetUnit) {
    return gradientPsiFt / UNIT_CONVERSIONS.gradient[targetUnit];
}

/**
 * Format number to fixed decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(num, decimals = 6) {
    return num.toFixed(decimals);
}

/**
 * Display results in the UI
 * @param {Object} results - Results object from calculation
 * @param {boolean} showDetails - Whether to show detailed calculations
 * @param {string} outputUnit - Output unit for gradient
 */
function displayResults(results, showDetails, outputUnit) {
    const resultsDiv = document.getElementById('results');
    const detailedResultsDiv = document.getElementById('detailedResults');
    const gradientValue = document.getElementById('gradientValue');
    const gradientUnit = document.getElementById('gradientUnit');
    
    // Show results section
    resultsDiv.classList.remove('hidden');
    
    // Convert gradient to selected output unit
    const convertedGradient = convertGradient(results.gradient, outputUnit);
    
    // Display main gradient result
    gradientValue.textContent = formatNumber(convertedGradient, 6);
    gradientUnit.textContent = outputUnit;
    
    // Display detailed results if checkbox is checked
    if (showDetails) {
        document.getElementById('tempRankine').textContent = `${formatNumber(results.tempRankine, 2)} °R`;
        document.getElementById('compressibility').textContent = formatNumber(results.compressibility, 4);
        document.getElementById('density').textContent = `${formatNumber(results.density, 6)} lb/ft³`;
        detailedResultsDiv.classList.remove('hidden');
    } else {
        detailedResultsDiv.classList.add('hidden');
    }
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Validate form inputs
 * @param {number} pressure - Pressure value
 * @param {number} temperature - Temperature value
 * @returns {Object} Validation result with valid flag and message
 */
function validateInputs(pressure, temperature) {
    if (isNaN(pressure) || pressure <= 0) {
        return {
            valid: false,
            message: 'Pressure must be a positive number'
        };
    }
    
    if (isNaN(temperature) || temperature < -273.15) {
        return {
            valid: false,
            message: 'Temperature cannot be below absolute zero (-273.15°C)'
        };
    }
    
    if (pressure > 10000) {
        return {
            valid: false,
            message: 'Pressure is outside the recommended range (0-10000 psi)'
        };
    }
    
    if (temperature > 200) {
        return {
            valid: false,
            message: 'Temperature is outside the recommended range (-20 to 200°C)'
        };
    }
    
    return { valid: true };
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    alert(message);
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const pressure = parseFloat(document.getElementById('pressure').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    const pressureUnit = document.getElementById('pressureUnit').value;
    const temperatureUnit = document.getElementById('temperatureUnit').value;
    const outputUnit = document.getElementById('outputUnit').value;
    const showDetails = document.getElementById('showDetails').checked;
    
    // Convert inputs to standard units (PSI and Celsius)
    const pressurePsi = convertPressureToPsi(pressure, pressureUnit);
    const temperatureCelsius = convertTemperatureToCelsius(temperature, temperatureUnit);
    
    // Validate converted inputs
    const validation = validateInputs(pressurePsi, temperatureCelsius);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    try {
        // Calculate gradient (in psi/ft)
        const results = calculateGasGradient(pressurePsi, temperatureCelsius);
        
        // Display results with unit conversion
        displayResults(results, showDetails, outputUnit);
    } catch (error) {
        showError('An error occurred during calculation. Please check your inputs.');
        console.error('Calculation error:', error);
    }
}

/**
 * Load example values into the form
 * @param {number} pressure - Example pressure (in psi)
 * @param {number} temperature - Example temperature (in Celsius)
 */
function loadExample(pressure, temperature) {
    document.getElementById('pressure').value = pressure;
    document.getElementById('temperature').value = temperature;
    document.getElementById('pressureUnit').value = 'psi';
    document.getElementById('temperatureUnit').value = 'C';
    document.getElementById('outputUnit').value = 'psi/ft';
    document.getElementById('showDetails').checked = true;
    
    // Trigger calculation
    document.getElementById('calculatorForm').dispatchEvent(new Event('submit'));
}

/**
 * Add click handlers to example table rows
 */
function setupExampleClickHandlers() {
    const exampleRows = document.querySelectorAll('.examples-box tbody tr');
    exampleRows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
            const cells = this.cells;
            const pressure = parseFloat(cells[0].textContent);
            const temperature = parseFloat(cells[1].textContent);
            loadExample(pressure, temperature);
        });
    });
}

/**
 * Initialize the application
 */
function init() {
    // Set up form submission handler
    const form = document.getElementById('calculatorForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Set up example click handlers
    setupExampleClickHandlers();
    
    // Load default example (230 psi, 30°C)
    document.getElementById('pressure').value = 230;
    document.getElementById('temperature').value = 30;
    
    console.log('Methane Gas Gradient Calculator initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
