const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/bigqueryService');

router.get('/stock-availability', async (req, res) => {
  const {
    search = '',
    platforms = [],
    date_from,
    date_to,
    page = 1,
    pageSize = 10,
    metrics = []
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
      product_id AS PRODUCT_ID,
      product_name AS PRODUCT_NAME,
      platform AS PLATFORM,
      city_name AS CITY_NAME,
      internal_client_id AS INTERNAL_CLIENT_ID,
      internal_product_id AS INTERNAL_PRODUCT_ID,
      internal_product_name AS INTERNAL_PRODUCT_NAME,
      internal_brand_name AS INTERNAL_BRAND_NAME,
      product_packsize AS PRODUCT_PACKSIZE,
      product_type AS PRODUCT_TYPE,
      category AS CATEGORY,
      sub_category AS SUB_CATEGORY,
      MAX(maximum_retail_price) AS MAXIMUM_RETAIL_PRICE,
      MAX(final_price) AS FINAL_PRICE,
      MAX(benchmark_selling_price) AS BENCHMARK_SELLING_PRICE,
      MAX(price_band) AS PRICE_BAND,
      SUM(total_stock) AS TOTAL_STOCK,
      SUM(instock_darkstores) AS INSTOCK_DARKSTORES,
      SUM(oos_darkstores) AS OOS_DARKSTORES,
      SUM(inactive_darkstores) AS INACTIVE_DARKSTORES,
      SUM(total_darkstores) AS TOTAL_DARKSTORES,
      SUM(units_sold) AS UNITS_SOLD,
      SUM(final_revenue) AS FINAL_REVENUE,
      SUM(stock_at_darkstores) AS STOCK_AT_DARKSTORES,
      SUM(stock_at_warehouses) AS STOCK_AT_WAREHOUSES,
      SUM(units_sold_l30d_drr) AS UNITS_SOLD_L30D_DRR,
      SUM(final_revenue_l30d_drr) AS FINAL_REVENUE_L30D_DRR
    FROM \`hackathon-458706.dataset.city-product_sales_stock_price_combined\`
    ${whereClause}
    GROUP BY 
      product_id, product_name, platform, city_name, internal_client_id,
      internal_product_id, internal_product_name, internal_brand_name, 
      product_packsize, product_type, category, sub_category
    ORDER BY product_id
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
