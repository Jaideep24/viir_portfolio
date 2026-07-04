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

function initBlogEditor() {
    setupEventListeners();
    setupRichTextEditor();
    checkEditMode();
    loadDraftIfExists();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogEditor);
} else {
    initBlogEditor();
}

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
    if (!contentEditor) return;
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
    if (contentEditor) contentEditor.focus();
    
    // Update button states
    updateToolbarButtons();
}

// Custom Theme-Aware Link Prompt
function showLinkPrompt(defaultText, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-prompt-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'custom-prompt-modal';
    
    modal.innerHTML = `
        <h3>Insert Link</h3>
        <input type="text" id="link-url-input" placeholder="https://example.com (Link URL)" style="margin-bottom: 12px;">
        <input type="text" id="link-text-input" placeholder="Display Text" value="${defaultText || ''}">
        <div class="custom-prompt-actions" style="margin-top: 16px;">
            <button class="custom-prompt-btn-cancel">Cancel</button>
            <button class="custom-prompt-btn-confirm">Insert</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const urlInput = modal.querySelector('#link-url-input');
    const textInput = modal.querySelector('#link-text-input');
    const btnCancel = modal.querySelector('.custom-prompt-btn-cancel');
    const btnConfirm = modal.querySelector('.custom-prompt-btn-confirm');
    
    // Animate in
    requestAnimationFrame(() => overlay.classList.add('show'));
    urlInput.focus();
    
    const close = (result) => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
        callback(result);
    };
    
    btnCancel.onclick = () => close(null);
    btnConfirm.onclick = () => {
        close({
            url: urlInput.value,
            text: textInput.value
        });
    };
    
    // Focus Trap
    const focusableElements = [urlInput, textInput, btnCancel, btnConfirm];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                }
            }
        }
        if (e.key === 'Escape') {
            btnCancel.click();
        }
    });

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnConfirm.click();
        }
    };

    urlInput.addEventListener('keydown', handleEnter);
    textInput.addEventListener('keydown', handleEnter);
}

// Insert link
function insertLink() {
    // Save selection before modal steals focus
    const selection = window.getSelection();
    let range = null;
    let selectedText = selection.toString();
    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
    }
    
    showLinkPrompt(selectedText, (result) => {
        if (!result || !result.url) {
            if (contentEditor) contentEditor.focus();
            return;
        }
        
        // Restore selection
        const newSelection = window.getSelection();
        newSelection.removeAllRanges();
        if (range) newSelection.addRange(range);
        
        const url = result.url;
        const linkText = result.text || url;
        
        const link = `<a href="${url}" target="_blank">${linkText}</a>`;
        document.execCommand('insertHTML', false, link);
        if (contentEditor) contentEditor.focus();
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showImagePrompt(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-prompt-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'custom-prompt-modal';
    
    modal.innerHTML = `
        <h3>Insert Image</h3>
        <div class="custom-prompt-tabs">
            <button class="custom-prompt-tab active" data-tab="url">Add Link</button>
            <button class="custom-prompt-tab" data-tab="upload">Upload</button>
        </div>
        
        <div class="custom-prompt-tab-content active" id="tab-url">
            <input type="text" id="img-url-input" placeholder="https://example.com/image.jpg">
        </div>
        
        <div class="custom-prompt-tab-content" id="tab-upload">
            <div class="file-upload-wrapper" id="file-upload-zone">
                <span class="file-upload-text">Click to browse or drag image here</span>
                <input type="file" id="img-file-input" accept="image/*">
            </div>
            <p id="upload-status" style="font-size: 12px; margin-bottom: 10px; display: none;"></p>
        </div>
        
        <div class="custom-prompt-actions">
            <button class="custom-prompt-btn-cancel">Cancel</button>
            <button class="custom-prompt-btn-confirm" id="btn-img-confirm">Insert</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('show');
        const urlInput = document.getElementById('img-url-input');
        if (urlInput) urlInput.focus();
    }, 10);
    
    const close = (value) => {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            callback(value);
        }, 200);
    };
    
    const btnCancel = modal.querySelector('.custom-prompt-btn-cancel');
    const btnConfirm = document.getElementById('btn-img-confirm');
    const tabs = modal.querySelectorAll('.custom-prompt-tab');
    const contents = modal.querySelectorAll('.custom-prompt-tab-content');
    
    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            if(tab.dataset.tab === 'url') document.getElementById('img-url-input').focus();
        });
    });
    
    // Handle File Selection Text
    const fileInput = document.getElementById('img-file-input');
    const fileText = modal.querySelector('.file-upload-text');
    if(fileInput && fileText) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileText.textContent = fileInput.files[0].name;
            } else {
                fileText.textContent = 'Click to browse or drag image here';
            }
        });
    }
    
    // Escape to close
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close(null);
    });

    btnCancel.onclick = () => close(null);
    
    btnConfirm.onclick = () => {
        const activeTab = modal.querySelector('.custom-prompt-tab.active').dataset.tab;
        
        if (activeTab === 'url') {
            const url = document.getElementById('img-url-input').value;
            close(url);
        } else {
            if (fileInput.files.length === 0) {
                alert('Please select an image to upload.');
                return;
            }
            
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('image', file);
            
            const status = document.getElementById('upload-status');
            status.style.display = 'block';
            status.style.color = 'var(--text-color, #333)';
            status.textContent = 'Uploading...';
            btnConfirm.disabled = true;
            
            fetch('/blogspace/upload-image/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    close(data.url);
                } else {
                    status.style.color = 'red';
                    status.textContent = data.error || 'Upload failed.';
                    btnConfirm.disabled = false;
                }
            })
            .catch(error => {
                status.style.color = 'red';
                status.textContent = 'An error occurred during upload.';
                btnConfirm.disabled = false;
            });
        }
    };
}

