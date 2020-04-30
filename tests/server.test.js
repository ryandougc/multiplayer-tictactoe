const puppeteer = require('puppeteer')

// test('create game', async () => {
//     const browser = await puppeteer.launch({
//         headless: false
//         ,args: ['--window-size=1280,720', '--auto-open-devtools-for-tabs']
//     })


//         const page = await browser.newPage()
//         await page.goto('http://localhost:3000/')

//         await page.click('input#inputGameName')
//         await page.type('input#inputGameName', 'test-game')
//         await page.click('button#submitNewGame')
//         await page.on('dialog', async dialog => {
//             await dialog.accept(`puppet`)
//         })

//         const page2 = await browser.newPage()
//         await page2.goto('http://localhost:3000/')
//         await page2.click('a#joinGameLink')
//         await page2.on('dialog', dialog => {
//             dialog.accept(`puppet2`)
//         })
// }, 25000)

// test('reconnect-user', async () => {
//     const browser = await puppeteer.launch({
//         headless: false
//         ,args: ['--window-size=1280,720', '--auto-open-devtools-for-tabs']
//     })

//         //Init player 1
//         const page = await browser.newPage()
//         await page.goto('http://localhost:3000/')
//         await page.click('input#inputName')
//         await page.type('input#inputName', 'puppet')
//         await page.click('button#nameInputSubmit')
//         await page.click('input#inputGameName')
//         await page.type('input#inputGameName', 'test-game')
//         await page.click('button#submitNewGame')

//         //Init player 2
//         const page2 = await browser.newPage()
//         await page2.goto('http://localhost:3000/')
//         await page2.click('input#inputName')
//         await page2.type('input#inputName', 'puppet2')
//         await page2.click('button#nameInputSubmit')
//         await page2.click('a#joinGameLink')

//         await page.click('#cell0')
//         await page2.click('#cell4')
//         await page.click('#cell1')
//         await page2.click('#cell8')

//         await page.reload()
// }, 25000)

test('reconnect-user', async () => {
    const browser = await puppeteer.launch({
        headless: false
        ,args: ['--window-size=1280,720', '--auto-open-devtools-for-tabs']
    })

        //Init player 1
        const page = await browser.newPage()
        await page.goto('http://localhost:3000/')
        await page.click('input#inputName')
        await page.type('input#inputName', 'puppet')
        await page.click('button#nameInputSubmit')
        await page.click('input#inputGameName')
        await page.type('input#inputGameName', 'test-game')
        await page.click('button#submitNewGame')

        //Init player 2
        const page2 = await browser.newPage()
        await page2.goto('http://localhost:3000/')
        await page2.click('input#inputName')
        await page2.type('input#inputName', 'puppet2')
        await page2.click('button#nameInputSubmit')
        await page2.click('a#joinGameLink')

        await page.click('#cell0')
        await page2.click('#cell4')
        await page.click('#cell1')
        await page2.click('#cell8')
        await page.click('#cell2')

        await page.click('#restartButton')
        await page2.click('#restartButton')

}, 25000)