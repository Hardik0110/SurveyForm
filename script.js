document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => generateForm(data.survey));
});

function nextPage(pageNumber) {
    const nextPageElement = document.getElementById(`page${pageNumber}`);
    const currentPage = document.querySelector('.question-page.active');


    if (currentPage.id === 'namePage') {
        const nameInput = document.getElementById('userName');
        if (!nameInput.value.trim()) {
            alert('Please enter your name.');
            return;
        }
        saveProgress('userName', nameInput.value.trim());
    } else {
        const selected = currentPage.querySelector('input[type="radio"]:checked');
        if (!selected) {
            alert('Please select an option.');
            return;
        }
        saveProgress(currentPage.id, selected.value);
    }

    currentPage.classList.remove('active');
    nextPageElement.classList.add('active');
}

function previousPage(pageNumber) {
    const prevPageElement = document.getElementById(`page${pageNumber}`);
    if (!prevPageElement) return;
    document.querySelector('.question-page.active').classList.remove('active');
    prevPageElement.classList.add('active');
}

function saveProgress(key, value) {
    const formData = JSON.parse(localStorage.getItem('surveyProgress') || '{}');
    formData[key] = value;
    localStorage.setItem('surveyProgress', JSON.stringify(formData));
    }

function loadProgress() {
    const formData = JSON.parse(localStorage.getItem('surveyProgress') || '{}');
    if (formData.userName) document.getElementById('userName').value = formData.userName;
    Object.keys(formData).forEach(pageId => {
        const input = document.querySelector(`#${pageId} input[value="${formData[pageId]}"]`);
        if (input) input.checked = true;
    });
}

function generateForm(survey) {
    const formContainer = document.querySelector('#surveyForm');
    const form = document.createElement('form');
    form.onsubmit = handleSubmit;

    const namePage = createNamePage();
    form.appendChild(namePage);

    let questions = [];
    Object.values(survey).flat().forEach(item => {
        if (item.question && item.options) {
            questions.push(item);
        }
    });

    const totalPages = questions.length;

    questions.forEach((item, index) => {
        const page = createQuestionPage(item, index, totalPages);
        form.appendChild(page);
    });

    formContainer.appendChild(form);
    namePage.classList.add('active');
    loadProgress();
}

function createNamePage() {
    const namePage = document.createElement('div');
    namePage.classList.add('question-page');
    namePage.id = 'namePage';
    namePage.innerHTML = `
        <h1>Welcome to the Survey</h1>
        <label>Please enter your name:</label>
        <input type="text" id="userName" required>
        <div class="buttons">
            <button type="button" onclick="nextPage(0)">Start Survey</button>
        </div>
    `;
    return namePage;
}

function createQuestionPage(item, index, totalPages) {
    const page = document.createElement('div');
    page.classList.add('question-page');
    page.id = `page${index}`;
    page.innerHTML = `
        <h1>Question ${index + 1} of ${totalPages}</h1>
        <p>${item.question}</p>
        ${item.options.map(option => `
            <label>
                <input type="radio" name="question${index}" value="${option}">
                ${option}
            </label>
        `).join('')}
        <div class="buttons">
            ${index > 0 ? `<button type="button" onclick="previousPage(${index - 1})">Previous</button>` : ''}
            ${index < totalPages - 1 ? `<button type="button" onclick="nextPage(${index + 1})">Next</button>` : `<button type="submit">Submit</button>`}
        </div>
    `;
    return page;
}

function handleSubmit(event) {
    event.preventDefault();
    const formData = JSON.parse(localStorage.getItem('surveyProgress') || '{}');
    console.log(formData)
    const resultPage = createResultPage(formData);
    const formContainer = document.querySelector('#surveyForm');
    formContainer.innerHTML = '';
    formContainer.appendChild(resultPage);
    localStorage.removeItem('surveyProgress');
}

function createResultPage(formData) {
    console.log(Object.entries(formData));
    const resultPage = document.createElement('div');
    resultPage.classList.add('result-page');
    resultPage.innerHTML = `
        <h1>Survey Results</h1>
        <h2>Thank you, ${formData.userName || 'Anonymous'}!</h2>
        ${Object.entries(formData).map(([key, value]) => {
            if (key !== 'userName') {
                const questionNumber = key.replace('page', '');
                const questionElement = document.querySelector(`#${key} p`);
                const questionText = questionElement ? questionElement.textContent : '';
                return `
                    <div class="result-item">
                        <h4>Question ${Number(questionNumber) + 1}: ${questionText}</h4>
                        <p>Your answer: ${value}</p>
                    </div>
                `;
            }
            return '';
        }).join('')}
    `;
    return resultPage;
}