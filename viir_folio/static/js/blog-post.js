/* ==========================================================================
   BLOG POST — Like button AJAX logic
   Extracted from blog_post.html inline script.
   Requires: jQuery, blogPostAjaxUrl (set by template before this script)
   ========================================================================== */

function like_change() {
    var btn = document.getElementById("btn");
    var model_id = btn.getAttribute("data-model-id");
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var action = btn.getAttribute("data-action");

    $.ajax({
        url: blogPostAjaxUrl,
        type: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        data: {
            'model_id': model_id,
            "action": action
        },
        success: function (response) {
            var likesCount = response.likes;
            var likesDisplay = document.getElementById("likes-display");
            likesDisplay.innerHTML = likesCount + " people liked your blog";
            if (action == "like") {
                btn.setAttribute("data-action", "unlike");
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/></svg>';
            } else {
                btn.setAttribute("data-action", "like");
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16"><path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/></svg>';
            }
        }
    });
}
