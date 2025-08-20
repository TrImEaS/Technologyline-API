const { ADMINPool } = require('../config.js');

exports.addBrandForCarousel = async ({ id_brand, image_path, active }) => {
  const query = 'INSERT INTO brands_carousel (brand_id, image_path, active, created_at) VALUES (?, ?, ?, NOW())';
  const values = [id_brand, image_path, active || 1];
  const [result] = await ADMINPool.query(query, values);
  return {
    id: result.insertId,
    brand_id: id_brand,
    image_path,
    active: active || 1,
    created_at: new Date().toISOString()
  };
};
