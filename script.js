/* =========================================================
   POWER SYSTEM FAULT ANALYZER
   GitHub Pages Compatible
   All calculations run entirely in JavaScript
========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedFault = "three_phase";

/*
    Sequence impedances

    Z1 = Positive sequence impedance
    Z2 = Negative sequence impedance
    Z0 = Zero sequence impedance

    Your HTML currently provides only Z1.

    For educational analysis, Z2 and Z0 are estimated
    from Z1. You can later add separate input fields.
*/

let Z1 = 0.15;
let Z2 = 0.15;
let Z0 = 0.45;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const faultButtons = document.querySelectorAll(".fault-btn");

const voltageInput = document.getElementById("voltage");
const baseMVAInput = document.getElementById("base_mva");
const z1Input = document.getElementById("z1");

const analyzeButton = document.getElementById("analyze");


/* =========================================================
   FAULT INFORMATION
========================================================= */

const faultInformation = {

    three_phase: {
        name: "3-Phase Fault",
        description:
            "A symmetrical three-phase short circuit has occurred.",
        severity: "CRITICAL"
    },

    line_ground: {
        name: "Line-Ground Fault",
        description:
            "A single phase has developed a short circuit to earth.",
        severity: "HIGH"
    },

    line_line: {
        name: "Line-Line Fault",
        description:
            "Two phases have developed a short circuit between them.",
        severity: "HIGH"
    },

    double_line_ground: {
        name: "Double Line-Ground Fault",
        description:
            "Two phases have shorted together and connected to earth.",
        severity: "CRITICAL"
    }

};


/* =========================================================
   FAULT BUTTON SELECTION
========================================================= */

faultButtons.forEach(button => {

    button.addEventListener("click", () => {

        faultButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedFault = button.dataset.fault;

        resetVisualization();

        updateFaultPreview();

    });

});


/* =========================================================
   ANALYZE BUTTON
========================================================= */

if (analyzeButton) {

    analyzeButton.addEventListener("click", analyzeFault);

}


/* =========================================================
   MAIN ANALYSIS FUNCTION
========================================================= */

function analyzeFault() {

    const voltage = Number(voltageInput.value);
    const baseMVA = Number(baseMVAInput.value);
    const enteredZ1 = Number(z1Input.value);

    /* ---------------------------------------------
       INPUT VALIDATION
    --------------------------------------------- */

    if (!Number.isFinite(voltage) || voltage <= 0) {

        alert("Please enter a valid system voltage.");

        voltageInput.focus();

        return;
    }


    if (!Number.isFinite(baseMVA) || baseMVA <= 0) {

        alert("Please enter a valid base power.");

        baseMVAInput.focus();

        return;
    }


    if (!Number.isFinite(enteredZ1) || enteredZ1 <= 0) {

        alert("Please enter a valid positive sequence impedance.");

        z1Input.focus();

        return;
    }


    /* ---------------------------------------------
       UPDATE SEQUENCE IMPEDANCES
    --------------------------------------------- */

    Z1 = enteredZ1;

    /*
        Since your current UI has only Z1,
        reasonable educational assumptions are used:

        Z2 = Z1

        Z0 = 3 × Z1
    */

    Z2 = Z1;

    Z0 = 3 * Z1;


    /* ---------------------------------------------
       BASE CURRENT
    --------------------------------------------- */

    /*
        Base current for a 3-phase system:

        Ibase = MVA / (√3 × kV)

        Result is kA.
    */

    const baseCurrent =
        baseMVA /
        (Math.sqrt(3) * voltage);


    /* ---------------------------------------------
       CALCULATE FAULT CURRENT
    --------------------------------------------- */

    let faultCurrent = 0;

    switch (selectedFault) {

        case "three_phase":

            faultCurrent =
                calculateThreePhaseFault(
                    baseCurrent,
                    Z1
                );

            break;


        case "line_ground":

            faultCurrent =
                calculateLineGroundFault(
                    baseCurrent,
                    Z1,
                    Z0
                );

            break;


        case "line_line":

            faultCurrent =
                calculateLineLineFault(
                    baseCurrent,
                    Z1,
                    Z2
                );

            break;


        case "double_line_ground":

            faultCurrent =
                calculateDoubleLineGroundFault(
                    baseCurrent,
                    Z1,
                    Z2,
                    Z0
                );

            break;


        default:

            faultCurrent = 0;

    }


    /* ---------------------------------------------
       FAULT MVA
    --------------------------------------------- */

    const faultMVA =
        Math.sqrt(3) *
        voltage *
        faultCurrent;


    /* ---------------------------------------------
       UPDATE RESULT UI
    --------------------------------------------- */

    updateResults(
        voltage,
        baseMVA,
        baseCurrent,
        faultCurrent,
        faultMVA
    );


    /* ---------------------------------------------
       UPDATE SEQUENCE NETWORK
    --------------------------------------------- */

    updateSequenceNetwork();


    /* ---------------------------------------------
       UPDATE FAULT VISUALIZATION
    --------------------------------------------- */

    updateFaultVisualization();


    /* ---------------------------------------------
       UPDATE GAUGE
    --------------------------------------------- */

    updateGauge(faultCurrent);


    /* ---------------------------------------------
       UPDATE PROTECTION
    --------------------------------------------- */

    updateProtection(faultCurrent);


    /* ---------------------------------------------
       UPDATE PROTECTION EQUIPMENT
    --------------------------------------------- */

    updateEquipment(faultCurrent);


    /* ---------------------------------------------
       UPDATE CALCULATION DETAILS
    --------------------------------------------- */

    updateCalculationDetails(
        voltage,
        baseMVA,
        baseCurrent,
        faultCurrent,
        faultMVA
    );

}


