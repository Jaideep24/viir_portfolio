// Sample blog data
const sampleBlogs = [
    {
        id: 1,
        title: "Getting Started with JavaScript ES6",
        excerpt: "Learn the latest features of JavaScript ES6 including arrow functions, destructuring, and modules.",
        content: `<p>JavaScript ES6 (ECMAScript 2015) introduced many powerful features that make writing JavaScript more efficient and elegant. In this comprehensive guide, we'll explore the most important features you need to know.</p>

<h3>Arrow Functions</h3>
<p>Arrow functions provide a more concise way to write functions and automatically bind the 'this' context.</p>

<h3>Destructuring</h3>
<p>Destructuring allows you to extract values from arrays and objects in a clean, readable way.</p>

<h3>Modules</h3>
<p>ES6 modules make it easy to organize and share code between different files.</p>`,
        category: "technology",
        author: "John Doe",
        date: "2024-12-10",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=400&fit=crop",
        likes: 15,
        comments: [
            {
                id: 1,
                author: "Alice Smith",
                date: "2024-12-11",
                content: "Great explanation of ES6 features! Very helpful for beginners."
            },
            {
                id: 2,
                author: "Bob Johnson",
                date: "2024-12-12",
                content: "I love the arrow function examples. Made it much clearer!"
            }
        ]
    },
    {
        id: 2,
        title: "Minimalist Living: A Guide to Decluttering",
        excerpt: "Discover the benefits of minimalist living and practical tips for decluttering your home and life.",
        content: `<p>Minimalism isn't just about having fewer possessions—it's about making room for what truly matters in your life. This guide will help you start your minimalist journey.</p>

<h3>Benefits of Minimalism</h3>
<p>Reduced stress, increased focus, and more freedom are just some of the benefits you'll experience.</p>

<h3>Getting Started</h3>
<p>Begin with one room at a time and focus on keeping only items that serve a purpose or bring you joy.</p>`,
        category: "lifestyle",
        author: "Sarah Wilson",
        date: "2024-12-08",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop",
        likes: 23,
        comments: []
    },
    {
        id: 3,
        title: "Hidden Gems of Southeast Asia",
        excerpt: "Explore breathtaking destinations off the beaten path in Southeast Asia that most tourists never discover.",
        content: `<p>Southeast Asia is full of incredible destinations that remain largely undiscovered by mass tourism. Let's explore some of these hidden gems.</p>

<h3>Pristine Beaches</h3>
<p>Discover secluded beaches with crystal-clear waters and white sand that few tourists know about.</p>

<h3>Cultural Experiences</h3>
<p>Immerse yourself in local cultures and traditions that have been preserved for centuries.</p>`,
        category: "travel",
        author: "Mike Chen",
        date: "2024-12-05",
        readTime: "10 min read",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
        likes: 31,
        comments: [
            {
                id: 1,
                author: "Emma Davis",
                date: "2024-12-06",
                content: "Added these destinations to my travel wishlist! Thanks for sharing."
            }
        ]
    },
    {
        id: 4,
        title: "The Future of Web Development",
        excerpt: "An in-depth look at emerging technologies and trends that will shape the future of web development.",
        content: `<p>Web development is constantly evolving, with new technologies and frameworks emerging regularly. Let's explore what the future holds.</p>

<h3>AI Integration</h3>
<p>Artificial intelligence is becoming increasingly important in web development, from automated testing to intelligent user interfaces.</p>

<h3>WebAssembly</h3>
<p>WebAssembly is opening up new possibilities for high-performance web applications.</p>`,
        category: "technology",
        author: "David Park",
        date: "2024-12-03",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop",
        likes: 18,
        comments: []
    },
    {
        id: 5,
        title: "Healthy Meal Prep for Busy Professionals",
        excerpt: "Simple and nutritious meal prep ideas that will save you time and keep you healthy during busy workweeks.",
        content: `<p>Eating healthy while maintaining a busy professional life can be challenging. Here are practical meal prep strategies that work.</p>

<h3>Planning Your Week</h3>
<p>Start with a meal plan and grocery list to streamline your preparation process.</p>

<h3>Batch Cooking</h3>
<p>Cook large batches of proteins and grains that can be mixed and matched throughout the week.</p>`,
        category: "lifestyle",
        author: "Lisa Rodriguez",
        date: "2024-12-01",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop",
        likes: 27,
        comments: []
    },
    {
        id: 6,
        title: "Backpacking Through Patagonia",
        excerpt: "A comprehensive guide to planning an unforgettable backpacking adventure through the stunning landscapes of Patagonia.",
        content: `<p>Patagonia offers some of the most spectacular backpacking opportunities in the world. This guide will help you plan your adventure.</p>

<h3>Best Routes</h3>
<p>Explore the most scenic and challenging routes through Torres del Paine and Los Glaciares.</p>

<h3>Essential Gear</h3>
<p>Learn what equipment you'll need to handle Patagonia's unpredictable weather conditions.</p>`,
        category: "travel",
        author: "Carlos Mendez",
        date: "2024-11-28",
        readTime: "12 min read",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop",
        likes: 42,
        comments: []
    }
];

