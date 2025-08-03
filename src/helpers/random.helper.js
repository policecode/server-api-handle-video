const $lastName = ['Nguyễn','Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đào', 'Chử', 'Chu', 'Nghiêm', 'Đinh', 'Khuất', 'Hà', 'Lại', 'Quách', 'Đồng', 'Lưu', 'Tạ', 'Uông', 'Bạch', 'Phùng', 'Đàm', 'Vi', 'Khổng', 'Lương', 'Văn', 'Bế', 'Nông', 'Quan', 'Thái', 'Đầu', 'Đoàn', 'Sái'];
const $firstName = ['Văn Tiến', 'Ngô bình', 'Đức Hà', 'Quốc Bảo', 'Quang Đăng', 'Minh Khôi', 'Văn Thắng', 'Tuấn Kiệt', 'Bảo Long', 'Hữu Đạt', 'Bảo Hân', 'Minh Nhật', 'Đình Quyết', 'Ngọc Anh', 'Mạnh Hùng', 'Thái Tuệ', 'Hữu Thịnh', 'Tấn Phát', 'Thanh Tùng', 'Huy Hoàng', 'Hải An', 'Trung Kiên', 'Thế Vinh', 'Tuấn Anh', 'Kiên Quốc', 'Minh Phát', 'Tùng Lâm', 'Hoàng Bách', 'Thái Sơn', 'Minh Quang', 'Minh Tâm. Nhật Cường', 'Văn Trôn', 'Quốc Đạt', 'Bảo Thạch', 'Ngọc Lâm', 'Chí Thiện', 'Minh Quân', 'Nghĩa Nam', 'Huỳnh Anh', 'Tuấn Tú', 'Hạnh Phúc', 'Xuân Cường', 'Đình Chung', 'Đăng Khôi', 'Tuấn Kiệt', 'Bảo Luân', 'Văn Khánh', 'Hưng Thịnh', 'Tuấn Kiệt', 'Quang Vinh', 'Gia Khang', 'Minh Luân', 'Thành Toàn', 'Hoàng Yến', 'Gia Hưng', 'Đức Toàn', 'Trung Thành', 'Huy Vũ', 'Hùng Dương', 'Anh Đức', 'Khôi Nguyên', 'Anh Tài', 'Khánh Toàn', 'Quang Minh', 'Gia Phát', 'Phương Nam', 'Hữu Thịnh', 'Anh Tuấn', 'Minh Hải', 'Hoàng Dũng', 'Viết Cường', 'Anh Dũng', 'Đình Khải', 'Huy Hoàng', 'Mạnh Tuấn', 'Chí Dũng', 'Hữu Thiện', 'Ngọc Hiếu', 'Minh Khang', 'Minh Quang', 'Quốc Bảo', 'Hoàng Anh', 'Minh Nhật', 'Hoài An', 'Thuỳ Anh', 'Văn Hội', 'Tú Anh', 'Thành Hưng', 'Ngọc Bích', 'Bảo Bình', 'Nguyệt Cát', 'Bảo Châu', 'Minh Châu', , 'Hương Chi', 'Lan Chi', 'Linh Chi', 'Mai Chi', 'Hạc Cúc', 'Nhật Dạ', 'Huyền Diệu', 'Trọng Giáp', 'Vinh Diệu', 'Vân Du', 'Hạnh Dung', 'Kiều Dung', 'Thiên Duyên', 'Hải Dương', 'Hướng Dương', 'Kim Đan', 'Văn Đức', 'Minh Đan', 'Trúc Đào', 'Hạ Giang', 'Hồng Giang', 'Khánh Giang', 'Lam Giang', 'Lệ Giang', 'Văn Hải', 'Bảo Hà', 'Linh Hà', 'Ngân Hà', 'Ngọc Hà', 'Vân Hà', 'An Hạ', 'Mai Hạ', 'Nhật Hạ', 'Tâm Hằng', 'Thanh Hằng', 'Thu Hằng', 'Diệu Hiền', 'Ánh Hồng', 'Đinh Hương', 'Quỳnh Hương', 'Thanh Hương', 'Mai Khôi', 'Bích Lam', 'Hiểu Lam', 'Song Lam', 'Vy lam', 'Hoàng Lan', 'Trúc Lâm', 'Tuệ Lâm', 'Bạch Liên', 'Ái Linh', 'Gia Linh', 'Thảo Linh', 'Thuỷ Linh', 'Hương Ly', 'Lưu Ly', 'Ban Mai', 'Nhật Mai', 'Yên Mai', 'Hải Miên', 'Thuỵ Miên', 'Thiện Mỹ', 'Thiên Nga', 'Bích Ngân', 'Đông Nghi', 'Khánh Ngọc', 'Minh Ngọc', 'Thi Ngôn', 'Thảo Nguyên', 'Ánh Nguyệt', 'Thuỷ Nguyệt', 'Gia Nhi', 'Thảo Nhi', 'An Nhiên', 'Vân Phi', 'Phương Phương', 'Hoàng Sa', 'Linh San', 'Băng Tâm', 'Phương Tâm', 'Tố Tâm', 'Tuyết Tâm', 'Đan Thanh', 'Giang Thanh', 'Hà Thanh', 'Thiên Thanh', 'Anh Thảo', 'Diễm Thảo', 'Nguyên Thảo', 'Thanh Thảo', 'Lệ Thu', 'Quế Thu', 'Diễm Thư', 'Vân Thường', 'Bảo Vy', 'Phúc Quảng', 'Hoàng Nam', 'Hoàng Đạt', 'Tất Thắng', 'Hải Thắng', 'Quang Ngọc', 'Duy Khánh', 'Xuân Thắng'];

