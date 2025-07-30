// Blog page functionality
let currentBlog = null;
let isLiked = false;

// DOM elements
const blogTitle = document.getElementById('blogTitle');
const blogCategory = document.getElementById('blogCategory');
const blogDate = document.getElementById('blogDate');
const blogContent = document.getElementById('blogContent');
const blogImage = document.getElementById('blogImage');
const authorName = document.getElementById('authorName');
const authorAvatar = document.getElementById('authorAvatar');
const readTime = document.getElementById('readTime');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');
const commentInput = document.getElementById('commentInput');
const commentsList = document.getElementById('commentsList');

// Initialize the blog page
document.addEventListener('DOMContentLoaded', function() {
    loadBlogContent();
    setupEventListeners();
});

// Load blog content
function loadBlogContent() {
    const blogId = localStorage.getItem('currentBlogId');
    
    // Get blog data (from sample data or localStorage)
    const allBlogs = getAllBlogs();
    currentBlog = allBlogs.find(blog => blog.id == blogId);
    
    // Populate blog content
    populateBlogData();
    loadComments();
    checkLikeStatus();
}

// Get all blogs (sample + saved)
function getAllBlogs() {
    const savedBlogs = localStorage.getItem('blogPosts');
    const sampleBlogs = window.BlogApp ? window.BlogApp.sampleBlogs : [];
    
    if (savedBlogs) {
        return [...JSON.parse(savedBlogs), ...sampleBlogs];
    }
    
    // Fallback sample data if script.js not loaded
    return [
        {
            id: 1,
            title: "Getting Started with JavaScript ES6",
            excerpt: "Learn the latest features of JavaScript ES6 including arrow functions, destructuring, and modules.",
            content: `<p>JavaScript ES6 (ECMAScript 2015) introduced many powerful features that make writing JavaScript more efficient and elegant. In this comprehensive guide, we'll explore the most important features you need to know.</p>

<h3>Arrow Functions</h3>
<p>Arrow functions provide a more concise way to write functions and automatically bind the 'this' context:</p>
<pre><code>// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;</code></pre>

<h3>Destructuring</h3>
<p>Destructuring allows you to extract values from arrays and objects in a clean, readable way:</p>
<pre><code>// Array destructuring
const [first, second] = [1, 2];

// Object destructuring
const {name, age} = person;</code></pre>

<h3>Template Literals</h3>
<p>Template literals make string interpolation much easier:</p>
<pre><code>const message = \`Hello, \${name}! You are \${age} years old.\`;</code></pre>

<h3>Modules</h3>
<p>ES6 modules make it easy to organize and share code between different files:</p>
<pre><code>// Export
export const myFunction = () => {};

// Import
import { myFunction } from './myModule.js';</code></pre>

<p>These features have become essential tools for modern JavaScript development. Start incorporating them into your projects to write cleaner, more maintainable code.</p>`,
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
                    content: "Great explanation of ES6 features! Very helpful for beginners.",
                    avatar: "https://via.placeholder.com/40"
                },
                {
                    id: 2,
                    author: "Bob Johnson",
                    date: "2024-12-12",
                    content: "I love the arrow function examples. Made it much clearer!",
                    avatar: "https://via.placeholder.com/40"
                }
            ]
        }
    ];
}

// Populate blog data in the page
function populateBlogData() {
    blogTitle.textContent = currentBlog.title;
    blogCategory.textContent = currentBlog.category;
    blogCategory.className = `category ${currentBlog.category}`;
    blogDate.textContent = formatDate(currentBlog.date);
    blogContent.innerHTML = currentBlog.content;
    blogImage.src = currentBlog.image;
    blogImage.alt = currentBlog.title;
    authorName.textContent = currentBlog.author;
    authorAvatar.src = currentBlog.avatar || "https://via.placeholder.com/50";
    readTime.textContent = currentBlog.readTime;
    likeCount.textContent = currentBlog.likes || 0;
    commentCount.textContent = currentBlog.comments ? currentBlog.comments.length : 0;
    
    // Update page title
    document.title = `${currentBlog.title} - BlogSpace`;
}

// Load and display comments
function loadComments() {
    if (!currentBlog.comments || currentBlog.comments.length === 0) {
        commentsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    currentBlog.comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

// Create comment element
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    commentDiv.innerHTML = `
        <div class="user-avatar">
            <img src="${comment.avatar || 'https://via.placeholder.com/40'}" alt="${comment.author}">
        </div>
        <div class="comment-content">
            <div class="comment-author">${comment.author}</div>
            <div class="comment-date">${formatDate(comment.date)}</div>
            <div class="comment-text">${comment.content}</div>
            <div class="comment-actions-inline">
                <button class="comment-action" onclick="likeComment(${comment.id})">
                    <i class="far fa-heart"></i> Like
                </button>
                <button class="comment-action" onclick="replyToComment(${comment.id})">
                    <i class="far fa-reply"></i> Reply
                </button>
            </div>
        </div>
    `;
    
    return commentDiv;
}

// Check if user has liked this blog
function checkLikeStatus() {
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
    isLiked = likedBlogs.includes(currentBlog.id);
    
    if (isLiked) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').className = 'fas fa-heart';
    } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').className = 'far fa-heart';
    }
}

// Toggle like on blog
function toggleLike() {
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
    
    if (isLiked) {
        // Unlike
        const index = likedBlogs.indexOf(currentBlog.id);
        if (index > -1) {
            likedBlogs.splice(index, 1);
        }
        currentBlog.likes = Math.max(0, (currentBlog.likes || 0) - 1);
        isLiked = false;
    } else {
        // Like
        likedBlogs.push(currentBlog.id);
        currentBlog.likes = (currentBlog.likes || 0) + 1;
        isLiked = true;
    }
    
    localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
    updateBlogInStorage();
    likeCount.textContent = currentBlog.likes;
    checkLikeStatus();
    
    // Add animation effect
    likeBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        likeBtn.style.transform = 'scale(1)';
    }, 150);
}

// Submit comment
function submitComment() {
    const content = commentInput.value.trim();
    
    if (!content) {
        alert('Please enter a comment before submitting.');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        author: 'Guest User', // In a real app, this would be the logged-in user
        date: new Date().toISOString().split('T')[0],
        content: content,
        avatar: 'https://via.placeholder.com/40'
    };
    
    // Add comment to current blog
    if (!currentBlog.comments) {
        currentBlog.comments = [];
    }
    currentBlog.comments.push(newComment);
    
    // Update storage
    updateBlogInStorage();
    
    // Update UI
    commentCount.textContent = currentBlog.comments.length;
    loadComments();
    clearComment();
    
    // Show success message
    showNotification('Comment added successfully!');
}

// Clear comment input
function clearComment() {
    commentInput.value = '';
}

// Scroll to comments section
function scrollToComments() {
    document.getElementById('commentsSection').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Share blog
function shareBlog() {
    if (navigator.share) {
        navigator.share({
            title: currentBlog.title,
            text: currentBlog.excerpt,
            url: window.location.href
        });
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Blog URL copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Blog URL copied to clipboard!');
        });
    }
}

// Update blog in storage
function updateBlogInStorage() {
    const savedBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const blogIndex = savedBlogs.findIndex(blog => blog.id === currentBlog.id);
    
    if (blogIndex > -1) {
        savedBlogs[blogIndex] = currentBlog;
        localStorage.setItem('blogPosts', JSON.stringify(savedBlogs));
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation styles
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Like button
    likeBtn.addEventListener('click', toggleLike);
    
    // Comment input focus effects
    commentInput.addEventListener('focus', () => {
        commentInput.parentElement.style.borderColor = '#4f46e5';
    });
    
    commentInput.addEventListener('blur', () => {
        commentInput.parentElement.style.borderColor = '#e2e8f0';
    });
    
    // Auto-resize comment textarea
    commentInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
    
    // Mobile navigation (if exists)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function likeComment(commentId) {
    showNotification('Comment liked!');
}

function replyToComment(commentId) {
    commentInput.focus();
    commentInput.value = `@${currentBlog.comments.find(c => c.id === commentId)?.author} `;
}