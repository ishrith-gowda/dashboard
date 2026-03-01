"""
Manual login helper for Browser Use Cloud profile.

Usage: uv run python scripts/manual_login.py

This opens a Browser Use cloud session for the same profile used by the PA agent.
Log in and complete 2FA in the live view URL, then press Enter here to stop
the session and persist cookies to that profile.
"""

import asyncio
import os

from browser_use_sdk import AsyncBrowserUse
from dotenv import load_dotenv

load_dotenv()

CLOUD_PROFILE_ID = os.getenv(
    "BROWSER_USE_PROFILE_ID", "bcf273d4-abc4-40c4-b506-8ad330d4c678"
)
CLOUD_BASE_URL = os.getenv("BROWSER_USE_BASE_URL", "https://api.browser-use.com/api/v3")


async def main():
    api_key = os.getenv("BROWSER_USE_API_KEY")
    if not api_key:
        raise RuntimeError("BROWSER_USE_API_KEY is required")

    client = AsyncBrowserUse(api_key=api_key, base_url=CLOUD_BASE_URL)
    session = await client.sessions.create_session(
        profile_id=CLOUD_PROFILE_ID,
        start_url="https://www.covermymeds.health",
        persist_memory=True,
        keep_alive=True,
    )

    print("🔓 Cloud profile login session started")
    print(f"   Profile ID: {CLOUD_PROFILE_ID}")
    print(f"   Session ID: {session.id}")
    if hasattr(session, "live_url"):
        print(f"   Live URL:   {session.live_url}")
    print()
    print("1) Open the live URL")
    print("2) Log in to CoverMyMeds + complete MFA")
    print("3) Press Enter here to save and close the cloud session")
    await asyncio.to_thread(input)

    await client.sessions.update_session(session.id, action="stop")
    print("✅ Cloud profile session stopped and state persisted.")
    print("   Future PA runs will reuse this profile.")


if __name__ == "__main__":
    asyncio.run(main())