const $firstPhone = ['039', '038', '037', '036', '035', '034', '033', '032', '096', '097', '098', '086', '083', '084', '085', '081', '082', '088', '070', '079', '078', '077', '076', '090', '093', '089'];
const NST_BROWSER_PROFILE_ID = [
  '4ca1e57d-b803-49a9-b1c3-1cebd36545f5',
  '476ec8fc-a1e6-4f0d-81ff-d2bdcdecd8b4',
  '8fd9198e-fe4a-458c-bad5-6c5f20bf81ad',
  '501eefcc-bdc3-489d-b74c-bf2d64b21cb2',
  '40d619b6-2028-4d6e-af58-a79adbf71168',
  'ba966826-e7c9-4619-b819-9fef8e3ab2f0',
  '535cb3a4-7b12-4fa5-9d65-011a0b8f7b3d',
  '38e5ba8d-a79d-49aa-bce4-dd7ea6c04cd6',
  '9e935c2f-b070-487d-a39d-9149b1fc3eca',
  'd26b7260-7985-4f1e-ad0a-5371f77e31e9'
];
function getRandomProperty(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

function changeSlug(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  str = str.toLowerCase();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/\s|!|@|%|\^|\*|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,"-");
  return str;
}

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
  return str;
}

function getLastName() {
  const index = Math.floor(Math.random() * $lastName.length);
  return $lastName[index];
}
function getFirstName() {
  const index = Math.floor(Math.random() * $firstName.length);
  return $firstName[index];
}
function randomPhone() {
  const index = Math.floor(Math.random() * $firstPhone.length);
  let lastPhone = 0;
  while (lastPhone < 1000000) {
    lastPhone = Math.floor(Math.random() * 9999999);
  }
  const phoneNumber = `${$firstPhone[index]}${lastPhone}`;
  return phoneNumber;
}
function getUserName(str) {
  const regex = /\s/gi;
  let strReplace = str.replace(regex, '').toLowerCase();
  strReplace = this.removeVietnameseTones(strReplace);
  let userName = strReplace + (Math.floor(Math.random() * 9999) + 1);
  return userName;
}


module.exports ={
  NST_BROWSER_PROFILE_ID,
  getRandomProperty,
  changeSlug,
  removeVietnameseTones,
  getLastName,
  getFirstName,
  getUserName,
  randomPhone
}
