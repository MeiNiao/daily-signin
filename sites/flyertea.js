const puppeteer = require('puppeteer');

const config = require('../config');

const { urls: URLS, elements: ELES } = config.sites.flyertea;

const gotoHome = async (page) => {
  await page.goto(URLS.home, { waitUntil: 'domcontentloaded' });
};

const loginProcess = async (page) => {
  await gotoHome(page);
  await page.screenshot({ path: './dev-images/flyertea-home.png' });
  await page.waitForSelector(ELES.gotoLogin);
  console.log('flyertea,click,gotoLogin,before');
  await page.click(ELES.gotoLogin);

  await page.waitForSelector(ELES.usernameInput);
  await page.screenshot({ path: './dev-images/flyertea-login-before.png' });

  const { username, password } = config.profile;
  await page.type(ELES.usernameInput, username);
  await page.type(ELES.passwordInput, password);
  await page.screenshot({ path: './dev-images/flyertea-login-type.png' });
  console.log('flyertea,click,loginButton,before');
  await page.click(ELES.loginButton);
  await page.waitFor(10000);
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

const logCheckinBtn = async (page, msg) => {
  const checkinBtnMessage = await page.$eval(
    ELES.checkinBtn,
    // @ts-ignore
    div => div.innerText,
  );
  console.log(`flyertea.checkinBtn.${msg}`, { message: checkinBtnMessage });
};

const run = async () => {
  const browser = await puppeteer.launch(config.puppeteer);
  const page = await browser.newPage();
  await page.setViewport(config.puppeteer.viewport);
  await abortImages(page);

  console.log('flyertea,login,before');
  await loginProcess(page);
  console.log('flyertea,login,after');

  await gotoHome(page);
  await page.waitForSelector(ELES.checkinBtn);
  await logCheckinBtn(page, 'before');
  await page.screenshot({ path: './dev-images/flyertea-login-after.png' });

  console.log('flyertea,click,checkinBtn,before');
  await page.click(ELES.checkinBtn);
  console.log('flyertea,click,checkinBtn,after');
  await page.waitFor(5000);

  await page.screenshot({ path: './dev-images/flyertea-click-checkin.png' });
  await logCheckinBtn(page, 'after');
  await browser.close();
};

module.exports = {
  run,
};
