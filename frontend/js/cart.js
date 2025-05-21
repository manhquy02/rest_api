$(document).ready(function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let tbody = $('#cart-table tbody');

    function renderCart() {
        tbody.empty();
        cart.forEach((item, index) => {
            if (!item.quantity || item.quantity <= 0) return;
            tbody.append(`
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.price.toLocaleString()}</td>
                        <td>${item.quantity}</td>
                        <td><button class="btn btn-danger btn-sm delete-btn">Xóa</button></td>
                    </tr>
                `)
        });
    }
    renderCart();

    $('#cart-table').on('click', '.delete-btn', function () {
        let index = $(this).closest('tr').data('index');
        if (confirm('Bạn có muốn xóa')) {
            cart.splice(index, 1),
                localStorage.setItem('cart', JSON.stringify(cart));
            renderCart()
        };
    })


    $('#cart-btn').on('click', function () {
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Đơn hàng được lưu')

    })

})