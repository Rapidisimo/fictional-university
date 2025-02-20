class Like {
    constructor() {
        this.likeButton = document.querySelector('.like-box');
        this.events();
    }

    events() {
        // add listener to heart button
        this.likeButton.addEventListener('click', (e) => this.ourClickDispatcher(e));
    }

    // methods
    ourClickDispatcher(e) {
        console.log(e.target);
        let currentLikeBox = e.target.closest('.like-box');
        if(currentLikeBox.dataset.exists === 'yes') {
            this.deleteLike()
        }else {
            this.createLike();
        }
    }

    createLike() {
        console.log('Create Like')
    }

    deleteLike() {
        console.log('Delete Like')
    }

}

export default Like;