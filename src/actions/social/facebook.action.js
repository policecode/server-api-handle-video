const BrowserDriver = require('../../drivers/BrowserDriver');
const Random = require('../../helpers/random.helper');
const SleepHelper = require('../../helpers/sleep.helper');
class FacebookActions {
    static async isLogin(page) {
        const formLogin = await page.$('#globalContainer') !== null;
        if (!formLogin) {
            let isLogin = await page.$('diva[aria-label="Tùy chọn khác"]') == null;
            if (isLogin) {
                return 'login';
            } else {
                return 'disable';
            }
        } else {
            return 'logout';
        }
    }

    static async loginFacebook(page, user, pass) {
        try {
            const formLogin = await page.$('#globalContainer') !== null;
            if (formLogin) {
                await page.type('#email', user)
                await page.type('#pass', pass)
                await page.click('button[name="login"]')
                // Chờ khi login thành công
                await page.waitForSelector('.x9f619.x1n2onr6.x1ja2u2z', { visible: true });
                console.log('Login facebook thành công'  + user);
                return true;
            } else {
                console.log('Đã login: ' + user);
                return false;
            }

        } catch (error) {
            console.log('Lỗi Login tài khoản: ' + user);
            return false;
        }
    }
    /**
     * Chuyển đổi sang sử dụng ngôn ngữ tiếng việt trong facebook
     */
    static async setVietNamese(page) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            await driver.gotoUrl(page, Urls.FACEBOONK_HELP);
            const btnLanguage = await page.waitForSelector('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.x1qughib.x6s0dn4.xozqiw3.x1q0g3np.xn6708d.x1ye3gou.xexx8yu.x1n0m28w.xp7jhwk.x137v6ai .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.x1sxyh0.xurb0ha div[role="button"]', { visible: true });
            await SleepHelper.sleep(1000);
            await btnLanguage.click()
            await SleepHelper.sleep(5000);
            await page.waitForSelector('input.x1i10hfl.xggy1nq.x1s07b3s.x1kdt53j.x1a2a7pz.xjbqb8w.x76ihet.xwmqs3e.x112ta8.xxxdfa6.x9f619.xzsf02u.x1uxerd5.x1fcty0u.x132q4wb.x1a8lsjc.x1pi30zi.x1swvt13.x9desvi.xh8yej3.x15h3p50.x10emqs4.xo6swyp.x1ad04t7.x1glnyev.x1ix68h3.x19gujb8');
            await page.type('input.x1i10hfl.xggy1nq.x1s07b3s.x1kdt53j.x1a2a7pz.xjbqb8w.x76ihet.xwmqs3e.x112ta8.xxxdfa6.x9f619.xzsf02u.x1uxerd5.x1fcty0u.x132q4wb.x1a8lsjc.x1pi30zi.x1swvt13.x9desvi.xh8yej3.x15h3p50.x10emqs4.xo6swyp.x1ad04t7.x1glnyev.x1ix68h3.x19gujb8', 'viet', { delay: 200 });
            await SleepHelper.sleep(2000);
            const liVnLanguage = await page.waitForSelector('ul li#vi_VN');
            await liVnLanguage.click();
            await SleepHelper.sleep(2000);
            await page.click('div[aria-label="Save Changes"]');
            await SleepHelper.sleep(10000);
        } catch (error) {
            console.log('setVietNamese(): ' + error);
            return false;
        }

    }
    /**
     * Lấy mã code khi đăng ký thành công tài khoản bằng gmail
     */
    static async getCodeConfirmFacebook(browser) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            const pageGmail = await browser.newPage();
            await driver.gotoUrl(pageGmail, Urls.GMAIL_LOGIN);
            await pageGmail.waitForSelector('.UI table.F.cf.zt');
            const listLetter = await pageGmail.$$('.UI table.F.cf.zt tbody tr');
            for (const letter of listLetter) {
                await letter.hover();
                const codeConfirm = await pageGmail.evaluate(el => {
                    const titleLetter = el.querySelector('td.yX.xY span[name="Facebook"]');
                    if (titleLetter) {
                        const contentLetter = el.querySelector('td.xY.a4W span').innerText;
                        const myRe = /\D*([0-9]*?)\sis\syour\sFacebook\sconfirmation\scode/gmi;
                        result = myRe.exec(contentLetter);
                        if (result) {
                            return result[1];
                        }
                    }
                    return false;
                }, letter);
                if (codeConfirm) {
                    await pageGmail.close();
                    return codeConfirm;
                }
                await pageGmail.waitForTimeout(1000);
            }
            await pageGmail.close();
            return false;
        } catch (error) {
            console.log('getCodeConfirmFacebook(): ' + error);
            return false;
        }
    }

    /**
     * Chuyển đến trang profile cá nhân (click chuột)
     */
    static async gotoPageProfile(page) {
        try {
            // visit page Profile
            await SleepHelper.sleep(1000);
            const isPageProfile = await page.$('.x1jx94hy.x14yjl9h.xudhj91.x18nykt9.xww2gxu.x1ey2m1c.x9f619.xds687c.x10l6tqk.x17qophe.x13vifvy') == null;
            if (isPageProfile) {
                const btnProfile = await page.waitForSelector('.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.xzsf02u.x1rg5ohu');
                await btnProfile.click();
                await SleepHelper.sleep(2000);
                await page.waitForSelector('.xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc');
                await page.click('.xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc .x9f619.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.x1qughib.x6s0dn4.xozqiw3.x1q0g3np.x1sxyh0.xurb0ha.xwib8y2.x1y1aw1k.xcud41i.x139jcc6.x4vbgl9.x1rdy4ex');
            }
        } catch (error) {
            console.log('gotoPageProfile(): ' + error);
            return false;
        }
    }

    /**
     * Get FullName Facebook
     */
    static async getFullName(page) {
        try {
            const btnProfile = await page.waitForSelector('.x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.xzsf02u.x1rg5ohu');
                await btnProfile.click();
                const btnFullName = await page.waitForSelector('span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x676frb.x1lkfr7t.x1lbecb7.x1s688f.xzsf02u.x1yc453h', { visible: true });
                await SleepHelper.sleep(2000);
                const fullName = await page.evaluate(el => {
                    return el.innerText;
                }, btnFullName);
                return fullName;
        } catch (error) {
            console.log('getFullName(): ' + error);
            return false;
        }
    }

    /**
     * Tính năng đang được xây dựng: Thay đổi avatar
     */
    static async changeAvatar(page) {
        
        // icon máy ảnh (thay đổi ảnh đại diện) ở trang cá nhân
        await SleepHelper.sleep(2000);
        const iconCamera = await page.waitForSelector('.x1jx94hy.x14yjl9h.xudhj91.x18nykt9.xww2gxu.x1ey2m1c.x9f619.xds687c.x10l6tqk.x17qophe.x13vifvy');
        await iconCamera.click();
        // Vào giao diện chọn ảnh
        await page.waitForSelector('.x1n2onr6.x1ja2u2z.x1afcbsf.x78zum5.xdt5ytf.x1a2a7pz.x6ikm8r.x10wlt62.x71s49j.x1jx94hy.x1qpq9i9.xdney7k.xu5ydu1.xt3gfkd.x104qc98.x1g2kw80.x16n5opg.xl7ujzl.xhkep3z.xrgej4m.xh8yej3');
        await SleepHelper.sleep(2000);
        // click vào btn upload photo
        const btnUpload = await page.$('.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xn6708d.x1ye3gou.x1hr4nm9.x1r1pt67');
        await SleepHelper.sleep(2000);
        await page.mouse.click(100, 100);

    }

    /**
     * Add friend
     */
    static async addFiends(page) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            // go to link https://www.facebook.com/friends/suggestions/
            // 1. Kết bạn theo đề xuất
            await driver.gotoUrl(page, 'https://www.facebook.com/friends/suggestions');
            await SleepHelper.sleep(2000);
            await page.waitForSelector('.x1xmf6yo .x135pmgq');
            const listSuggestions = await page.$$('.x1xmf6yo .x135pmgq .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1iyjqo2.xs83m0k.x150jy0e.x1e558r4.xjkvuk6.x1iorvi4.xdl72j9');
            if (listSuggestions.length > 0) {
                for (const btnFriend of listSuggestions) {
                    const textBtn = await page.evaluate(el => el.innerText, btnFriend);
                    await SleepHelper.sleep(1000);
                    if (textBtn == 'Add friend' || textBtn == 'Thêm bạn bè') {
                        await btnFriend.click();
                        await SleepHelper.sleep(2000);
                    }
                }
            }
            // 2. Tìm kiếm bạn bè và thực hiện kết bạn
            const fullName = Random.getLastName() + ' ' + Random.getFirstName();
            await page.click('.x1a2a7pz.x1qjc9v5.xnwf7zb.x40j3uw.x1s7lred.x15gyhx8.x9f619.x78zum5.x1fns5xo.x1n2onr6.xh8yej3.x1ba4aug.xmjcpbm');
            await SleepHelper.sleep(2000);
            await page.type('.x1a2a7pz.x1qjc9v5.xnwf7zb.x40j3uw.x1s7lred.x15gyhx8.x9f619.x78zum5.x1fns5xo.x1n2onr6.xh8yej3.x1ba4aug.xmjcpbm input[type="search"]', fullName, {delay: 100});
            await SleepHelper.sleep(1000);
            await driver.setKeyboard(page, 'Enter');
            // Load dữ liệu sau khi tìm kiếm
            await page.waitForSelector('.x9f619.x193iq5w.x1miatn0.xqmdsaz.x1gan7if.x1xfsgkm .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x150jy0e.x1e558r4.xjkvuk6.x1iorvi4 div[aria-label="Thêm bạn bè"]', { visible: true });
            let listFriend = await page.$$('.x9f619.x193iq5w.x1miatn0.xqmdsaz.x1gan7if.x1xfsgkm .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x150jy0e.x1e558r4.xjkvuk6.x1iorvi4 div[aria-label="Thêm bạn bè"]');
            if (listFriend.length == 0) {
                listFriend = await page.$$('.x9f619.x193iq5w.x1miatn0.xqmdsaz.x1gan7if.x1xfsgkm .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x150jy0e.x1e558r4.xjkvuk6.x1iorvi4 div[aria-label="Add Friend"]');
            }
            // Add Friend
            for (const friend of listFriend) {
                await friend.click();
                await SleepHelper.sleep(3000);
                const togleNoAddFriend = await page.$('.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7');
                if (togleNoAddFriend) {
                    await page.click('.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x78zum5.xdt5ytf.x1iyjqo2.x1al4vs7 div[role="button"]');
                await SleepHelper.sleep(2000);
                }
            }
        } catch (error) {
            console.log('addFiends(): ' + error);
            return false;
        }
       
    }
    // Chấp nhận kết bạn
    static async activeFriends(page) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            // go to link https://www.facebook.com/friends
            await driver.gotoUrl(page, 'https://www.facebook.com/friends');
            
            await SleepHelper.sleep(4000);
            const listFriendRequest = await page.$$('.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xn6708d.x1ye3gou.xtvsq51.x1r1pt67');
            if (listFriendRequest.length > 0) {
                for (const btnFriend of listFriendRequest) {
                    await btnFriend.click();
                    await SleepHelper.sleep(2000);
                }
            }
        } catch (error) {
            console.log('addFiends(): ' + error);
            return false;
        }
    }
    /**
     * Tính năng đăng status trên trang cá nhân
     */
    static async postStatus(page, statusContent) {
        try {
            // Click up status
            await SleepHelper.sleep(5000);
           
            const inputStatus = await page.waitForSelector('.x1cy8zhl.x78zum5.x1iyjqo2.xh8yej3 .x1i10hfl.x6umtig.x1b1mbwd.xaqea5y.xav7gou.x9f619.x1ypdohk.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xmjcpbm.x107yiy2.xv8uw2v.x1tfwpuw.x2g32xy.x78zum5.x1q0g3np.x1iyjqo2.x1nhvcw1.x1n2onr6.xt7dq6l.x1ba4aug.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', {visible: true});
            await inputStatus.hover();
            await SleepHelper.sleep(1000);
            await inputStatus.click();
            await SleepHelper.sleep(3000);

            const commentForm = await page.$('form .xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc div[role="radio"]');
            await SleepHelper.sleep(2000);
            if (commentForm) {
                await commentForm.click();
                await SleepHelper.sleep(1000);
                await page.click('form .xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.xsyo7zv.x16hj40l.x10b6aqq.x1yrsyyn div[role="button"]');
                await SleepHelper.sleep(1000);
            }
            // post comment
            try {
                const comment = await page.waitForSelector('form .xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc p.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8', {visible: true});
                await comment.click();
                await page.type('form .xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc p.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8', statusContent, {delay: 200});
                await SleepHelper.sleep(2000);
            } catch (error) {
                const comment = await page.waitForSelector('form .xb57i2i.x1q594ok.x5lxg6s.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1e4zzel.x78zum5.xdt5ytf.x1iyjqo2', {visible: true});
                await comment.click();
                await page.type('form .xb57i2i.x1q594ok.x5lxg6s.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1e4zzel.x78zum5.xdt5ytf.x1iyjqo2', statusContent, {delay: 200});
                await SleepHelper.sleep(2000);
            }
            //.xb57i2i.x1q594ok.x5lxg6s.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1e4zzel.x78zum5.xdt5ytf.x1iyjqo2

            await page.click('form .xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc .x6s0dn4.x9f619.x78zum5.x1qughib.x1pi30zi.x1swvt13.xyamay9.xh8yej3 div[role="button"]');
            await SleepHelper.sleep(5000);
            return true;
        } catch (error) {
            console.log('postStatus(): ' + error);
            return false;
        }

    }
    /**
     * Tính năng like page
     */
    static async likePage(page, page_link) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        await driver.gotoUrl(page, page_link);

        // Load trang
        await page.waitForSelector('.xsgj6o6.xw3qccf.x1xmf6yo.x1w6jkce.xusnbm3', { visible: true });
        let btnLikePage = await page.$('.xsgj6o6.xw3qccf.x1xmf6yo.x1w6jkce.xusnbm3 div[aria-label="Thích"]', { visible: true });
        if (!btnLikePage) {
            btnLikePage = await page.$('.xsgj6o6.xw3qccf.x1xmf6yo.x1w6jkce.xusnbm3 div[aria-label="Following"]', { visible: true });
        }
        if (btnLikePage) {
            await btnLikePage.click();
        }
        await SleepHelper.sleep(4000);
    }

    /**
     * Xử lý từng bài viết cụ thể: content
     */
    static async handlePost(page, post_link, list_comment, isShare, isLike) {
        const driver = await BrowserDriver.getDriver('dev_extra');
        try {
            for (let index = 0; index < post_link.length; index++) {
                const comment = list_comment.length ? list_comment[Math.floor(Math.random() * list_comment.length)] : false;
                await driver.gotoUrl(page, post_link[index]);
                // Load trang
                //  x78zum5 xdt5ytf x1n2onr6 x1ja2u2z
                //.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x10b6aqq.x1yrsyyn
                await page.waitForSelector('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x10b6aqq.x1yrsyyn', { visible: true });
                //.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x14vy60q.xyiysdx.x10b6aqq.x1yrsyyn
                let btnLikePage = await page.$('div[aria-labelledby="_R_aaqdfiqapapd5aq_"] .x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x14vy60q.xyiysdx.x10b6aqq.x1yrsyyn div[aria-label="Thích"]', { visible: true });
                let btnList = await page.$$('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x10b6aqq.x1yrsyyn', { visible: true });
                let btnComment = btnList[1];
                let btnSharePage = btnList[2];
                
                if (btnLikePage && isLike) {
                    console.log('like');
                    
                    await btnLikePage.hover();
                    await SleepHelper.sleep(1000);
                    await btnLikePage.click();
                    await SleepHelper.sleep(2000);
                }
    
                // Comment bài viết
                if (comment) {
                    await btnComment.hover();
                    await SleepHelper.sleep(1000);
                    await btnComment.click();
                    let formComment = await page.waitForSelector('form.x1ed109x.x1n2onr6.xmjcpbm.x1tlxs6b.x1g8br2z.x1gn5b1j.x230xth.x972fbf.xcfux6l.x1qhh985.xm0m39n.x78zum5.x1iyjqo2.x13a6bvl .xi81zsa.xo1l8bm.xlyipyv.xuxw1ft.x49crj4.x1ed109x.xdl72j9.x1iyjqo2.xs83m0k.x6prxxf.x6ikm8r.x10wlt62.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', { visible: true });
                    await page.type('form.x1ed109x.x1n2onr6.xmjcpbm.x1tlxs6b.x1g8br2z.x1gn5b1j.x230xth.x972fbf.xcfux6l.x1qhh985.xm0m39n.x78zum5.x1iyjqo2.x13a6bvl .xi81zsa.xo1l8bm.xlyipyv.xuxw1ft.x49crj4.x1ed109x.xdl72j9.x1iyjqo2.xs83m0k.x6prxxf.x6ikm8r.x10wlt62.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', comment, {delay: 100});
                    await SleepHelper.sleep(2000);
                    driver.setKeyboard(page, 'Enter');
                    await SleepHelper.sleep(4000);
                }
                // share bài viết lên trang cá nhân
                if (isShare) {
                    if (btnSharePage) {
                        //.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xbxaen2.x1u72gb5.xtvsq51.x1r1pt67
                        await btnSharePage.click();
                        await page.waitForSelector('.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xbxaen2.x1u72gb5.xtvsq51.x1r1pt67', { visible: true });
                        await SleepHelper.sleep(2000);
                        await page.click('.x1ja2u2z.x78zum5.x2lah0s.x1n2onr6.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xbxaen2.x1u72gb5.xtvsq51.x1r1pt67');
                    }
                    await SleepHelper.sleep(3000);
                }
            }
        } catch (e) {
            console.log('Error Action Facebook handlePost: ' + e.message());
        }
    }
    /**
     * Xử lý từng bài viết cụ thể: video
     */
    static async handlePostVideo(page, post_link, list_comment, isShare, isLike) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            for (let index = 0; index < post_link.length; index++) {
                const comment = list_comment[Math.floor(Math.random() * list_comment.length)];
                await driver.gotoUrl(page, post_link[index]);
                // Load trang
                await page.waitForSelector('.x78zum5.xdt5ytf.x1n2onr6.x1ja2u2z', { visible: true });
                let btnLikePage = await page.$('.x78zum5.xdt5ytf.x1n2onr6.x1ja2u2z div[aria-label="Thích"]', { visible: true });
                let btnComment = await page.waitForSelector('.x78zum5.xdt5ytf.x1n2onr6.x9otpla form .xi81zsa.xo1l8bm.xlyipyv.xuxw1ft.x49crj4.x1ed109x.xdl72j9.x1iyjqo2.xs83m0k.x6prxxf.x6ikm8r.x10wlt62.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', { visible: true });
                let btnSharePage = await page.waitForSelector('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xn6708d.x1ye3gou.xexx8yu.xcud41i.x139jcc6.x4cne27.xifccgj.xn3w4p2.xuxw1ft', { visible: true });
                // Like bài viết
                if (btnLikePage && isLike) {
                    await btnLikePage.hover();
                    await SleepHelper.sleep(1000);
                    await btnLikePage.click();
                }
                await SleepHelper.sleep(3000);
    
                // Comment bài viết
                if (comment) {
                    await btnComment.hover();
                    await SleepHelper.sleep(1000);
                    await btnComment.click();
                    
                    await page.type('.x78zum5.xdt5ytf.x1n2onr6.x9otpla form .xi81zsa.xo1l8bm.xlyipyv.xuxw1ft.x49crj4.x1ed109x.xdl72j9.x1iyjqo2.xs83m0k.x6prxxf.x6ikm8r.x10wlt62.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', comment, {delay: 100});
                    await SleepHelper.sleep(2000);
                    driver.setKeyboard(page, 'Enter');
                    await SleepHelper.sleep(2000);
                }
                // share bài viết lên trang cá nhân
                if (isShare) {
                   if (btnSharePage) {
                        await btnSharePage.click();
                        await page.waitForSelector('.xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc', { visible: true });
                        await SleepHelper.sleep(2000);
                        let listShare = await page.$$('.xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc .x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1lliihq', { visible: true });
                        await listShare[0].click();
                    }
                    await SleepHelper.sleep(3000);
                }
            }
        } catch (e) {
            console.log('Error Action Facebook handlePost: ' + e.message());
        }
        
    }

    /**
     * Xử lý từng bài viết cụ thể: image (ảnh nằm trong một bài viết)
     * .x1fqkajt.x1aj7aux.x1axty5n.x1uuop16
     */
    static async handlePostImage(page, post_link, list_comment, isShare, isLike) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        try {
            for (let index = 0; index < post_link.length; index++) {
                const comment = list_comment[Math.floor(Math.random() * list_comment.length)];
                await driver.gotoUrl(page, post_link[index]);
                // Load trang
                await page.waitForSelector('.x78zum5.xdt5ytf.x1n2onr6.x1ja2u2z', { visible: true });
                let btnLikePage = await page.$('.x1fqkajt.x1aj7aux.x1axty5n.x1uuop16 div[aria-label="Thích"]', { visible: true });
                let btnComment = await page.waitForSelector('form .xi81zsa.xo1l8bm.xlyipyv.xuxw1ft.x49crj4.x1ed109x.xdl72j9.x1iyjqo2.xs83m0k.x6prxxf.x6ikm8r.x10wlt62.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', { visible: true });
                await page.waitForSelector('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xn6708d.x1ye3gou.xexx8yu.xcud41i.x139jcc6.x4cne27.xifccgj.xn3w4p2.xuxw1ft', { visible: true });
                let btnSharePage = await page.$$('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.x1r8uery.x1iyjqo2.xs83m0k.xeuugli.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xn6708d.x1ye3gou.xexx8yu.xcud41i.x139jcc6.x4cne27.xifccgj.xn3w4p2.xuxw1ft', { visible: true })[2];
                // Like bài viết
                if (btnLikePage && isLike) {
                    await btnLikePage.hover();
                    await SleepHelper.sleep(1000);
                    await btnLikePage.click();
                }
                await SleepHelper.sleep(3000);
    
                // Comment bài viết
                if (comment) {
                    await btnComment.hover();
                    await SleepHelper.sleep(1000);
                    await btnComment.click();
                    
                    await page.type('.x78zum5.xdt5ytf.x1n2onr6.x9otpla form .xi81zsa.xo1l8bm.xlyipyv.xuxw1ft.x49crj4.x1ed109x.xdl72j9.x1iyjqo2.xs83m0k.x6prxxf.x6ikm8r.x10wlt62.x1y1aw1k.xn6708d.xwib8y2.x1ye3gou', comment, {delay: 100});
                    await SleepHelper.sleep(2000);
                    driver.setKeyboard(page, 'Enter');
                    await SleepHelper.sleep(2000);
                }
                // share bài viết lên trang cá nhân
                if (isShare) {
                   if (btnSharePage) {
                        await btnSharePage.click();
                        await page.waitForSelector('.xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc', { visible: true });
                        await SleepHelper.sleep(2000);
                        //.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.xl56j7k.x6s0dn4.xozqiw3.x1q0g3np.xi112ho.x17zwfj4.x585lrc.x1403ito.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xbxaen2.x1u72gb5.xtvsq51.x1r1pt67
                        let listShare = await page.$('.xt7dq6l.x1a2a7pz.x6ikm8r.x10wlt62.x1n2onr6.x14atkfc .x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1lliihq', { visible: true });
                        await listShare[0].click();
                    }
                    await SleepHelper.sleep(3000);
                }
            }
        } catch (e) {
            console.log('Error Action Facebook handlePost: ' + e.message());
        }
    }
}

module.exports = FacebookActions;
