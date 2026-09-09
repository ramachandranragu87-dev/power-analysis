from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

from calculations.faults import (
    calculate_three_phase,
    calculate_line_ground,
    calculate_line_line,
    calculate_double_line_ground,
    get_severity,
    get_formula,
    get_fault_description
)


app = Flask(__name__)


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =========================================================
# CALCULATE FAULT
# =========================================================

@app.route(
    "/calculate",
    methods=["POST"]
)
def calculate():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No calculation data received."
            }), 400


        fault_type = data.get(
            "fault_type"
        )


        voltage = float(
            data.get("voltage")
        )

        base_mva = float(
            data.get("base_mva")
        )


        # -------------------------------------------------
        # GENERAL VALIDATION
        # -------------------------------------------------

        if voltage <= 0:

            return jsonify({
                "error":
                    "System voltage must be greater than zero."
            }), 400


        if base_mva <= 0:

            return jsonify({
                "error":
                    "Base MVA must be greater than zero."
            }), 400


        # -------------------------------------------------
        # 3-PHASE
        # -------------------------------------------------

        if fault_type == "three_phase":

            z1 = float(
                data.get("z1")
            )

            result = calculate_three_phase(
                voltage,
                base_mva,
                z1
            )


        # -------------------------------------------------
        # LINE-GROUND
        # -------------------------------------------------

        elif fault_type == "line_ground":

            z0 = float(
                data.get("z0")
            )

            z1 = float(
                data.get("z1")
            )

            z2 = float(
                data.get("z2")
            )

            result = calculate_line_ground(
                voltage,
                base_mva,
                z0,
                z1,
                z2
            )


        # -------------------------------------------------
        # LINE-LINE
        # -------------------------------------------------

        elif fault_type == "line_line":

            z1 = float(
                data.get("z1")
            )

            z2 = float(
                data.get("z2")
            )

            result = calculate_line_line(
                voltage,
                base_mva,
                z1,
                z2
            )


        # -------------------------------------------------
        # DOUBLE LINE-GROUND
        # -------------------------------------------------

        elif fault_type == "double_line_ground":

            z0 = float(
                data.get("z0")
            )

            z1 = float(
                data.get("z1")
            )

            z2 = float(
                data.get("z2")
            )

            result = calculate_double_line_ground(
                voltage,
                base_mva,
                z0,
                z1,
                z2
            )


        else:

            return jsonify({
                "error":
                    "Invalid fault type."
            }), 400


        # -------------------------------------------------
        # ADDITIONAL INFORMATION
        # -------------------------------------------------

        result["severity"] = get_severity(
            result["fault_current"]
        )

        result["formula"] = get_formula(
            fault_type
        )

        result["description"] = get_fault_description(
            fault_type
        )

        result["fault_type"] = fault_type


        return jsonify(result)


    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400


    except ZeroDivisionError:

        return jsonify({
            "error":
                "Invalid impedance values. Division by zero occurred."
        }), 400


    except Exception as error:

        return jsonify({
            "error":
                f"Calculation error: {str(error)}"
        }), 400


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )