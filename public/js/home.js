$(".delete-comment-btn").click(function(e) {
    e.preventDefault()
    
    let commentId = $(this).attr('data-mongoId');
    

    $.ajax({
        url: `/api/${commentId}/delete`,
        method: "DELETE"
    }).then(() => {
        location.reload();
    })
})

