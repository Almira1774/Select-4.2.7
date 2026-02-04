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
    createUser(userData, className) {
    
    
    
       
        // Создаем элемент пользователя
        const userElement = this.createElement('li', className);
        userElement.innerHTML = `<div class="user-info" > 
                                   <span class="user-name">Name: ${userData.name}</span><br>
                                   <span class="user-owner">Owner: ${userData.owner}</span><br>
                                   <span>Stars: ${userData.stars}</span> 
                                 </div>`;
    
        
        this.usersList.append(userElement);
    
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

    searchClear() {
        this.usersList.innerHTML = ''; //очищаем список поиска
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

    }
    createCheckedList(user) {
      
const checkedItem = this.view.createElement('div', 'added-users')
        const addedElement = this.view.createUser(user, 'added-users-item')

        console.log(addedElement)
        const btnClose = this.view.createElement('div', 'btn-close')
        btnClose.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L15 15M15 1L1 15" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
`;
        btnClose.addEventListener('click', () => {
            checkedList.removeChild(checkedItem)
            this.addedIds.delete(user.id);
            console.log(this.addedIds)
          
        })
        let checkedList = this.view.searchWrapper.querySelector('.checked-users-wrapper')
        if (!checkedList) {
            checkedList = this.view.createElement('div', 'checked-users-wrapper')
            this.view.searchWrapper.append(checkedList)
        }

        checkedItem.append(addedElement)
        checkedItem.append(btnClose)
        checkedList.append(checkedItem)
        this.view.searchClear()
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

                const userData = this.view.createData(item)
               
                
                const userItem = this.view.createUser(userData, 'user');
                
                this.view.onFocuse(userItem);
                console.log(userItem)
                
                userItem.addEventListener('click', () => {
                    if (this.addedIds.has(userData.id)) {
                       console.log('This user is already added!');
                        this.view.searchClear();
                        this.view.searchInput.value = '';
                        return;
                    }
                    this.createCheckedList(userData);
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