/* =========================================================
   3-PHASE FAULT
========================================================= */

/*
    For a balanced 3-phase fault:

        Ifault(pu) = 1 / Z1

    Therefore:

        Ifault(kA) =
        Ibase / Z1
*/

function calculateThreePhaseFault(
    baseCurrent,
    z1
) {

    return baseCurrent / z1;

}


/* =========================================================
   LINE-GROUND FAULT
========================================================= */

/*
    Single line-to-ground fault:

        Ifault(pu) =
        3 / (Z1 + Z2 + Z0)

    Assuming fault impedance = 0.
*/

function calculateLineGroundFault(
    baseCurrent,
    z1,
    z0
) {

    const denominator =
        z1 +
        z1 +
        z0;

    if (denominator <= 0) {
        return 0;
    }

    const faultPU =
        3 / denominator;

    return baseCurrent * faultPU;

}


/* =========================================================
   LINE-LINE FAULT
========================================================= */

/*
    Line-to-line fault:

        Ifault(pu) =
        √3 / (Z1 + Z2)

    The result is expressed as line fault current.
*/

function calculateLineLineFault(
    baseCurrent,
    z1,
    z2
) {

    const denominator =
        z1 +
        z2;

    if (denominator <= 0) {
        return 0;
    }

    const faultPU =
        Math.sqrt(3) / denominator;

    return baseCurrent * faultPU;

}


/* =========================================================
   DOUBLE LINE-GROUND FAULT
========================================================= */

/*
    Simplified educational calculation.

    For a double-line-to-ground fault,
    the sequence networks are interconnected.

    A commonly used expression is:

        I1 =
        1 / [ Z1 + (Z2 × Z0)/(Z2 + Z0) ]

    The phase current magnitude depends on the
    sequence currents.

    For this browser-based educational analyzer,
    we use the following approximation:

        I_fault ≈
        Ibase ×
        3 / [ Z1 + (Z2×Z0)/(Z2+Z0) ]

*/

function calculateDoubleLineGroundFault(
    baseCurrent,
    z1,
    z2,
    z0
) {

    const parallelPart =
        (z2 * z0) /
        (z2 + z0);

    const denominator =
        z1 +
        parallelPart;

    if (denominator <= 0) {
        return 0;
    }

    const faultPU =
        3 / denominator;

    return baseCurrent * faultPU;

}


/* =========================================================
   UPDATE RESULTS
========================================================= */

function updateResults(
    voltage,
    baseMVA,
    baseCurrent,
    faultCurrent,
    faultMVA
) {

    setText(
        "base-current",
        formatNumber(baseCurrent)
    );


    setText(
        "fault-current",
        formatNumber(faultCurrent)
    );


    setText(
        "fault-mva",
        formatNumber(faultMVA)
    );


    const severity =
        determineSeverity(faultCurrent);


    setText(
        "severity",
        severity
    );

}


/* =========================================================
   SEQUENCE NETWORK
========================================================= */

