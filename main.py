import math


# ============================================================
# 1. THREE-PHASE FAULT
# ============================================================

def three_phase_fault():

    print("\n" + "=" * 60)
    print("                 3-PHASE FAULT")
    print("=" * 60)

    voltage_kv = float(input("Enter system voltage (kV): "))
    base_mva = float(input("Enter base MVA: "))
    z1_pu = float(input("Enter positive sequence impedance Z1 (pu): "))

    # Base current
    base_current_ka = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    # 3-phase fault current
    fault_current_pu = 1 / z1_pu

    # Actual fault current
    fault_current_ka = (
        fault_current_pu * base_current_ka
    )

    # Fault MVA
    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current_ka
    )

    display_result(
        voltage_kv,
        base_mva,
        base_current_ka,
        fault_current_ka,
        fault_mva
    )


# ============================================================
# 2. LINE-TO-GROUND FAULT
# ============================================================

def line_ground_fault():

    print("\n" + "=" * 60)
    print("             LINE-TO-GROUND FAULT")
    print("=" * 60)

    voltage_kv = float(input("Enter system voltage (kV): "))
    base_mva = float(input("Enter base MVA: "))

    z0_pu = float(input("Enter zero sequence impedance Z0 (pu): "))
    z1_pu = float(input("Enter positive sequence impedance Z1 (pu): "))
    z2_pu = float(input("Enter negative sequence impedance Z2 (pu): "))

    # Base current
    base_current_ka = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    # L-G fault current
    fault_current_pu = 3 / (
        z0_pu + z1_pu + z2_pu
    )

    # Actual fault current
    fault_current_ka = (
        fault_current_pu * base_current_ka
    )

    # Fault MVA
    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current_ka
    )

    display_result(
        voltage_kv,
        base_mva,
        base_current_ka,
        fault_current_ka,
        fault_mva
    )


# ============================================================
# 3. LINE-TO-LINE FAULT
# ============================================================

def line_line_fault():

    print("\n" + "=" * 60)
    print("              LINE-TO-LINE FAULT")
    print("=" * 60)

    voltage_kv = float(input("Enter system voltage (kV): "))
    base_mva = float(input("Enter base MVA: "))

    z1_pu = float(input("Enter positive sequence impedance Z1 (pu): "))
    z2_pu = float(input("Enter negative sequence impedance Z2 (pu): "))

    # Base current
    base_current_ka = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    # L-L fault current
    fault_current_pu = math.sqrt(3) / (
        z1_pu + z2_pu
    )

    # Actual fault current
    fault_current_ka = (
        fault_current_pu * base_current_ka
    )

    # Fault MVA
    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current_ka
    )

    display_result(
        voltage_kv,
        base_mva,
        base_current_ka,
        fault_current_ka,
        fault_mva
    )


# ============================================================
# 4. DOUBLE-LINE-TO-GROUND FAULT
# ============================================================

def double_line_ground_fault():

    print("\n" + "=" * 60)
    print("         DOUBLE-LINE-TO-GROUND FAULT")
    print("=" * 60)

    voltage_kv = float(input("Enter system voltage (kV): "))
    base_mva = float(input("Enter base MVA: "))

    z0_pu = float(input("Enter zero sequence impedance Z0 (pu): "))
    z1_pu = float(input("Enter positive sequence impedance Z1 (pu): "))
    z2_pu = float(input("Enter negative sequence impedance Z2 (pu): "))

    # Base current
    base_current_ka = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    # Parallel combination of Z0 and Z2
    z0_parallel_z2 = (
        z0_pu * z2_pu
    ) / (
        z0_pu + z2_pu
    )

    # L-L-G fault sequence current
    fault_current_pu = 1 / (
        z1_pu + z0_parallel_z2
    )

    # Approximate fault current
    fault_current_ka = (
        fault_current_pu * base_current_ka
    )

    # Fault MVA
    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current_ka
    )

    display_result(
        voltage_kv,
        base_mva,
        base_current_ka,
        fault_current_ka,
        fault_mva
    )


# ============================================================
# RESULT DISPLAY
# ============================================================

def display_result(
    voltage_kv,
    base_mva,
    base_current_ka,
    fault_current_ka,
    fault_mva
):

    print("\n" + "=" * 60)
    print("                 FAULT RESULT")
    print("=" * 60)

    print(f"System Voltage : {voltage_kv:.2f} kV")
    print(f"Base MVA       : {base_mva:.2f} MVA")
    print(f"Base Current   : {base_current_ka:.3f} kA")
    print(f"Fault Current  : {fault_current_ka:.3f} kA")
    print(f"Fault MVA      : {fault_mva:.3f} MVA")

    # Fault severity
    if fault_current_ka >= 10:
        severity = "VERY HIGH"
    elif fault_current_ka >= 5:
        severity = "HIGH"
    elif fault_current_ka >= 2:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    print(f"Fault Severity : {severity}")

    print("=" * 60)


# ============================================================
# MAIN MENU
# ============================================================

def main():

    while True:

        print("\n")
        print("=" * 60)
        print("          POWER SYSTEM FAULT ANALYZER")
        print("=" * 60)

        print("1. 3-Phase Fault")
        print("2. Line-to-Ground Fault")
        print("3. Line-to-Line Fault")
        print("4. Double-Line-to-Ground Fault")
        print("5. Exit")

        print("=" * 60)

        choice = input("Select an option (1-5): ")

        # Option 1
        if choice == "1":
            three_phase_fault()

        # Option 2
        elif choice == "2":
            line_ground_fault()

        # Option 3
        elif choice == "3":
            line_line_fault()

        # Option 4
        elif choice == "4":
            double_line_ground_fault()

        # Option 5
        elif choice == "5":
            print("\nThank you for using Power System Fault Analyzer.")
            print("Program terminated.")
            break

        # Invalid option
        else:
            print("\nInvalid option!")
            print("Please enter a number from 1 to 5.")


# ============================================================
# PROGRAM START
# ============================================================

if __name__ == "__main__":
    main()