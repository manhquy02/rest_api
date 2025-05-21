const cart = JSON.parse(localStorage.getItem('cart') || []);
let total = 0;
const tbody = $('#cart-table tbody');

cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    tbody.append(`
        <tr>
          <td>${item.name}</td>
          <td>${item.price.toLocaleString()}</td>
          <td>${item.quantity}</td>
          <td>${itemTotal.toLocaleString()}</td>
        </tr>
      `)
})
$('#total-amount').text(`Tổng : ${total.toLocaleString()}`)



$.get(`http://localhost:5555/provinces`, function (res) {
    res.data.forEach(p => {
        $('#province-select').append(`<option value = "${p.code}">${p.name}</option>`);
    });
})

$('#province-select').on('change', function () {
    const provinceId = $(this).val();
    $('#district-select').html(`<option value = "">Quận huyện</option>`)
    $('#ward-select').html(`<option value = "">Phường xã</option>`).prop('disabled', true);
    if (!provinceId) {
        $('#district-select').prop('disabled', true);
        return;
    }
    $('#district-select').prop('disabled', false);
    $.get(`http://localhost:5555/districts?province_id=${provinceId}`, function (res) {
        console.log('Wards response:', res);
        res.data.forEach(d => {
            $('#district-select').append(`<option value="${d.code}">${d.name}</option>`)
        });
        $('#district-select').prop('disabled', false);
    });

});



$('#district-select').on('change', function () {
    const districtId = $(this).val();
    $('#ward-select').html(`<option value = "">Phường xã</option>`)
    if (!districtId) {
        $('#ward-select').prop('disabled', true);
        return;
    }
    $('#ward-select').prop('disabled', false);
    $.get(`http://localhost:5555/wards?district_id=${districtId}`, function (res) {

        res.data.forEach(w => {
            $('#ward-select').append(`<option value="${w.code}">${w.name}</option>`)
        })
        $('#ward-select').prop('disabled', false);
    })

})
$('#submit-order').on('click', function () {
    const province_code = $('#province-select').val();
    const district_code = $('#district-select').val();
    const ward_code = $('#ward-select').val();
    const phone = $('#phone').val().trim();
    const detail_address = $('#address').val().trim();
    const province = $('#province-select option:selected').text();
    const district = $('#district-select option:selected').text();
    const ward = $('#ward-select option:selected').text();


    if (!phone || !detail_address) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }));
    if (items.length === 0) {
        alert('Giỏ hàng trống')
        return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Bạn chưa đăng nhập')
        return;
    }
    console.log('Items:', items);
    $.ajax({
        url: 'http://localhost:5555/orders',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: JSON.stringify({
            phone,
            detail_address,
            province_code,
            district_code,
            ward_code,
            items
        }),
        success: function (res) {
            if (res.result === 1) {
                alert('Đặt hàng thành công')
                localStorage.removeItem('cart');
                location.reload();
            } else {
                alert('Lỗi' + res.message);
            }
        },
        error: function () {
            alert('Có lỗi xảy ra')
        }
    })
})