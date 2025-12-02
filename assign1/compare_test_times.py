"""
Compare Selenium vs Playwright test execution times. 
Run from: assign1/
Requires: selenium, playwright, matplotlib
pip install selenium playwright matplotlib && playwright install
"""
import time
import os
import matplotlib.pyplot as plt
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from playwright.sync_api import sync_playwright

# All pages in assign1/
PAGES = [
    'index.html',
    'enquiry.html',
    'register.html',
    'profile.html',
    'product1.html',
    'product2.html',
    'workshop.html',
    'promotion.html',
    'enhancement.html',
    'enhancement2.html'
]
BASE_PATH = os.path.dirname(os.path.abspath(__file__))


def get_file_url(page):
    return f"file://{os.path.join(BASE_PATH, page)}"


def test_page_selenium(url):
    """Load page, wait for content, interact with elements."""
    driver = webdriver.Chrome()
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        # Simulate basic interactions
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='email']")
        for inp in inputs[:3]:
            try:
                inp.send_keys("test")
            except:
                pass
        driver.execute_script("return document.readyState")
    finally:
        driver.quit()


def test_page_playwright(url, browser_type):
    """Load page, wait for content, interact with elements."""
    with sync_playwright() as p:
        browser = getattr(p, browser_type).launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(url)
            page.wait_for_load_state("domcontentloaded")
            # Simulate basic interactions
            inputs = page.locator("input[type='text'], input[type='email']").all()
            for inp in inputs[:3]:
                try:
                    inp.fill("test")
                except:
                    pass
            page.evaluate("document.readyState")
        finally:
            browser.close()


def plot_results(results):
    """Generate bar graph comparing Selenium vs Playwright times."""
    pages = list(results["selenium"].keys())
    selenium_times = [results["selenium"][p] or 0 for p in pages]
    playwright_times = [results["playwright"][p] or 0 for p in pages]

    x = range(len(pages))
    width = 0.35

    fig, ax = plt.subplots(figsize=(14, 7))
    bars1 = ax.bar([i - width/2 for i in x], selenium_times, width, label='Selenium', color='#FF6B6B')
    bars2 = ax.bar([i + width/2 for i in x], playwright_times, width, label='Playwright', color='#4ECDC4')

    ax.set_xlabel('Pages', fontsize=12)
    ax.set_ylabel('Time (seconds)', fontsize=12)
    ax.set_title('Selenium vs Playwright Performance Comparison', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([p.replace('.html', '') for p in pages], rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)

    # Add value labels on bars
    for bar in bars1:
        height = bar.get_height()
        if height > 0:
            ax.annotate(f'{height:.1f}s', xy=(bar.get_x() + bar.get_width()/2, height),
                        xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8)
    for bar in bars2:
        height = bar.get_height()
        if height > 0:
            ax.annotate(f'{height:.1f}s', xy=(bar.get_x() + bar.get_width()/2, height),
                        xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8)

    plt.tight_layout()
    plt.savefig('comparison_results.png', dpi=150)
    print(f"\nGraph saved to: {os.path.join(BASE_PATH, 'comparison_results.png')}")
    plt.show()


def run_comparison():
    results = {"selenium": {}, "playwright": {}}

    print("=" * 60)
    print("Selenium vs Playwright Performance Comparison")
    print(f"Testing {len(PAGES)} pages")
    print("=" * 60)

    for page in PAGES:
        filepath = os.path.join(BASE_PATH, page)
        if not os.path.exists(filepath):
            print(f"\nSkipping {page} - file not found")
            continue

        url = get_file_url(page)
        print(f"\nTesting: {page}")
        print("-" * 40)

        # Selenium test
        start = time.perf_counter()
        try:
            test_page_selenium(url)
            selenium_time = time.perf_counter() - start
            results["selenium"][page] = selenium_time
            print(f"  Selenium:   {selenium_time:.3f}s")
        except Exception as e:
            print(f"  Selenium:   FAILED - {e}")
            results["selenium"][page] = None

        # Playwright test (chromium)
        start = time.perf_counter()
        try:
            test_page_playwright(url, "chromium")
            playwright_time = time.perf_counter() - start
            results["playwright"][page] = playwright_time
            print(f"  Playwright: {playwright_time:.3f}s")
        except Exception as e:
            print(f"  Playwright: FAILED - {e}")
            results["playwright"][page] = None

        # Compare
        if results["selenium"].get(page) and results["playwright"].get(page):
            diff = results["selenium"][page] - results["playwright"][page]
            faster = "Playwright" if diff > 0 else "Selenium"
            print(f"  Winner:     {faster} (by {abs(diff):.3f}s)")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    sel_times = [t for t in results["selenium"].values() if t]
    pw_times = [t for t in results["playwright"].values() if t]
    sel_total = sum(sel_times) if sel_times else 0
    pw_total = sum(pw_times) if pw_times else 0

    print(f"Pages tested:     {len(sel_times)}")
    print(f"Selenium total:   {sel_total:.3f}s")
    print(f"Playwright total: {pw_total:.3f}s")

    if sel_total and pw_total:
        if pw_total < sel_total:
            pct = ((sel_total - pw_total) / sel_total) * 100
            print(f"Playwright is {pct:.1f}% faster overall")
        else:
            pct = ((pw_total - sel_total) / pw_total) * 100
            print(f"Selenium is {pct:.1f}% faster overall")

    # Generate graph
    plot_results(results)


if __name__ == "__main__":
    run_comparison()