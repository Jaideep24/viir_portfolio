// Editor page functionality
let isEditMode = false;
let currentEditId = null;

// DOM elements
const blogForm = document.getElementById('blogForm');
const blogTitleInput = document.getElementById('blogTitleInput');
const categorySelect = document.getElementById('categorySelect');
const authorInput = document.getElementById('authorInput');
const excerptInput = document.getElementById('excerptInput');
const imageUrlInput = document.getElementById('imageUrlInput');
const imagePreview = document.getElementById('imagePreview');
const contentEditor = document.getElementById('contentEditor');
const tagsInput = document.getElementById('tagsInput');
const editorTitle = document.getElementById('editorTitle');

// Initialize the editor
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupRichTextEditor();
    checkEditMode();
    loadDraftIfExists();
});

// Check if we're in edit mode
function checkEditMode() {
    const editId = localStorage.getItem('editBlogId');
    if (editId) {
        isEditMode = true;
        currentEditId = parseInt(editId);
        loadBlogForEditing(currentEditId);
        editorTitle.textContent = 'Edit Blog';
        localStorage.removeItem('editBlogId'); // Clear after loading
    }
}

// Load blog for editing
function loadBlogForEditing(blogId) {
    const savedBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const blog = savedBlogs.find(b => b.id === blogId);
    
    if (blog) {
        blogTitleInput.value = blog.title;
        categorySelect.value = blog.category;
        authorInput.value = blog.author;
        excerptInput.value = blog.excerpt;
        imageUrlInput.value = blog.image || '';
        contentEditor.innerHTML = blog.content;
        tagsInput.value = blog.tags ? blog.tags.join(', ') : '';
        
        if (blog.image) {
            updateImagePreview(blog.image);
        }
    }
}

// Setup rich text editor
function setupRichTextEditor() {
    // Focus and placeholder handling
    contentEditor.addEventListener('focus', function() {
        if (this.innerHTML === '' || this.innerHTML === '<br>') {
            this.innerHTML = '';
        }
    });
    
    contentEditor.addEventListener('blur', function() {
        if (this.innerHTML === '' || this.innerHTML === '<br>') {
            this.innerHTML = '';
        }
    });
    
    // Handle paste events to clean up formatting
    contentEditor.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });
    
    // Auto-save draft while typing
    let saveTimeout;
    contentEditor.addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveDraft, 2000); // Auto-save after 2 seconds of inactivity
    });
}

// Format text in editor
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    contentEditor.focus();
    
    // Update button states
    updateToolbarButtons();
}

// Insert link
function insertLink() {
    const url = prompt('Enter the URL:');
    if (url) {
        const selection = window.getSelection().toString();
        const linkText = selection || prompt('Enter link text:') || url;
        
        if (linkText) {
            const link = `<a href="${url}" target="_blank">${linkText}</a>`;
            document.execCommand('insertHTML', false, link);
        }
    }
    contentEditor.focus();
}

// Insert image
function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
        const img = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 1rem 0;">`;
        document.execCommand('insertHTML', false, img);
    }
    contentEditor.focus();
}

// Update toolbar button states
function updateToolbarButtons() {
    const buttons = document.querySelectorAll('.toolbar-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        
        const command = btn.onclick.toString().match(/formatText\('([^']+)'/);
        if (command && document.queryCommandState(command[1])) {
            btn.classList.add('active');
        }
    });
}

// Update image preview
function updateImagePreview(url) {
    if (url) {
        imagePreview.innerHTML = `<img src="${url}" alt="Preview">`;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
    }
}

// Validate form
function validateForm() {
    const errors = [];
    
    if (!blogTitleInput.value.trim()) {
        errors.push('Title is required');
    }
    
    if (!categorySelect.value) {
        errors.push('Category is required');
    }
    
    if (!authorInput.value.trim()) {
        errors.push('Author is required');
    }
    
    if (!contentEditor.innerHTML.trim() || contentEditor.innerHTML === '<br>') {
        errors.push('Content is required');
    }
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// Save draft
function saveDraft() {
    if (!blogTitleInput.value.trim() && !contentEditor.innerHTML.trim()) {
        return; // Don't save empty drafts
    }
    
    const draft = {
        title: blogTitleInput.value,
        category: categorySelect.value,
        author: authorInput.value,
        excerpt: excerptInput.value,
        image: imageUrlInput.value,
        content: contentEditor.innerHTML,
        tags: tagsInput.value,
        timestamp: Date.now()
    };
    
    localStorage.setItem('blogDraft', JSON.stringify(draft));
    showNotification('Draft saved automatically', 'info');
}

// Load draft
function loadDraftIfExists() {
    if (isEditMode) return; // Don't load draft if editing existing blog
    
    const draft = localStorage.getItem('blogDraft');
    if (draft) {
        const parsedDraft = JSON.parse(draft);
        
        // Only load if draft is recent (within last 24 hours)
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - parsedDraft.timestamp < dayInMs) {
            const loadDraft = confirm('A recent draft was found. Would you like to restore it?');
            if (loadDraft) {
                blogTitleInput.value = parsedDraft.title || '';
                categorySelect.value = parsedDraft.category || '';
                authorInput.value = parsedDraft.author || '';
                excerptInput.value = parsedDraft.excerpt || '';
                imageUrlInput.value = parsedDraft.image || '';
                contentEditor.innerHTML = parsedDraft.content || '';
                tagsInput.value = parsedDraft.tags || '';
                
                if (parsedDraft.image) {
                    updateImagePreview(parsedDraft.image);
                }
            }
        }
    }
}

