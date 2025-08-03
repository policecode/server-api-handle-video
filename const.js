const SCRIPT_TYPES = {
  DAY1:"day1",
  DAY2:"day2",
}
const ALL_SCRIPTS = Object.values(SCRIPT_TYPES)

const FOLDER_PROFILE = global.root_path+'/UDATA/profiles';
const API_GPM_URL = 'http://127.0.0.1:19995/v2';
const SCRIPTS = [
    {
        group: 'MAIL',
        scripts: [
            {
                id: 'loginMail_1',
                name: 'LOGIN MAIL 1',
                path: 'Script\\Mail\\LoginMail_1\\loginMail_1.js',
                des: 'Script kiểm tra việc login mail, nếu chưa login thì thực hiện login mail.'
            },
            {
                id: 'changePassword_1',
                name: 'ĐỔI PASS MAIL 1',
                path: 'Script\\Mail\\LoginMail_1\\loginMail_1.js',
                des: 'Script đổi pass mail.'
            }
        ]    
    },
    {
        group: 'GOOGLE',
        scripts: [
            {
                id: 'googleSearch_1',
                name: 'SEARCH GOOGLE 1',
                path: 'Script\\Google\\Search\\googleSearch_1.js',
                des: 'Vào trang chủ google, search từ khóa ngẫu nhiên, sau đó xem bài viết bất kì, ngẫu nhiên thời gian xem, số lần scroll lên xuống.'
            }
        ] 
    },
    {
        group: 'AMAZON',
        scripts: [
            {
                id: 'viewAmazon_1',
                name: 'VIEW AMAZON 1',
                path: 'Script\\Amazon\\Amazon_1\\viewAmazon_1.js',
                des: 'Vào trang chủ amazon, search từ khóa nhẫu nhiên, ngẫu nhiên nhấn 1-5 filter phía bên trái, ngẫu nhiên xem 3-5 sản phẩm.'
            }
        ] 
    },
    {
        group: 'TIKTOK',
        scripts: [
            {
                id: 'viewTiktok_1',
                name: 'VIEW TIKTOK 1',
                path: 'Script\\Tiktok\\Tiktok_1\\viewTiktok_1.js',
                des: 'Lướt lên xuống xem tiktok, random thời gian xem, random like, follow kênh.'
            }
        ] 
    },
    {
        group: 'TWITTER',
        scripts: [
            {
                id: 'viewTwitter_1',
                name: 'VIEW TWITTER 1',
                path: 'Script\\Twitter_1\\ViewTwitter\\viewTwitter_1.js',
                des: 'Lướt lên xuống xem twitter, random thời gian xem, random like, retweet.'
            }
        ] 
    },
]

const DRIVERS = {
    NONE: 'none',
    GPM_LOGIN: 'gpm_login',
    GEN_LOGIN: 'gen_login',
}

const PROCESS_STATUS = {
    PENDING: 0,
    RUNNING: 1,
    FINISHED: 2,
    STOPPED: 3
}
module.exports = {
    FOLDER_PROFILE,
    SCRIPTS,
    API_GPM_URL,
    SCRIPT_TYPES,
    ALL_SCRIPTS,
    PROCESS_STATUS,
    DRIVERS
};