Lưu ý: Dự án chỉ phục vụ mục đích học tập

# Hướng Dẫn Tạo Bot Discord và Lấy API Key của Gemini

## Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt](#cài-đặt)
3. [Tạo Bot trên Discord](#tạo-bot-trên-discord)
4. [Lấy API Key của Gemini từ AI Studio](#lấy-api-key-của-gemini-từ-ai-studio)
5. [Cấu hình Bot](#cấu-hình-bot)
6. [Chạy Bot](#chạy-bot)

## Giới thiệu
Bot này được thiết kế để tương tác với người dùng trên Discord, sử dụng API của Google Generative AI để tạo ra các phản hồi thông minh và tự nhiên.

## Cài đặt
1. Clone repository này về máy của bạn:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Cài đặt các dependencies:
    ```sh
    npm install
    ```

## Cấu hình Bot
Tạo một file `.env` trong thư mục gốc từ `.env-template` và điền các thông tin cần thiết

## Tạo Bot trên Discord
1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications).
2. Nhấn vào nút "New Application" và đặt tên cho ứng dụng của bạn.
3. Trong trang ứng dụng, chọn tab "Bot" và nhấn "Add Bot".
4. Sao chép token của bot và dán vào file `.env`:
    ```env
    TOKEN_BOT = <TOKEN_APPLICATION_BOT_DISCORD>
    APP_ID = <ID_APPLICATION_BOT_DISCORD>
    PUBLIC_KEY = <PUBLIC_KEY_APPLICATION_BOT_DISCORD>
    ```

## Lấy API Key của Gemini từ AI Studio
1. Truy cập [AI Studio của Google](https://aistudio.google.com).
2. Đăng nhập bằng tài khoản Google của bạn.
3. Tạo một dự án mới hoặc chọn một dự án hiện có.
4. Truy cập phần "API & Services" và tạo một API key.
5. Sao chép API key và dán vào file `.env`:
    ```env
    GEMINI_API_KEY = <GEMINI_API_KEY>
    ```
## Chạy Bot
1. Chạy bot bằng lệnh:
    ```sh
    npm start
    ```

Bot của bạn bây giờ sẽ hoạt động trên Discord và sử dụng API của Google Generative AI để tạo ra các phản hồi thông minh.

## Ghi chú
- Đảm bảo rằng tất cả các dependencies đã được cài đặt và cấu hình đúng.
- Nếu gặp bất kỳ lỗi nào, kiểm tra lại các bước cấu hình và đảm bảo rằng các thông tin như token và API key đã được nhập đúng.
