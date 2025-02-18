const puppeteer = require("puppeteer");

(async (hideUI = true) => {
    try {
        const browser = await puppeteer.launch({ headless : hideUI });
        const page = await browser.newPage();

        // Setting uo the events lisenters to catch the request
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            request.continue();
        });

        page.on('response', async (response) => {
            const request = response.request();
            if (request.url().includes('/api/auth')) {
                try {
                    const jsonResponse = await response.text();  // Or response.json() for json responses
                    console.log('Login Response:\n', jsonResponse, "\n");
                } catch (error) {
                    console.error('Error parsing response:', error);
                }
            }
        });


        await page.goto("http://localhost:3000/", {waitUntil: 'networkidle2'});

        // Filling the forms
        await page.type("#email", "dany@gmail.com");
        await page.type("#password", "dany");

        // Performing the log in
        await Promise.all([
            page.click("#log-in"),
            page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);

        console.log("Puppeteer: Logged in successfully");
        await browser.close()
    } catch (ex) {
        console.log("Error Logging in:", ex);
    }
})();