// Aguarda o HTML carregar completamente
document.addEventListener("DOMContentLoaded", () => {

  // ====== ELEMENTOS ======
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const themeToggle = document.getElementById("theme-toggle");
  const filterButtons = document.querySelectorAll(".filters button");

  // filtro ativo padrão
  if (filterButtons.length > 0) {
    filterButtons[0].classList.add("active");
  }

  // ====== ESTADOS ======
  let currentFilter = "all";
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // ====== DARK MODE ======
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️";
  }

  // ====== EVENTOS ======

  // adicionar tarefa
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addTask(text);
    input.value = "";
  });

  // dark mode
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");

      if (isDark) {
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "dark");
      } else {
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "light");
      }
    });
  }

  // filtros
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      filterButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      renderTasks();
    });
  });

  // ====== FUNÇÕES ======

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function addTask(text) {
    tasks.push({
      id: Date.now(),
      text,
      completed: false
    });
    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }

  function renderTasks() {
    list.innerHTML = "";

    let filtered = tasks;

    if (currentFilter === "pending") {
      filtered = tasks.filter(t => !t.completed);
    }

    if (currentFilter === "completed") {
      filtered = tasks.filter(t => t.completed);
    }

    filtered.forEach(task => {

      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = task.text;
      if (task.completed) span.classList.add("completed");

      // ===== CLICK vs DBLCLICK sem conflito =====
      let clickTimer = null;

      // clique simples → concluir
      span.addEventListener("click", () => {
        clickTimer = setTimeout(() => {
          task.completed = !task.completed;
          saveTasks();
          renderTasks();
        }, 200);
      });

      // duplo clique → editar
      span.addEventListener("dblclick", () => {
        clearTimeout(clickTimer);

        const inputEdit = document.createElement("input");
        inputEdit.type = "text";
        inputEdit.value = task.text;

        li.replaceChild(inputEdit, span);
        inputEdit.focus();

        inputEdit.addEventListener("keydown", (e) => {

          // salvar
          if (e.key === "Enter") {
            const novoTexto = inputEdit.value.trim();
            if (novoTexto) {
              task.text = novoTexto;
              saveTasks();
            }
            renderTasks();
          }

          // cancelar
          if (e.key === "Escape") {
            renderTasks();
          }

        });
      });

      // botão excluir
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.addEventListener("click", () => deleteTask(task.id));

      li.appendChild(span);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }

  // ====== START ======
  renderTasks();

});
