export default function Footer() {
  const footerSections = [
    {
      title: "Về MealDrone",
      links: ["Giới thiệu", "Tuyển dụng", "Blog", "Liên hệ"],
    },
    {
      title: "Hỗ trợ khách hàng",
      links: [
        "Trung tâm trợ giúp",
        "Hướng dẫn đặt hàng",
        "Chính sách hoàn trả",
        "Điều khoản sử dụng",
      ],
    },
    {
      title: "Nhà hàng",
      links: [
        "Đăng ký nhà hàng",
        "Quản lý nhà hàng",
        "Chính sách nhà hàng",
        "Hỗ trợ nhà hàng",
      ],
    },
    {
      title: "Theo dõi chúng tôi",
      links: ["Facebook", "Instagram", "Twitter", "TikTok"],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold text-lg mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-400">
                © 2025 MealDrone. Tất cả quyền được bảo lưu.
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200"
              >
                Chính sách bảo mật
              </a>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200"
              >
                Điều khoản dịch vụ
              </a>
              <a
                href="#"
                className="text-sm hover:text-white transition-colors duration-200"
              >
                Cài đặt cookie
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
