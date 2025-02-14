class Search {
    // Area 1 - Describe and create/initiate our object
    constructor() {
        this.addSearchHTML();
        this.openButton = document.querySelectorAll('.js-search-trigger');
        this.closeButton = document.querySelector('.search-overlay__close');
        this.searchOverlay = document.querySelector('.search-overlay');
        this.website = document;
        this.isOverlayOpen = false;
        this.isSpinnerVisible = false;
        this.searchField = document.querySelector('#search-term');
        this.resultsDiv = document.querySelector('#search-overlay__results');
        this.events();
        this.previousValue;
        this.typingTimer;
    }
    // Area 2 - List events (connects area 1 and area 3 by doing something from area 3)
    events() {
        this.openButton.forEach( (element) => {
            element.addEventListener("click", (e) => {
                e.preventDefault();
               this.openOverlay();
            });
        })
     this.closeButton.addEventListener('click', () => {
        this.closeOverlay();
     })
     this.website.addEventListener('keydown', (e) => {
        this.keyPressDispatcher(e);
     })
     this.searchField.addEventListener('keyup', (e) => {
        this.typingLogic();
     })

    }
    
    // Area 3 - Methods (function, actions...)
    openOverlay() {
        this.searchOverlay.classList.add('search-overlay--active');
        document.querySelector('body').classList.add('body-no-scroll');
        setTimeout( () => this.searchField.focus(), 301);
        this.isOverlayOpen = true;
        return false;
    }
    closeOverlay() {
        this.searchOverlay.classList.remove('search-overlay--active');
        document.querySelector('body').classList.remove('body-no-scroll');
        this.searchField.value = '';
        this.isOverlayOpen = false;
    }
    keyPressDispatcher(e) {
        const inputs = document.querySelectorAll('input, textarea'); //get inputs
        const isAnyFocused = Array.from(inputs).some(input => input === document.activeElement); //return any active input
    
        // s=83 esc=27
        if(e.keyCode === 83 && !this.isOverlayOpen && !isAnyFocused) {
            this.openOverlay();
        }
        
        if(e.keyCode === 27 && this.isOverlayOpen) {
            this.closeOverlay();
        }
    }
    typingLogic() {
        if(this.searchField.value !== this.previousValue) {
            clearTimeout(this.typingTimer);

            if(this.searchField.value) {
                if(!this.isSpinnerVisible) {
                    this.resultsDiv.innerHTML = "";
                    const newDiv = document.createElement("div");
                    newDiv.classList.add("spinner-loader");
                    this.resultsDiv.appendChild(newDiv);
                    this.isSpinnerVisible = true;
                }
                this.typingTimer = setTimeout( () => this.getResults(), 750);
                this.previousValue = this.searchField.value;
            }else {
                this.resultsDiv.innerHTML = "";
                this.isSpinnerVisible = false;
            }

        }
    }
    async getResults() {
        try {
            const response = await fetch(`${universityData.root_url}/wp-json/university/v1/search?term=${this.searchField.value}`);
            const data = await response.json();
            this.resultsDiv.innerHTML = `
                <div class="row">
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">General Information</h2>
                            ${data.generalInfo.length ? '<ul class="link-list min-list">' : `<p>No programs match that search.</p>`}
                                ${data.generalInfo.map( postData =>
                                    `<li><a href="${postData.permalink}">${postData.title}</a> ${postData.postType === "post" ? `by ${postData.authorName}` : ""}</li>`
                                ).join('')}
                            ${data.generalInfo.length ? '</ul>' : ''}
                    </div>
                </div>
                <div class="one-third">
                    <h2 class="search-overlay__section-title">Programs</h2>
                        ${data.programs.length ? '<ul class="link-list min-list">' : `<p>No programs match that search. <a href="${universityData.root_url}/programs">View All Programs</a></p>`}
                            ${data.programs.map( postData =>
                                `<li><a href="${postData.permalink}">${postData.title}</a></li>`
                            ).join('')}
                        ${data.programs.length ? '</ul>' : ''}
                        <h2 class="search-overlay__section-title">Professors</h2>
                        ${data.professors.length ? '<ul class="professor-cards">' : '<p>Sorry, no results found</p>'}
                            ${data.professors.map( postData =>
                                `
                                <li class="professor-card__list-item">
                                    <a class="professor-card" href="${postData.permalink}">
                                        <img class="professor-card__image" src="${postData.image}" alt="">
                                        <span class="professor-card__name">${postData.title}</span>
                                    </a>
                                </li>
                                `
                            ).join('')}
                        ${data.professors.length ? '</ul>' : ''}
                </div>
                <div class="row">
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">Campuses</h2>
                            ${data.campuses.length ? '<ul class="link-list min-list">' : `<p>No campuses match that search. <a href="${universityData.root_url}/campuses">View All Campuses</a></p>`}
                                ${data.campuses.map( postData =>
                                    `<li><a href="${postData.permalink}">${postData.title}</a></li>`
                                ).join('')}
                            ${data.campuses.length ? '</ul>' : ''}
                            
                            <h2 class="search-overlay__section-title">Events</h2>
                            ${data.events.length ? '' : `<p>No events match that search. <a href="${universityData.root_url}/events">View All events</a></p>`}
                                ${data.events.map( postData =>
                                    `
                                    <div class="event-summary">
                                        <a class="event-summary__date t-center" href="${postData.permalink}">
                                            <span class="event-summary__month">${postData.month}</span>
                                            <span class="event-summary__day">${postData.day}</span>
                                        </a>
                                        <div class="event-summary__content">
                                            <h3 class="event-summary__title headline headline--tiny"><a href="${postData.permalink}">${postData.title}</a></h3>
                                            <p>
                                                ${postData.description}
                                                <a href="${postData.permalink}" class="nu gray">Learn more</a>
                                            </p>
                                        </div>
                                    </div>
                                    `
                                ).join('')}
                            ${data.events.length ? '</ul>' : ''}
                    </div>
                </div>
            `;
            this.isSpinnerVisible = false;
        }
        catch(error) {
            console.error('Error fetching results', error);
            this.resultsDiv.innerHTML = `
            <h2 class="search-overlay__section-title">Sorry! Something went wrong with the search. Please try again.</h2>
            `;
            this.isSpinnerVisible = false;
        };
    }
    addSearchHTML() {
        const searchOverlayDiv = document.createElement('div');
        searchOverlayDiv.classList.add('search-overlay');
        document.querySelector('body').appendChild(searchOverlayDiv);
        searchOverlayDiv.innerHTML = `
                <div class="search-overlay__top">
                    <div class="container">
                    <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
                    <input type="text" class="search-term" placeholder="What are you looking for?" id="search-term" autocomplete="off">
                    <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="container">
                    <div id="search-overlay__results">

                    </div>
                </div>
            `;
    }
}

export default Search

