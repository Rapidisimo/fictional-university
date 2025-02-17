class MyNotes {
    constructor() {
        if(window.location.pathname.endsWith('my-notes/')) {
            this.submitButton = document.querySelector('.submit-note');
            this.listOfNotes = document.querySelector('#my-notes');
            this.events();
        }
    }

    events() {

        // Continue adding else if for other buttons
        this.listOfNotes.addEventListener('click', (e) => {
            if(e.target.classList.contains("edit-note") || e.target.parentNode.classList.contains("edit-note")) {
                this.editNote(e);
            }else if(e.target.classList.contains("delete-note") || e.target.parentNode.classList.contains("delete-note")) {
                this.deleteNote(e);
            }else if(e.target.classList.contains("update-note") || e.target.parentNode.classList.contains("update-note")) {
                this.updateNote(e);
            }
        })


        this.submitButton.addEventListener('click', (e) => this.createNote(e));
    }

    // Methods will go here
    async deleteNote(e) {
        const postId = e.target.closest('li').dataset.postId;
        const currentNote = e.target.closest('li');
        const url = `${universityData.root_url}/wp-json/wp/v2/note/${postId}`;
        const myHeaders = new Headers();
        myHeaders.append("X-WP-Nonce", universityData.nonce);

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: myHeaders,
            });
            if(!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            console.log("Success:", json);
            if(json.status === "trash") {
                currentNote.remove();
            }else {
                throw new Error('Server did not confirm note deletion');
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    async updateNote(e) {
        const postId = e.target.closest('li').dataset.postId;
        const noteTitle = e.target.closest('li').querySelector('input').value;
        const noteContent = e.target.closest('li').querySelector('textarea').value;
        
        const ourUpdatedPost = {
            'title': noteTitle,
            'content': noteContent
        }

        const url = `${universityData.root_url}/wp-json/wp/v2/note/${postId}`;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-WP-Nonce", universityData.nonce);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(ourUpdatedPost)
            });
            if(!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            console.log("Success:", json);
            this.makeNoteReadOnly();
        } catch (error) {
            console.error(error.message);
        }
    }

    async createNote(e) {
        const noteTitle = e.target.closest('div .create-note').querySelector('input');
        const noteContent = e.target.closest('div .create-note').querySelector('textarea');
        
        const ourNewPost = {
            'title': noteTitle.value,
            'content': noteContent.value,
            'status': 'publish',
        }

        const url = `${universityData.root_url}/wp-json/wp/v2/note/`;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("X-WP-Nonce", universityData.nonce);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(ourNewPost)
            });

            const jsonData = await response.json();
            
            if(!response.ok) {
                if(jsonData.data.message === 'You have reached your note limit') {
                    console.log("Result:", jsonData);
                    alert(jsonData.data.message);
                    return;
                }
                throw new Error(`Response status: ${response.status}`);
            }

            // reset form
            noteTitle.value = "";
            noteContent.value = "";
            // add newly created note to DOM
            const newNote = document.createElement('li');
            newNote.dataset.postId = jsonData.id;
            newNote.innerHTML = `
                <input readonly value="${jsonData.title.raw}" class="note-title-field">
                <span class="edit-note"><i class="fa fa-pencil" aria-hidden="true"></i>Edit</span>
                <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="true"></i>Delete</span>
                <textarea readonly class="note-body-field">${jsonData.content.raw}</textarea>
                <span class="update-note btn btn--blue btn--small"><i class="fa fa-arrow-right" aria-hidden="true"></i>Save</span>
            `;
            // Add note to the top of the list of notes
            this.listOfNotes.insertAdjacentElement('afterbegin', newNote);
        } catch (error) {
            console.error(error.message);
        }
    }

    editNote(e) {
        this.thisNote = e.target.closest('li');
        this.fields = this.thisNote.querySelectorAll('.note-title-field, .note-body-field');
        this.saveButton = this.thisNote.querySelector('.update-note');
        this.editButton = this.thisNote.querySelector('.edit-note');
        
        if(this.editButton.innerText === 'Edit') {
            this.makeNoteEditable();
        }else if(this.editButton.innerText === 'Cancel') {
            this.makeNoteReadOnly();
        }
    }
    
    makeNoteEditable() {
        this.editButton.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>Cancel`;
        this.saveButton.classList.toggle("update-note--visible");
        this.fields.forEach((input) => {
            input.removeAttribute("readonly");
            input.classList.toggle("note-active-field");
        })
    }
    
    makeNoteReadOnly() {
        this.editButton.innerHTML = `<i class="fa fa-pencil" aria-hidden="true"></i>Edit`;
        this.saveButton.classList.toggle("update-note--visible");
        this.fields.forEach((input) => {
            input.setAttribute("readonly", "");
            input.classList.toggle("note-active-field");
        })
    }

}

export default MyNotes;