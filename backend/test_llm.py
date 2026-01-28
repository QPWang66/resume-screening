import asyncio
from app.services.llm.client import llm_client

async def main():
    print(f"Testing Provider: {llm_client.provider}")
    try:
        response = await llm_client.generate_json(
            system="You are a helpful assistant that outputs JSON.",
            user="Return a JSON object with a greeting key saying 'Hello from local LLM' and a timestamp."
        )
        print("Response received:")
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
