import Modal from "../js/modal.js";

const optionsDate = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
}

const optionsTime = {
    hour: 'numeric',
    minute: 'numeric'
}

let contactFlag = 0;
let userFlag = {};

let sortDirFlag = true;
let sortColumnFlag = 'id';

const $body = document.getElementById('body');
const $header = document.createElement('header');
const $headerContainer = document.createElement('div');
const $headerLogo = document.createElement('a');
const $headerSearch = document.createElement('input');
const $headerSearchList = document.createElement('ul');
const $main = document.createElement('main');
const $container = document.createElement('div');
const $heading = document.createElement('h1');

const $tableContainer = document.createElement('div');
const $table = document.createElement('table');
const $tableHead = document.createElement('thead');
const $tableBody = document.createElement('tbody');
const $spinner = document.createElement('div');
const $tableHeadTr = document.createElement('tr');
const $addButton = document.createElement('button');
const $addButtonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const $addButtonSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
const $modal = document.createElement('div');

function createHeadTh(tr, firstText, secondText = '', idOfSort, arrow = true) {
    const $tableHeadTh = document.createElement('th');
    const $tableHeadThContainer = document.createElement('div');
    const $tableHeadThFirstText = document.createElement('span');
    const $tableHeadThSecondText = document.createElement('span');

    tr.append($tableHeadTh);
    $tableHeadTh.append($tableHeadThContainer);
    $tableHeadThContainer.append($tableHeadThFirstText);
    $tableHeadThContainer.append($tableHeadThSecondText);
    $tableHeadTh.classList.add('table-head__th');
    $tableHeadThContainer.classList.add('table-head__th-container');
    $tableHeadThFirstText.textContent = firstText;
    $tableHeadThSecondText.textContent = secondText;
    $tableHeadThFirstText.classList.add('table-head__th-text');
    $tableHeadThSecondText.classList.add('table-head__th-second-text');

    if (arrow == true) {
        const $tableHeadThIcon = document.createElement('span');
        $tableHeadThFirstText.after($tableHeadThIcon);
        $tableHeadThIcon.classList.add('table-head__th-icon');
        $tableHeadThContainer.id = idOfSort;
        $tableHeadThContainer.classList.add('table-head__th-container_sort')
    };
};

$body.append($header);
$header.append($headerContainer);
$headerContainer.append($headerLogo);
$headerContainer.append($headerSearch);
$headerContainer.append($headerSearchList);
$body.append($main);
$main.append($container);
$container.append($heading);
$container.append($tableContainer);
$tableContainer.append($table);
$addButton.textContent = 'Добавить клиента';
$container.append($addButton);
$addButton.append($addButtonSvg);
$addButtonSvg.append($addButtonSvgPath);

$addButtonSvg.setAttributeNS(null, "width", 23);
$addButtonSvg.setAttributeNS(null, "height", 16);
$addButtonSvg.setAttributeNS(null, "viewBox", '0 0 23 16');
$addButtonSvg.setAttributeNS(null, "fill", 'none');
$addButtonSvgPath.setAttributeNS(null, "d", 'M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z');
$addButtonSvgPath.setAttributeNS(null, "fill", '#9873FF');

$container.append($modal);
$table.append($tableHead);
$table.append($tableBody);
$tableHead.append($tableHeadTr);
$tableBody.append($spinner)

createHeadTh($tableHeadTr, 'ID', '', 'id');
document.getElementById('id').querySelector('.table-head__th-icon').classList.add('active')
createHeadTh($tableHeadTr, 'Фамилия Имя Отчество', 'А-Я', 'NSL');
createHeadTh($tableHeadTr, 'Дата и время создания', '', 'createdAt');
createHeadTh($tableHeadTr, 'Последние изменения', '', 'updatedAt');
createHeadTh($tableHeadTr, 'Контакты', '', '', false);
createHeadTh($tableHeadTr, 'Действия', '', '', false);

