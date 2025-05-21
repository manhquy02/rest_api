const axios = require('axios');
const db = require('./db');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    // Lấy danh sách tỉnh
    const provincesRes = await axios.get('https://api.vnappmob.com/api/v2/province/');
    const provinces = provincesRes.data.results;

    for (const province of provinces) {
      const [provinceResult] = await db.execute(
        'INSERT INTO provinces (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [province.province_id, province.province_name]
      );
      const provinceId = province.province_id;

      // Lấy danh sách huyện theo tỉnh
      const districtsRes = await axios.get(`https://vapi.vnappmob.com/api/v2/province/district/${provinceId}`);
      await delay(300); // nghỉ tránh gọi API liên tục
      const districts = districtsRes.data.results;

      for (const district of districts) {
        const [districtResult] = await db.execute(
          'INSERT INTO districts (code, name, province_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
          [district.district_id, district.district_name, provinceId]
        );
        const districtId = district.district_id;

        try {
          // Lấy danh sách xã theo huyện
          const wardsRes = await axios.get(`https://vapi.vnappmob.com/api/v2/province/ward/${districtId}`);
          await delay(300); // nghỉ tiếp giữa các huyện
          const wards = wardsRes.data.results;

          console.log(`📍 ${district.district_name} (${districtId}) có ${wards.length} xã`);

          for (const ward of wards) {
            try {
              await db.execute(
                'INSERT INTO wards (code, name, district_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
                [ward.ward_id, ward.ward_name, districtId]
              );
            } catch (wardErr) {
              console.error(`❌ Lỗi chèn xã ${ward.ward_name} (${ward.ward_id}):`, wardErr.message);
            }
          }
        } catch (wardApiErr) {
          console.error(`🚫 Lỗi gọi API xã của huyện ${district.district_name} (${districtId}):`, wardApiErr.message);
        }
      }

      console.log(`✅ Đã chèn xong tỉnh: ${province.province_name}`);
    }

    console.log('🎉 Đã hoàn thành toàn bộ việc import dữ liệu!');
  } catch (error) {
    console.log('❌ Lỗi tổng:', error.message);
  } finally {
    await db.end();
  }
})();
