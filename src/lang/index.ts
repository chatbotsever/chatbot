export default {
  MAINTENANCE: '[BOT] 🚧Server hiện đang bảo trì...',

  FIRST_COME: '[BOT] 🎉Chào mừng bạn đến với hồ câu lớn nhất VBB. Trước khi bắt đầu, hãy chắc chắn rằng bạn đã chọn đúng giới tính người muốn chat cùng.\n\nẤn trợ giúp (hoặc gửi "trogiup") để xem thêm.',

  INSTRUCTION: '[BOT] 🎉Gửi "batdau" hoặc bấm vào nút để thả câu.',

  HELP_TXT: '[BOT] ⭐Danh sách các lệnh:\n' +
            '- batdau: Bắt đầu tìm bạn chat\n' +
            '- ketthuc: Kết thúc chat\n' +
            '- trogiup: Xem trợ giúp\n' +
            '- meow: Xem ảnh mèo\n' +
            '- gauw: Xem ảnh cún\n' + 
            '- mlem: Xem ảnh girl xinh\n' +
            '- heyadmin: Kết nối với admin\n' + 
            '- byeadmin: Ngắt kết nối với admin\n' +
            '- getinfo: Xem thông tin của bạn\n\n' +
            'Các lệnh có thể dùng khi đang không chat:\n' +
            '- timnu: Tìm nữ chat cùng\n' +
            '- timnam: Tìm nam chat cùng',

  START_OKAY: '[BOT] 📣OK! Chúng mình sẽ thông báo khi tìm được cá.',
  START_WARN_GENDER: '[BOT] 📣Lưu ý: Bạn không chọn giới tính. Có thể bạn sẽ phải đợi lâu hơn.',
  START_ERR_ALREADY: '[BOT] ⚠️Bạn không thể "batdau" khi chưa "ketthuc"...',

  WAITING: '[BOT] 🔎Đang tìm cá... Nếu bạn muốn đổi giới tính, gửi "ketthuc" sau đó chọn giới tính mới.',
  CONNECTED: '[BOT] 💖Connected! Nếu muốn kết thúc, hãy gửi "ketthuc"',

  END_CHAT: '[BOT] ❌End chat!\nGửi "batdau" hoặc bấm vào nút để tìm bạn chat.',
  END_CHAT_PARTNER: '[BOT] 💔Cá đã ngắt kết nối :(\nGửi "batdau" hoặc bấm vào nút để tìm bạn chat.',
  END_CHAT_FORCE: '[BOT] ⚠️Hiện tại không có cá nào đang online cả. Bạn hãy thử lại sau nhé :(',

  ERR_ATTACHMENT: '[BOT] ⚠️Lỗi: Chatbot chưa hỗ trợ gửi dạng dữ liệu này',
  ATTACHMENT_LINK: '[BOT] 📣Cá đã gửi 1 đường link: ',

  GENDER_ERR: '[BOT] ⚠️Lỗi: Giới tính nhập vào không hợp lệ!\n\nẤn trợ giúp (hoặc gửi "trogiup") để xem thêm.',
  GENDER_WRITE_OK: '[BOT] 📣Bạn đã chọn giới tính mong muốn tìm được là: ',
  GENDER_WRITE_WARN: '\n\nLưu ý: Tùy chọn này chỉ có tác dụng với PHẦN LỚN các cuộc nói chuyện.',
  GENDER_ARR_UNKNOWN: 'cả hai',
  GENDER_ARR_MALE: 'nam',
  GENDER_ARR_FEMALE: 'nữ',

  KEYWORD_START: 'batdau',
  KEYWORD_END: 'ketthuc',
  KEYWORD_GENDER: 'tim',
  KEYWORD_GENDER_MALE: 'nam',
  KEYWORD_GENDER_FEMALE: 'nu',
  KEYWORD_GENDER_BOTH: 'namnu',
  KEYWORD_HELP: 'trogiup',
  KEYWORD_CAT: 'meow',
  KEYWORD_DOG: 'gauw',
  KEYWORD_GIRL: 'mlem',
  KEYWORD_INFO: 'getinfo',
  KEYWORD_ADMIN_START: 'heyadmin',
  KEYWORD_ADMIN_END: 'byeadmin',

  ADMIN_CONNECTED: '[BOT] 📣Bạn đã được kết nối với admin',
  ADMIN_USER_CONNECTED: '[BOT] 📣Bạn đã được kết nối với thành viên có id : ',
  ADMIN_END_CHAT: '[BOT] ❌Bạn đã ngắt kết nối với admin',
  ADMIN_END_CHAT_PARTNER: '[BOT] ❌Thành viên đã ngắt kết nối với admin có id : ',
  ADMIN_ERR_CONNECTED: '[BOT] ⚠️Lỗi: Bạn đang kết nối với admin rồi.',
  ADMIN_ERR_END: '[BOT] ⚠️Lỗi: Bạn chưa kết nối với admin.',

  SYSTEM_START: '⭐Thả câu',
  SYSTEM_END: '❌Kết thúc',
  SYSTEM_FIND: '👫Tìm theo giới tính',
  SYSTEM_FIND_MALE: '👨Tìm cá nam',
  SYSTEM_FIND_FEMALE: '👩Tìm cá nữ',
  SYSTEM_HELP: '💡Trợ giúp',
  SYSTEM_REPORT: '📝Gửi phản hồi',
  SYSTEM_CONFESSION:'💌Gửi confession',
  SYSTEM_MENU: '💬Menu chat',
  SYSTEM_MENU_CHAT: '🐟Hồ câu cá',
  SYSTEM_MENU_ADMIN: '👮Kết nối Admin',
  SYSTEM_MENU_OTHER: '📋Chức năng',
  SYSTEM_MENU_INFO: '🔎Thông tin',
  SYSTEM_ADMIN_START: '🔰Kết nối',
  SYSTEM_ADMIN_END: '❌Ngắt kết nối',
  SYSTEM_MEOW: '🐱Xem ảnh mèo',
  SYSTEM_GAUW: '🐶Xem ảnh cún',
  SYSTEM_INFO: '🏆Thông tin của bạn',
  SYSTEM_GIRL: '🔞Xem ảnh girl xinh',

  ERR_FAKE_MSG: '[BOT] ⚠️Lỗi: Bạn không được giả mạo tin nhắn của bot!',
  ERR_DATABASE: '[BOT] ⚠️Lỗi: Không thể kết nối với database. Hãy báo cho admin!',
  ERR_TOO_LONG: '[BOT] ⚠️Lỗi: Tin nhắn quá dài (nhiều hơn 2000 ký tự). Hãy chia nhỏ tin nhắn và gửi dần.',
  ERR_200: '[BOT] ⚠️Bạn chat không thể nhận tin nhắn do đã xóa inbox hoặc block page.',
  ERR_10: '[BOT] ⚠️Bạn chat không thể nhận tin nhắn do 2 bạn không nói chuyện trong 24h. Gửi ketthuc để kết thúc chat.',
  ERR_SERVER: '[BOT] ⚠️Có lỗi xảy ra với chatbot. Tin nhắn của bạn chưa được xử lý. Bạn hãy thử lại sau 1 phút nữa nhé.',
  ERR_UNKNOWN: '[BOT] ⚠️Server xảy ra lỗi nhưng không nghiêm trọng lắm\nHãy gửi ketthuc để thoát ra và thử lại',
};
