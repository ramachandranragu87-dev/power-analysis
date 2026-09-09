/* =========================================================
   POWER SYSTEM FAULT ANALYZER
========================================================= */

let selectedFault = "three_phase";


/* =========================================================
   FAULT BUTTONS
========================================================= */

const faultButtons = document.querySelectorAll(".fault-btn");

faultButtons.forEach(button => {

    button.addEventListener("click", () => {

        faultButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedFault = button.dataset.fault;

        updateInputs();

        resetResults();

        resetPhaseVisualization();

    });

});


/* =========================================================
   UPDATE INPUT FIELDS
========================================================= */

function updateInputs() {

    const container =
        document.getElementById("impedance-fields");

    if (!container) {
        return;
    }


    /* 3 PHASE */

    if (selectedFault === "three_phase") {

        container.innerHTML = `

            <div class="input-grid">

                <div class="input-group">

                    <label>
                        Positive Sequence Z₁
                    </label>

                    <div class="input-box">

                        <input
                            type="number"
                            id="z1"
                            value="0.15"
                            step="0.01"
                            min="0.001"
                        >

                        <span>pu</span>

                    </div>

                </div>

            </div>

        `;

    }


    /* LINE-GROUND */

    else if (selectedFault === "line_ground") {

        container.innerHTML =
            createThreeImpedanceFields();

    }


    /* LINE-LINE */

    else if (selectedFault === "line_line") {

        container.innerHTML =
            createTwoImpedanceFields();

    }


    /* DOUBLE LINE-GROUND */

    else if (
        selectedFault === "double_line_ground"
    ) {

        container.innerHTML =
            createThreeImpedanceFields();

    }

}


/* =========================================================
   THREE IMPEDANCE FIELDS
========================================================= */

function createThreeImpedanceFields() {

    return `

        <div class="input-grid">

            ${createInput(
                "z0",
                "Zero Sequence Z₀",
                "0.30"
            )}

            ${createInput(
                "z1",
                "Positive Sequence Z₁",
                "0.15"
            )}

            ${createInput(
                "z2",
                "Negative Sequence Z₂",
                "0.15"
            )}

        </div>

    `;

}


/* =========================================================
   TWO IMPEDANCE FIELDS
========================================================= */

function createTwoImpedanceFields() {

    return `

        <div class="input-grid">

            ${createInput(
                "z1",
                "Positive Sequence Z₁",
                "0.15"
            )}

            ${createInput(
                "z2",
                "Negative Sequence Z₂",
                "0.15"
            )}

        </div>

    `;

}


/* =========================================================
   INPUT CREATOR
========================================================= */

function createInput(id, label, value) {

    return `

        <div class="input-group">

            <label>
                ${label}
            </label>

            <div class="input-box">

                <input
                    type="number"
                    id="${id}"
                    value="${value}"
                    step="0.01"
                    min="0.001"
                >

                <span>pu</span>

            </div>

        </div>

    `;

}


/* =========================================================
   ANALYZE BUTTON
========================================================= */

const analyzeButton =
    document.getElementById("analyze");


if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        analyzeFault
    );

}


