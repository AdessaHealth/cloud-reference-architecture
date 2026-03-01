import os
import google.cloud.documentai_v1 as documentai
import vertexai
from vertexai.generative_models import GenerativeModel, Part

# --- Configuration ---
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
LOCATION = "us"
DOCAI_PROCESSOR_ID = os.environ.get("DOCAI_PROCESSOR_ID")

# --- Initialize Clients ---
vertexai.init(project=PROJECT_ID, location=LOCATION)
docai_client = documentai.DocumentProcessorServiceClient(
    client_options={"api_endpoint": f"{LOCATION}-documentai.googleapis.com"}
)
gemini_model = GenerativeModel("gemini-1.0-pro")

def process_denial_document(gcs_bucket: str, gcs_name: str) -> dict:
    """Orchestrates the processing of a denial document from GCS."""
    gcs_uri = f"gs://{gcs_bucket}/{gcs_name}"

    # 1. Extract text using Document AI
    raw_document = documentai.RawDocument(
        content=None,
        gcs_uri=gcs_uri,
        mime_type="application/pdf",
    )
    processor_name = docai_client.processor_path(PROJECT_ID, LOCATION, DOCAI_PROCESSOR_ID)
    request = documentai.ProcessRequest(name=processor_name, raw_document=raw_document)
    result = docai_client.process_document(request=request)
    denial_text = result.document.text

    # 2. Generate summary and recommendation with Gemini
    prompt = f"""
    Analyze the following healthcare claim denial information and provide a concise, actionable summary.
    Denial Information: {denial_text}
    Response format: JSON {{"summary": "...", "recommendedAction": "..."}}
    """
    response = gemini_model.generate_content(prompt)
    return {
        "raw_text": denial_text,
        "ai_analysis": response.text,
    }
