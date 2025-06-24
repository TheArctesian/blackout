import os
import re
import io
import json
import tempfile
import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import fitz # PyMuPDF
import pytesseract
from PIL import Image
import numpy as np
from datetime import datetime
import openai
from dotenv import load_dotenv
# Load environment variables from .env file

load_dotenv()
# Configure OpenAI

openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(name)
CORS(app)
# California legal codes and regulations

CALIFORNIA_CODES = {
"CCP_1798.3": "California Civil Code § 1798.3 - Prohibits disclosure of personal information",
"WIC_827": "California Welfare and Institutions Code § 827 - Confidentiality of juvenile records",
"PC_293": "California Penal Code § 293 - Protection of sexual assault victim information",
"PC_841.5": "California Penal Code § 841.5 - Confidentiality of informant information",
"EC_1040": "California Evidence Code § 1040 - Privilege for official information",
"CRC_2.550": "California Rules of Court 2.550 - Sealed records requirements",
"FC_3042": "California Family Code § 3042 - Protection of minor's information in custody proceedings",
"HSC_123100": "California Health and Safety Code § 123100 - Medical information confidentiality",
"CCPA": "California Consumer Privacy Act - Protection of personal information",
"GOV_6254": "California Government Code § 6254 - Exemptions from public records disclosure",
}

class CaliforniaRedactor:
    def init(self):
# Patterns for California-specific redactions with legal citations
    self.patterns = {
"ssn": {
"pattern": r"\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b",
"citation": "CCP_1798.3",
"reason": "Social Security numbers must be redacted per California Civil Code § 1798.3",
},
"driver_license": {
"pattern": r"\b[A-Z]\d{7}\b",
"citation": "GOV_6254",
"reason": "Driver's license numbers are exempt from disclosure under Government Code § 6254(c)",
},
"phone": {
"pattern": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
"citation": "CCPA",
"reason": "Phone numbers may constitute personal information under CCPA",
},
"email": {
"pattern": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Z|a-z]{2,}\b",
"citation": "CCPA",
"reason": "Email addresses are personal information protected under CCPA",
},
"credit_card": {
"pattern": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
"citation": "CCP_1798.3",
"reason": "Financial account numbers must be redacted per Civil Code § 1798.3",
},
"bank_account": {
"pattern": r"\b\d{8,17}\b",
"citation": "CCP_1798.3",
"reason": "Bank account numbers are protected financial information",
},
"date_of_birth": {
"pattern": r"\b(0[1-9]|1[0-2])/-/-\d{2}\b",
"citation": "GOV_6254",
"reason": "Full dates of birth are exempt from disclosure",
},
}
json

def extract_text_with_positions(self, pdf_path):
    """Extract text with position information from PDF"""
    doc = fitz.open(pdf_path)
    full_text = ""
    page_data = []
    text_positions = []

    for page_num, page in enumerate(doc):
        # Get text with position information
        blocks = page.get_text("dict")
        page_text = ""

        for block in blocks["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"]
                        bbox = span["bbox"]
                        page_text += text + " "

                        # Store position information
                        text_positions.append(
                            {
                                "page": page_num,
                                "text": text,
                                "bbox": bbox,
                                "start": len(full_text),
                                "end": len(full_text) + len(text),
                            }
                        )

        full_text += page_text + "\n"
        page_data.append({"page_num": page_num, "text": page_text, "page": page})

    doc.close()
    return full_text, page_data, text_positions

def find_patterns_to_redact(self, text, text_positions):
    """Find all patterns that need redaction with legal citations"""
    redactions = []

    for pattern_name, pattern_info in self.patterns.items():
        pattern = pattern_info["pattern"]
        for match in re.finditer(pattern, text, re.IGNORECASE):
            # Find the position in the PDF
            match_start = match.start()
            match_end = match.end()
            matched_text = match.group()

            # Find corresponding position info
            bbox_list = []
            page_num = None

            for pos in text_positions:
                if pos["start"] <= match_start < pos["end"]:
                    if page_num is None:
                        page_num = pos["page"]
                    if pos["page"] == page_num:
                        bbox_list.append(pos["bbox"])

            redactions.append(
                {
                    "type": pattern_name,
                    "text": matched_text,
                    "start": match_start,
                    "end": match_end,
                    "page": page_num,
                    "bbox": bbox_list,
                    "citation": CALIFORNIA_CODES[pattern_info["citation"]],
                    "reason": pattern_info["reason"],
                    "legal_code": pattern_info["citation"],
                }
            )

    return redactions

