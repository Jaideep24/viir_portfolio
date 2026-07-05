/* ==========================================================================
   BLOG POST — Like button AJAX logic & Post Actions
   Requires: blogPostAjaxUrl (set by template before this script)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // Event delegation for all blog actions
    document.addEventListener("click", function (e) {
        // Like Button
        var likeBtn = e.target.closest(".like-btn");
        if (likeBtn) {
            e.preventDefault();
            var model_id = likeBtn.getAttribute("data-model-id");
            var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            var action = likeBtn.getAttribute("data-action");

            fetch(blogPostAjaxUrl, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrftoken,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: "model_id=" + encodeURIComponent(model_id) + "&action=" + encodeURIComponent(action)
            })
            .then(response => response.json())
            .then(data => {
                var likesCount = data.likes;
                var likesDisplay = document.getElementById("likes-display");
                if (likesDisplay) {
                    if (likesCount === 0) {
                        likesDisplay.innerHTML = "No one has liked this yet";
                    } else if (likesCount === 1) {
                        likesDisplay.innerHTML = "1 person liked this";
                    } else {
                        likesDisplay.innerHTML = likesCount + " people liked this";
                    }
                }
                if (action === "like") {
                    likeBtn.setAttribute("data-action", "unlike");
                    likeBtn.classList.add("liked");
                    likeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="bi bi-heart-fill like-pop"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
                } else {
                    likeBtn.setAttribute("data-action", "like");
                    likeBtn.classList.remove("liked");
                    likeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="bi bi-heart like-pop"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>';
                }
            })
            .catch(error => console.error("Error:", error));
        }

        // Scroll to Comments Button
        var commentBtn = e.target.closest(".comment-btn");
        if (commentBtn) {
            e.preventDefault();
            var commentForm = document.getElementById("commentFormWrapper");
            if (commentForm) {
                commentForm.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Share Button
        var shareBtn = e.target.closest(".share-btn");
        if (shareBtn) {
            e.preventDefault();
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(window.location.href)
                    .then(() => showNotification("Blog URL copied to clipboard!"))
                    .catch(() => {
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
    });
});

// Toast notification helper
function showNotification(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#7c3aed;color:#f8fafc;' +
                       'padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;' +
                       'box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}
