const helper = require('../Helper/helper')
async function pressKey(activePage, text, speed = 0.5) {
    try {
        // const activePage = await helper.findActiveTab(browser);
        const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for await (const char of text) {
            if (helper.randomFloat(0, 1) <= 0.2) {
                const wrongChar = validChars.charAt(Math.floor(Math.random() * validChars.length));
                activePage.keyboard.type(wrongChar);
                await helper.delay(helper.randomFloat(0.1, 0.5));
                activePage.keyboard.press('Backspace');
                await helper.delay(helper.randomFloat(0.1, 0.5));
                activePage.keyboard.type(char);
                await helper.delay(helper.randomFloat(0.1, 0.5));
            }
            else {
                activePage.keyboard.type(char);
                await helper.delay(helper.randomFloat(0.1, 0.5));
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
module.exports = pressKey;
