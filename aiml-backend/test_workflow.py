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
            "latitude": 40.7128,  # Example GPS coordinate
            "longitude": -74.0060
        },
        {
            "lost_item_id": "L-456",
            "description": "Lost blue umbrella at the library cafe.",
            "category": "umbrella",
            "color": "blue",
            "latitude": 34.0522,
            "longitude": -118.2437
        }
    ]
    time.sleep(1)

    # 2. A new Found Item is submitted by a user
    print("🎒 USER B: Submits a Found Item report!")
    print("   -> Found: 'A black metal bottle in the CS Lab hallway.' (Tagging exact location...)")
    found_item_payload = {
        "found_item_id": "F-999",
        "description": "A black metal bottle in the CS Lab hallway.",
        "category": "bottle",
        "color": "black",
        "latitude": 40.7129,  # Very close to L-123
        "longitude": -74.0061
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
                
            # 5. Simulate Claimant Answering the Questions
            print("\n👤 USER A (Claimant): Submits answers to the challenge...")
            claimant_answers = [
                "It has a spiderman sticker on it",
                "The milton logo is almost rubbed off",
                "There is a big scratch/dent on the bottom left corner"
            ]
            print(f"   -> Answers: {claimant_answers}")
            
            # 6. Evaluate Answers
            print("\n⚙️ MERN BACKEND: Sending Answers to AI Evaluator...")
            eval_payload = {
                "category": "bottle",
                "secret_clues": secret_clues,
                "claimant_answers": claimant_answers
            }
            
            try:
                eval_response = requests.post(f"{BASE_URL}/evaluate_answers", json=eval_payload)
                eval_response.raise_for_status()
                eval_data = eval_response.json()
                print(f"\n✅ AI EVALUATOR VERDICT: PASSED = {eval_data.get('passed', False)}")
                print(f"   -> Reason: {eval_data.get('reason', '')}")
            except Exception as e:
                print(f"❌ Error evaluating answers: {e}")
                
        except Exception as e:
            print(f"❌ Error generating questions: {e}")
    else:
        print("\nℹ️ No strong matches found. Saving to Watchlist...")

    # 7. Simulate Missing Item Thread & Analysis
    print("\n" + "="*50)
    print("🕵️‍♂️ Phase 8: CROWDSOURCED THREAD ANALYSIS")
    print("   -> MERN Admin clicks 'Analyze Thread' on a noisy discussion board.")
    
    thread_payload = {
        "item_title": "Lost black Milton bottle near Lab 10",
        "comments": [
            {"user_id": "Anon1", "timestamp": "Tuesday 2:00 PM", "text": "I saw a black bottle sitting on Desk 4 in Lab 10."},
            {"user_id": "Anon2", "timestamp": "Tuesday 3:15 PM", "text": "I was in Lab 10, someone picked it up and said they were taking it to the Library to turn it in."},
            {"user_id": "Anon3", "timestamp": "Tuesday 4:00 PM", "text": "Checked the library, they said the guy never dropped it off. He had a red backpack."},
            {"user_id": "Anon4", "timestamp": "Wednesday 9:00 AM", "text": "Wait, I saw a bottle matching that description near the Cafeteria corridor just now!"}
        ]
    }
    
    try:
        print("\n🧠 AI: Gemini extracting timeline and clues from chaos...")
        thread_response = requests.post(f"{BASE_URL}/analyze_thread", json=thread_payload)
        thread_response.raise_for_status()
        thread_data = thread_response.json()
        
        print("\n✅ AI THREAD INTELLIGENCE REPORT:")
        print(f"   📍 Likely Locations: {', '.join(thread_data.get('likely_locations', []))}")
        print(f"   🔍 Synthesized Clues: {', '.join(thread_data.get('synthesized_clues', []))}")
        print("\n   ⏱️ Timeline of Events:")
        for event in thread_data.get('timeline_events', []):
            print(f"      - {event}")
        print(f"\n   📝 Summary Trail: {thread_data.get('summary_trail', '')}")
        
    except Exception as e:
        print(f"❌ Error analyzing thread: {e}")

    print("\n" + "-" * 50)
    print("🏁 Simulation Complete!")

if __name__ == "__main__":
    run_workflow()
