// const fs = require('fs');
const path = require('path');
const axios = require('axios');
// const FormData = require('form-data');
const Controller = require('./Controller');
const BrowserDriver = require('../drivers/BrowserDriver');
const RandomHelper = require('../helpers/random.helper');
const FileHelper = require('../helpers/file.helper');
const Office = require('../helpers/office.helper');
const { list_area_address } = require('../config');


// const SleepHelper = require('../helpers/sleep.helper');

class XuatnhapcanhController extends Controller {
    async getListFolderStory(req, res) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        const browser = await driver.getBrowser();
        const { action, account, pass, address } = req.body;
        try {
            let page = await browser.newPage();

            await driver.gotoUrl(page, 'https://hanoi.xuatnhapcanh.gov.vn/faces/login.jsf');
            // Login
            await page.waitForSelector('.form-login-cell', { visible: true });
            await page.type('.form-login-cell input[id="pt1\:s1\:it1\:\:content"]', account, { delay: 10 });
            await page.type('.form-login-cell input[id="pt1\:s1\:it2\:\:content"]', pass, { delay: 10 });
            await page.click('.form-login-cell div[id="pt1\:s1\:b1"]');
            try {
                // Check login
                await page.waitForSelector('span.tileUserName', { visible: true, timeout: 3000 });
                console.log("Login");
            } catch (error) {
                console.log("Logout");
                await driver.closeBrowser(browser);
                return res.send({
                    code: "9999",
                    message: "NO LOGIN",
                    reason: error.message
                });
            }
            let dataExcel = [];
            // Xử lý trang kiểm tra thông tin người lưu trú
            for (let t = 0; t < list_area_address.length; t++) {
                if (address != list_area_address[t].code) continue;
                await driver.gotoUrl(page, 'https://hanoi.xuatnhapcanh.gov.vn/faces/search_kbtt.jsf');
                await page.waitForSelector('span[id="pt1\:pt_pgl6"]', { visible: true }); //Form
                await page.select('span[id="pt1\:pt_pgl6"] select[id="pt1\:soc5\:\:content"]', '0'); //ô chọn khách đang tạm trú
                await page.select('span[id="pt1\:pt_pgl6"] select[id="pt1\:soc15\:\:content"]', list_area_address[t].code); // Chọn phường tìm kiếm
                await page.click('span[id="pt1\:pt_pgl6"] div[id="pt1\:b1"]');// Btn tìm kiếm
                await SleepHelper.sleep(3000);

                // Lấy dữ liệu ở table
                await page.waitForSelector('div[id="pt1\:pb2\:\:content"] table', { visible: true }); //Table
                while (true) {
                    let listForeigner = await page.$$('div[id="pt1\:table\:\:db"] table tbody tr');
                    for (let i = 0; i < listForeigner.length; i++) {
                        let foreigner = await page.evaluate(el => {
                            const listTitle = el.querySelectorAll('td');
                            // Xử lý thời gian, được 1 tháng thì lấy kết quả
                            let dateArr = listTitle[6].innerText.split('/'); // dateArr[0] - Day, dateArr[1] - Month, dateArr[2] - Year
                            let oldTime = (new Date(dateArr[2], dateArr[1] - 1, dateArr[0])).getTime() / 86400000;
                            let currentTime = (new Date()).getTime() / 86400000; // 86400000 milisecond = 1 ngày
                            let checkDay = Math.floor(currentTime - oldTime);
                            if (checkDay >= 30) {
                                return {
                                    name: listTitle[1].innerText,
                                    birthday: listTitle[2].innerText,
                                    gender: listTitle[3].innerText,
                                    country: listTitle[4].innerText,
                                    passport: listTitle[5].innerText,
                                    startDate: listTitle[6].innerText,
                                    endDate: listTitle[7].innerText,
                                    hotel: listTitle[8].innerText,
                                };
                            } else {
                                return false;
                            }
                        }, listForeigner[i]);
                        if (foreigner) {
                            foreigner.address = list_area_address[t].display;
                            dataExcel.push(foreigner);
                        }
                    }
                    // Xử lý việc sang trang tiếp theo
                    try {
                        let nextPage = await page.$('a[id="pt1\:table\:\:nb_nx"].x13o.p_AFDisabled');
                        // console.log(!nextPage);
                        if (!nextPage) {
                            await page.click('a[id="pt1\:table\:\:nb_nx"].x13o');
                            await SleepHelper.sleep(1000);
                        } else {
                            break;
                        }
                    } catch (error) {
                        let nextPage = await page.$('a[id="pt1\:table\:\:nb_nx"].x13k.p_AFDisabled');
                        if (!nextPage) {
                            await page.click('a[id="pt1\:table\:\:nb_nx"].x13k');
                            await SleepHelper.sleep(1000);
                        } else {
                            break;
                        }
                    }
                }
                await driver.gotoUrl(page, 'https://hanoi.xuatnhapcanh.gov.vn/faces/manage_cslt.jsf');
            }
            // Ghi file excel
            const pathXlsx = path.join(
                root_path + '/public/xuatnhapcanh/xuat-nhap-canh.xlsx'
            );
            FileHelper.createFolderAnfFile(root_path + '/public/xuatnhapcanh/', 'xuat-nhap-canh.xlsx');
            Office.writeFileXlsx(pathXlsx, dataExcel, 'luu tru dai han');
            await driver.closeBrowser(browser);
            return res.status(200).send({
                message: "Đang chạy, xem màn hình process để xem tiến trình chạy",
                link_download: '/xuatnhapcanh/xuat-nhap-canh.xlsx'
            });
        } catch (error) {
            await driver.closeBrowser(browser);
            console.log("Error in /api/v1/xuatnhapcanh/crawl_person_long_time: " + error);
            return res.send({
                code: "9999",
                message: "FAILED",
                reason: error.message
            });
        }
    }

    // Lấy danh sách đang tạm trú
    async getTouristsTemporary(req, res) {
        const driver = await BrowserDriver.getDriver('dev_tool');
        const browser = await driver.getBrowser();
        const { action, account, pass, address } = req.body;
        try {
            let page = await browser.newPage();

            await driver.gotoUrl(page, 'https://hanoi.xuatnhapcanh.gov.vn/faces/login.jsf');
            // Login
            await page.waitForSelector('.form-login-cell', { visible: true });
            await page.type('.form-login-cell input[id="pt1\:s1\:it1\:\:content"]', account, { delay: 10 });
            await page.type('.form-login-cell input[id="pt1\:s1\:it2\:\:content"]', pass, { delay: 10 });
            await page.click('.form-login-cell div[id="pt1\:s1\:b1"]');
            try {
                // Check login
                await page.waitForSelector('span.tileUserName', { visible: true, timeout: 3000 });
                console.log("Login");
            } catch (error) {
                console.log("Logout");
                await driver.closeBrowser(browser);
                return res.send({
                    code: "9999",
                    message: "NO LOGIN",
                    reason: error.message
                });
            }
            let dataExcel = [];
            // Xử lý trang kiểm tra thông tin người lưu trú
            for (let t = 0; t < list_area_address.length; t++) {
                if (address != list_area_address[t].code) continue;
                await driver.gotoUrl(page, 'https://hanoi.xuatnhapcanh.gov.vn/faces/search_kbtt.jsf');
                await page.waitForSelector('span[id="pt1\:pt_pgl6"]', { visible: true }); //Form
                await page.select('span[id="pt1\:pt_pgl6"] select[id="pt1\:soc5\:\:content"]', '0'); //ô chọn khách đang tạm trú
                await page.select('span[id="pt1\:pt_pgl6"] select[id="pt1\:soc15\:\:content"]', list_area_address[t].code); // Chọn phường tìm kiếm
                await page.click('span[id="pt1\:pt_pgl6"] div[id="pt1\:b1"]');// Btn tìm kiếm
                await SleepHelper.sleep(3000);

                // Lấy dữ liệu ở table
                await page.waitForSelector('div[id="pt1\:pb2\:\:content"] table', { visible: true }); //Table
                while (true) {
                    let listForeigner = await page.$$('div[id="pt1\:table\:\:db"] table tbody tr');
                    for (let i = 0; i < listForeigner.length; i++) {
                        let foreigner = await page.evaluate(el => {
                            const listTitle = el.querySelectorAll('td');
                            return {
                                name: listTitle[1].innerText,
                                birthday: listTitle[2].innerText,
                                gender: listTitle[3].innerText,
                                country: listTitle[4].innerText,
                                passport: listTitle[5].innerText,
                                startDate: listTitle[6].innerText,
                                endDate: listTitle[7].innerText,
                                hotel: listTitle[8].innerText,
                            };
                        }, listForeigner[i]);
                        if (foreigner.name) {
                            foreigner.address = list_area_address[t].display;
                            dataExcel.push(foreigner);
                            // Lưu vào DB
                            await this.uploadApiTourist(foreigner);
                            await SleepHelper.sleep(1000);
                        }
                    }
                    // Xử lý việc sang trang tiếp theo
                    try {
                        let nextPage = await page.$('a[id="pt1\:table\:\:nb_nx"].x13o.p_AFDisabled');
                        // console.log(!nextPage);
                        if (!nextPage) {
                            await page.click('a[id="pt1\:table\:\:nb_nx"].x13o');
                            await SleepHelper.sleep(1000);
                        } else {
                            break;
                        }
                    } catch (error) {
                        let nextPage = await page.$('a[id="pt1\:table\:\:nb_nx"].x13k.p_AFDisabled');
                        if (!nextPage) {
                            await page.click('a[id="pt1\:table\:\:nb_nx"].x13k');
                            await SleepHelper.sleep(1000);
                        } else {
                            break;
                        }
                    }
                }
                await driver.gotoUrl(page, 'https://hanoi.xuatnhapcanh.gov.vn/faces/manage_cslt.jsf');
            }
            // Ghi file excel
            const pathXlsx = path.join(
                root_path + '/public/xuatnhapcanh/xuat-nhap-canh.xlsx'
            );
            FileHelper.createFolderAnfFile(root_path + '/public/xuatnhapcanh/', 'xuat-nhap-canh.xlsx');
            Office.writeFileXlsx(pathXlsx, dataExcel, 'dang tam tru');
            await driver.closeBrowser(browser);
            return res.status(200).send({
                message: "Đang chạy, xem màn hình process để xem tiến trình chạy",
                link_download: '/xuatnhapcanh/xuat-nhap-canh.xlsx'
            });
        } catch (error) {
            await driver.closeBrowser(browser);
            console.log("Error in /api/v1/xuatnhapcanh/crawl_person_long_time: " + error);
            return res.send({
                code: "9999",
                message: "FAILED",
                reason: error.message
            });
        }
    }

    async uploadApiTourist(item) {
        // Xử lý giới tính lưu vào DB
        let gender = item.gender;
        if (gender) {
            if (gender.toLowerCase() == 'nam') {
                gender = 'male';
            }
            if (gender.toLowerCase() == 'nữ') {
                gender = 'female';
            }
        } else {
            gender = 'unknown';
        }
        item.gender = gender;
        // Xử lý ngày tháng năm sinh lưu vào DB
        let birthday = item.birthday;
        if (birthday) {
            let dateArr = birthday.split('/'); // dateArr[0] - Day, dateArr[1] - Month, dateArr[2] - Year
            item.birthday = `${dateArr[1]}/${dateArr[0]}/${dateArr[2]}`;
        }
        try {
            const respone = await axios({
                url: 'http://127.0.0.1:8000/api/admin/customers',
                method: 'post',
                data: item,
              });
        } catch (e) {
            console.log(`${item.name}: ${e.message}`);
        }
        return item;
    }
}

module.exports = XuatnhapcanhController;