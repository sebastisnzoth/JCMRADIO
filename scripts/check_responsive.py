"""Exercise the production bundle served by Vite preview using headless Chrome."""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
driver = webdriver.Chrome(options=options)
try:
    for width in (320, 390, 768, 1440):
        driver.execute_cdp_cmd("Emulation.setDeviceMetricsOverride", {
            "width": width, "height": 900, "deviceScaleFactor": 1, "mobile": False,
        })
        driver.get("http://localhost:4173/")
        wait = WebDriverWait(driver, 20)
        wait.until(lambda d: d.find_element(By.CSS_SELECTOR, ".jcm-play").is_displayed())
        assert driver.execute_script("return document.documentElement.scrollWidth") <= width
        assert len(driver.find_elements(By.TAG_NAME, "audio")) == 1
        if width < 1024:
            driver.find_element(By.CSS_SELECTOR, ".jcm-menu-toggle").click()
            menu = driver.find_element(By.ID, "jcm-mobile-menu")
            menu.find_element(By.CSS_SELECTOR, 'a[href="#programacion"]').click()
            wait.until(lambda d: d.current_url.endswith("#programacion") and not menu.is_displayed())
        print(f"PASS {width}px: player, document width, HTML5 audio and navigation")
finally:
    driver.quit()
