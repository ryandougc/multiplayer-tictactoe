const puppeteer = require('puppeteer')

test('connect-user', async () => {
    const browser = await puppeteer.launch({
        headless: false
        ,args: ['--window-size=1280,720', '--auto-open-devtools-for-tabs']
    })
        const page = await browser.newPage()
        await page.goto('http://localhost:3000/')

        //Init player 1
        await page.click('input#inputGameName')
        await page.type('input#inputGameName', 'test-game')
        await page.click('button#submitNewGame')
        
        await page.on('dialog', async dialog => {
            await dialog.accept(`puppet`)
        })
})