def find_sensitive_info_with_llm(self, text):
    """Use LLM to find additional sensitive information with legal reasoning"""
    try:
        prompt = f"""
        You are a legal expert specializing in California privacy and redaction laws. Analyze this legal document excerpt and identify information that must be redacted according to California law.

        For each item that needs redaction, provide:
        1. The exact text to redact
        2. The specific California law code requiring redaction
        3. A brief legal reason

        Focus on these categories:
        - Names of minors (Welfare & Institutions Code § 827)
        - Sexual assault victim names (Penal Code § 293)
        - Confidential informant identities (Penal Code § 841.5)
        - Medical/psychological information (Health & Safety Code § 123100)
        - Witness home addresses in criminal cases (Government Code § 6254)

        Return your response as a JSON array with objects containing:
        {{"text": "exact text to redact", "code": "legal code reference", "reason": "brief explanation"}}

        Document excerpt:
        {text[:10000]}
        """

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=10000,
        )

        # Parse LLM response
        try:
            llm_suggestions = json.loads(response.choices[0].message.content)
        except:
            # Fallback parsing if not valid JSON
            llm_suggestions = []

        additional_redactions = []
        for suggestion in llm_suggestions:
            if "text" in suggestion and suggestion["text"]:
                pattern = re.escape(suggestion["text"])
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    additional_redactions.append(
                        {
                            "type": "llm_identified",
                            "text": match.group(),
                            "start": match.start(),
                            "end": match.end(),
                            "citation": suggestion.get(
                                "code", "California Privacy Laws"
                            ),
                            "reason": suggestion.get(
                                "reason", "Identified as sensitive information"
                            ),
                            "legal_code": suggestion.get("code", "GENERAL"),
                        }
                    )

        return additional_redactions
    except Exception as e:
        print(f"LLM error: {e}")
        return []

def create_redacted_pdf_with_metadata(self, input_path, output_path, redactions):
    """Create a new PDF with redactions and return metadata"""
    doc = fitz.open(input_path)
    redaction_metadata = []

    for page_num, page in enumerate(doc):
        page_redactions = [r for r in redactions if r.get("page") == page_num]

        for redaction in page_redactions:
            search_text = redaction["text"]
            text_instances = page.search_for(search_text)

            for inst in text_instances:
                # Add redaction annotation
                page.add_redact_annot(inst)

                # Store metadata
                redaction_metadata.append(
                    {
                        "id": f"redaction_{page_num}_{len(redaction_metadata)}",
                        "page": page_num,
                        "text": search_text,
                        "bbox": [inst.x0, inst.y0, inst.x1, inst.y1],
                        "type": redaction["type"],
                        "citation": redaction.get("citation", ""),
                        "reason": redaction.get("reason", ""),
                        "legal_code": redaction.get("legal_code", ""),
                        "applied": True,
                    }
                )

        # Apply the redactions
        page.apply_redactions()

    doc.save(output_path)
    doc.close()

    return redaction_metadata

def redact_document(self, pdf_path):
    """Main method to redact a document with full metadata"""
    # Extract text with positions
    full_text, page_data, text_positions = self.extract_text_with_positions(
        pdf_path
    )

    # Find patterns to redact
    pattern_redactions = self.find_patterns_to_redact(full_text, text_positions)

    # Use LLM for additional redactions
    llm_redactions = self.find_sensitive_info_with_llm(full_text)

    # Combine all redactions
    all_redactions = pattern_redactions + llm_redactions

    # Remove duplicates
    unique_redactions = []
    seen = set()
    for r in all_redactions:
        key = (r["start"], r["end"])
        if key not in seen:
            seen.add(key)
            unique_redactions.append(r)

    # Create redacted PDF and get metadata
    output_path = pdf_path.replace(".pdf", "_redacted.pdf")
    metadata = self.create_redacted_pdf_with_metadata(
        pdf_path, output_path, unique_redactions
    )

    return output_path, metadata

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})

@app.route("/redact", methods=["POST"])
def redact_pdf():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
    
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
    
        # Perform redaction
        redactor = CaliforniaRedactor()
        output_path, metadata = redactor.redact_document(temp_path)
    
        # Read the redacted file
        with open(output_path, "rb") as f:
            redacted_data = f.read()
    
        # Convert to base64 for transmission
        pdf_base64 = base64.b64encode(redacted_data).decode("utf-8")
    
        # Clean up temporary files
        os.unlink(temp_path)
        os.unlink(output_path)
    
        # Return both PDF and metadata
        return jsonify(
            {
                "success": True,
                "pdf_base64": pdf_base64,
                "filename": f"redacted_{file.filename}",
                "redactions": metadata,
                "total_redactions": len(metadata),
            }
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/apply_redactions", methods=["POST"])
def apply_redactions():
    """Apply custom redactions to a PDF"""
    try:
        data = request.json
        pdf_base64 = data.get("pdf_base64")
        redactions = data.get("redactions", [])

        # Decode PDF
        pdf_data = base64.b64decode(pdf_base64)

        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_data)
            temp_path = tmp_file.name

        # Apply redactions
        doc = fitz.open(temp_path)

        for redaction in redactions:
            if redaction.get("applied", True):
                page = doc[redaction["page"]]
                bbox = fitz.Rect(redaction["bbox"])
                page.add_redact_annot(bbox)

        # Apply all redactions
        for page in doc:
            page.apply_redactions()

        # Save
        output_path = temp_path.replace(".pdf", "_updated.pdf")
        doc.save(output_path)
        doc.close()

        # Read result
        with open(output_path, "rb") as f:
            result_data = f.read()

        # Clean up
        os.unlink(temp_path)
        os.unlink(output_path)

        # Return updated PDF
        result_base64 = base64.b64encode(result_data).decode("utf-8")

        return jsonify({"success": True, "pdf_base64": result_base64})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "main":
    app.run(debug=True, port=5000)
