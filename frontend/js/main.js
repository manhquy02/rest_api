
$(document).ready(function () {

    // const user = localStorage.getItem('user');

    // if(user){
    //     const logoutBtn = `<a href="#" id="logout" title="Đăng xuất"><i class="bi bi-box-arrow-right fs-4"></i></a>`;
    //     $('#auth-buttons').html(logoutBtn)
    // }else{
    //     const loginRegisterBtns=`
    //         <a href="register.html" title="Đăng ký"><i class="bi bi-person-plus fs-4"></i></a>
    //         <a href="login.html" title="Đăng nhập"><i class="bi bi-box-arrow-in-right fs-4"></i></a>
    //     `;
    //     $('#auth-buttons').html(loginRegisterBtns);
    // }
    // $(document).on('click','#logout',function(e){
    //     e.preventDefault();
    //     localStorage.removeItem('user');
    //     localStorage.removeItem('access_token')
    //     location.reload();
    // })

    let currentPage = 1;
    const limit = 6;
    function loadProducts(page) {
        $.get(`http://localhost:5555/products?page=${page}&limit=${limit}`, function (data) {
            let products = data.data;
            let total = data.pagination.total_pages;
            let apiCurrentPage = data.pagination.current_page;
            totalPages = total;
            let html = '';
            products.forEach(function (product) {
                html += `
                            <div class="col-md-4">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.name_product}</h5>
                                        <p class="card-text">Giá: ${product.price.toLocaleString()}₫</p>
                                        <div class="mb-3">
                                            <label class="form-label">Số lượng:</label>
                                            <input type="number" value="1" min="1" class="form-control quantity" />
                                        </div>
                                        <button 
                                            class="btn btn-primary add-to-cart" 
                                            data-productid="${product.id}" 
                                            data-name="${product.name_product}" 
                                            data-price="${product.price}">
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                </div>
                            </div>`;
            });

            $('#product-list').html(html);
            renderPagination(totalPages, apiCurrentPage);
        });
    }
    function renderPagination(totalPages, currentPage) {
        let html = '';
        if (currentPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">Trước</a></li>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            html += `
                            <li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                            </li>`;
        }
        if (currentPage < totalPages) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">Sau</a></li>`;
        }

        $('#pagination').html(html);
    }
    loadProducts(currentPage);
    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();
        const selectedPage = parseInt($(this).data('page'));
        if (selectedPage !== currentPage) {
            currentPage = selectedPage;
            loadProducts(currentPage);
        }
    });

    $(document).on('click', '.add-to-cart', function () {
        const productId = $(this).data('productid');
        const name = $(this).data('name');
        const price = $(this).data('price');
        const quantity = parseInt($(this).closest('.card-body').find('.quantity').val());


        if (isNaN(quantity) || quantity <= 0) {
            alert('Vui lòng nhập số lượng hợp lệ!');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let exists = cart.find(item => item.product_id === productId);
        if (exists) {
            exists.quantity += parseInt(quantity);
        } else {
            cart.push({
                product_id: productId,
                name: name,
                price: price,
                quantity: quantity
            })
        }
        localStorage.setItem('cart', JSON.stringify(cart))
        alert('Đã thêm vào giỏ hàng')
        console.log(cart);
        console.log(localStorage.getItem('cart'));
    });

    $('#search-name').click(function () {
        const keyword = $('#search-product').val().trim();
        if (keyword === '') {
            alert('Vui lòng nhập từ khóa');
            return;
        }
        $.get(`http://localhost:5555/products/search?name_product=${encodeURIComponent(keyword)}`, function (response) {

            if (Array.isArray(response.data)) {
                let html = '';
                response.data.forEach(function (product) {
                    html += `
                                <div class="col-md-4">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h5 class="card-title">${product.name_product}</h5>
                                            <p class="card-text">Giá: ${product.price.toLocaleString()}₫</p>
                                            <div class="mb-3">
                                                <label class="form-label">Số lượng:</label>
                                                <input type="number" value="1" min="1" class="form-control quantity" />
                                            </div>
                                            <button 
                                                class="btn btn-primary add-to-cart" 
                                                data-productid="${product.id}" 
                                                data-name="${product.name_product}" 
                                                data-price="${product.price}">
                                                Thêm vào giỏ hàng
                                            </button>
                                        </div>
                                    </div>
                                </div>`;
                })
                $('#product-list').html(html);
                $('#pagination').hide();
            } else {
                $('#product-list').html('<p>Không tìm thấy sản phẩm.</p>');
                $('#pagination').hide();
            }
        })
    });
})