// State management
let currentFilter = 'all';
let displayedBlogs = 6;
let allBlogs = [...sampleBlogs];

// DOM elements
const blogsGrid = document.getElementById('blogsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load blogs from localStorage if available
    const savedBlogs = localStorage.getItem('blogPosts');
    if (savedBlogs) {
        allBlogs = [...JSON.parse(savedBlogs), ...sampleBlogs];
    }
    
    renderBlogs();
    setupEventListeners();
});

// Render blogs
function renderBlogs() {
    const filteredBlogs = currentFilter === 'all' ? 
        allBlogs : 
        allBlogs.filter(blog => blog.category === currentFilter);
    
    const blogsToShow = filteredBlogs.slice(0, displayedBlogs);
    
    blogsGrid.innerHTML = '';
    
    blogsToShow.forEach(blog => {
        const blogCard = createBlogCard(blog);
        blogsGrid.appendChild(blogCard);
    });
    
    // Update load more button visibility
    if (filteredBlogs.length <= displayedBlogs) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
    
    // Add animation class
    setTimeout(() => {
        document.querySelectorAll('.blog-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in-up');
            }, index * 100);
        });
    }, 100);
}

// Create blog card element
function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.onclick = () => viewBlog(blog.id);
    
    card.innerHTML = `
        <div class="blog-card-image" style="background-image: url('${blog.image}')">
            <span class="blog-category">${blog.category}</span>
        </div>
        <div class="blog-card-content">
            <h3>${blog.title}</h3>
            <p class="blog-excerpt">${blog.excerpt}</p>
            <div class="blog-meta">
                <div class="author-info">
                    <img src="https://via.placeholder.com/30" alt="${blog.author}" class="author-avatar">
                    <span>${blog.author}</span>
                </div>
                <span>${blog.readTime}</span>
            </div>
        </div>
    `;
    
    return card;
}

// View individual blog
function viewBlog(blogId) {
    // Store the blog ID in URL parameters or localStorage for the blog page
    localStorage.setItem('currentBlogId', blogId);
    window.location.href = 'blog.html';
}

// Filter blogs
function filterBlogs(category) {
    currentFilter = category;
    displayedBlogs = 6; // Reset displayed count
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
    
    renderBlogs();
}

// Load more blogs
function loadMoreBlogs() {
    displayedBlogs += 6;
    renderBlogs();
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBlogs(btn.dataset.filter);
        });
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', loadMoreBlogs);
    
    // Mobile navigation
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Search functionality (can be added later)
function searchBlogs(query) {
    if (!query) {
        renderBlogs();
        return;
    }
    
    const filteredBlogs = allBlogs.filter(blog => 
        blog.title.toLowerCase().includes(query.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        blog.category.toLowerCase().includes(query.toLowerCase()) ||
        blog.author.toLowerCase().includes(query.toLowerCase())
    );
    
    blogsGrid.innerHTML = '';
    filteredBlogs.forEach(blog => {
        const blogCard = createBlogCard(blog);
        blogsGrid.appendChild(blogCard);
    });
    
    loadMoreBtn.style.display = 'none';
}

// Utility function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Export functions for other scripts
window.BlogApp = {
    sampleBlogs,
    allBlogs,
    viewBlog,
    searchBlogs,
    formatDate
};