import math


# =========================================================
# 3-PHASE FAULT
# =========================================================

def calculate_three_phase(voltage_kv, base_mva, z1):

    if z1 <= 0:
        raise ValueError("Z₁ must be greater than zero.")

    base_current = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    fault_current_pu = 1 / z1

    fault_current = (
        fault_current_pu * base_current
    )

    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current
    )

    return {
        "base_current": base_current,
        "fault_current": fault_current,
        "fault_mva": fault_mva
    }


# =========================================================
# LINE-GROUND FAULT
# =========================================================

def calculate_line_ground(
    voltage_kv,
    base_mva,
    z0,
    z1,
    z2
):

    if z0 <= 0 or z1 <= 0 or z2 <= 0:
        raise ValueError(
            "All sequence impedances must be greater than zero."
        )

    base_current = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    fault_current_pu = (
        3 / (z0 + z1 + z2)
    )

    fault_current = (
        fault_current_pu * base_current
    )

    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current
    )

    return {
        "base_current": base_current,
        "fault_current": fault_current,
        "fault_mva": fault_mva
    }


# =========================================================
# LINE-LINE FAULT
# =========================================================

def calculate_line_line(
    voltage_kv,
    base_mva,
    z1,
    z2
):

    if z1 <= 0 or z2 <= 0:
        raise ValueError(
            "Z₁ and Z₂ must be greater than zero."
        )

    base_current = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    fault_current_pu = (
        math.sqrt(3) / (z1 + z2)
    )

    fault_current = (
        fault_current_pu * base_current
    )

    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current
    )

    return {
        "base_current": base_current,
        "fault_current": fault_current,
        "fault_mva": fault_mva
    }


# =========================================================
# DOUBLE LINE-GROUND FAULT
# =========================================================

def calculate_double_line_ground(
    voltage_kv,
    base_mva,
    z0,
    z1,
    z2
):

    if z0 <= 0 or z1 <= 0 or z2 <= 0:
        raise ValueError(
            "All sequence impedances must be greater than zero."
        )

    base_current = base_mva / (
        math.sqrt(3) * voltage_kv
    )

    parallel_z0_z2 = (
        z0 * z2
    ) / (
        z0 + z2
    )

    fault_current_pu = (
        1 / (
            z1 + parallel_z0_z2
        )
    )

    fault_current = (
        fault_current_pu * base_current
    )

    fault_mva = (
        math.sqrt(3)
        * voltage_kv
        * fault_current
    )

    return {
        "base_current": base_current,
        "fault_current": fault_current,
        "fault_mva": fault_mva
    }


# =========================================================
# SEVERITY
# Educational classification for this application
# =========================================================

def get_severity(fault_current):

    if fault_current >= 10:
        return "VERY HIGH"

    elif fault_current >= 5:
        return "HIGH"

    elif fault_current >= 2:
        return "MEDIUM"

    else:
        return "LOW"


# =========================================================
# FAULT FORMULA
# =========================================================

def get_formula(fault_type):

    formulas = {

        "three_phase":
            "I_f(pu) = 1 / Z₁",

        "line_ground":
            "I_f(pu) = 3 / (Z₀ + Z₁ + Z₂)",

        "line_line":
            "I_f(pu) = √3 / (Z₁ + Z₂)",

        "double_line_ground":
            "I_f(pu) = 1 / [Z₁ + (Z₀ × Z₂)/(Z₀ + Z₂)]"

    }

    return formulas.get(
        fault_type,
        "Formula unavailable"
    )


# =========================================================
# FAULT DESCRIPTION
# =========================================================

def get_fault_description(fault_type):

    descriptions = {

        "three_phase":
            "A symmetrical three-phase short circuit involving all three phases.",

        "line_ground":
            "A single line-to-ground fault where one phase is connected to ground.",

        "line_line":
            "A short circuit between two phases without direct ground involvement.",

        "double_line_ground":
            "A fault involving two phases and ground simultaneously."

    }

    return descriptions.get(
        fault_type,
        "Unknown fault type."
    )