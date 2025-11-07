import os
import json

def test_health(client):
    """Test health endpoint returns 200"""
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert data["status"] == "ok"

def test_version(client):
    """Test version endpoint returns app version"""
    r = client.get("/version")
    assert r.status_code == 200
    data = r.json()
    assert "version" in data

def test_upload_and_propose(client, tmp_path):
    """Test file upload and widget proposal flow"""
    # Create a tiny CSV file
    csv_file = tmp_path / "tiny.csv"
    csv_file.write_text("a,b\n1,2\n3,4\n")
    
    # Upload the file
    with open(csv_file, "rb") as f:
        r = client.post(
            "/api/upload",
            files={"file": ("tiny.csv", f, "text/csv")}
        )
    
    assert r.status_code == 200
    upload_data = r.json()
    assert "dataset_id" in upload_data
    assert "profile" in upload_data
    
    # Request widget proposals (mock Groq mode)
    payload = {
        "dataset_id": upload_data["dataset_id"],
        "domain": "sales",
        "intent": "trends",
        "role": "finance",
        "profile": upload_data["profile"]
    }
    
    r2 = client.post(
        "/api/widgets/propose",
        json=payload
    )
    
    assert r2.status_code == 200
    proposal_data = r2.json()
    assert "specs" in proposal_data
    specs = proposal_data["specs"]
    assert len(specs) >= 1, "Should return at least 1 widget spec"
    
    # Verify each spec is valid Vega-Lite JSON
    for spec in specs:
        assert "$schema" in spec or "mark" in spec, "Invalid Vega-Lite spec"
        assert "data" in spec, "Spec must have data field"
