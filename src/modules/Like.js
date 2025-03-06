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
        let currentLikeBox = e.target.closest('.like-box');
        if(currentLikeBox.dataset.exists === 'yes') {
            this.deleteLike(currentLikeBox)
        }else {
            this.createLike(currentLikeBox);
        }
    }

async createLike(currentLikeBox) {
        const url = `${universityData.root_url}/wp-json/university/v1/managelike?professorId=${currentLikeBox.dataset.professor}`;
        
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-WP-Nonce", universityData.nonce);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: myHeaders,
            });
            
            const jsonData = await response.json();
            console.log(jsonData);
            
            if(!response.ok) {
                throw new Error(`Response status: ${response.status} | Response message: ${jsonData.message}`);
            }
            // Update like heart and count
            currentLikeBox.dataset.exists = "yes";
            const likeCountElement = currentLikeBox.querySelector('.like-count');
            let likeCount = parseInt(likeCountElement.innerText, 10);
            likeCount++;
            likeCountElement.innerText = likeCount;
            currentLikeBox.dataset.like = `${jsonData.likeId}`;
            
        } catch (error) {
            console.error(error.message);
        }
    }

async deleteLike(currentLikeBox) {
        const url = `${universityData.root_url}/wp-json/university/v1/managelike?like=${currentLikeBox.dataset.like}`;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-WP-Nonce", universityData.nonce);

        try {
            console.log(`${currentLikeBox.dataset.like}`);
            const response = await fetch(url, {
                method: "DELETE",
                headers: myHeaders
            });

            const jsonData = await response.json();

            if(!response.ok) {
                throw new Error(`Response status: ${response.status} | Response message: ${jsonData.message}`);
            }

            currentLikeBox.dataset.exists = "no";
            const likeCountElement = currentLikeBox.querySelector('.like-count');
            let likeCount = parseInt(likeCountElement.innerText, 10);
            likeCount--;
            likeCountElement.innerText = likeCount;
            currentLikeBox.dataset.like = "";


        } catch (error) {
            console.error(error.message);
        }
    }

}

export default Like;