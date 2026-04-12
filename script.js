let recipes = [];
let ingredientsSet = new Set();

const searchInput = document.getElementById('searchInput');
const pantrySearch = document.getElementById('pantrySearch');
const searchByName = document.getElementById('searchByName');
const searchByIngredient = document.getElementById('searchByIngredient');
const recipeContainer = document.getElementById('recipeContainer');
const ingredientsList = document.getElementById('ingredientsList');
const countDisplay = document.getElementById('recipeCount');

async function init() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/Ungotable/cookarecipe/refs/heads/main/Recipes.json');
        const data = await res.json();
        
        recipes = Object.values(data).flat();
        recipes.forEach(r => r.ingredients.forEach(i => ingredientsSet.add(i)));

        renderPantry();
        updateDisplay();
    } catch (err) {
        recipeContainer.innerHTML = `<p class="error">Failed to load recipe data.</p>`;
    }
}

Wah, itu kayaknya karena ada "tabrakan" logika di bagian renderPantry. Kalau di screenshot itu, checkbox-nya terlihat berwarna ungu penuh (seperti di-override CSS atau state-nya tidak sinkron), jadi sistem menganggap barangnya belum "terpilih" dengan benar di dalam kode JavaScript-nya.

Satu hal lagi: di mode "Only recipes I can cook", resep yang bahannya cuma 1 (seperti Toasted Flour yang cuma butuh Flour) bakal muncul kalau kamu belum pilih bahan apa-apa karena nilai defaultnya true.

Ayo kita perbaiki script.js kamu supaya logikanya lebih ketat. Gunakan kode di bawah ini untuk mengganti fungsi updateDisplay dan renderPantry:

Perbaikan script.js
JavaScript

function renderPantry() {
    const filter = pantrySearch.value.toLowerCase();
    ingredientsList.innerHTML = "";
    
    const sortedIngs = [...ingredientsSet].sort();
    
    sortedIngs.forEach(ing => {
        if (ing.toLowerCase().includes(filter)) {
            const label = document.createElement('label');
            label.className = "custom-checkbox";
            
            const isChecked = selectedPantryItems.has(ing);
            
            label.innerHTML = `
                <input type="checkbox" value="${ing}" ${isChecked ? 'checked' : ''}>
                <span>${ing}</span>
            `;

            label.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedPantryItems.add(ing);
                } else {
                    selectedPantryItems.delete(ing);
                }
                updateDisplay();
            });

            ingredientsList.appendChild(label);
        }
    });
}

function updateDisplay() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedArray = Array.from(selectedPantryItems);
    const mode = document.querySelector('input[name="pantryMode"]:checked').value;

    const filtered = recipes.filter(recipe => {
        const matchesName = searchByName.checked && recipe.name.toLowerCase().includes(searchTerm);
        const matchesIngText = searchByIngredient.checked && recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm));
        const textPass = !searchTerm || matchesName || matchesIngText;

        let pantryPass = true;

        if (mode === 'full') {
            if (selectedArray.length === 0) {
                pantryPass = false;
            } else {
                pantryPass = recipe.ingredients.every(ing => selectedArray.includes(ing));
            }
        } else {
            if (selectedArray.length > 0) {
                pantryPass = recipe.ingredients.some(ing => selectedArray.includes(ing));
            }
        }

        return textPass && pantryPass;
    });

    renderCards(filtered, selectedArray);
}

function renderCards(data, selected) {
    recipeContainer.innerHTML = "";
    countDisplay.textContent = data.length;

    data.forEach(recipe => {
        const card = document.createElement('div');
        card.className = "recipe-card";
        const stars = "★".repeat(recipe.rarity);
        
        card.innerHTML = `
            <div class="rarity">${stars}</div>
            <h3>${recipe.name}</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => `
                    <li class="${selected.includes(ing) ? 'has-it' : ''}">
                        ${selected.includes(ing) ? '✓ ' : '• '} ${ing}
                    </li>
                `).join('')}
            </ul>
            <div class="price">$${recipe.money.toLocaleString()}</div>
        `;
        recipeContainer.appendChild(card);
    });
}

function clearChecks() {
    document.querySelectorAll('.pantry-item').forEach(i => i.checked = false);
    updateDisplay();
}

searchInput.addEventListener('input', updateDisplay);
pantrySearch.addEventListener('input', renderPantry); 
searchByName.addEventListener('change', updateDisplay);
searchByIngredient.addEventListener('change', updateDisplay);

init();
