const puppeteer = require('puppeteer');

const config = require('../config');

const { urls: URLS, elements: ELES } = config.sites.flyertea;

const loginProcess = async (page) => {
  await page.goto(URLS.home, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: './dev-images/flyertea-home.png' });
  await page.waitForSelector(ELES.gotoLogin);
  await page.click(ELES.gotoLogin);

  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await page.waitForSelector(ELES.usernameInput);
  await page.screenshot({ path: './dev-images/flyertea-login-before.png' });

  const { username, password } = config.profile;
  await page.type(ELES.usernameInput, username);
  await page.type(ELES.passwordInput, password);
  await page.screenshot({ path: './dev-images/flyertea-login-type.png' });
  await page.click(ELES.loginButton);
};

const imageSuffix = ['.png', '.jpg'];
const abortImages = async (page) => {
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    const isImage = !!imageSuffix.find(suffix =>
      interceptedRequest.url().endsWith(suffix));
    if (isImage) {
      interceptedRequest.abort();
    } else {
      interceptedRequest.continue();
    }
  });
};

const run = async () => {
  const browser = await puppeteer.launch(config.puppeteer);
  const page = await browser.newPage();
  await page.setViewport(config.puppeteer.viewport);
  await abortImages(page);

  // login with retry
  await loginProcess(page);

  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await page.waitForSelector(ELES.checkinBtn);
  await page.screenshot({ path: './dev-images/flyertea-login-after.png' });

  // await page.waitFor(10000);
  await page.click(ELES.checkinBtn);
  await page.screenshot({
    path: './dev-images/flyertea-click-signin.png',
  });
  // // wait more 10s for api calling
  // await page.waitFor(10000);

  const checkinBtnMessage = await page.$eval(
    ELES.checkinBtn,
    // @ts-ignore
    div => div.innerText,
  );
  console.log('flyertea.checkinBtn.message', { message: checkinBtnMessage });

  await browser.close();
};

module.exports = {
  run,
};