async function analyzeFault() {

    try {

        /* -----------------------------------------
           SYSTEM PARAMETERS
        ----------------------------------------- */

        const voltageElement =
            document.getElementById("voltage");

        const baseMvaElement =
            document.getElementById("base_mva");


        const voltage =
            Number(voltageElement.value);

        const baseMva =
            Number(baseMvaElement.value);


        if (!voltage || voltage <= 0) {

            alert(
                "Please enter a valid system voltage."
            );

            return;

        }


        if (!baseMva || baseMva <= 0) {

            alert(
                "Please enter a valid Base MVA."
            );

            return;

        }


        /* -----------------------------------------
           CREATE REQUEST
        ----------------------------------------- */

        const data = {

            fault_type:
                selectedFault,

            voltage:
                voltage,

            base_mva:
                baseMva

        };


        /* -----------------------------------------
           GET IMPEDANCES
        ----------------------------------------- */

        const z0 =
            document.getElementById("z0");

        const z1 =
            document.getElementById("z1");

        const z2 =
            document.getElementById("z2");


        if (z0) {

            data.z0 =
                Number(z0.value);

        }


        if (z1) {

            data.z1 =
                Number(z1.value);

        }


        if (z2) {

            data.z2 =
                Number(z2.value);

        }


        /* -----------------------------------------
           SEND TO FLASK
        ----------------------------------------- */

        const response =
            await fetch(
                "/calculate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        const result =
            await response.json();


        /* -----------------------------------------
           SERVER ERROR
        ----------------------------------------- */

        if (!response.ok) {

            alert(
                result.error ||
                "Calculation error."
            );

            return;

        }


        console.log(
            "Calculation result:",
            result
        );


        /* -----------------------------------------
           DISPLAY RESULT
        ----------------------------------------- */

        displayResults(result);


        /* -----------------------------------------
           UPDATE PHASE DIAGRAM
        ----------------------------------------- */

        updatePhaseVisualization();


        /* -----------------------------------------
           UPDATE SEQUENCE NETWORK
        ----------------------------------------- */

        updateSequenceNetwork(data);


        /* -----------------------------------------
           OPTIONAL SECTIONS
        ----------------------------------------- */

        updateOptionalSections(
            result,
            voltage,
            baseMva
        );

    }


    catch (error) {

        console.error(
            "ERROR:",
            error
        );


        alert(
            "Calculation failed. Check that Flask is running."
        );

    }

}


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function displayResults(result) {

    const baseCurrent =
        document.getElementById(
            "base-current"
        );

    const faultCurrent =
        document.getElementById(
            "fault-current"
        );

    const faultMva =
        document.getElementById(
            "fault-mva"
        );

    const severity =
        document.getElementById(
            "severity"
        );


    if (baseCurrent) {

        baseCurrent.textContent =
            Number(
                result.base_current
            ).toFixed(3);

    }


    if (faultCurrent) {

        faultCurrent.textContent =
            Number(
                result.fault_current
            ).toFixed(3);

    }


    if (faultMva) {

        faultMva.textContent =
            Number(
                result.fault_mva
            ).toFixed(3);

    }


    if (severity) {

        severity.textContent =
            result.severity;

    }

}


/* =========================================================
   PHASE FAULT VISUALIZATION
========================================================= */

function updatePhaseVisualization() {

    const phaseDiagram =
        document.querySelector(
            ".phase-diagram"
        );


    if (!phaseDiagram) {

        console.warn(
            "Phase diagram not found."
        );

        return;

    }


    const statusText =
        document.getElementById(
            "phase-status-text"
        );


    const statusDot =
        document.getElementById(
            "phase-status-dot"
        );


    const rFault =
        document.getElementById(
            "phase-r-fault"
        );


    const yFault =
        document.getElementById(
            "phase-y-fault"
        );


    const bFault =
        document.getElementById(
            "phase-b-fault"
        );


    if (
        !rFault ||
        !yFault ||
        !bFault
    ) {

        console.warn(
            "Phase fault points not found."
        );

        return;

    }


    const rRow =
        rFault.parentElement;

    const yRow =
        yFault.parentElement;

    const bRow =
        bFault.parentElement;


    /* -----------------------------------------
       RESET PHASES
    ----------------------------------------- */

    phaseDiagram.classList.remove(
        "fault-active"
    );

    phaseDiagram.classList.remove(
        "ground-fault"
    );


    rRow.classList.remove(
        "active",
        "inactive"
    );

    yRow.classList.remove(
        "active",
        "inactive"
    );

    bRow.classList.remove(
        "active",
        "inactive"
    );


    /* -----------------------------------------
       ACTIVATE FAULT
    ----------------------------------------- */

    phaseDiagram.classList.add(
        "fault-active"
    );


    /* -----------------------------------------
       3-PHASE FAULT
    ----------------------------------------- */

    if (
        selectedFault === "three_phase"
    ) {

        rRow.classList.add("active");

        yRow.classList.add("active");

        bRow.classList.add("active");

        if (statusText) {

            statusText.textContent =
                "3-PHASE FAULT";

        }

        if (statusDot) {

            statusDot.style.background =
                "#ef4444";

            statusDot.style.boxShadow =
                "0 0 12px #ef4444";

        }

    }


    /* -----------------------------------------
       LINE-GROUND FAULT
    ----------------------------------------- */

    else if (
        selectedFault === "line_ground"
    ) {

        rRow.classList.add("active");

        yRow.classList.add("inactive");

        bRow.classList.add("inactive");


        phaseDiagram.classList.add(
            "ground-fault"
        );


        if (statusText) {

            statusText.textContent =
                "R-G LINE-GROUND FAULT";

        }


        if (statusDot) {

            statusDot.style.background =
                "#ef4444";

            statusDot.style.boxShadow =
                "0 0 12px #ef4444";

        }

    }


    /* -----------------------------------------
       LINE-LINE FAULT
    ----------------------------------------- */

    else if (
        selectedFault === "line_line"
    ) {

        rRow.classList.add("active");

        yRow.classList.add("active");

        bRow.classList.add("inactive");


        if (statusText) {

            statusText.textContent =
                "R-Y LINE-LINE FAULT";

        }


        if (statusDot) {

            statusDot.style.background =
                "#ef4444";

            statusDot.style.boxShadow =
                "0 0 12px #ef4444";

        }

    }


    /* -----------------------------------------
       DOUBLE LINE-GROUND FAULT
    ----------------------------------------- */

    else if (
        selectedFault === "double_line_ground"
    ) {

        rRow.classList.add("inactive");

        yRow.classList.add("active");

        bRow.classList.add("active");


        phaseDiagram.classList.add(
            "ground-fault"
        );


        if (statusText) {

            statusText.textContent =
                "Y-B-G DOUBLE LINE-GROUND FAULT";

        }


        if (statusDot) {

            statusDot.style.background =
                "#ef4444";

            statusDot.style.boxShadow =
                "0 0 12px #ef4444";

        }

    }


    /* -----------------------------------------
       DESCRIPTION
    ----------------------------------------- */

    const faultName =
        document.getElementById(
            "visual-fault-name"
        );


    const faultDescription =
        document.getElementById(
            "visual-fault-description"
        );


    if (faultName) {

        faultName.textContent =
            getFaultName(
                selectedFault
            );

    }


    if (faultDescription) {

        faultDescription.textContent =
            getFaultDescription(
                selectedFault
            );

    }

}


/* =========================================================
   FAULT DESCRIPTION
========================================================= */

function getFaultDescription(
    faultType
) {

    switch (faultType) {

        case "three_phase":

            return (
                "All three phases R, Y and B " +
                "are involved in the symmetrical fault."
            );


        case "line_ground":

            return (
                "Phase R is connected to ground. " +
                "Zero, positive and negative sequence " +
                "networks participate in the fault."
            );


        case "line_line":

            return (
                "Phases R and Y are short-circuited " +
                "without a direct connection to ground."
            );


        case "double_line_ground":

            return (
                "Phases Y and B are connected together " +
                "and to ground."
            );


        default:

            return (
                "System is operating normally."
            );

    }

}


/* =========================================================
   FAULT NAME
========================================================= */

function getFaultName(
    faultType
) {

    switch (faultType) {

        case "three_phase":
            return "3-PHASE FAULT";

        case "line_ground":
            return "LINE-GROUND FAULT";

        case "line_line":
            return "LINE-LINE FAULT";

        case "double_line_ground":
            return "DOUBLE LINE-GROUND FAULT";

        default:
            return "NO FAULT";

    }

}


/* =========================================================
   SEQUENCE NETWORK
========================================================= */

function updateSequenceNetwork(data) {

    const z0 =
        document.getElementById(
            "sequence-z0"
        );

    const z1 =
        document.getElementById(
            "sequence-z1"
        );

    const z2 =
        document.getElementById(
            "sequence-z2"
        );


    if (z0) {

        z0.textContent =
            data.z0 !== undefined
                ? Number(data.z0).toFixed(3) + " pu"
                : "Not used";

    }


    if (z1) {

        z1.textContent =
            data.z1 !== undefined
                ? Number(data.z1).toFixed(3) + " pu"
                : "Not used";

    }


    if (z2) {

        z2.textContent =
            data.z2 !== undefined
                ? Number(data.z2).toFixed(3) + " pu"
                : "Not used";

    }

}


function updateOptionalSections(
    result,
    voltage,
    baseMva
) {

    /* =========================================
       FAULT CURRENT GAUGE
    ========================================= */

    const current =
        Number(result.fault_current);


    const gaugeCurrent =
        document.getElementById(
            "gauge-current"
        );


    const gaugeNeedle =
        document.getElementById(
            "gauge-needle"
        );


    const gaugeProgress =
        document.getElementById(
            "gauge-progress"
        );


    const gaugeStatus =
        document.getElementById(
            "gauge-status"
        );


    if (gaugeCurrent) {

        gaugeCurrent.textContent =
            current.toFixed(2);

    }


    /*
       Gauge range = 0 to 15 kA
    */

    const percentage =
        Math.min(
            (current / 15) * 100,
            100
        );


    if (gaugeProgress) {

        gaugeProgress.style.width =
            percentage + "%";

    }


    if (gaugeNeedle) {

        /*
           -90° = zero
           +90° = maximum
        */

        const angle =
            -90 +
            (percentage * 1.8);

        gaugeNeedle.style.transform =
            `rotate(${angle}deg)`;

    }


    if (gaugeStatus) {

        gaugeStatus.textContent =
            result.severity;


        if (
            result.severity ===
            "VERY HIGH"
        ) {

            gaugeStatus.style.color =
                "#ef4444";

            if (gaugeProgress) {

                gaugeProgress.style.background =
                    "#ef4444";

            }

        }

        else if (
            result.severity ===
            "HIGH"
        ) {

            gaugeStatus.style.color =
                "#f59e0b";

            if (gaugeProgress) {

                gaugeProgress.style.background =
                    "#f59e0b";

            }

        }

        else if (
            result.severity ===
            "MEDIUM"
        ) {

            gaugeStatus.style.color =
                "#eab308";

            if (gaugeProgress) {

                gaugeProgress.style.background =
                    "#eab308";

            }

        }

        else {

            gaugeStatus.style.color =
                "#22c55e";

            if (gaugeProgress) {

                gaugeProgress.style.background =
                    "#22c55e";

            }

        }

    }


    /* =========================================
       PROTECTION RECOMMENDATION
    ========================================= */

    const protectionIcon =
        document.getElementById(
            "protection-icon"
        );


    const protectionTitle =
        document.getElementById(
            "protection-title"
        );


    const protectionMessage =
        document.getElementById(
            "protection-message"
        );


    if (
        result.severity ===
        "VERY HIGH"
    ) {

        if (protectionIcon) {

            protectionIcon.textContent =
                "⚡";

            protectionIcon.style.background =
                "#7f1d1d";

            protectionIcon.style.color =
                "#ef4444";

        }


        if (protectionTitle) {

            protectionTitle.textContent =
                "CRITICAL FAULT LEVEL";

        }


        if (protectionMessage) {

            protectionMessage.textContent =
                "Very high fault current detected. " +
                "Protection relay operation, circuit-breaker " +
                "interrupting capability and coordination " +
                "must be checked.";

        }

    }


    else if (
        result.severity ===
        "HIGH"
    ) {

        if (protectionIcon) {

            protectionIcon.textContent =
                "⚠";

            protectionIcon.style.background =
                "#78350f";

            protectionIcon.style.color =
                "#f59e0b";

        }


        if (protectionTitle) {

            protectionTitle.textContent =
                "HIGH FAULT CURRENT";

        }


        if (protectionMessage) {

            protectionMessage.textContent =
                "High fault current detected. " +
                "Review relay settings and verify " +
                "circuit-breaker interrupting capability.";

        }

    }


    else if (
        result.severity ===
        "MEDIUM"
    ) {

        if (protectionIcon) {

            protectionIcon.textContent =
                "⚠";

            protectionIcon.style.background =
                "#713f12";

            protectionIcon.style.color =
                "#eab308";

        }


        if (protectionTitle) {

            protectionTitle.textContent =
                "PROTECTION REVIEW";

        }


        if (protectionMessage) {

            protectionMessage.textContent =
                "Moderate fault current detected. " +
                "Review relay protection settings " +
                "and coordination.";

        }

    }


    else {

        if (protectionIcon) {

            protectionIcon.textContent =
                "✓";

            protectionIcon.style.background =
                "#14532d";

            protectionIcon.style.color =
                "#22c55e";

        }


        if (protectionTitle) {

            protectionTitle.textContent =
                "LOW FAULT LEVEL";

        }


        if (protectionMessage) {

            protectionMessage.textContent =
                "Fault current is within the low " +
                "range of this educational analyzer. " +
                "Normal protection coordination checks " +
                "should still be performed.";

        }

    }


    /* =========================================
       RELAY + CIRCUIT BREAKER
    ========================================= */

    const relayIndicator =
        document.getElementById(
            "relay-indicator"
        );


    const relayStatus =
        document.getElementById(
            "relay-status"
        );


    const breakerIndicator =
        document.getElementById(
            "breaker-indicator"
        );


    const breakerStatus =
        document.getElementById(
            "breaker-status"
        );


    const tripStatus =
        document.getElementById(
            "trip-status"
        );


    const tripIndicator =
        document.getElementById(
            "trip-indicator"
        );


    if (
        result.severity === "HIGH" ||
        result.severity === "VERY HIGH"
    ) {

        if (relayIndicator) {

            relayIndicator.style.background =
                "#7f1d1d";

            relayIndicator.style.color =
                "#ef4444";

        }


        if (relayStatus) {

            relayStatus.textContent =
                "TRIP SIGNAL";

            relayStatus.style.color =
                "#ef4444";

        }


        if (breakerIndicator) {

            breakerIndicator.style.background =
                "#7f1d1d";

            breakerIndicator.style.color =
                "#ef4444";

        }


        if (breakerStatus) {

            breakerStatus.textContent =
                "TRIPPED";

            breakerStatus.style.color =
                "#ef4444";

        }


        if (tripIndicator) {

            tripIndicator.style.background =
                "#7f1d1d";

            tripIndicator.style.color =
                "#ef4444";

        }


        if (tripStatus) {

            tripStatus.textContent =
                "TRIP COMMAND";

            tripStatus.style.color =
                "#ef4444";

        }

    }


    else {

        if (relayIndicator) {

            relayIndicator.style.background =
                "#14532d";

            relayIndicator.style.color =
                "#22c55e";

        }


        if (relayStatus) {

            relayStatus.textContent =
                "MONITORING";

            relayStatus.style.color =
                "#22c55e";

        }


        if (breakerIndicator) {

            breakerIndicator.style.background =
                "#14532d";

            breakerIndicator.style.color =
                "#22c55e";

        }


        if (breakerStatus) {

            breakerStatus.textContent =
                "CLOSED";

            breakerStatus.style.color =
                "#22c55e";

        }


        if (tripIndicator) {

            tripIndicator.style.background =
                "#172554";

            tripIndicator.style.color =
                "#38bdf8";

        }


        if (tripStatus) {

            tripStatus.textContent =
                "STANDBY";

            tripStatus.style.color =
                "#38bdf8";

        }

    }


    /* =========================================
       CALCULATION DETAILS
    ========================================= */

    const calcVoltage =
        document.getElementById(
            "calc-voltage"
        );


    const calcBaseMva =
        document.getElementById(
            "calc-base-mva"
        );


    const calcBaseCurrent =
        document.getElementById(
            "calc-base-current"
        );


    const calcFaultCurrent =
        document.getElementById(
            "calc-fault-current"
        );


    const calcFaultMva =
        document.getElementById(
            "calc-fault-mva"
        );


    if (calcVoltage) {

        calcVoltage.textContent =
            voltage.toFixed(2) +
            " kV";

    }


    if (calcBaseMva) {

        calcBaseMva.textContent =
            baseMva.toFixed(2) +
            " MVA";

    }


    if (calcBaseCurrent) {

        calcBaseCurrent.textContent =
            Number(
                result.base_current
            ).toFixed(3) +
            " kA";

    }


    if (calcFaultCurrent) {

        calcFaultCurrent.textContent =
            current.toFixed(3) +
            " kA";

    }


    if (calcFaultMva) {

        calcFaultMva.textContent =
            Number(
                result.fault_mva
            ).toFixed(3) +
            " MVA";

    }

}
/* =========================================================
   RESET RESULTS
========================================================= */

function resetResults() {

    const ids = [

        "base-current",
        "fault-current",
        "fault-mva",
        "severity",
        "gauge-current"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                "--";

        }

    });

}


