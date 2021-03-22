const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;
chai.use(chaiHttp);
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { Builder, By, Key, until, WebDriver } = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome');
var driver;

let container, prev, next, indicators, slide;

const options = new chrome.Options();
options.addArguments(
    'headless'
);

describe('Image carousel test', function() {
    this.timeout(100000);

    before(function(done) {
        driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        driver.get('http://localhost:8000')
            .then(() => {
                done();
            });
    });

    after(function() {
        driver.quit();
    })

    beforeEach(async function() {
        driver.navigate().refresh();
        container = await driver.findElement(By.className("cariusel-img"));
        prev = await driver.findElement(By.className("previous"));
        next = await driver.findElement(By.className("next"));
        slide = await driver.findElement(By.id("slide"));
        indicators = await driver.findElement(By.className("indicator-list"));

    })


    it('should test load the page', async function() {
        let page = await driver.getPageSource();
        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('initial-view.png', image, 'base64', function(err) {});
            }
        );
    });

    it('carousel should show the 1st image from the list by default', async function() {
        driver.sleep(2000);
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-1.jpg');
    });

    it('Clicking on previous button should show the previous image', async function() {
        await next.click();
        await prev.click();
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-1.jpg');
    });

    it('Clicking on next button should show the next image', async function() {
        await next.click();
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-2.jpg');
        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('next-click-view.png', image, 'base64', function(err) {});
            }
        );
    });

    it('Clicking on next button in the last item should show the first image', async function() {
        await next.click();
        await next.click();
        await next.click();
        await next.click();
        await next.click();
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-1.jpg');
    });

    it('Clicking on previous button in the first item should show the last image', async function() {
        await prev.click();
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-5.jpg');
    });

    it('Clicking on any indicator icon should show the appropriate image', async function() {
        driver.sleep(2000);
        let indicator2 = await indicators.findElement(By.className("two"));
        indicator2.click();
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-2.jpg');
        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('second-indicator-click.png', image, 'base64', function(err) {});
            }
        );
    });

    it('when slide enabled should change the image for every 3 seconds', async function() {
        slide.click();
        driver.sleep(6000);
        await driver.manage().timeouts().implicitlyWait(5000);
        let image = await container.getAttribute('src');
        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('slide-enable-view.png', image, 'base64', function(err) {});
            }
        );
        expect(image).to.contains('img-3.jpg');
    });

    it('when slide enabled also user interaction like previous, next or indecator should work as expected', async function() {
        slide.click();
        driver.sleep(6000);
        await prev.click();
        await prev.click();
        await driver.manage().timeouts().implicitlyWait(5000);
        let image = await container.getAttribute('src');
        expect(image).to.contains('img-1.jpg');
    });

    it('uncheck slide should stop changing the image for every 3 seconds', async function() {
        slide.click();
        driver.sleep(6000);
        await driver.manage().timeouts().implicitlyWait(5000);
        let image = await container.getAttribute('src');
        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('slide-enable-view.png', image, 'base64', function(err) {});
            }
        );
        expect(image).to.contains('img-3.jpg');

        slide.click();
        driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile('slide-uncheck-view.png', image, 'base64', function(err) {});
            }
        );
        driver.sleep(6000);
        await driver.manage().timeouts().implicitlyWait(5000);
        let image1 = await container.getAttribute('src');
        expect(image1).to.contains('img-3.jpg');
    });

});