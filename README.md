# React + Vite

Context: 我正在開發一個 React + Vite 的 POS 前端，後端 API 規範如下：

User Role: role: 1 是開發者，role: 6 是店員。

Auth Handling: 使用 Axios Interceptor 處理 401 (重新登入) 與 402 (租戶過期)。

Data Scope: 訂單資料包含 items 陣列（內含 priceSnapshot 與 qty）。

Task: 請幫我建立一個「訂單列表頁面」，需包含：

根據 Order.status 顯示不同的 Badge 顏色。

如果 req.user.role > 4，則隱藏「刪除訂單」按鈕。

串接 /api/orders 並實作分頁。

技術棧要求
框架: React 18+ (Vite)

狀態管理: 建議使用 React Query (TanStack Query) 來處理後端頻繁的庫存與訂單更新，並配合快取機制。

樣式: Tailwind CSS。

API Client: Axios (需設定 withCredentials 與攔截器)。

錯誤代碼定義 (Error Codes)
401: 未授權 / Token 過期。

402: 租戶欠費/到期（進入受限模式）。

403: 帳號停用或權限等級不足。

404: 找不到資源（例如租戶資料遺失）。