/* =========================================================
   RESET PHASE DIAGRAM
========================================================= */

function resetPhaseVisualization() {

    const phaseDiagram =
        document.querySelector(
            ".phase-diagram"
        );


    if (!phaseDiagram) {
        return;
    }


    const rows =
        document.querySelectorAll(
            ".phase-row"
        );


    phaseDiagram.classList.remove(
        "fault-active"
    );


    phaseDiagram.classList.remove(
        "ground-fault"
    );


    rows.forEach(row => {

        row.classList.remove(
            "active",
            "inactive"
        );

    });


    const statusText =
        document.getElementById(
            "phase-status-text"
        );


    const statusDot =
        document.getElementById(
            "phase-status-dot"
        );


    if (statusText) {

        statusText.textContent =
            "SYSTEM NORMAL";

        statusText.style.color =
            "#22c55e";

    }


    if (statusDot) {

        statusDot.style.background =
            "#22c55e";

        statusDot.style.boxShadow =
            "0 0 10px #22c55e";

    }


    const faultName =
        document.getElementById(
            "visual-fault-name"
        );


    const faultDescription =
        document.getElementById(
            "visual-fault-description"
        );


    if (faultName) {

        faultName.textContent =
            "No Fault";

    }


    if (faultDescription) {

        faultDescription.textContent =
            "System is operating normally.";

    }


    const z0 =
        document.getElementById(
            "sequence-z0"
        );


    const z1 =
        document.getElementById(
            "sequence-z1"
        );


    const z2 =
        document.getElementById(
            "sequence-z2"
        );


    if (z0) z0.textContent = "--";

    if (z1) z1.textContent = "--";

    if (z2) z2.textContent = "--";

}


/* =========================================================
   INITIALIZE
========================================================= */

updateInputs();

resetResults();

resetPhaseVisualization();