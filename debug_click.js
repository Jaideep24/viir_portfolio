const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    console.log("Navigating to login page...");
    await page.goto('http://localhost:8000/blogspace/edit/');
    
    // Wait for the form to render
    await page.waitForSelector('input#username');
    
    console.log("Getting input field coordinates...");
    const box = await page.evaluate(() => {
        const el = document.getElementById('username');
        const rect = el.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });
    
    console.log(`Input field center is at: ${box.x}, ${box.y}`);
    
    console.log("Checking elementFromPoint...");
    const topElementInfo = await page.evaluate((x, y) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return 'No element';
        return `${el.tagName} id="${el.id}" class="${el.className}"`;
    }, box.x, box.y);
    
    console.log(`Element at input center: ${topElementInfo}`);
    
    console.log("Clicking the input field using exact coordinates...");
    await page.mouse.click(box.x, box.y);
    
    console.log("Typing 'testadmin'...");
    await page.keyboard.type('testadmin');
    
    const inputValue = await page.evaluate(() => document.getElementById('username').value);
    console.log(`Input value after typing: "${inputValue}"`);
    
    await browser.close();
})();
