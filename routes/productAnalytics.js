const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/bigqueryService');

router.get('/product-analytics', async (req, res) => {
  const {
    search = '',
    platforms = [],
    date_from,
    date_to,
    page = 1,
    pageSize = 10,
    sortBy = 'total_final_revenue',
    sortOrder = 'desc'
  } = req.query;

  const offset = (page - 1) * pageSize;

  let filters = [`date BETWEEN '${date_from}' AND '${date_to}'`];

  if (platforms.length) {
    const platformList = platforms.map(p => `'${p}'`).join(',');
    filters.push(`platform IN (${platformList})`);
  }

  if (search) filters.push(`product_name LIKE '%${search}%'`);

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const query = `
    SELECT 
      date AS DATE,
      Internal_Client_ID AS INTERNAL_CLIENT_ID,
      product_id AS PRODUCT_ID,
      product_name AS PRODUCT_NAME,
      brand_name AS BRAND_NAME,
      scrape_account_name AS SCRAPE_ACCOUNT_NAME,
      SUM(total_orders) AS TOTAL_ORDERS,
      SUM(total_mrp_revenue) AS TOTAL_MRP_REVENUE,
      SUM(total_final_revenue) AS TOTAL_FINAL_REVENUE,
      SUM(stock_at_darkstores) AS STOCK_AT_DARKSTORES,
      SUM(stock_at_warehouses) AS STOCK_AT_WAREHOUSES,
      SUM(ad_spend) AS TOTAL_AD_SPEND,
      SUM(ad_impressions) AS TOTAL_AD_IMPRESSIONS,
      SUM(ad_clicks) AS TOTAL_AD_CLICKS,
      SUM(ad_add_to_carts) AS TOTAL_AD_ADD_TO_CARTS,
      SUM(ad_orders) AS TOTAL_AD_ORDERS,
      SUM(ad_orders_othersku) AS TOTAL_AD_ORDERS_OTHERSKU,
      SUM(ad_orders_samesku) AS TOTAL_AD_ORDERS_SAMESKU,
      SUM(ad_revenue) AS TOTAL_AD_REVENUE,
      bundle_id AS BUNDLE_ID,
      product_image AS PRODUCT_IMAGE,
      internal_product_id AS INTERNAL_PRODUCT_ID,
      internal_product_name AS INTERNAL_PRODUCT_NAME,
      product_type AS PRODUCT_TYPE,
      category_name AS CATEGORY_NAME,
      subcategory_name AS SUBCATEGORY_NAME,
      MAX(maximum_retail_price) AS MAXIMUM_RETAIL_PRICE,
      MAX(discounted_selling_price) AS DISCOUNTED_SELLING_PRICE,
      platform AS PLATFORM
    FROM \`hackathon-458706.dataset.product_sales_stock_price_combined\`
    ${whereClause}
    GROUP BY 
      date, Internal_Client_ID, product_id, product_name, brand_name, scrape_account_name,
      bundle_id, product_image, internal_product_id, internal_product_name, product_type,
      category_name, subcategory_name, platform
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  try {
    const results = await runQuery(query);
    res.json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
