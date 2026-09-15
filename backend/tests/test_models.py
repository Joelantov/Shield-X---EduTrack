import os
from backend.config import Config
from google import genai

def test():
    key = Config.GEMINI_API_KEY
    print("Testing key:", key[:10] + "...")
    client = genai.Client(api_key=key)
    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]:
        try:
            res = client.models.generate_content(
                model=model_name,
                contents="Hello, reply with 1 word."
            )
            print(f"SUCCESS with {model_name}:", res.text)
            return model_name
        except Exception as e:
            print(f"Failed with {model_name}:", e)

if __name__ == "__main__":
    test()
