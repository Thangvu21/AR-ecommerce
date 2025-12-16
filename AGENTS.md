### tích hợp module ar tryon
sửa lại file face.tsx:
- để tích hợp hook useAREngine với các thay đổi mới nhất của module
- mã hiện tại đang chưa dùng url model 3d mà dùng ảnh thumb, hãy sửa lại: luôn là 3d nếu có url từ api
- triển khai các placeholder features chưa được triển khai trong trang này nếu có thể. nếu hook ar chưa cung cấp tính năng thì bỏ qua.
- optimize toàn bộ mã face.tsx để đảm bảo dễ đọc và bảo trì.
- tham khảo một vài triển khai trong src/app/(ar-test)/ar-inte/page.tsx
- viết docs tổng hợp thay đổi và những tính nănng chưa triển khai được (nếu có)