$header.classList.add('header');
$headerContainer.classList.add('header__container');
$headerLogo.classList.add('header__logo');
$headerLogo.href = '#';
$headerSearch.classList.add('header__search');
$headerSearch.placeholder = 'Введите текст';
$headerSearchList.classList.add('header__search-list')
$main.classList.add('main');
$container.classList.add('main__container');
$heading.textContent = 'Клиенты';
$heading.classList.add('main__heading');
$addButton.classList.add('main__button');
$addButton.dataset.modal = 'modal-create';
$addButton.dataset.animation = 'fadeInUp';
$addButton.dataset.speed = '500';
$tableContainer.classList.add('main__table-container');
$table.classList.add('main__table');
$tableHead.classList.add('table__table-head');
$tableHeadTr.classList.add('table-head__tr');
$tableBody.classList.add('table__table-body');
$modal.classList.add('main__modal', 'fix-block');
$spinner.classList.add('table-body__spinner');

let listData = [];

try {
    $tableBody.classList.add('loading');
    $addButton.disabled = true;
    $headerSearch.disabled = true;

    const response = await fetch(`http://localhost:3000/api/clients`);
    listData = await response.json();

    $tableBody.classList.remove('loading');
    $addButton.disabled = false;
    $headerSearch.disabled = false;
}
catch(error) {
    alert('Ошибка сервера')
    $tableBody.classList.remove('loading');
}

let searchList = []

let timerId;

function filter(arr, prop, value) {
    return arr.filter(function (oneUser) {
      if (oneUser[prop].toString().toLowerCase().includes(value.toLowerCase().trim())) {
        return true
      }
    });
};
  
$headerSearch.addEventListener('input', function () {
    window.clearTimeout(timerId);

    if (searchList.length != listData.length) {
        searchList = [];
        for (const oneUser of listData) {
            searchList.push(oneUser)
        };
    };

    let searchListCopy = [...searchList]

    function clearSearchList() {
        for (const item of $headerSearchList.querySelectorAll('.header__search-list-item')) {
            item.remove()
        };
    };

    function renderSearchList() {
        for (const oneUser of searchListCopy) {
            const $searchItem = document.createElement('li')
            const $searchItemLink = document.createElement('a')

            $headerSearchList.append($searchItem);
            $searchItem.append($searchItemLink);

            $searchItem.classList.add('header__search-list-item');
            $searchItemLink.classList.add('header__search-list-link', 'js-scroll-link');

            $searchItemLink.textContent = oneUser.NSL;
            $searchItemLink.href = '#' + 'scroll' + oneUser.id;

            $searchItemLink.addEventListener('click', function (e) {
                e.preventDefault();
                for (const searchedItem of document.querySelectorAll('.searched')) {
                    searchedItem.classList.remove('searched');
                };
                document.getElementById('scroll' + oneUser.id).classList.add('searched');
                const href = this.getAttribute('href').substring(1);
                const scrollTarget = document.getElementById(href);
                const elementPosition = scrollTarget.getBoundingClientRect().top;
            
                window.scrollBy({
                  top: elementPosition,
                  behavior: 'smooth'
                });
            })
        };

        if (document.querySelectorAll('.header__search-list-item').length == 0) {
            $headerSearchList.classList.remove('visible')
        };
    };

    if ($headerSearch.value.trim() == '') {
        timerId = window.setTimeout(() => {
            clearSearchList()
            $headerSearchList.classList.remove('visible')
        }, 300);
    };

    if ($headerSearch.value.trim() !== '') {
        timerId = window.setTimeout(() => {
            clearSearchList()
            $headerSearchList.classList.add('visible')
            searchListCopy = filter(searchListCopy, 'NSL', $headerSearch.value);
            renderSearchList()
        }, 300);
    };
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.header__search-list') && !e.target.closest('.header__search') || e.target.closest('.header__search-list-link')) {
        $headerSearchList.classList.remove('visible');
    };
});

document.addEventListener('focusin', function (e) {
    if (!e.target.closest('.header__search-list') && !e.target.closest('.header__search')) {
        $headerSearchList.classList.remove('visible');
    };
});


function addContact($addContact, $modalContactList, selectedTypeOfContact = 'Telephone') {
    const $contactItem = document.createElement('li');
    const $contactType = document.createElement('select');
    const $contactValue = document.createElement('input');
    const $contactDeleteButton = document.createElement('button');
    const $contactDeleteButtonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const $contactDeleteButtonSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    contactFlag = contactFlag + 1;

    $modalContactList.append($contactItem);
    $contactItem.append($contactType);
    $contactItem.append($contactValue);
    $contactItem.append($contactDeleteButton);
    $contactDeleteButton.append($contactDeleteButtonSvg);
    $contactDeleteButtonSvg.append($contactDeleteButtonSvgPath);
    $contactItem.classList.add('modal__contact')

    $contactType.classList.add('modal__contact-type-select');
    $contactValue.classList.add('modal__contact-input');
    $contactDeleteButton.classList.add('modal__contact-delete');

    $contactDeleteButtonSvg.setAttributeNS(null, "width", 12);
    $contactDeleteButtonSvg.setAttributeNS(null, "height", 12);
    $contactDeleteButtonSvg.setAttributeNS(null, "viewBox", '0 0 12 12');
    $contactDeleteButtonSvg.setAttributeNS(null, "fill", 'none');
    $contactDeleteButtonSvgPath.setAttributeNS(null, "d", 'M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z');
    $contactDeleteButtonSvgPath.setAttributeNS(null, "fill", '#B0B0B0');

    $contactDeleteButton.addEventListener('click', async function (e) {
        e.preventDefault();
        $contactItem.classList.add('animate-growth-down');
        setTimeout(() => {
            $contactItem.remove()
        }, 200)
        
        contactFlag = contactFlag - 1;
        if (contactFlag < 10) {
            $addContact.classList.remove('disabled');
        };
        if (contactFlag == 0) {
            $addContact.classList.remove('modal__contact-button_more-then-one');
            $modalContactList.classList.remove('modal__contact-list_more-then-one');
        }
    });

    if (contactFlag > 0) {
        $addContact.classList.add('modal__contact-button_more-then-one');
        $modalContactList.classList.add('modal__contact-list_more-then-one');
    };

    if (contactFlag == 10) {
        $addContact.classList.add('disabled');
    };

    const choices = new Choices($contactType, {
        searchEnabled: false,
        itemSelectText: '',
        position: 'bottom',
        choices: [
        { value: 'Telephone', label: 'Телефон'},
        { value: 'Email', label: 'Email'},
        { value: 'VK', label: 'VK'},
        { value: 'Facebook', label: 'Facebook'},
        { value: 'Other', label: 'Другое'},
      ],
    });

    choices.setChoiceByValue(selectedTypeOfContact);
};

