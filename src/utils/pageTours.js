/**
 * Centralized guided tour step definitions for all pages.
 * Each function receives the `t` (i18n translate) function and returns an array of step objects.
 *
 * Step object: { target: 'data-tour-id', title: string, content: string, placement: 'bottom'|'top'|'left'|'right' }
 */

export const pageTours = {
  // ==================== Dashboard ====================
  dashboard: (t) => [
    {
      target: 'dashboard-header',
      title: t('tour.dashboard_header_title', 'Welcome to Your Dashboard'),
      content: t('tour.dashboard_header_content', 'This is your central hub. Here you can monitor sales, track inventory, and view key business metrics at a glance.'),
      placement: 'bottom',
    },
    {
      target: 'dashboard-stats',
      title: t('tour.dashboard_stats_title', 'Key Performance Metrics'),
      content: t('tour.dashboard_stats_content', 'These cards show your most important numbers: daily sales, inventory value, product count, and more. Tap any card to explore further.'),
      placement: 'bottom',
    },
    {
      target: 'dashboard-chart',
      title: t('tour.dashboard_chart_title', 'Sales Trend Chart'),
      content: t('tour.dashboard_chart_content', 'This interactive chart shows your sales performance over the selected period. Hover over data points to see detailed values.'),
      placement: 'top',
    },
    {
      target: 'dashboard-products',
      title: t('tour.dashboard_products_title', 'Popular Products'),
      content: t('tour.dashboard_products_content', 'Your best-selling products are listed here. Use this insight to optimize your inventory and promotions.'),
      placement: 'top',
    },
  ],

  // ==================== POS ====================
  pos: (t) => [
    {
      target: 'pos-search',
      title: t('tour.pos_search_title', 'Search Products'),
      content: t('tour.pos_search_content', 'Quickly find products by name or barcode. Type here to filter the product grid below in real time.'),
      placement: 'bottom',
    },
    {
      target: 'pos-categories',
      title: t('tour.pos_categories_title', 'Browse by Category'),
      content: t('tour.pos_categories_content', 'Filter products by category. Tap "All" to see everything, or select a specific category to narrow down.'),
      placement: 'bottom',
    },
    {
      target: 'pos-product-grid',
      title: t('tour.pos_grid_title', 'Product Selection'),
      content: t('tour.pos_grid_content', 'Tap any product card to add it to the shopping cart. Products with variants will show a selection popup.'),
      placement: 'right',
    },
    {
      target: 'pos-cart',
      title: t('tour.pos_cart_title', 'Shopping Cart'),
      content: t('tour.pos_cart_content', 'All selected items appear here. You can adjust quantities, remove items, select a customer, apply discounts, and set the order date.'),
      placement: 'left',
    },
    {
      target: 'pos-checkout',
      title: t('tour.pos_checkout_title', 'Complete the Sale'),
      content: t('tour.pos_checkout_content', 'When ready, click "Checkout Now" to process the payment and create the order. Use "Hold Order" to save it for later.'),
      placement: 'top',
    },
  ],

  // ==================== Products ====================
  products: (t) => [
    {
      target: 'products-search',
      title: t('tour.products_search_title', 'Find Products'),
      content: t('tour.products_search_content', 'Search by product name, SKU, or barcode to quickly locate items in your catalog.'),
      placement: 'bottom',
    },
    {
      target: 'products-add',
      title: t('tour.products_add_title', 'Add New Product'),
      content: t('tour.products_add_content', 'Click here to create a new product. Fill in the name, price, SKU, category, and optional image to add it to your catalog.'),
      placement: 'bottom',
    },
    {
      target: 'products-import-export',
      title: t('tour.products_import_title', 'Import & Export'),
      content: t('tour.products_import_content', 'Use Import CSV to bulk-add products from a spreadsheet. Export CSV downloads your full catalog for offline editing or backup.'),
      placement: 'bottom',
    },
    {
      target: 'products-table',
      title: t('tour.products_table_title', 'Product List'),
      content: t('tour.products_table_content', 'This table shows all your products with SKU, name, price, stock level, and category. Click the edit icon to modify a product. Use the checkbox to select items for bulk deletion.'),
      placement: 'top',
    },
  ],

  // ==================== Orders ====================
  orders: (t) => [
    {
      target: 'orders-tabs',
      title: t('tour.orders_tabs_title', 'Filter by Status'),
      content: t('tour.orders_tabs_content', 'Switch between All, Paid, Partial Return, Returned, and Cancelled orders to quickly find what you need.'),
      placement: 'bottom',
    },
    {
      target: 'orders-date',
      title: t('tour.orders_date_title', 'Date Range Filter'),
      content: t('tour.orders_date_content', 'Narrow down orders by selecting a start and end date. Useful for daily reconciliation and period-end reports.'),
      placement: 'bottom',
    },
    {
      target: 'orders-table',
      title: t('tour.orders_table_title', 'Order List'),
      content: t('tour.orders_table_content', 'Each row shows the order number, customer, amount, status, and creation time. Click the eye icon to view full order details.'),
      placement: 'top',
    },
    {
      target: 'orders-export',
      title: t('tour.orders_export_title', 'Export Orders'),
      content: t('tour.orders_export_content', 'Download your order data as a CSV summary file for accounting or further analysis in a spreadsheet.'),
      placement: 'bottom',
    },
  ],

  // ==================== Customers ====================
  customers: (t) => [
    {
      target: 'customers-search',
      title: t('tour.customers_search_title', 'Search Customers'),
      content: t('tour.customers_search_content', 'Look up customers by name or phone number. Results update as you type.'),
      placement: 'bottom',
    },
    {
      target: 'customers-add',
      title: t('tour.customers_add_title', 'Add New Customer'),
      content: t('tour.customers_add_content', 'Register a new customer with their name, phone, email, and address. Customer records help track purchase history and loyalty points.'),
      placement: 'bottom',
    },
    {
      target: 'customers-table',
      title: t('tour.customers_table_title', 'Customer List'),
      content: t('tour.customers_table_content', 'View all registered customers. Click the edit icon to update their details. Use the checkbox to select customers for bulk deletion.'),
      placement: 'top',
    },
  ],

  // ==================== Suppliers ====================
  suppliers: (t) => [
    {
      target: 'suppliers-search',
      title: t('tour.suppliers_search_title', 'Find Suppliers'),
      content: t('tour.suppliers_search_content', 'Search your supplier directory by name to quickly locate contact information.'),
      placement: 'bottom',
    },
    {
      target: 'suppliers-add',
      title: t('tour.suppliers_add_title', 'Add New Supplier'),
      content: t('tour.suppliers_add_content', 'Register a new supplier with their company name, contact person, phone, email, and address.'),
      placement: 'bottom',
    },
    {
      target: 'suppliers-grid',
      title: t('tour.suppliers_grid_title', 'Supplier Cards'),
      content: t('tour.suppliers_grid_content', 'Each card displays a supplier\'s key information. Use the edit and delete buttons to manage supplier records.'),
      placement: 'top',
    },
  ],

  // ==================== Purchase Orders ====================
  purchaseOrders: (t) => [
    {
      target: 'po-search',
      title: t('tour.po_search_title', 'Search Purchase Orders'),
      content: t('tour.po_search_content', 'Find purchase orders by supplier name or order number.'),
      placement: 'bottom',
    },
    {
      target: 'po-add',
      title: t('tour.po_add_title', 'Create Purchase Order'),
      content: t('tour.po_add_content', 'Initiate a new purchase order to restock inventory from your suppliers. Select a supplier, add products, and set quantities.'),
      placement: 'bottom',
    },
    {
      target: 'po-table',
      title: t('tour.po_table_title', 'Purchase Order List'),
      content: t('tour.po_table_content', 'Track all your purchase orders with their status (pending, received, cancelled), total amount, and creation date.'),
      placement: 'top',
    },
  ],

  // ==================== Inventory Counts ====================
  inventoryCounts: (t) => [
    {
      target: 'inv-search',
      title: t('tour.inv_search_title', 'Search Inventory'),
      content: t('tour.inv_search_content', 'Quickly find products in your inventory by name or SKU.'),
      placement: 'bottom',
    },
    {
      target: 'inv-add',
      title: t('tour.inv_add_title', 'New Inventory Count'),
      content: t('tour.inv_add_content', 'Start a new stock count session. Select products, enter actual quantities, and submit to reconcile your inventory.'),
      placement: 'bottom',
    },
    {
      target: 'inv-table',
      title: t('tour.inv_table_title', 'Inventory Records'),
      content: t('tour.inv_table_content', 'View all past inventory count sessions, including date, products counted, and any discrepancies found.'),
      placement: 'top',
    },
  ],

  // ==================== Staff Management ====================
  staffManagement: (t) => [
    {
      target: 'staff-search',
      title: t('tour.staff_search_title', 'Search Staff'),
      content: t('tour.staff_search_content', 'Find team members by name, email, or role.'),
      placement: 'bottom',
    },
    {
      target: 'staff-add',
      title: t('tour.staff_add_title', 'Add Team Member'),
      content: t('tour.staff_add_content', 'Invite a new staff member. Set their role, permissions, and assigned store to control what they can access.'),
      placement: 'bottom',
    },
    {
      target: 'staff-table',
      title: t('tour.staff_table_title', 'Staff List'),
      content: t('tour.staff_table_content', 'Manage your team: view roles, update permissions, or remove members. Each row shows name, email, role, and assigned store.'),
      placement: 'top',
    },
  ],

  // ==================== Timecards ====================
  timecards: (t) => [
    {
      target: 'tc-search',
      title: t('tour.tc_search_title', 'Search Time Records'),
      content: t('tour.tc_search_content', 'Find timecard entries by staff name or date range.'),
      placement: 'bottom',
    },
    {
      target: 'tc-add',
      title: t('tour.tc_add_title', 'Add Time Entry'),
      content: t('tour.tc_add_content', 'Manually record a clock-in/clock-out entry for a staff member. Great for correcting missed punches.'),
      placement: 'bottom',
    },
    {
      target: 'tc-table',
      title: t('tour.tc_table_title', 'Timecard Records'),
      content: t('tour.tc_table_content', 'View all clock-in/out records. Track hours worked, shifts, and monitor attendance across your team.'),
      placement: 'top',
    },
  ],

  // ==================== Discounts ====================
  discounts: (t) => [
    {
      target: 'disc-search',
      title: t('tour.disc_search_title', 'Search Discounts'),
      content: t('tour.disc_search_content', 'Find discount rules by name or type.'),
      placement: 'bottom',
    },
    {
      target: 'disc-add',
      title: t('tour.disc_add_title', 'Create Discount'),
      content: t('tour.disc_add_content', 'Set up a new discount rule: choose percentage or fixed amount, set conditions, and specify which products or categories it applies to.'),
      placement: 'bottom',
    },
    {
      target: 'disc-table',
      title: t('tour.disc_table_title', 'Discount List'),
      content: t('tour.disc_table_content', 'Manage all your active and inactive discounts. Edit rules or delete ones you no longer need.'),
      placement: 'top',
    },
  ],

  // ==================== Revenue Report ====================
  revenueReport: (t) => [
    {
      target: 'rev-filter',
      title: t('tour.rev_filter_title', 'Date Filters'),
      content: t('tour.rev_filter_content', 'Select a date range to view revenue data for a specific period. Use preset ranges or custom dates.'),
      placement: 'bottom',
    },
    {
      target: 'rev-summary',
      title: t('tour.rev_summary_title', 'Revenue Summary'),
      content: t('tour.rev_summary_content', 'Quick overview of total revenue, number of orders, average order value, and refunds for the selected period.'),
      placement: 'bottom',
    },
    {
      target: 'rev-export',
      title: t('tour.rev_export_title', 'Export Report'),
      content: t('tour.rev_export_content', 'Download the revenue report as CSV or PDF for accounting, tax filing, or sharing with stakeholders.'),
      placement: 'bottom',
    },
  ],

  // ==================== Staff Reports ====================
  staffReports: (t) => [
    {
      target: 'sr-filter',
      title: t('tour.sr_filter_title', 'Filter Reports'),
      content: t('tour.sr_filter_content', 'Select a date range and optionally filter by a specific staff member to view individual performance.'),
      placement: 'bottom',
    },
    {
      target: 'sr-table',
      title: t('tour.sr_table_title', 'Staff Performance'),
      content: t('tour.sr_table_content', 'View each staff member\'s sales totals, number of orders, average order value, and total hours worked.'),
      placement: 'top',
    },
    {
      target: 'sr-export',
      title: t('tour.sr_export_title', 'Export Report'),
      content: t('tour.sr_export_content', 'Download staff performance data as CSV for payroll processing or performance reviews.'),
      placement: 'bottom',
    },
  ],

  // ==================== Settings ====================
  settings: (t) => [
    {
      target: 'settings-tabs',
      title: t('tour.settings_tabs_title', 'Settings Categories'),
      content: t('tour.settings_tabs_content', 'Browse through different settings categories using these tabs. Each tab contains configuration options for a specific area of your POS system.'),
      placement: 'bottom',
    },
    {
      target: 'settings-content',
      title: t('tour.settings_content_title', 'Configuration Panel'),
      content: t('tour.settings_content_content', 'Adjust your settings here. Changes are saved automatically or by clicking the save button at the bottom of each section.'),
      placement: 'top',
    },
  ],

  // ==================== Developer Settings ====================
  developerSettings: (t) => [
    {
      target: 'dev-imports',
      title: t('tour.dev_imports_title', 'Data Import'),
      content: t('tour.dev_imports_content', 'Import data from Loyverse CSV exports. Select a category to import: products, orders/receipts, customers, payments, or store configuration.'),
      placement: 'bottom',
    },
    {
      target: 'dev-api',
      title: t('tour.dev_api_title', 'API Access'),
      content: t('tour.dev_api_content', 'Manage your API keys here. Generate, view, and revoke keys for integrating external applications with your POS system.'),
      placement: 'top',
    },
  ],

  // ==================== Receipts Report ====================
  receiptsReport: (t) => [
    {
      target: 'receipts-table',
      title: t('tour.receipts_table_title', 'Receipt List'),
      content: t('tour.receipts_table_content', 'View all imported receipts. Click a row to see detailed receipt information on the right panel.'),
      placement: 'bottom',
    },
    {
      target: 'receipts-detail',
      title: t('tour.receipts_detail_title', 'Receipt Details'),
      content: t('tour.receipts_detail_content', 'Full receipt breakdown including items, amounts, payment method, and status. Use the print button to print a receipt copy.'),
      placement: 'left',
    },
  ],
};
