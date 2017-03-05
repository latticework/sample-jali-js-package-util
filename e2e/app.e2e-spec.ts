import { SampleJaliJsPackageUtilPage } from './app.po';

describe('sample-jali-js-package-util2 App', () => {
  let page: SampleJaliJsPackageUtilPage;

  beforeEach(() => {
    page = new SampleJaliJsPackageUtilPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