function createModalContent(action) {
    const $modalWindow = document.createElement('form')
    const $modalHeading = document.createElement('h2');
    const $modalButton = document.createElement('button');
    const $modalCancel = document.createElement('button');
    const $modalExit = document.createElement('button');

    $modalWindow.dataset.target = 'modal-' + action;

    $modal.append($modalWindow);
    $modalWindow.append($modalHeading);

    function createInput($containerOfBlock, placeholderText, idOfInput, star = true) {
        const $inputContainer = document.createElement('div');
        const $input = document.createElement('input');
        const $placeholder = document.createElement('label');
        const $placeholderText = document.createElement('span');

        $containerOfBlock.append($inputContainer);
        $inputContainer.append($input);
        $inputContainer.append($placeholder);
        $placeholder.append($placeholderText);

        $inputContainer.classList.add('modal__input-container');
        $input.classList.add('modal__input');
        $input.id = action + '-' + idOfInput;
        $placeholder.classList.add('modal__input-placeholder');
        $placeholderText.textContent = placeholderText;
        $placeholderText.classList.add('modal__input-placeholder-text')
        if (star == true) {
            const $star = document.createElement('span');
            $placeholder.append($star);
            $star.classList.add('modal__star');
            $star.textContent = '*';
        }

        $input.addEventListener('input', function () {
            if ($input.value !== '' && action == 'create') {
                $placeholder.style.visibility = 'hidden';
            } else {
                $placeholder.style.visibility = 'visible';
            }
        });

        if (action == 'edit') {
            $placeholder.classList.add('modal__input-placeholder_edit')
        };
    };

    function validation() {
        const surname = document.getElementById(action + '-surname-input');
        const name = document.getElementById(action + '-name-input');
        const errorBlock = $modalWindow.querySelector('.modal__error');
        const surnameError = $modalWindow.querySelectorAll('.modal__error-item')[0];
        const nameError = $modalWindow.querySelectorAll('.modal__error-item')[1];
        const contactError = $modalWindow.querySelectorAll('.modal__error-item')[2];

        if (surname.value.trim() == '') {
            surname.classList.add('error');
            surnameError.classList.add('error')
            surnameError.textContent = 'Фамилия обязательна для заполнения';
            errorBlock.classList.add('error');
            $modalButton.disabled = true;
        };
        if (name.value.trim() == '') {
            name.classList.add('error');
            nameError.classList.add('error');
            nameError.textContent = 'Имя обязательно для заполнения';
            errorBlock.classList.add('error');
            $modalButton.disabled = true;
        };

        for (const oneContactInput of $modalWindow.querySelectorAll('.modal__contact-input')) {
            if (oneContactInput.value.trim() == '') {
                oneContactInput.classList.add('error');
                contactError.classList.add('error')
                contactError.textContent = 'Каждый добавленный контакт должен быть полностью заполнен';
                errorBlock.classList.add('error');
                $modalButton.disabled = true;
            };

            oneContactInput.addEventListener('input', function () {
                oneContactInput.classList.remove('error');

                if ($modalWindow.querySelectorAll('.modal__contact-input.error').length == 0) {
                    contactError.classList.remove('error')
                    setTimeout(() => {
                        contactError.textContent = ''
                    }, 300);
                };

                if ($modalWindow.querySelectorAll('.error').length == 1) {
                    setTimeout(() => {
                        errorBlock.classList.remove('error');
                        $modalButton.disabled = false;
                    }, 300);
                };
            });

            const contactDeleteButtonList = $modalWindow.querySelectorAll('.modal__contact-delete');

            for (const contactDeleteButton of contactDeleteButtonList) {
                contactDeleteButton.addEventListener('click', function () {
                    if (contactFlag == 0) {
                        setTimeout(() => {
                            contactError.textContent = '';
                        }, 300);
                        contactError.classList.remove('error')
                        if ($modalWindow.querySelectorAll('.error').length == 2) {
                            errorBlock.classList.remove('error');
                            $modalButton.disabled = false;
                        };
                    };

                    if ($modalWindow.querySelectorAll('.error').length == 3) {
                        setTimeout(() => {
                            contactError.textContent = '';
                        }, 300);
                        contactError.classList.remove('error');
                        errorBlock.classList.remove('error');
                        $modalButton.disabled = false;
                    };
                });
            };
        };

        surname.addEventListener('input', function () {
            surname.classList.remove('error');
            surnameError.classList.remove('error');

            setTimeout(() => {
                surnameError.textContent = ''
            }, 300);

            if ($modalWindow.querySelectorAll('.error').length == 1) {
                setTimeout(() => {
                    errorBlock.classList.remove('error');
                    $modalButton.disabled = false;
                }, 300);
            };
        });

        name.addEventListener('input', function () {
            name.classList.remove('error');
            nameError.classList.remove('error');

            setTimeout(() => {
                nameError.textContent = ''
            }, 300);

            if ($modalWindow.querySelectorAll('.error').length == 1) {
                setTimeout(() => {
                    errorBlock.classList.remove('error');
                    $modalButton.disabled = false;
                }, 300);
            };
        });

        if ($modalWindow.querySelectorAll('.error').length > 0) {
            return false;
        };
        if ($modalWindow.querySelectorAll('.error').length == 0) {
            return true;
        };
    };

    if (action == 'create' || action == 'edit') {
        const $modalContactsButton = document.createElement('button');
        const $modalContactList = document.createElement('ul');
        const $modalError = document.createElement('div');
        const $modalErrorName = document.createElement('p');
        const $modalErrorSurname = document.createElement('p');
        const $modalErrorContact = document.createElement('p');

        createInput($modalWindow, 'Фамилия', 'surname-input');
        createInput($modalWindow, 'Имя', 'name-input');
        createInput($modalWindow, 'Отчество', 'lastname-input', false);

        $modalWindow.append($modalContactList);
        $modalContactsButton.textContent = 'Добавить контакт';
        $modalWindow.append($modalContactsButton);
        $modalWindow.append($modalError);
        $modalError.append($modalErrorSurname);
        $modalError.append($modalErrorName);
        $modalError.append($modalErrorContact);

        $modalContactList.classList.add('modal__contact-list')
        $modalContactsButton.classList.add('modal__contact-button');
        $modalError.classList.add('modal__error')
        $modalButton.textContent = 'Сохранить';
        $modalCancel.textContent = 'Отмена';
        $modalErrorSurname.classList.add('modal__error-item');
        $modalErrorName.classList.add('modal__error-item');
        $modalErrorContact.classList.add('modal__error-item');

        $modalContactsButton.addEventListener('click', async function (e) {
            e.preventDefault();
            addContact($modalContactsButton, $modalContactList);
        });
    };

    if (action == 'create') {
        $modalHeading.textContent = 'Новый клиент';
        $modalCancel.classList.add('modal__cancel-button');

        $modalWindow.addEventListener('submit', async function (e) {
            e.preventDefault();
            validation()
            if (validation() == false) {
                return false;
            }
            await onCreate();
            modal.close();
            sortDirFlag = true;
            sortColumnFlag = 'id';
            for (const oneColumn of document.querySelectorAll('.table-head__th-container_sort')) {
                oneColumn.querySelector('.table-head__th-text').classList.remove('active');
                oneColumn.querySelector('.table-head__th-icon').classList.remove('active');
            }
            document.getElementById('id').querySelector('.table-head__th-icon').classList.add('active')
            render();
        });
    };

    if (action == 'edit') {
        const $modalIdFlag = document.createElement('span');

        $modalWindow.append($modalIdFlag);

        $modalIdFlag.classList.add('modal__id-flag');

        $modalHeading.textContent = 'Изменить данные';
        $modalCancel.textContent = 'Удалить клиента';
        $modalCancel.classList.add('modal__delete-button');

        $modalWindow.addEventListener('submit', async function (e) {
            e.preventDefault();
            validation()
            if (validation() == false) {
                return;
            }
            await onEdit();
            modal.close();
            render();
        });

        $modalCancel.addEventListener('click', async function (e) {
            e.preventDefault();
            await onDelete();
            modal.close()
            render();
        });
    };

    if (action == 'delete') {
        const $modalText = document.createElement('p');

        $modalWindow.append($modalText);

        $modalHeading.textContent = 'Удалить клиента';
        $modalHeading.classList.add('modal__heading_delete');
        $modalButton.textContent = 'Удалить';
        $modalText.textContent = 'Вы действительно хотите удалить данного клиента?';
        $modalText.classList.add('modal__text');
        $modalCancel.classList.add('modal__cancel-button');

        $modalWindow.addEventListener('submit', async function (e) {
            e.preventDefault();
            await onDelete();
            modal.close()
            render();
        });
    };

    $modalWindow.append($modalButton);
    $modalWindow.append($modalCancel);
    $modalWindow.append($modalExit);

    $modalWindow.classList.add('modal__container');
    $modalHeading.classList.add('modal__heading');
    $modalButton.classList.add('modal__aprove-button');
    $modalButton.type = 'submit';
    $modalExit.classList.add('modal__exit-button');

    $modalCancel.addEventListener('click', function (e) {
        e.preventDefault();
    });

    $modalExit.addEventListener('click', function (e) {
        e.preventDefault();
    });

    function getContactArray() {
        let contactArray = [];
        for (let i = 0; i < contactFlag; i++) {
            let contactItem = {};
            contactItem.type = document.querySelectorAll('.modal__contact-type-select')[i].value.trim();
            contactItem.value = document.querySelectorAll('.modal__contact-input')[i].value.trim();
            contactArray.push(contactItem);
        };
        return contactArray;
    };

    function disableElements() {
        $modalWindow.classList.add('disabled');
        $modalWindow.querySelector('.modal__aprove-button').classList.add('loading');
        $modalWindow.querySelector('.modal__aprove-button').disabled = true;
    }

    function enableElements() {
        $modalWindow.classList.remove('disabled');
        $modalWindow.querySelector('.modal__aprove-button').classList.remove('loading');
        $modalWindow.querySelector('.modal__aprove-button').disabled = false;
    }

    async function onCreate() {
        try {
            disableElements()

            const $modalSurname = document.getElementById('create-surname-input');
            const $modalName = document.getElementById('create-name-input');
            const $modalLastname = document.getElementById('create-lastname-input');

            const response = await fetch('http://localhost:3000/api/clients', {
                method: 'POST',
                body: JSON.stringify({
                    name: $modalName.value.trim(),
                    surname: $modalSurname.value.trim(),
                    lastName: $modalLastname.value.trim(),
                    contacts: getContactArray(),
                }),
                headers: {
                  'Content-type': 'application/json',
                }
            });
            const client = await response.json();
            listData.push(client);

            enableElements()
        }

        catch (error) {
            enableElements()
            alert('Ошибка сервера')
          }
    }

    async function onEdit() {
        try {
            disableElements()

            const $modalSurname = document.getElementById('edit-surname-input');
            const $modalName = document.getElementById('edit-name-input');
            const $modalLastname = document.getElementById('edit-lastname-input');
    
            const userNumber = listData.indexOf(userFlag);
            const response = await fetch(`http://localhost:3000/api/clients/${userFlag.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name: $modalName.value.trim(),
                    surname: $modalSurname.value.trim(),
                    lastName: $modalLastname.value.trim(),
                    contacts: getContactArray(),
                }),
                headers: {
                  'Content-type': 'application/json',
                }
            });
            const client = await response.json();
            listData.splice(userNumber, 1, client);

            enableElements()
        }

        catch (error) {
            enableElements()
            alert('Ошибка сервера')
        }
    };

    async function onDelete() {
        try {
            disableElements()

            await fetch(`http://localhost:3000/api/clients/${userFlag.id}`, {
                method: 'DELETE',
            });
            const response = await fetch(`http://localhost:3000/api/clients`);
            listData = await response.json();

            enableElements()
        }

        catch (error) {
            enableElements()
            alert('Ошибка сервера')
        }
    };
};

