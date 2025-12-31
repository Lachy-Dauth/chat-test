#!/usr/bin/env python3
"""
Methane Gas Gradient Calculator

Calculates the gas gradient of methane in PSI/ft given pressure and temperature.
Uses the real gas equation of state with compressibility factor.
"""

import argparse
import sys


def calculate_compressibility_factor(pressure_psi, temp_celsius):
    """
    Calculate compressibility factor (Z) for methane.
    Uses simplified correlation for methane at moderate pressures.
    
    Args:
        pressure_psi: Pressure in PSI
        temp_celsius: Temperature in Celsius
    
    Returns:
        Compressibility factor Z (dimensionless)
    """
    # Methane critical properties
    P_critical = 667.8  # psi
    T_critical = -82.6  # Celsius (190.6 K)
    T_critical_rankine = (-82.6 + 273.15) * 9/5  # Convert to Rankine
    
    # Convert to Rankine for calculations
    temp_rankine = (temp_celsius + 273.15) * 9/5
    
    # Reduced properties
    P_reduced = pressure_psi / P_critical
    T_reduced = temp_rankine / T_critical_rankine
    
    # Simplified correlation for Z (valid for moderate pressures)
    # Using Dranchuk-Abou-Kassem correlation (simplified)
    Z = 1.0 - (0.36 * P_reduced / T_reduced)
    
    # Ensure Z is within reasonable bounds
    Z = max(0.5, min(Z, 1.2))
    
    return Z


def calculate_gas_gradient(pressure_psi, temp_celsius, verbose=False):
    """
    Calculate the gas gradient of methane in PSI/ft.
    
    Args:
        pressure_psi: Pressure in PSI
        temp_celsius: Temperature in Celsius
        verbose: If True, print detailed calculations
    
    Returns:
        Gas gradient in PSI/ft
    """
    # Constants
    MW_METHANE = 16.04  # g/mol or lb/lb-mol
    R = 10.732  # Gas constant: psi·ft³/(lb-mol·°R)
    
    # Convert temperature to Rankine
    temp_rankine = (temp_celsius * 9/5) + 491.67
    
    # Calculate compressibility factor
    Z = calculate_compressibility_factor(pressure_psi, temp_celsius)
    
    # Calculate gas density using real gas equation
    # ρ = (P × MW) / (Z × R × T)
    # Units: (psi × lb/lb-mol) / (dimensionless × psi·ft³/(lb-mol·°R) × °R)
    # Result: lb/ft³
    density_lb_per_ft3 = (pressure_psi * MW_METHANE) / (Z * R * temp_rankine)
    
    # Gas gradient in psi/ft
    # For gas: gradient = density / 144 (since 1 psi/ft = 144 lb/ft³ × 1 ft / 1 ft²)
    # Actually: gradient (psi/ft) = density (lb/ft³) / 144
    gas_gradient = density_lb_per_ft3 / 144
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"Methane Gas Gradient Calculation")
        print(f"{'='*60}")
        print(f"Input Parameters:")
        print(f"  Pressure:           {pressure_psi:.2f} psi")
        print(f"  Temperature:        {temp_celsius:.2f} °C ({temp_rankine:.2f} °R)")
        print(f"\nConstants:")
        print(f"  Molecular Weight:   {MW_METHANE} lb/lb-mol")
        print(f"  Gas Constant (R):   {R} psi·ft³/(lb-mol·°R)")
        print(f"\nCalculated Values:")
        print(f"  Compressibility (Z): {Z:.4f}")
        print(f"  Gas Density:        {density_lb_per_ft3:.6f} lb/ft³")
        print(f"\nResult:")
        print(f"  Gas Gradient:       {gas_gradient:.6f} psi/ft")
        print(f"{'='*60}\n")
    
    return gas_gradient


def main():
    parser = argparse.ArgumentParser(
        description='Calculate methane gas gradient in PSI/ft',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --pressure 230 --temperature 30
  %(prog)s -p 500 -t 25 --verbose
  %(prog)s -p 1000 -t 50 -v
        """
    )
    
    parser.add_argument(
        '-p', '--pressure',
        type=float,
        required=True,
        help='Pressure in PSI'
    )
    
    parser.add_argument(
        '-t', '--temperature',
        type=float,
        required=True,
        help='Temperature in degrees Celsius'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Print detailed calculation steps'
    )
    
    args = parser.parse_args()
    
    # Validate inputs
    if args.pressure <= 0:
        print("Error: Pressure must be positive", file=sys.stderr)
        sys.exit(1)
    
    if args.temperature < -273.15:
        print("Error: Temperature cannot be below absolute zero", file=sys.stderr)
        sys.exit(1)
    
    # Calculate gas gradient
    gradient = calculate_gas_gradient(args.pressure, args.temperature, args.verbose)
    
    if not args.verbose:
        print(f"{gradient:.6f}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
