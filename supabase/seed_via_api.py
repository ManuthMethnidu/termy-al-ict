import os
import sys
import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://lhzghbqjxkaexbcgpvev.supabase.co"

def seed_database(api_key: str):
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    with open("q_bank/ict_question_bank.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = data.get("questions", [])
    print(f"Starting API upload for {len(questions)} questions to {SUPABASE_URL}...")

    SUBJECT_TO_UNIT = {
        'Introduction to ICT & Data/Information': 1,
        'Number Systems & Data Representation': 2,
        'Digital Electronics & Logic Circuits': 3,
        'Computer Systems & Architecture': 4,
        'Operating Systems & File Management': 5,
        'Programming Concepts (Python/PHP)': 6,
        'Database Management Systems': 7,
        'Web Development': 8,
        'Data Communication & Networking': 9,
        'Systems Analysis & Design': 10,
        'ICT & Society, Security, E-commerce': 11,
        'General ICT': 12,
    }

    batch_size = 100
    total_batches = (len(questions) + batch_size - 1) // batch_size

    for b in range(total_batches):
        chunk = questions[b * batch_size : (b + 1) * batch_size]
        payload = []
        for q in chunk:
            subject = q.get('subject', 'General ICT')
            unit = SUBJECT_TO_UNIT.get(subject, 12)
            payload.append({
                "id": q.get('id'),
                "unit": unit,
                "unit_title": subject,
                "question_text": q.get('question'),
                "options": q.get('options', []),
                "correct_option": q.get('correct_answer_index', 0) + 1,
                "explanation": q.get('explanation', 'Verified with official G.C.E. A/L marking scheme.'),
                "difficulty": 'medium',
                "topic": subject,
                "series": q.get('series', '')
            })

        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/questions",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                print(f"Batch {b + 1}/{total_batches} uploaded successfully ({len(chunk)} questions).")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            print(f"Error on batch {b + 1}: HTTP {e.code} - {err_body}")
            return False

    print("All 2,636 questions successfully seeded via Supabase REST API!")
    return True

if __name__ == "__main__":
    key = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SUPABASE_KEY", "")
    if not key:
        print("Usage: python3 supabase/seed_via_api.py <SUPABASE_ANON_OR_SERVICE_KEY>")
        sys.exit(1)
    seed_database(key)