createModalContent('create');
createModalContent('edit');
createModalContent('delete');

const modal = new Modal({
    isOpen: () => {
    },
    isClose: () => {
        contactFlag = 0;
        userFlag = {};
        window.location.hash = '';
        for (const oneModal of document.querySelectorAll('.modal__container')) {
            oneModal.reset();
        };
        for (const oneContactList of document.querySelectorAll('.modal__contact-list')) {
            oneContactList.classList.remove('modal__contact-list_more-then-one');
        }
        for (const oneButton of $modal.querySelectorAll('.modal__contact-button')) {
            oneButton.classList.remove('disabled', 'modal__contact-button_more-then-one');
        };
        for (const oneContact of document.querySelectorAll('.modal__contact')) {
            oneContact.outerHTML = ''
        };
        for (const onePlaceholder of document.querySelectorAll('.modal__input-placeholder')) {
            onePlaceholder.style.visibility = 'visible'
        };
        for (const errorItem of document.querySelectorAll('.error')) {
            errorItem.classList.remove('error');
        }
        for (const errorItem of document.querySelectorAll('.modal__error-item')) {
            errorItem.textContent = ''
        }
        for (const aproveButton of document.querySelectorAll('.modal__aprove-button')) {
            aproveButton.disabled = false;
        }
        history.pushState(null, null, location.href.replace('#', ''));
    }
  });

