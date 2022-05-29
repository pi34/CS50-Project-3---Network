document.addEventListener('DOMContentLoaded', function () {

    load_page('#all-posts-view', 'all', '#all-posts')

    document.querySelector('#all').addEventListener('click', () => load_page('#all-posts-view', 'all', '#all-posts'));

    if (document.querySelector('#following')) {
        document.querySelector('#following').addEventListener('click', () => load_page('#following-view', 'following','#following-posts'));
    }

    profile()

    if (document.querySelector('#form')) {
        document.querySelector('#form').onsubmit = () => {
            const body = document.querySelector('#body').value;
    
            new_post(body)
        }
    }

    document.addEventListener('click', event => {
        const button = event.target
        if (button.classList.contains("edit")) {
            document.querySelector(`#p_${button.parentElement.id}`).contentEditable = "true"
            save = document.createElement('button')
            save.innerHTML = "Save"
            save.classList.add("btn-outline-success", "btn", "save")
            button.parentElement.append(save)
            button.disabled = "true"
        }
    })

    document.addEventListener('click', event => {
        const save = event.target
        if (save.classList.contains("save")) {
            body = document.querySelector(`#p_${save.parentElement.id}`).innerHTML
            edit_page(save.parentElement.id, body)
            body.contentEditable = "false"
            save.remove()
            load_page('#all-posts-view', 'all', '#all-posts')
        }
    })

    document.addEventListener('click', event => {
        const element = event.target;
        if (element.classList.contains("like")) {
            like(element.parentElement.id)
            load_page('#all-posts-view', 'all', '#all-posts')
        }
    })

})

function load_page(page, post_type, section, user) {

    user = user || null

    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'none';

    document.querySelector(page).style.display = 'block';

    document.querySelector('#page-number').innerHTML = '';

    fetch_post(post_type, section, 1, user)

    pagination(post_type, section)


}

function new_post(body) {
    fetch('/new', {
        method: 'POST', 
        body: JSON.stringify({
            body: body
        })
    })
}

function fetch_post(post_type, section, counter, user) {

    user = user || null

    document.querySelector(section).innerHTML = ''

    fetch(`/posts/${post_type}?page=${counter}&user=${user}`)
    .then(response => response.json())
    .then(posts => {

        posts.forEach(element => {
            let post = document.createElement('div')
            post.innerHTML = `<span>
                                <button class="btn btn-link user-link">${element.username}</button>
                              </span>
                              <button id="edit_${element.id}" class="btn btn-outline-info edit">Edit</button>
                              <hr>
                              <p id="p_${element.id}">${element.content}</p>
                              <p class="card-subtitle mb-2 text-muted">${element.timestamp}</p>
                                <button id="l_${element.id}" class="btn like"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill like" viewBox="0 0 16 16">
                <path class"like" fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg></button>
                                <span class="margin">${element.likes.length} likes</span>`

            document.querySelector(section).append(post)
                                
            post.classList.add("box") 
            post.id = element.id

            let username = document.querySelector('#profile')

            if (username) {
                if (element.likes.indexOf(username.value) !== -1) {  
                    document.querySelector(`#l_${post.id}`).style.color = "black"
                } else {
                    document.querySelector(`#l_${post.id}`).style.color = "red"
                }
    
                if (element.username === username.value) {
                    document.querySelector(`#l_${element.id}`).remove()
                } else {
                    document.querySelector(`#edit_${element.id}`).remove()
                }
            } else {
                document.querySelector(`#edit_${element.id}`).remove()
                document.querySelector(`#l_${element.id}`).remove()
            }
                
        });

    })
}

function like(element) {
    fetch(`/post/${element}`, {
        method: 'PUT', 
        body: JSON.stringify({})
    })
}

function follower(user) {
    fetch(`/followers/${user}`, {
        method: 'PUT'
    })
    load_page('#all-posts-view', 'all', '#all-posts')
}

function profile() {
    document.addEventListener('click', event => {

        const element = event.target;

        if (element.classList.contains("user-link")) {

            document.querySelector('#profile-details').innerHTML = ''

            user = element.innerHTML
            fetch(`/followers/${user}`)
            .then(response => response.json())
            .then(result => {
                document.querySelector('#username').innerHTML = user
                document.querySelector('#following_pf').innerHTML = `Following: ${result.following.length}`
                document.querySelector('#followers').innerHTML = `Followers: ${result.followers.length}`
                follow = document.createElement('button')
                
                if (result.followers.indexOf(document.querySelector('#profile').value) !== -1){
                    follow.innerHTML = 'Unfollow'
                } else {
                    follow.innerHTML = 'Follow'
                }

                follow.classList.add("btn", "btn-warning")
                follow.addEventListener('click', () => {
                    follower(user)
                })
                if (user !== document.querySelector('#profile').value) {
                    document.querySelector('#profile-details').append(follow)
                }
            })
            load_page('#profile-view', 'profile','#profile-posts', user)
        }
        
    });
}

function edit_page(id, body) {
    fetch(`/post/${id}`, {
        method: 'PUT', 
        body: JSON.stringify({
            body: body
        })
    })
    .then(load_page('#all-posts-view', 'all', '#all-posts'))
}

function pagination(page_type, section) {
    fetch(`/posts/${page_type}?page=0`)
    .then(response => response.json())
    .then(result => {

        if (result.context > 1) {

            let counter = 1;

            let previous = document.createElement('li')
            previous.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`
            previous.classList.add("page-item")

            let next = document.createElement('li')
            next.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`
            next.classList.add("page-item")

            previous.addEventListener('click', function() {
                counter--
                fetch_post(page_type, section, counter)
                if (counter === 1) {
                    previous.style.display = 'none'
                    next.style.display = 'block'
                } else {
                    next.style.display = 'block'
                }
            })

            next.addEventListener('click', function() {
                counter++
                fetch_post(page_type, section, counter)
                if (counter >= result.context) {
                    next.style.display = 'none'
                    previous.style.display = 'block'
                } 

                previous.style.display = 'block'
            })

            previous.style.display = 'none'
        
            document.querySelector('#page-number').append(previous)
            document.querySelector('#page-number').append(next)

        }

    })
}