function updateSequenceNetwork() {

    setText(
        "sequence-z0",
        Z0.toFixed(3) + " pu"
    );


    setText(
        "sequence-z1",
        Z1.toFixed(3) + " pu"
    );


    setText(
        "sequence-z2",
        Z2.toFixed(3) + " pu"
    );

}


/* =========================================================
   FAULT VISUALIZATION
========================================================= */

function updateFaultVisualization() {

    resetVisualization();


    const info =
        faultInformation[selectedFault];


    setText(
        "visual-fault-name",
        info.name
    );


    setText(
        "visual-fault-description",
        info.description
    );


    setText(
        "phase-status-text",
        "FAULT DETECTED"
    );


    const statusDot =
        document.getElementById(
            "phase-status-dot"
        );


    if (statusDot) {
        statusDot.classList.add("fault");
    }


    switch (selectedFault) {

        case "three_phase":

            activateFaultPoint(
                "phase-r-fault"
            );

            activateFaultPoint(
                "phase-y-fault"
            );

            activateFaultPoint(
                "phase-b-fault"
            );

            activateWire(
                "phase-r-wire"
            );

            activateWire(
                "phase-y-wire"
            );

            activateWire(
                "phase-b-wire"
            );

            break;


        case "line_ground":

            activateFaultPoint(
                "phase-r-fault"
            );

            activateWire(
                "phase-r-wire"
            );

            break;


        case "line_line":

            activateFaultPoint(
                "phase-y-fault"
            );

            activateFaultPoint(
                "phase-b-fault"
            );

            activateWire(
                "phase-y-wire"
            );

            activateWire(
                "phase-b-wire"
            );

            break;


        case "double_line_ground":

            activateFaultPoint(
                "phase-y-fault"
            );

            activateFaultPoint(
                "phase-b-fault"
            );

            activateWire(
                "phase-y-wire"
            );

            activateWire(
                "phase-b-wire"
            );

            break;

    }

}


/* =========================================================
   RESET VISUALIZATION
========================================================= */

function resetVisualization() {

    const faultPoints = [
        "phase-r-fault",
        "phase-y-fault",
        "phase-b-fault"
    ];


    const wires = [
        "phase-r-wire",
        "phase-y-wire",
        "phase-b-wire"
    ];


    faultPoints.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.classList.remove("active");
        }

    });


    wires.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.classList.remove("fault");
        }

    });


    const statusDot =
        document.getElementById(
            "phase-status-dot"
        );


    if (statusDot) {
        statusDot.classList.remove("fault");
    }


    setText(
        "phase-status-text",
        "SYSTEM NORMAL"
    );

}


/* =========================================================
   FAULT PREVIEW
========================================================= */

function updateFaultPreview() {

    const info =
        faultInformation[selectedFault];


    if (!info) {
        return;
    }


    setText(
        "visual-fault-name",
        info.name
    );


    setText(
        "visual-fault-description",
        info.description
    );

}


/* =========================================================
   GAUGE
========================================================= */

function updateGauge(faultCurrent) {

    setText(
        "gauge-current",
        formatNumber(faultCurrent)
    );


    /*
        Gauge maximum = 15 kA.

        Anything above 15 kA
        stays at maximum.
    */

    const maximum = 15;

    let percentage =
        (faultCurrent / maximum) * 100;


    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    const progress =
        document.getElementById(
            "gauge-progress"
        );


    if (progress) {

        progress.style.width =
            percentage + "%";

    }


    /*
        Needle angle:

        -90° = minimum
        +90° = maximum
    */

    const angle =
        -90 +
        (percentage * 1.8);


    const needle =
        document.getElementById(
            "gauge-needle"
        );


    if (needle) {

        needle.style.transform =
            `rotate(${angle}deg)`;

    }


    const status =
        determineSeverity(
            faultCurrent
        );


    setText(
        "gauge-status",
        status
    );

}


/* =========================================================
   SEVERITY
========================================================= */

function determineSeverity(faultCurrent) {

    if (faultCurrent >= 10) {
        return "CRITICAL";
    }


    if (faultCurrent >= 5) {
        return "HIGH";
    }


    if (faultCurrent >= 2) {
        return "MODERATE";
    }


    return "LOW";

}


/* =========================================================
   PROTECTION RECOMMENDATION
========================================================= */

