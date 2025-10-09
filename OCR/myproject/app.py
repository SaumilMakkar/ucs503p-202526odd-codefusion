from __future__ import annotations

import os
from pathlib import Path
import re
from typing import Any, Dict

from flask import Flask, jsonify, render_template, request, send_from_directory
from werkzeug.utils import secure_filename

from ocr_util import ocr_receipt


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


app = Flask(__name__, template_folder=str(BASE_DIR / "templates"), static_folder=str(BASE_DIR / "static"))
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "tif", "tiff", "bmp", "gif"}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get("/")
def index():
    return render_template("upload.html")


@app.post("/upload")
def upload():
    if "file" not in request.files:
        return render_template("upload.html", error="No file part in request")
    file = request.files["file"]
    if file.filename == "":
        return render_template("upload.html", error="No file selected")
    if not _allowed_file(file.filename):
        return render_template("upload.html", error="Unsupported file type")

    filename = secure_filename(file.filename)
    save_path = UPLOAD_DIR / filename
    file.save(str(save_path))

    try:
        result = ocr_receipt(str(save_path))
    except Exception as exc:  # noqa: BLE001
        return render_template("upload.html", error=f"OCR failed: {exc}")

    # Build a simple two-column representation from raw lines
    raw_lines = result.get("raw_lines") or []
    result["lines_2col"] = _format_lines_to_columns(raw_lines)
    result["structured_items"] = _parse_structured_items(raw_lines)
    _fill_summary_from_lines(result)

    return render_template("result.html", result=result, image_path=str(save_path.relative_to(BASE_DIR)))


@app.get("/uploads/<path:filename>")
def uploaded_file(filename: str):
    return send_from_directory(str(UPLOAD_DIR), filename)


@app.post("/api/ocr")
def api_ocr():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    if not _allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    filename = secure_filename(file.filename)
    save_path = UPLOAD_DIR / filename
    file.save(str(save_path))

    try:
        result = ocr_receipt(str(save_path))
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500

    raw_lines = result.get("raw_lines") or []
    result["lines_2col"] = _format_lines_to_columns(raw_lines)
    result["structured_items"] = _parse_structured_items(raw_lines)
    _fill_summary_from_lines(result)

    return jsonify(result)


_AMOUNT_RE = re.compile(r"[-+]?\$?\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d{1,2})?\s*$")
_TOTAL_KEYS = re.compile(r"(amount\s*due|total\s*due|grand\s*total|\btotal\b|balance\s*due|final\s*total|subtotal|sub\s*total|tax|gst|vat)", re.I)


def _normalize_amount(value: str) -> str:
    v = value.strip().replace(" ", "")
    if v.startswith("$"):
        v = v[1:]
    v = v.replace(",", "")
    try:
        return f"{float(v):.2f}"
    except Exception:
        return value.strip()


def _format_lines_to_columns(lines: list[str]) -> dict:
    grouped = {"items": [], "totals": [], "meta": []}
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        is_amount_tail = _AMOUNT_RE.search(line) is not None
        if is_amount_tail:
            left, right = (line.rsplit(" ", 1) + [""])[:2]
            right = _normalize_amount(right)
        else:
            left, right = line, ""

        # classify
        if right and not _TOTAL_KEYS.search(left.lower()) and not _TOTAL_KEYS.search(line.lower()):
            grouped["items"].append({"left": left.rstrip("- "), "right": right})
        elif _TOTAL_KEYS.search(line.lower()):
            grouped["totals"].append({"left": left, "right": right})
        else:
            grouped["meta"].append({"left": left, "right": right})

    return grouped


_QTY_RE = re.compile(r"^\d+(?:\.\d+)?$")
_ONE_LINE_ITEM_RE = re.compile(r"^\s*(\d+(?:\.\d+)?)\s+(.+?)\s+(\$?\d{1,3}(?:[,\s]\d{3})*(?:\.\d{1,2})?)\s*$")


def _parse_structured_items(lines: list[str]) -> list[dict]:
    # Attempt to map sequences like: Qty / Item / Price header then repeating triples
    cleaned = [ln.strip() for ln in lines if ln and ln.strip()]
    # Remove header words scattered by OCR
    headers = {"qty", "quantity", "item", "items", "price", "amount"}
    filtered = [ln for ln in cleaned if ln.lower() not in headers]

    items: list[dict] = []
    i = 0
    while i < len(filtered):
        a = filtered[i]
        b = filtered[i + 1] if i + 1 < len(filtered) else ""
        c = filtered[i + 2] if i + 2 < len(filtered) else ""

        # 1) Single-line: "QTY DESC PRICE"
        m = _ONE_LINE_ITEM_RE.match(a)
        if m:
            qty, desc, price = m.groups()
            items.append({"qty": qty, "description": desc.strip("- "), "price": _normalize_amount(price)})
            i += 1
            continue

        # 2) Three lines: qty -> desc -> price
        if _QTY_RE.match(a) and b and (_AMOUNT_RE.search(c or "") is not None):
            items.append({
                "qty": a,
                "description": b,
                "price": _normalize_amount(c),
            })
            i += 3
            continue

        # 3) Two lines: desc -> price
        if b and (_AMOUNT_RE.search(b) is not None) and not _QTY_RE.match(a):
            items.append({
                "qty": "",
                "description": a,
                "price": _normalize_amount(b),
            })
            i += 2
            continue

        # 4) Two lines: qty -> desc (no price yet), look ahead one more for price
        if _QTY_RE.match(a) and b and not _QTY_RE.match(b):
            # look ahead
            c2 = filtered[i + 2] if i + 2 < len(filtered) else ""
            if _AMOUNT_RE.search(c2 or "") is not None:
                items.append({"qty": a, "description": b, "price": _normalize_amount(c2)})
                i += 3
                continue

        # Otherwise advance safely
        i += 1

    return items


_RELAXED_DATE_RE = re.compile(r"\b\d{1,2}[^0-9A-Za-z]\d{1,2}[^0-9A-Za-z]\d{2,4}\b")


def _fill_summary_from_lines(result: dict) -> None:
    # Totals fallback from organized lines
    lines2 = result.get("lines_2col") or {}
    totals = (lines2.get("totals") or []) if isinstance(lines2, dict) else []
    def find_total(label: str) -> str | None:
        for row in totals:
            if label in row.get("left", "").lower():
                return row.get("right")
        return None

    if not (result.get("totals", {}).get("subtotal")):
        v = find_total("subtotal") or find_total("sub total")
        if v:
            result["totals"]["subtotal"] = v

    if not (result.get("totals", {}).get("tax")):
        v = find_total("tax") or find_total("vat") or find_total("gst")
        if v:
            result["totals"]["tax"] = v

    if not (result.get("totals", {}).get("total")):
        v = find_total("grand total") or find_total("amount due") or find_total("total")
        if v:
            result["totals"]["total"] = v

    # Merchant fallback: first meta line or first non-empty top line
    if not result.get("merchant"):
        meta = (lines2.get("meta") or []) if isinstance(lines2, dict) else []
        if meta:
            result["merchant"] = meta[0].get("left") or meta[0].get("right")
        elif result.get("raw_lines"):
            result["merchant"] = next((ln for ln in result["raw_lines"] if ln.strip()), None)

    # Date fallback: relaxed pattern over raw_lines
    if not result.get("date") and result.get("raw_lines"):
        for ln in result["raw_lines"]:
            m = _RELAXED_DATE_RE.search(ln)
            if m:
                result["date"] = m.group(0)
                break


if __name__ == "__main__":
    # Run: python app.py
    app.run(host="0.0.0.0", port=5000, debug=True)


