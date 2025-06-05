document.addEventListener('DOMContentLoaded', () => {
  const groupDropdown = document.getElementById('dropdownGroup');
  const nameDropdown = document.getElementById('dropdownName');
  const sizeDropdown = document.getElementById('dropdownSize');
  const recipeTitle = document.getElementById('recipeTitle');
  const recipeBody = document.getElementById('recipeBody');
  const instructionBox = document.getElementById('instructionBox');
  const toggleInstructionsButton = document.getElementById('toggleInstructionsButton');
  const recipeContainer = document.getElementById('recipeContainer');

  let recipes = [];

  fetch('data/recipes.csv')
    .then(response => response.text())
    .then(csv => {
      const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
      recipes = results.data;
      populateGroups();
    })
    .catch(error => {
      alert("No se pudo cargar la base de datos de recetas");
      console.error("Error cargando CSV:", error);
    });

  function populateGroups() {
    const groups = [...new Set(recipes.map(r => (r.Group || '').trim()))].filter(Boolean);
    groupDropdown.innerHTML = `<option value="">Select Group</option>`;
    groups.forEach(group => {
      groupDropdown.innerHTML += `<option value="${group}">${group}</option>`;
    });
    groupDropdown.disabled = false;
    nameDropdown.disabled = true;
    sizeDropdown.disabled = true;
    clearRecipe();
  }

  function populateNames(group) {
    const names = [...new Set(recipes.filter(r => r.Group === group).map(r => r.Name))];
    nameDropdown.innerHTML = `<option value="">Select Recipe</option>`;
    names.forEach(name => {
      nameDropdown.innerHTML += `<option value="${name}">${name}</option>`;
    });
    nameDropdown.disabled = false;
    sizeDropdown.disabled = true;
    clearRecipe();
  }

  function populateSizes(group, name) {
    const sizes = [...new Set(recipes.filter(r => r.Group === group && r.Name === name).map(r => r.SizeCode))];
    sizeDropdown.innerHTML = `<option value="">Select Size</option>`;
    sizes.forEach(size => {
      sizeDropdown.innerHTML += `<option value="${size}">${convertSizeCode(size)}</option>`;
    });
    sizeDropdown.disabled = false;
    clearRecipe();
  }

  function displayRecipe(group, name, sizeCode) {
    const filtered = recipes.filter(r => r.Group === group && r.Name === name && r.SizeCode === sizeCode);
    if (filtered.length === 0) {
      recipeContainer.classList.add('hidden');
      return;
    }

    recipeContainer.classList.remove('hidden');
    recipeTitle.textContent = `${name} (${convertSizeCode(sizeCode)})`;
    recipeBody.innerHTML = '';

    filtered.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.Ingredient}</td>
        <td>${r.Detail}</td>
        <td>${r.Amount}</td>
        <td>${r.Unit}</td>
        <td>${r.Grams}</td>
      `;
      recipeBody.appendChild(row);
    });

    if (filtered[0].Instructions) {
      instructionBox.innerHTML = filtered[0].Instructions.replace(/\n/g, '<br>');
      instructionBox.classList.add('hidden'); // Ocultar al inicio
      toggleInstructionsButton.classList.remove('hidden');
    } else {
      instructionBox.classList.add('hidden');
      toggleInstructionsButton.classList.add('hidden');
    }
  }

  function clearRecipe() {
    recipeContainer.classList.add('hidden');
    recipeTitle.textContent = '';
    recipeBody.innerHTML = '';
    instructionBox.innerHTML = '';
    instructionBox.classList.add('hidden');
    toggleInstructionsButton.classList.add('hidden');
  }

  function convertSizeCode(code) {
    switch (code) {
      case 'A': return '2 lb';
      case 'B': return '1.5 lb';
      case 'C': return '1 lb';
      case 'D': return 'Standard';
      default: return code;
    }
  }

  // Listeners
  groupDropdown.addEventListener('change', () => {
    const group = groupDropdown.value;
    if (group) {
      populateNames(group);
    } else {
      nameDropdown.disabled = true;
      sizeDropdown.disabled = true;
      clearRecipe();
    }
  });

 nameDropdown.addEventListener('change', () => {
  const group = groupDropdown.value;
  const name = nameDropdown.value;
  if (name) {
    // 1. Guarda el tamaño seleccionado actualmente (si existe)
    const currentSize = sizeDropdown.value;
    // 2. Llenar los tamaños DISPONIBLES para esta receta
    populateSizes(group, name);

    // 3. Si el tamaño que estaba seleccionado existe para la nueva receta,
    // selecciona ese mismo tamaño automáticamente y muestra la receta
    const sizeOptions = Array.from(sizeDropdown.options).map(opt => opt.value);
    if (currentSize && sizeOptions.includes(currentSize)) {
      sizeDropdown.value = currentSize;
      displayRecipe(group, name, currentSize);
    } else {
      // Si el tamaño actual NO está disponible, selecciona el primero de la lista
      sizeDropdown.selectedIndex = 0; // O muestra nada hasta que elijan un tamaño
      clearRecipe();
    }
    sizeDropdown.disabled = false;
  } else {
    sizeDropdown.disabled = true;
    clearRecipe();
  }
});


  sizeDropdown.addEventListener('change', () => {
    const group = groupDropdown.value;
    const name = nameDropdown.value;
    const size = sizeDropdown.value;
    if (size) {
      displayRecipe(group, name, size);
    } else {
      clearRecipe();
    }
  });

  toggleInstructionsButton.addEventListener('click', () => {
    instructionBox.classList.toggle('hidden');
  });
});
