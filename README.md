# Methane Gas Gradient Calculator

A Python script for calculating the gas gradient of methane in PSI/ft at various pressure and temperature conditions. The calculator uses the real gas equation of state with compressibility factor corrections for accurate results.

## Overview

The gas gradient represents the pressure change per unit depth and is essential for petroleum engineering, well planning, and reservoir analysis. This calculator specifically handles methane (CH₄) gas under various pressure and temperature conditions.

## Formula

The gas gradient is calculated using:

```
Gas Gradient (psi/ft) = ρ / 144
```

Where gas density (ρ) is calculated using the real gas equation:

```
ρ = (P × MW) / (Z × R × T)
```

- **P**: Pressure (psi)
- **MW**: Molecular weight of methane (16.04 lb/lb-mol)
- **Z**: Compressibility factor (calculated using reduced properties)
- **R**: Gas constant (10.732 psi·ft³/(lb-mol·°R))
- **T**: Temperature (°R)

## Requirements

- Python 3.6 or higher
- No external dependencies (uses only standard library)

## Usage

### Basic Syntax

```bash
python3 methane_gas_gradient.py -p <pressure> -t <temperature> [options]
```

### Command-Line Arguments

| Argument | Short | Long | Required | Description |
|----------|-------|------|----------|-------------|
| Pressure | `-p` | `--pressure` | Yes | Pressure in PSI |
| Temperature | `-t` | `--temperature` | Yes | Temperature in degrees Celsius |
| Verbose | `-v` | `--verbose` | No | Show detailed calculation steps |
| Help | `-h` | `--help` | No | Display help message |

### Example Commands

#### Basic Usage (Returns gradient value only)
```bash
python3 methane_gas_gradient.py -p 230 -t 30
```
**Output:**
```
0.004745
```

#### Verbose Mode (Shows detailed calculations)
```bash
python3 methane_gas_gradient.py -p 230 -t 30 --verbose
```
**Output:**
```
============================================================
Methane Gas Gradient Calculation
============================================================
Input Parameters:
  Pressure:           230.00 psi
  Temperature:        30.00 °C (545.67 °R)

Constants:
  Molecular Weight:   16.04 lb/lb-mol
  Gas Constant (R):   10.732 psi·ft³/(lb-mol·°R)

Calculated Values:
  Compressibility (Z): 0.9221
  Gas Density:        0.683219 lb/ft³

Result:
  Gas Gradient:       0.004745 psi/ft
============================================================
```

#### High Pressure Conditions
```bash
python3 methane_gas_gradient.py -p 1000 -t 50 -v
```

#### Low Temperature Conditions
```bash
python3 methane_gas_gradient.py -p 500 -t 10 --verbose
```

#### Ambient Conditions
```bash
python3 methane_gas_gradient.py -p 14.7 -t 20
```

#### Multiple Calculations (Using a Loop)
```bash
for pressure in 100 200 300 400 500; do
  echo "Pressure: $pressure psi"
  python3 methane_gas_gradient.py -p $pressure -t 30
done
```

### Using in Scripts

You can also import and use the functions in your own Python scripts:

```python
from methane_gas_gradient import calculate_gas_gradient

# Calculate gradient
gradient = calculate_gas_gradient(pressure_psi=230, temp_celsius=30, verbose=False)
print(f"Gas Gradient: {gradient:.6f} psi/ft")
```

## Example Results

| Pressure (psi) | Temperature (°C) | Gas Gradient (psi/ft) |
|----------------|------------------|-----------------------|
| 14.7 (1 atm)   | 20               | 0.000304              |
| 100            | 25               | 0.002054              |
| 230            | 30               | 0.004745              |
| 500            | 40               | 0.010180              |
| 1000           | 50               | 0.020145              |

## Technical Notes

- **Compressibility Factor (Z)**: The script uses a simplified Dranchuk-Abou-Kassem correlation to calculate the compressibility factor, which accounts for real gas behavior deviation from ideal gas law.

- **Valid Range**: The calculations are most accurate for:
  - Pressure: 14.7 - 5000 psi
  - Temperature: -20°C to 100°C

- **Units**: 
  - Input pressure: PSI (pounds per square inch)
  - Input temperature: Celsius
  - Output gradient: PSI/ft (pounds per square inch per foot)

## Error Handling

The script validates inputs and will return errors for:
- Non-positive pressure values
- Temperatures below absolute zero (-273.15°C)

## License

This script is provided as-is for educational and engineering purposes.

## Author

Created for UNSW petroleum engineering calculations.