function updateProtection(faultCurrent) {

    const icon =
        document.getElementById(
            "protection-icon"
        );


    const title =
        document.getElementById(
            "protection-title"
        );


    const message =
        document.getElementById(
            "protection-message"
        );


    if (!title || !message) {
        return;
    }


    if (faultCurrent >= 10) {

        if (icon) {
            icon.textContent = "⚠";
        }

        title.textContent =
            "Immediate Circuit Breaker Trip";

        message.textContent =
            "Very high fault current detected. " +
            "High-speed protection and immediate " +
            "circuit breaker operation are recommended.";

    }


    else if (faultCurrent >= 5) {

        if (icon) {
            icon.textContent = "!";
        }

        title.textContent =
            "High-Speed Overcurrent Protection";

        message.textContent =
            "High fault current detected. " +
            "Verify relay settings and ensure the " +
            "circuit breaker interrupting rating is adequate.";

    }


    else if (faultCurrent >= 2) {

        if (icon) {
            icon.textContent = "✓";
        }

        title.textContent =
            "Overcurrent Protection Recommended";

        message.textContent =
            "Moderate fault current detected. " +
            "Coordinate the protection relay and " +
            "circuit breaker settings.";

    }


    else {

        if (icon) {
            icon.textContent = "✓";
        }

        title.textContent =
            "Protection Monitoring";

        message.textContent =
            "Fault current is relatively low. " +
            "Continue protection monitoring and verify " +
            "relay coordination.";

    }

}


/* =========================================================
   PROTECTION EQUIPMENT
========================================================= */

function updateEquipment(faultCurrent) {

    const relayStatus =
        document.getElementById(
            "relay-status"
        );


    const breakerStatus =
        document.getElementById(
            "breaker-status"
        );


    const tripStatus =
        document.getElementById(
            "trip-status"
        );


    const relayIndicator =
        document.getElementById(
            "relay-indicator"
        );


    const breakerIndicator =
        document.getElementById(
            "breaker-indicator"
        );


    const tripIndicator =
        document.getElementById(
            "trip-indicator"
        );


    /* ---------------------------------------------
       RELAY
    --------------------------------------------- */

    if (relayStatus) {

        relayStatus.textContent =
            "FAULT DETECTED";

    }


    if (relayIndicator) {

        relayIndicator.classList.add(
            "active"
        );

    }


    /* ---------------------------------------------
       BREAKER
    --------------------------------------------- */

    if (faultCurrent >= 5) {

        if (breakerStatus) {

            breakerStatus.textContent =
                "OPEN";

        }


        if (breakerIndicator) {

            breakerIndicator.classList.add(
                "active"
            );

        }

    }

    else {

        if (breakerStatus) {

            breakerStatus.textContent =
                "CLOSED";

        }

    }


    /* ---------------------------------------------
       TRIP COMMAND
    --------------------------------------------- */

    if (faultCurrent >= 5) {

        if (tripStatus) {

            tripStatus.textContent =
                "TRIP ACTIVE";

        }


        if (tripIndicator) {

            tripIndicator.classList.add(
                "active"
            );

        }

    }

    else {

        if (tripStatus) {

            tripStatus.textContent =
                "STANDBY";

        }

    }

}


/* =========================================================
   CALCULATION DETAILS
========================================================= */

function updateCalculationDetails(
    voltage,
    baseMVA,
    baseCurrent,
    faultCurrent,
    faultMVA
) {

    setText(
        "calc-voltage",
        voltage.toFixed(2) + " kV"
    );


    setText(
        "calc-base-mva",
        baseMVA.toFixed(2) + " MVA"
    );


    setText(
        "calc-base-current",
        baseCurrent.toFixed(3) + " kA"
    );


    setText(
        "calc-fault-current",
        faultCurrent.toFixed(3) + " kA"
    );


    setText(
        "calc-fault-mva",
        faultMVA.toFixed(3) + " MVA"
    );

}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}


function formatNumber(value) {

    if (!Number.isFinite(value)) {
        return "--";
    }


    return value.toFixed(3);

}


function activateFaultPoint(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.classList.add(
            "active"
        );

    }

}


function activateWire(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.classList.add(
            "fault"
        );

    }

}


/* =========================================================
   INITIAL PAGE STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        resetVisualization();

        updateFaultPreview();

        updateSequenceNetwork();

    }
);