function createUserTr(oneUser) {
    const $userTr = document.createElement('tr');
    const $userTrID = document.createElement('th');
    const $userTrNSL = document.createElement('th');
    const $userTrCreation = document.createElement('th');
    const $userTrCreationDate = document.createElement('span');
    const $userTrCreationTime = document.createElement('span');
    const $userTrChanges = document.createElement('th');
    const $userTrChangesDate = document.createElement('span');
    const $userTrChangesTime = document.createElement('span');
    const $userTrContacts = document.createElement('th');
    const $userTrContactsContaier = document.createElement('div');
    const $userTrActions = document.createElement('th');
    const $userTrEditButton = document.createElement('button');
    const $userTrDeleteButton = document.createElement('button');

    $userTr.append($userTrID);
    $userTr.append($userTrNSL);
    $userTr.append($userTrCreation);
    $userTrCreation.append($userTrCreationDate);
    $userTrCreation.append($userTrCreationTime);
    $userTr.append($userTrChanges);
    $userTrChanges.append($userTrChangesDate);
    $userTrChanges.append($userTrChangesTime);
    $userTr.append($userTrContacts);
    $userTrContacts.append($userTrContactsContaier);
    $userTr.append($userTrActions);
    $userTrActions.append($userTrEditButton);
    $userTrActions.append($userTrDeleteButton);

    $userTrID.textContent = oneUser.id;
    $userTrNSL.textContent = oneUser.surname + ' ' + oneUser.name + ' ' + oneUser.lastName;
    $userTrCreationDate.textContent = (new Date (oneUser.createdAt)).toLocaleString('ru', optionsDate);
    $userTrCreationTime.textContent = (new Date (oneUser.createdAt)).toLocaleString('ru', optionsTime);
    $userTrChangesDate.textContent = (new Date (oneUser.updatedAt)).toLocaleString('ru', optionsDate);
    $userTrChangesTime.textContent = (new Date (oneUser.updatedAt)).toLocaleString('ru', optionsTime);
    $userTrEditButton.textContent = 'Изменить';
    $userTrDeleteButton.textContent = 'Удалить';

    $userTr.classList.add('table-body__client');
    $userTr.id = 'scroll' + oneUser.id;
    $userTrID.classList.add('client__th', 'client__th_id');
    $userTrNSL.classList.add('client__th');
    $userTrCreation.classList.add('client__th');
    $userTrCreationDate.classList.add('client__date')
    $userTrCreationTime.classList.add('client__time')
    $userTrChanges.classList.add('client__th');
    $userTrChangesDate.classList.add('client__date')
    $userTrChangesTime.classList.add('client__time')
    $userTrContacts.classList.add('client__th', 'client__th_contacts');
    $userTrContactsContaier.classList.add('client__contacts-container');

    $userTrActions.classList.add('client__th', 'client__th_actions');
    $userTrEditButton.classList.add('client__action-button', 'client__action-button_edit');
    $userTrDeleteButton.classList.add('client__action-button', 'client__action-button_delete');
    $userTrDeleteButton.dataset.modal = 'modal-delete';
    $userTrDeleteButton.dataset.animation = 'fadeInUp';
    $userTrDeleteButton.dataset.speed = '500';
    $userTrEditButton.dataset.modal = 'modal-edit';
    $userTrEditButton.dataset.animation = 'fadeInUp';
    $userTrEditButton.dataset.speed = '500';

    for (const oneContact of oneUser.contacts) {
        const $contactButton = document.createElement('button');
        const $contactTooltip = document.createElement('div');
        const $contactTooltipType = document.createElement('span');
        const $contactTooltipValue = document.createElement('a');

        $userTrContactsContaier.append($contactButton);
        $contactTooltip.append($contactTooltipType);
        $contactTooltip.append($contactTooltipValue);

        $contactButton.classList.add('client__contact-button');
        $contactTooltip.classList.add('client__contact-tooltip');
        $contactTooltipType.classList.add('client__contact-type');
        $contactTooltipValue.classList.add('client__contact-value');
        $contactTooltipValue.textContent = oneContact.value;

        if (oneContact.type == 'Telephone') {
            $contactButton.classList.add('client__contact-button_tel');
            $contactTooltipType.textContent = 'Телефон: '
            $contactTooltipValue.href = 'tel:' + oneContact.value;
        };
        
        if (oneContact.type == 'Email') {
            $contactButton.classList.add('client__contact-button_email');
            $contactTooltipType.textContent = 'Email: '
            $contactTooltipValue.href = 'mailto:' + oneContact.value;
        };

        if (oneContact.type == 'Facebook') {
            $contactButton.classList.add('client__contact-button_fb');
            $contactTooltipType.textContent = 'Facebook: '
            $contactTooltipValue.href = oneContact.value;
        };

        if (oneContact.type == 'VK') {
            $contactButton.classList.add('client__contact-button_vk');
            $contactTooltipType.textContent = 'VK: '
            $contactTooltipValue.href = oneContact.value;
        };

        if (oneContact.type == 'Other') {
            $contactButton.classList.add('client__contact-button_other');
            $contactTooltipType.textContent = 'Другое: '
            $contactTooltipValue.href = oneContact.value;
        };

        tippy($contactButton, {
            content: $contactTooltip,
            maxWidth: 200,
            offset: [0, 11],
            trigger: 'click',
            interactive: true,
            theme: 'black',
            onShow() {
                $contactButton.classList.add('active')
            },
            onHide() {
                $contactButton.classList.remove('active')
            }
        });
        
        if ($userTrContactsContaier.childNodes.length >= 5) {
            $contactButton.classList.add('hidden');
        };
    };

    if ($userTrContactsContaier.querySelectorAll('.hidden').length > 0) {
        const $contactMoreButton = document.createElement('button');
        $userTrContactsContaier.append($contactMoreButton);
        $contactMoreButton.classList.add('client__contact-button', 'client__contact-button_more');
        $contactMoreButton.textContent = '+' + $userTrContactsContaier.querySelectorAll('.hidden').length;

        $contactMoreButton.addEventListener('click', function () {
            $contactMoreButton.remove();
            for (const oneButton of $userTrContactsContaier.querySelectorAll('.hidden')) {
                oneButton.classList.remove('hidden');
            };
        });
    };

    $userTrDeleteButton.addEventListener('click', function (e) {
        e.preventDefault();
        findUser(oneUser.id);
        $userTrDeleteButton.classList.add('loading');
        setTimeout(() => {
            $userTrDeleteButton.classList.remove('loading');
        }, 500);
    });

    $userTrEditButton.addEventListener('click', function (e) {
        e.preventDefault();
        findUser(oneUser.id);
        $userTrEditButton.classList.add('loading');
        setTimeout(() => {
            $userTrEditButton.classList.remove('loading');
        }, 500);
        const $modalEdit = document.querySelector('[data-target="modal-edit"]');

        $modalEdit.querySelector('.modal__id-flag').textContent = 'ID: ' + userFlag.id;

        const $modalChangeSurname = document.getElementById('edit-surname-input');
        const $modalChangeName = document.getElementById('edit-name-input');
        const $modalChangeLastname = document.getElementById('edit-lastname-input');

        if (userFlag.name.length != 0) {
            $modalChangeSurname.value = userFlag.surname;
            $modalChangeName.value = userFlag.name;
            $modalChangeLastname.value = userFlag.lastName;   
        };
        for (let i = 0; i < userFlag.contacts.length; i++) {
            addContact($modalEdit.querySelector('.modal__contact-button'), $modalEdit.querySelector('.modal__contact-list'), userFlag.contacts[i].type);
            let contactValueList = $modalEdit.querySelectorAll('.modal__contact-input');
            contactValueList[i].value = userFlag.contacts[i].value;
        };
        window.location.hash = userFlag.id;
    });

    return $userTr;
};