// Clear draft
function clearDraft() {
    localStorage.removeItem('blogDraft');
}

// Publish blog
function publishBlog() {
    if (!validateForm()) {
        return;
    }
    
    const blogData = {
        id: isEditMode ? currentEditId : Date.now(),
        title: blogTitleInput.value.trim(),
        category: categorySelect.value,
        author: authorInput.value.trim(),
        excerpt: excerptInput.value.trim() || generateExcerpt(contentEditor.innerHTML),
        image: imageUrlInput.value.trim() || getDefaultImage(categorySelect.value),
        content: contentEditor.innerHTML,
        tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
        date: isEditMode ? getCurrentBlog()?.date : new Date().toISOString().split('T')[0],
        readTime: calculateReadTime(contentEditor.innerHTML),
        likes: isEditMode ? getCurrentBlog()?.likes || 0 : 0,
        comments: isEditMode ? getCurrentBlog()?.comments || [] : []
    };
    
    // Save to localStorage
    const savedBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    if (isEditMode) {
        const index = savedBlogs.findIndex(blog => blog.id === currentEditId);
        if (index > -1) {
            savedBlogs[index] = blogData;
        } else {
            savedBlogs.unshift(blogData);
        }
    } else {
        savedBlogs.unshift(blogData);
    }
    
    localStorage.setItem('blogPosts', JSON.stringify(savedBlogs));
    
    // Clear draft
    clearDraft();
    
    // Show success message
    showNotification(isEditMode ? 'Blog updated successfully!' : 'Blog published successfully!', 'success');
    
    // Redirect to the published blog
    setTimeout(() => {
        localStorage.setItem('currentBlogId', blogData.id);
        window.location.href = 'blog.html';
    }, 1500);
}

// Get current blog if editing
function getCurrentBlog() {
    if (!isEditMode) return null;
    const savedBlogs = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    return savedBlogs.find(blog => blog.id === currentEditId);
}

// Generate excerpt from content
function generateExcerpt(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
}

// Calculate read time
function calculateReadTime(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed: 200 words per minute
    return `${minutes} min read`;
}

// Get default image based on category
function getDefaultImage(category) {
    const defaultImages = {
        technology: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
        lifestyle: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
        travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
        food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop',
        health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
        business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'
    };
    
    return defaultImages[category] || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    // Add animation styles if not already present
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Image URL input change
    imageUrlInput.addEventListener('input', function() {
        updateImagePreview(this.value);
    });
    
    // Form inputs for auto-save
    [blogTitleInput, categorySelect, authorInput, excerptInput, tagsInput].forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(saveDraft, 2000);
        });
    });
    
    // Content editor selection change for toolbar updates
    contentEditor.addEventListener('mouseup', updateToolbarButtons);
    contentEditor.addEventListener('keyup', updateToolbarButtons);
    
    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Prevent form submission on Enter key
    blogForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    
    // Handle beforeunload to warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Check if there are unsaved changes
function hasUnsavedChanges() {
    const currentData = {
        title: blogTitleInput.value,
        category: categorySelect.value,
        author: authorInput.value,
        excerpt: excerptInput.value,
        image: imageUrlInput.value,
        content: contentEditor.innerHTML,
        tags: tagsInput.value
    };
    
    const savedDraft = localStorage.getItem('blogDraft');
    if (!savedDraft) {
        return Object.values(currentData).some(value => value.trim() !== '');
    }
    
    const draft = JSON.parse(savedDraft);
    return JSON.stringify(currentData) !== JSON.stringify({
        title: draft.title || '',
        category: draft.category || '',
        author: draft.author || '',
        excerpt: draft.excerpt || '',
        image: draft.image || '',
        content: draft.content || '',
        tags: draft.tags || ''
    });
}

// Reset form
function resetForm() {
    blogForm.reset();
    contentEditor.innerHTML = '';
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    clearDraft();
}