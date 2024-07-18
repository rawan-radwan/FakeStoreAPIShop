let products = [];
let cart = [];
let filteredProducts = []; // Array to hold filtered products
let currentPage = 1; // Current page number
const itemsPerPage = 4; // Number of items per page

// Fetch products and categories once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchCategories();
});

// Fetch products from the API
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('Product fetch failed');
        products = await response.json(); // Store the fetched products in the products array
        filteredProducts = products.slice(); // Initially, filtered products are the same as all products
        displayProducts(filteredProducts); // Display the fetched products
    } catch (error) {
        console.error(error); // Log any errors to the console
    }
}

// Fetch product categories from the API
async function fetchCategories() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        if (!response.ok) throw new Error('Categories fetch failed');
        const categories = await response.json(); // Store the fetched categories
        const categoryFilter = document.getElementById('categoryFilter');
        // Populate the category filter dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error(error); // Log any errors to the console
    }
}

function displayProducts(displayedProducts) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = displayedProducts.slice(startIndex, endIndex);

    paginatedProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="product-details">
                <h2>${product.title}</h2>
                <p>Price: $${product.price}</p>
                <p>Category: ${product.category}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        resultsContainer.appendChild(productItem); // Add product item to the results container
    });

    // Update the page number display
    document.getElementById('pageNumber').textContent = currentPage;

    // Enable or disable pagination buttons
    document.querySelector('.pagination button:first-child').disabled = currentPage === 1;
    document.querySelector('.pagination button:last-child').disabled = endIndex >= displayedProducts.length;
}


// // Search products based on the search term
// function searchProducts() {
//     const searchTerm = document.getElementById('searchInput').value.toLowerCase();
//     // Filter products based on the search term
//     filteredProducts = products.filter(product => product.title.toLowerCase().includes(searchTerm));
//     currentPage = 1; // Reset to the first page
//     displayProducts(filteredProducts); // Display the filtered products
// }

// Apply filters and sorting to the products
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const sortOrder = document.getElementById('sortOrder').value;

    // Filter products based on category and price range
    filteredProducts = products.filter(product => {
        return (category === '' || product.category === category) &&
               product.price >= minPrice &&
               product.price <= maxPrice &&
               product.title.toLowerCase().includes(searchTerm);
    });

    // Sort products based on the selected sorting order
    if (sortOrder === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'alpha') {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    }

    currentPage = 1; // Reset to the first page
    displayProducts(filteredProducts); // Display the filtered and sorted products
}

// Pagination: Go to the previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts(filteredProducts); // Display products for the previous page
    }
}

// Pagination: Go to the next page
function nextPage() {
    if (currentPage * itemsPerPage < filteredProducts.length) {
        currentPage++;
        displayProducts(filteredProducts); // Display products for the next page
    }
}

// Add a product to the cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId); // Find the product by its ID
    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem) {
        cartItem.quantity++; // If product is already in the cart, increase its quantity
    } else {
        cart.push({ product, quantity: 1 }); // Otherwise, add the product to the cart with quantity 1
    }
    updateCart(); // Update the cart display
}

// Remove a product from the cart
function removeFromCart(productId) {
    const cartItemIndex = cart.findIndex(item => item.product.id === productId);
    if (cartItemIndex !== -1) {
        cart.splice(cartItemIndex, 1); // Remove the product from the cart
    }
    updateCart(); // Update the cart display
}

// Update the cart display
function updateCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = ''; // Clear previous cart items
    let totalPrice = 0;
    let totalQuantity = 0;
    const ul = document.createElement('ul'); // Create a new unordered list
    cart.forEach(({ product, quantity }) => {
        const cartItem = document.createElement('li'); // Create a new list item
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            ${product.title} - $${product.price} 
            <button onclick="removeFromCart(${product.id})">Remove</button>
        `;
        ul.appendChild(cartItem); // Add cart item to the unordered list
        totalPrice += product.price * quantity; // Calculate the total price
        totalQuantity += quantity; // Calculate the total quantity
    });
    cartItemsContainer.appendChild(ul); // Append the unordered list to the cart container
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2); // Update the total price display
    document.getElementById('cartTotalQuantity').textContent = totalQuantity; // Update the total quantity display
}