// Insert image
function insertImage() {
    const selection = window.getSelection();
    let range = null;
    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
    }
    
    showImagePrompt((url) => {
        if (url) {
            const newSelection = window.getSelection();
            newSelection.removeAllRanges();
            if (range) newSelection.addRange(range);
            
            const img = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 1rem 0;">`;
            document.execCommand('insertHTML', false, img);
        }
        if (contentEditor) contentEditor.focus();
    });
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
    // Toolbar Event Delegation (CSP Compliant)
    const toolbar = document.querySelector(".editor-toolbar");
    if (toolbar) {
        toolbar.addEventListener("click", (e) => {
            const btn = e.target.closest(".toolbar-btn");
            if (!btn) return;
            e.preventDefault();
            const cmd = btn.getAttribute("data-command");
            const action = btn.getAttribute("data-action");
            
            if (cmd) {
                formatText(cmd);
            } else if (action === "insertLink") {
                insertLink();
            } else if (action === "insertImage") {
                insertImage();
            }
        });
    }

    // Image URL input change
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function() {
            updateImagePreview(this.value);
        });
    }
    
    // Form inputs for auto-save
    [blogTitleInput, categorySelect, authorInput, excerptInput, tagsInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(saveDraft, 2000);
            });
        }
    });
    
    // Content editor selection change for toolbar updates
    if (contentEditor) {
        contentEditor.addEventListener('mouseup', updateToolbarButtons);
        contentEditor.addEventListener('keyup', updateToolbarButtons);
    }
    
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
    if (blogForm) {
        blogForm.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                e.preventDefault();
            }
        });
    }
    
    // Handle beforeunload to warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        // Don't show warning if form is submitting
        if (window.formSubmitting) {
            return;
        }
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Check if there are unsaved changes
function hasUnsavedChanges() {
    const currentData = {
        title: blogTitleInput ? blogTitleInput.value : '',
        category: categorySelect ? categorySelect.value : '',
        author: authorInput ? authorInput.value : '',
        excerpt: excerptInput ? excerptInput.value : '',
        image: imageUrlInput ? imageUrlInput.value : '',
        content: contentEditor ? contentEditor.innerHTML : '',
        tags: tagsInput ? tagsInput.value : ''
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
    if (blogForm) blogForm.reset();
    if (contentEditor) contentEditor.innerHTML = '';
    if (imagePreview) {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
    }
    clearDraft();
}

const blogFormEl = document.getElementById('blogForm');
if (blogFormEl) {
    blogFormEl.addEventListener('submit', function () {
        const editorContentEl = document.getElementById('contentEditor');
        const hiddenContentEl = document.getElementById('id_content');
        if (editorContentEl && hiddenContentEl) {
            hiddenContentEl.value = editorContentEl.innerHTML;
        }
        // Clear unsaved changes flag on submit
        localStorage.removeItem('blogDraft');
        window.formSubmitting = true;
    });
}
