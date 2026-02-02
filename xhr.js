class View {
    constructor() {
        this.body = document.body;
        this.searchWrapper = this.createElement('div', 'search-wrapper');

        this.body.append(this.searchWrapper);
        this.searchLine = this.createElement('div', 'search-line');

        this.searchInput = this.createElement('input', 'search-input');


        this.usersWrapper = this.createElement('div', 'users-wrapper');
        this.usersList = this.createElement('ul', 'users-list');

        this.usersWrapper.append(this.usersList);
        this.searchLine.append(this.searchInput);
        this.searchLine.append(this.usersWrapper);
        this.searchWrapper.append(this.searchLine);



    }
    createElement(elementTagNAme, elementClassName) {
        const element = document.createElement(elementTagNAme);
        if (elementClassName) {
            element.classList.add(elementClassName);
        }
        return element;
    }
    createUser(userData) {
        const userElement = this.createElement('li', 'user');
        userElement.innerHTML = `<div class="user-info"> 
                                   <span class = "user-name">Name: ${userData.name} </span><br>
                                   <span class="user-owner">Owner: ${userData.owner}</span><br>
                                   <span>Stars: ${userData.stars}</span> 
                                 </div>`;


        this.usersList.append(userElement);
        return userElement;


    }
    searchClear() {
        this.usersList.innerHTML = ''; //очищаем список поиска
    }
    createCheckedList(user) {
        if (this.checkedWrapper) {
            this.checkedWrapper.append(user);
            return user;                                  //создаем обертку для списка добавленных реппозиториев
        }
        this.checkedWrapper = this.createElement('div', 'checked-users-wrapper');
        this.searchWrapper.append(this.checkedWrapper);
        this.checkedWrapper.append(user);
        return user;
    }
    addUserChecked(userItem) {
        const addedUser = this.createCheckedList(userItem)
        console.log(addedUser);                                   //добавляем элемент
        this.searchInput.value = '';
        this.searchClear();
        this.usersList.innerHTML = '';
      
    }


}


class Search {
    constructor(view) {
        this.view = view;
        this.controller = new AbortController();
        this.view.searchInput.addEventListener('keyup', this.searchUsers.bind(this));
        this.view.searchInput.addEventListener('keypress', this.handleKeyPress.bind(this));

    }
    abortRequest() {
        this.controller.abort()
        this.controller = new AbortController()
    }
    handleKeyPress(event) {
        if (event.key === ' ' && this.view.searchInput.value.trim() === '') {
            this.abortRequest();
        }
    }





    async searchUsers() {
        if (this.view.searchInput.value.trim() === '') {
            this.abortRequest();
            this.view.searchClear();
            return;
        }

        try {

            const signal = this.controller.signal;
            const response = await fetch(`https://api.github.com/search/repositories?q=${this.view.searchInput.value}`, {
                signal: signal,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.view.searchClear();

            const result = data.items.slice(0, 5);

            result.forEach(item => {
                const userData = {
                    name: item.name,
                    owner: item.language,
                    stars: item.stargazers_count
                }
                const userItem = this.view.createUser(userData);
                userItem.addEventListener('click', () => {
                    this.view.addUserChecked(userItem);
                })

            })

        }

        catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            }
            else if (error.name === 'HTTPError') {
                console.error('HTTP Error:', error.message);
            }
            else {
                console.error('Error fetching data:', error);
            }
        }
    }
}

new Search(new View());
