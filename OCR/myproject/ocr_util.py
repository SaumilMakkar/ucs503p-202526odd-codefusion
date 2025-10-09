from __future__ import annotations

import re
import time
from typing import Dict, List
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
import cv2
import numpy as np
import pytesseract


_CURRENCY = r"[-+]?\$?\s*\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?"
_NUM_RE = re.compile(_CURRENCY)
_DATE_RES = [
    re.compile(r"\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b"),
    re.compile(r"\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2})\b"),
    re.compile(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.\?\s+\d{1,2},\s*\d{2,4}\b", re.I),
]
_TOTAL_KEYS = [r"amount\s*due", r"total\s*due", r"\bgrand\s*total\b", r"\btotal\b", r"balance\s*due", r"final\s*total"]
_SUBTOTAL_KEYS = [r"sub\s*total", r"subtotal"]
_TAX_KEYS = [r"sales?\s*tax", r"\btax\b", r"gst", r"vat"]

_TESS_CONFIGS = [
    "--oem 3 --psm 6 -l eng",
    "--oem 3 --psm 4 -l eng",
    "--oem 3 --psm 11 -l eng",
]


def _read_bgr(path: str):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {path}")
    return img


def _preprocess_variants(img_bgr):
    up = cv2.resize(img_bgr, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(up, cv2.COLOR_BGR2GRAY)

    variants = []
    variants.append(("gray", gray))
    variants.append(("bilateral", cv2.bilateralFilter(gray, 7, 50, 50)))
    variants.append(("clahe", cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(gray)))

    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    _, otsu_inv = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    variants.append(("otsu", otsu))
    variants.append(("otsu_inv", otsu_inv))
    variants.append(("adaptive", cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 7)))

    kernel = np.ones((2, 2), np.uint8)
    variants.append(("morph_open", cv2.morphologyEx(otsu, cv2.MORPH_OPEN, kernel, iterations=1)))

    return variants


def _ocr_get_lines(img):
    best_txt = ""
    best_score = -1
    best_lines = []
    for cfg in _TESS_CONFIGS:
        txt = pytesseract.image_to_string(img, config=cfg)
        lines = [ln.strip() for ln in txt.splitlines() if ln.strip()]
        score = len(lines)
        if score > best_score:
            best_score = score
            best_txt = txt
            best_lines = lines
    return best_txt, best_lines


def _find_amount_on_line(line: str):
    nums = _NUM_RE.findall(line)
    return nums[-1].replace(" ", "") if nums else None


def _find_by_keywords(lines, patterns):
    for i, ln in enumerate(lines):
        low = ln.lower()
        for pat in patterns:
            if re.search(pat, low):
                amt = _find_amount_on_line(ln)
                if amt:
                    return {"label": pat, "value": amt, "index": i, "line": ln}
    return None


def _extract_date(lines):
    for ln in lines[:20]:
        for rex in _DATE_RES:
            m = rex.search(ln)
            if m:
                return m.group(0)
    for ln in lines:
        for rex in _DATE_RES:
            m = rex.search(ln)
            if m:
                return m.group(0)
    return None


def _extract_merchant(lines):
    top = lines[:8]
    for ln in top:
        if len(ln) < 3:
            continue
        if re.search(r"\b(receipt|invoice|order|transaction|store|market)\b", ln, re.I):
            continue
        if re.search(r"https?://|www\.", ln, re.I):
            continue
        if re.search(r"\d{3}[-\s]?\d{3}[-\s]?\d{4}", ln):
            continue
        if re.search(r"\d", ln) and len(ln.split()) > 6:
            continue
        words = ln.split()
        if 1 <= len(words) <= 5:
            return ln
    return top[0] if top else None


def _is_likely_item_line(ln: str):
    if not _NUM_RE.search(ln):
        return False
    tail_num = _find_amount_on_line(ln)
    if not tail_num:
        return False
    low = ln.lower()
    if any(k in low for k in ["subtotal", "sub total", "tax", "total", "amount due", "balance", "change", "tender", "cash", "credit"]):
        return False
    before = ln.rsplit(tail_num, 1)[0]
    return bool(re.search(r"[A-Za-z]", before))


def _extract_items(lines, stop_index_candidates):
    stop_idx = min(stop_index_candidates) if stop_index_candidates else len(lines)
    search_lines = lines[3:stop_idx]

    items = []
    for ln in search_lines:
        if _is_likely_item_line(ln):
            amt = _find_amount_on_line(ln)
            desc = ln.rsplit(amt, 1)[0].strip() if amt else ln
            desc = re.sub(r"^\s*\d+\s*[xX]\s*", "", desc).strip()
            items.append({"description": desc, "amount": amt})
    return items


def ocr_receipt(path: str):
    img_bgr = _read_bgr(path)
    variants = _preprocess_variants(img_bgr)

    best = {"score": -1, "lines": [], "name": "", "text": ""}

    for name, proc in variants:
        txt, lines = _ocr_get_lines(proc)
        sig = 0
        if _find_by_keywords(lines, _TOTAL_KEYS):
            sig += 2
        if _find_by_keywords(lines, _TAX_KEYS):
            sig += 1
        if _find_by_keywords(lines, _SUBTOTAL_KEYS):
            sig += 1
        sig += min(10, len([ln for ln in lines if _is_likely_item_line(ln)]))

        if sig > best["score"]:
            best = {"score": sig, "lines": lines, "name": name, "text": txt}

    lines = best["lines"]

    merchant = _extract_merchant(lines)
    date_str = _extract_date(lines)

    subtotal = _find_by_keywords(lines, _SUBTOTAL_KEYS)
    tax = _find_by_keywords(lines, _TAX_KEYS)
    total = _find_by_keywords(lines, _TOTAL_KEYS)

    stop_idxs = [x["index"] for x in [subtotal, tax, total] if x]
    items = _extract_items(lines, stop_idxs)

    out = {
        "meta": {
            "preprocess_variant": best["name"],
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        },
        "merchant": merchant,
        "date": date_str,
        "totals": {
            "subtotal": subtotal["value"] if subtotal else None,
            "tax": tax["value"] if tax else None,
            "total": total["value"] if total else None,
        },
        "items": items,
        "raw_text": best["text"],
        "raw_lines": lines,
    }
    return out


