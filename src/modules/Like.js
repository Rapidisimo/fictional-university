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

async   createLike() {
        const url = `${universityData.root_url}/wp-json/university/v1/managelike`;

        try {
            const response = await fetch(url, {
                method: "POST",
            });
            
            const jsonData = await response.json();

            if(!response.ok) {
                throw new Error('Response status: ${response.status}');
            }
            if(response.ok) {
                console.log(jsonData.data)
            }
        } catch (error) {
            console.error(error.message);
        }
    }

async   deleteLike() {
        const url = `${universityData.root_url}/wp-json/university/v1/managelike`;

        try {
            const response = await fetch(url, {
                method: "DELETE"
            });

            const jsonData = await response.json();

            if(!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            if(response.ok) {
                console.log(jsonData.data)
            }
        } catch (error) {
            console.error(error.message);
        }
    }

}

export default Like;