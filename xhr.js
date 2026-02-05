class View {
    constructor() {
        this.body = document.body;
        this.searchWrapper = this.createElement('div', 'search-wrapper');

        this.body.append(this.searchWrapper);
        this.inputWrapper = this.createElement('div', 'input-wrapper');

        this.searchInput = this.createElement('input', 'input-wrapper_input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Введите имя реппозитория...';

        this.repositoriesWrapper = this.createElement('div', 'repositories-wrapper');
        this.repositoriesList = this.createElement('ul', 'repositories-wrapper__list');

        this.repositoriesWrapper.append(this.repositoriesList);
        this.inputWrapper.append(this.searchInput);
        this.inputWrapper.append(this.repositoriesWrapper);
        this.searchWrapper.append(this.inputWrapper);
    }

    createElement(elementTagNAme, elementClassName) {
        const element = document.createElement(elementTagNAme);
        if (elementClassName) {
            element.classList.add(elementClassName);
        }
        return element;
    }
    createUser(userData, className) {

        // Создаем элемент пользователя
        const userElement = this.createElement('li', className);
        userElement.innerHTML = `<div class="repository-info" > 
                                   <span class="repository-info_name">Name: ${userData.name}</span><br>
                                   <span class="repository-info_owner">Owner: ${userData.owner}</span><br>
                                   <span>Stars: ${userData.stars}</span> 
                                 </div>`;


        this.repositoriesList.append(userElement);

        return userElement;
    }


    onFocuse(element) {
        element.addEventListener('mouseover', () => {
            console.log('Mouse over event triggered');
            element.classList.add('focused')
        })
        element.addEventListener('mouseout', () => {
            console.log('Mouse over event triggered');
            element.classList.remove('focused')
        })
    }

    clearSearchList() {
        this.repositoriesList.innerHTML = ''; //очищаем список поиска
    }
    createData(user) {
        return {
            id: user.id,
            name: user.name,
            owner: user.language,
            stars: user.stargazers_count
        }
    }

    debounce(fn, debounceTime) {
        let timer
        return function () {
            const callFn = () => {
                fn.apply(this, arguments)
            }
            clearTimeout(timer)
            timer = setTimeout(callFn, debounceTime)

        }

    };
}

class Search {
    constructor(view) {
        this.view = view;
        this.controller = new AbortController();
        this.debouncedSearchUsers = this.view.debounce(this.searchUsers.bind(this), 600);
        this.view.searchInput.addEventListener('keyup', this.debouncedSearchUsers.bind(this));
        this.view.searchInput.addEventListener('keypress', this.handleKeyPress.bind(this));
        this.addedIds = new Set();
        
        this.view.searchWrapper.addEventListener('click', (event) => {
            if (!this.view.searchInput.contains(event.target)) {
                console.log('clicked outside');
                this.view.clearSearchList();
                this.view.searchInput.value = '';
            }
        })

    }

    createaddedList(user) {

        const repositoryWraper = this.view.createElement('div', 'added-repository-wraper')
        const addedElement = this.view.createUser(user, 'added-repository')
        const btnClose = this.view.createElement('div', 'btn-close')
        btnClose.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L15 15M15 1L1 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
`;
        btnClose.addEventListener('click', () => {
            addedList.removeChild(repositoryWraper)
            this.addedIds.delete(user.id);
            console.log(this.addedIds)

        })
        let addedList = this.view.searchWrapper.querySelector('.added-list')
        if (!addedList) {
            addedList = this.view.createElement('div', 'added-list')
            this.view.searchWrapper.append(addedList)
        }
        this.view.onFocuse(repositoryWraper);
        repositoryWraper.append(addedElement)
        repositoryWraper.append(btnClose)
        addedList.append(repositoryWraper)
        this.view.clearSearchList()
        this.view.searchInput.value = ''
        return addedElement
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
            this.view.clearSearchList();
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
            if (!data.items || data.items.length === 0) {
                throw new Error(`No data found`);
            }
            this.view.clearSearchList();

            const result = data.items.slice(0, 5);

            result.forEach(item => {

                const userData = this.view.createData(item)
                const userItem = this.view.createUser(userData, 'user');
                this.view.onFocuse(userItem);
                console.log(userItem)

                userItem.addEventListener('click', () => {
                    if (this.addedIds.has(userData.id)) {
                        console.log('This user is already added!');
                        this.view.clearSearchList();
                        this.view.searchInput.value = '';
                        return;
                    }
                    this.createaddedList(userData);
                    console.log(userData.id)
                    this.addedIds.add(userData.id);
                    console.log(this.addedIds)

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
