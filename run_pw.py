from playwright.sync_api import sync_playwright
import time
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')

    # Wait for the developer bypass button and click it
    page.wait_for_selector('button.dev-bypass-btn')
    page.click('button.dev-bypass-btn')
    page.wait_for_load_state('networkidle')

    # Wait for sidebar navigation to load
    time.sleep(2)

    # Click on the Device Registry tab via text content instead of exact name, targeting any button matching it
    page.locator('button:has-text("Registry")').click()
    page.wait_for_load_state('networkidle')

    # Wait for the devices table to load
    page.wait_for_selector('.custom-table')

    # Click the Inspect button (the one with the Eye icon) on the first device row
    inspect_buttons = page.locator('button[aria-label="Inspect"], .custom-table button:has(svg)').all()
    if inspect_buttons:
        inspect_buttons[0].click(force=True)
        time.sleep(2)
        page.screenshot(path='screenshot.png')

    browser.close()
