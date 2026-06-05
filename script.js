// DOM 요소 선택
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

// 상태 관리
let todos = [];
let currentFilter = 'all';

// 로컬 스토리지에서 데이터 불러오기
function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
        render();
    }
}

// 로컬 스토리지에 데이터 저장하기
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Todo 추가
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date()
    };

    todos.unshift(newTodo);
    todoInput.value = '';
    todoInput.focus();
    
    saveTodos();
    render();
}

// Todo 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
}

// Todo 완료 상태 토글
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        render();
    }
}

// 완료된 Todo 모두 제거
function clearCompleted() {
    if (todos.some(todo => todo.completed)) {
        if (confirm('완료된 모든 항목을 삭제하시겠습니까?')) {
            todos = todos.filter(todo => !todo.completed);
            saveTodos();
            render();
        }
    } else {
        alert('완료된 항목이 없습니다!');
    }
}

// 필터링된 Todo 리스트 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 통계 업데이트
function updateStats() {
    totalCount.textContent = todos.length;
    completedCount.textContent = todos.filter(todo => todo.completed).length;
}

// Todo 렌더링
function render() {
    const filteredTodos = getFilteredTodos();
    
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-message">할 일이 없습니다 😊</div>';
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
            `;
            todoList.appendChild(li);
        });
    }

    updateStats();
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 필터 버튼 클릭 이벤트
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        render();
    });
});

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});
clearBtn.addEventListener('click', clearCompleted);

// 초기 로드
loadTodos();