function findUser(userId) {
    userFlag = listData.find(user => user.id == userId);
};

function render() {
    let copyListData = [...listData];
    $tableBody.innerHTML = '';

    for (const oneUser of copyListData) {
        oneUser.NSL = oneUser.surname + ' ' + oneUser.name + ' ' + oneUser.lastName;
    }

    copyListData = copyListData.sort(function (a, b) {
        let sort = a[sortColumnFlag] < b[sortColumnFlag];
        if (sortDirFlag == false) sort = a[sortColumnFlag] > b[sortColumnFlag];
        if (sort) return -1;
    });

    for (const oneUser of copyListData) {
        const $newTr = createUserTr(oneUser);
        $tableBody.append($newTr);
      };
};

render();

for (const oneColumn of document.querySelectorAll('.table-head__th-container_sort')) {
    let sortColumn = document.getElementById(oneColumn.id);
    sortColumn.addEventListener('click', function () {
        for (const activeElement of document.querySelectorAll('.active')) {
            if (activeElement.parentNode.id != sortColumn.id) {
                activeElement.classList.remove('active');
            };
        };
        sortColumn.querySelector('.table-head__th-text').classList.add('active');
        sortColumn.querySelector('.table-head__th-icon').classList.toggle('active');
        sortColumnFlag = oneColumn.id;
        sortDirFlag = !sortDirFlag;
        render();
    });
};

function openCardByHash() {
    for (const oneUser of listData) {
        if ((window.location.hash).substring(1) == oneUser.id) {
            findUser((window.location.hash).substring(1));
            document.querySelectorAll('.client__action-button_edit')[listData.indexOf(userFlag)].click()
        }
    }
};

openCardByHash();

window.addEventListener('hashchange', () => {
    if (Object.keys(userFlag).length == 0) {
        openCardByHash();
    }
});




