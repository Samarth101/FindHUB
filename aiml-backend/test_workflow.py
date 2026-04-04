import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def run_workflow():
    print("🚀 Starting End-to-End FindHUB AI Workflow Simulation...\n")
    print("-" * 50)

    # 1. Simulate active Lost Items in the Database
    print("📝 MERN DB: Retrieving active Lost Items...")
    lost_items_mock_db = [
        {
            "lost_item_id": "L-123",
            "description": "I lost my metal water bottle near the CS Lab yesterday. It's black and has a dent on the bottom.",
            "category": "water bottle",
            "color": "black",
        },
        {
            "lost_item_id": "L-456",
            "description": "Lost blue umbrella at the library cafe.",
            "category": "umbrella",
            "color": "blue",
        }
    ]
    time.sleep(1)

    # 2. A new Found Item is submitted by a user
    print("🎒 USER B: Submits a Found Item report!")
    print("   -> Found: 'A black metal bottle in the CS Lab hallway.'")
    found_item_payload = {
        "found_item_id": "F-999",
        "description": "A black metal bottle in the CS Lab hallway.",
        "category": "bottle",
        "color": "black",
    }
    time.sleep(1)

    # 3. MERN backend calls Python AI for Matching
    print(f"\n⚙️ MERN BACKEND: Sending Found Item F-999 to AI Matching Engine...")
    match_request = {
        "found_item": found_item_payload,
        "lost_items": lost_items_mock_db
    }
    
    try:
        response = requests.post(f"{BASE_URL}/match_items", json=match_request)
        response.raise_for_status()
        match_data = response.json()
        print("\n✅ AI RESPONSE: Match Scores Calculated:")
        for res in match_data.get("matches", []):
            score = round(res['match_score'] * 100, 2)
            print(f"   -> Against [{res['lost_item_id']}]: {score}% Confidence")
        
        top_match = match_data['matches'][0]
        top_score = top_match['match_score']

    except Exception as e:
        print(f"❌ Error talking to AI Service: {e}")
        return

    # 4. If Match is High, Trigger Verification
    if top_score > 0.80:
        print(f"\n🔔 MERN BACKEND: Very High confidence match detected for Lost Item {top_match['lost_item_id']}!")
        print("   -> Triggering Anti-Theft Verification Generation...")
        time.sleep(1)

        # Secret clues entered by the finder at the time of submission
        secret_clues = ["Superman sticker on the cap", "Milton brand name faded", "dent on bottom left"]
        print(f"   -> Finder's hidden clues: {secret_clues}")

        question_payload = {
            "category": "bottle",
            "clues": secret_clues
        }

        try:
            print("\n🧠 AI: Gemini LLM generating natural questions...")
            q_response = requests.post(f"{BASE_URL}/generate_questions", json=question_payload)
            q_response.raise_for_status()
            questions = q_response.json().get("questions", [])
            
            print("\n✅ AI RESPONSE: Final Challenge Questions rendered to React UI:")
            for i, q in enumerate(questions, 1):
                print(f"   [Question {i}]: {q}")
                
        except Exception as e:
            print(f"❌ Error generating questions: {e}")
    else:
        print("\nℹ️ No strong matches found. Saving to Watchlist...")

    print("\n" + "-" * 50)
    print("🏁 Simulation Complete!")

if __name__ == "__main__":
    run_workflow()
