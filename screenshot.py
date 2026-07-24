from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    # Create context with video recording enabled
    context = browser.new_context(record_video_dir="videos/")
    page = context.new_page()

    print("Navigating to application...")
    page.goto('http://localhost:5173')

    # Wait for the login screen bypass button
    page.wait_for_selector('button.dev-bypass-btn')

    # Click it to skip authentication
    print("Clicking dev bypass button...")
    page.click('button.dev-bypass-btn')

    # Wait for app to load properly
    page.wait_for_load_state('networkidle')
    page.wait_for_selector('.chart-filters', timeout=10000)

    # Take screenshot of the EnergyLoadChart element
    chart_elem = page.locator('.chart-panel').first
    chart_elem.screenshot(path="energy_load_chart.png")

    print("Successfully took screenshot.")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
