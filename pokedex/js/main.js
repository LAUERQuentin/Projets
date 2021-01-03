const P = new Pokedex.Pokedex();
let table = [];
let select = document.getElementById("sort-by");
let searchBar = document.getElementById("searchBar");
const feedback = document.getElementById("feedback");

if (localStorage["favorited"] == undefined) {
    localStorage["favorited"] = JSON.stringify([]);
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const displayPokemonList = (table, ul) => {
    let stored_favorited = JSON.parse(localStorage["favorited"]);
    table = table.sort(function(a, b) {
        a = stored_favorited.includes(a.id);
        b = stored_favorited.includes(b.id);
        if (a > b) {
            return -1;
        }
        if (b > a) {
            return 1;
        }
        return 0;
    });

    table.forEach(entry =>{
        let newLi = document.createElement("li");
        newLi.innerHTML = entry.id + " - " + capitalize(entry.name);
        newLi.setAttribute("id", entry.id);
        newLi.addEventListener("click", function(){CarPokemon(this.id);});
        if (stored_favorited.includes(entry.id)){
            let icon = document.createElement("div");
            icon.classList.add('float-right');
            icon.innerHTML = '<svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="currentColor" style="margin-right:15px" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path></svg>';
            newLi.appendChild(icon);
        }
        ul.appendChild(newLi);
    });
    if (sessionStorage.getItem('current_id') !== null) {
        let current_id = sessionStorage.getItem('current_id');
        if (document.getElementById(current_id) !== null){
            let current_li = document.getElementById(current_id);
            current_li.scrollIntoView({block: "center"});
            document.getElementsByClassName("container fiche")[0].scrollIntoView({behavior: "smooth"});
            current_li.classList.remove('font-weight-bold');
            current_id = sessionStorage.getItem('current_id');
            current_li = document.getElementById(current_id);
            current_li.classList.add('font-weight-bold');
            document.title = "Pokedex (" + current_li.innerText + ")";
        }
    }
}

document.addEventListener("load", CarPokemon(1));

function CarPokemon(entry){
    P.getPokemonsList(entry-1)
    .then(function(response) {
        const button = document.querySelector('button');
        let stored_favorited = JSON.parse(localStorage["favorited"]);
        if (stored_favorited.includes(parseInt(entry))){
            button.classList.remove("addFavorite");
        } else {
            button.classList.add("addFavorite");
        }
        
        if (sessionStorage.getItem('current_id') !== null) {
            let current_id = sessionStorage.getItem('current_id');
            if (document.getElementById(current_id) !== null){
                let current_li = document.getElementById(current_id);
                current_li.classList.remove('font-weight-bold');
                sessionStorage.setItem('current_id', entry);
                current_id = sessionStorage.getItem('current_id');
                current_li = document.getElementById(current_id);
                current_li.classList.add('font-weight-bold');
                document.title = "Pokedex (" + current_li.innerText + ")";
            } else {
                sessionStorage.setItem('current_id', entry);
            }
        } else {
            sessionStorage.setItem('current_id', entry);
        }
        
        //Name
        let PokeName = response.results[entry-1].name;
        document.getElementById("titleName").innerHTML = "#"+ entry + " " +  capitalize(PokeName);

        P.getPokemonSpeciesByName(entry).then(function(valPok){
            if(valPok.is_legendary){
                document.getElementById("titleName").innerHTML += " " + "(Legendary)"
            }
            if(valPok.is_mythical){
                document.getElementById("titleName").innerHTML += " " + "(Mythical)"
            }
        });

        P.getPokemonByName(PokeName)
        .then(function(valPok){
            document.getElementById("imgPok").src = valPok.sprites.front_default

            //Type
            let tabType =valPok.types; 
            document.getElementById("type").innerHTML = "";
            tabType.forEach(function(e){
                document.getElementById("type").innerHTML += capitalize(e.type.name) + "  ";
            })

            //Ability
            //Hover -> Description ability
            let tabAbil =valPok.abilities;
            document.getElementById("abilities").innerHTML = "  ";
            document.getElementById("abilities").title = "";
            tabAbil.forEach(function(e){
                P.getAbilityByName(e.ability.name).then(function(e2){
                    document.getElementById("abilities").innerHTML += capitalize(e2.name) + "  ";
                    e2.effect_entries.forEach(function(entry){
                        if(entry.language.name === "en"){
                            document.getElementById("abilities").title += capitalize(e.ability.name) + ":  " + entry.short_effect + "\n\n" ;
                        }
                    })
                });

            })

            
            //Height
            document.getElementById("height").innerHTML = valPok.height * 10 + " cm";

            //weight
            document.getElementById("weight").innerHTML = (valPok.weight * 0.1).toFixed(2) + " kg";

            //hp
            document.getElementById("hp").innerHTML = valPok.stats[0].base_stat;
            document.getElementById("progBarreHp").style = "width: " + (valPok.stats[0].base_stat * 100 / 200) + "%";

            //Attack
            document.getElementById("atk").innerHTML = valPok.stats[1].base_stat;
            document.getElementById("progBarreAtk").style = "width: " + (valPok.stats[1].base_stat * 100 / 200) + "%";

            //Defense
            document.getElementById("def").innerHTML = valPok.stats[2].base_stat;
            document.getElementById("progBarreDef").style = "width: " + (valPok.stats[2].base_stat * 100 / 200) + "%";

            //Special-attack
            document.getElementById("spAtk").innerHTML = valPok.stats[3].base_stat;
            document.getElementById("progBarreSpAtk").style = "width: " + (valPok.stats[3].base_stat * 100 / 200) + "%";

            //Special-defense
            document.getElementById("spDef").innerHTML = valPok.stats[4].base_stat;
            document.getElementById("progBarreSpDef").style = "width: " + (valPok.stats[4].base_stat * 100 / 200) + "%";

            //speed
            document.getElementById("spd").innerHTML = valPok.stats[5].base_stat;
            document.getElementById("progBarreSpd").style = "width: " + (valPok.stats[5].base_stat * 100 / 200) + "%";
            
            let ul = document.getElementById("moveList");
            let li = document.querySelectorAll("ul#moveList li");
            li.forEach(function(element){
                element.remove();
            });
            let tabMove = valPok.moves;
            tabMove.forEach(function(e){
                let newLi = document.createElement("li");
                P.getMoveByName(e.move.name).then(function(e2){
                    console.log(e2);
                    newLi.title = "PP:  " + e2.pp;
                    newLi.title += "\nType:  " + e2.type.name;
                    if (e2.power === null){
                        newLi.title += "\nPower:  N/A";
                    }
                    else{
                        newLi.title += "\nPower:  " + e2.power;
                    }

                    if (e2.accuracy === null){
                        newLi.title += "\nAccuracy:  N/A";
                    }
                    else{
                        newLi.title += "\nAccuracy:  " + e2.accuracy;
                    }
                    
                    newLi.title += "\nDamage class:  " + e2.damage_class.name;

                    newLi.title += "\nDescription:  " + e2.effect_entries[0].short_effect;
                });
               newLi.innerHTML = capitalize(e.move.name);
               
               ul.appendChild(newLi);
            })
        });
    });
}


function ListPokemon(){
    //Defaut by Id
    P.getPokedexByName("national")
    .then(function(response) {
        //console.log(response);
        response.pokemon_entries.forEach(entry => {
            table.push({"name": entry.pokemon_species.name, "id":entry.entry_number});
            //console.log(entry.entry_number, entry.pokemon_species.name)
        });
        displayPokemonList(table, ul);
        
        let current_id = sessionStorage.getItem('current_id')
        let current_li = document.getElementById(current_id);
        current_li.classList.add('font-weight-bold');
        document.title = "Pokedex (" + current_li.innerText + ")";

        //li = document.querySelectorAll('ul#PokemonList li');
    });

    let ul = document.getElementById("PokemonList");
    
    select.addEventListener("change", function(){
        let li = document.querySelectorAll('ul#PokemonList li');
        //By Id 
        if(select.options[select.selectedIndex].value === "id"){
    
            li.forEach(function(element){
                element.remove();
            });
            table = table.sort(function(a, b) {
                var nameA = a.id; // ignore upper and lowercase
                var nameB = b.id; // ignore upper and lowercase
                if (nameA < nameB) {
                  return -1; //nameA comes first
                }
                if (nameA > nameB) {
                  return 1; // nameB comes first
                }
                return 0;  // names must be equal
            });
            displayPokemonList(table, ul);
        }
        //croissant A - Z
        if(select.options[select.selectedIndex].value === "az"){
    
            li.forEach(function(element){
                element.remove();
            });
            table = table.sort(function(a, b) {
                var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                  return -1; //nameA comes first
                }
                if (nameA > nameB) {
                  return 1; // nameB comes first
                }
                return 0;  // names must be equal
            });
            displayPokemonList(table, ul);
        }
    
    
        //decroissant
        if(select.options[select.selectedIndex].value === "za"){
            console.log(li)
            li.forEach(function(element){
                element.remove();
            });
            table = table.sort(function(a, b) {
                var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                  return -1; //nameA comes first
                }
                if (nameA > nameB) {
                  return 1; // nameB comes first
                }
                return 0;  // names must be equal
            }).reverse();
            displayPokemonList(table, ul);
        }
    });

}
ListPokemon();


function favorite() {
    const button = document.querySelector('button');
    button.addEventListener('click', event => {
        var stored_favorited = JSON.parse(localStorage["favorited"]);
        let current_id = parseInt(sessionStorage.getItem('current_id'));
        const li_pokemon = document.getElementById(current_id);

        if (button.classList.toggle('addFavorite')){
            stored_favorited = stored_favorited.filter(id => id != current_id);
            li_pokemon.removeChild(li_pokemon.lastChild);
            localStorage["favorited"] = JSON.stringify(stored_favorited);
        } else {
            stored_favorited.push(current_id);
            let icon = document.createElement("div");
            icon.classList.add('float-right');
            icon.innerHTML = '<svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="currentColor" style="margin-right:15px" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path></svg>';
            li_pokemon.appendChild(icon);
            localStorage["favorited"] = JSON.stringify(stored_favorited);
        }
    });
    
}
favorite();

function search(searched){
    if(searched === ''){ //ignore l'appui sur la croix de la barre de recherche
        return;
    }
    if(searched == parseInt(searched)){
        if(searched > table.length || parseInt(searched) === 0){
            searchBar.value = "ID invalide";
            searchBar.classList.add('is-invalid');
            return;
        }
        CarPokemon(searched)
    }else{
        searched = searched.toLowerCase();
        searched = table.find(({ name }) => name === searched);
        if(searched === undefined){
            searchBar.classList.add('is-invalid');
            feedback.classList.add('invalid-feedback');
            feedback.innerHTML = 'No Pokémon found.';
            return;
        }
        CarPokemon(searched.id);
    }
}

searchBar.addEventListener("input", function(){
    searchBar.classList.remove('is-invalid');
})

searchBar.addEventListener("search", function(){
    search(searchBar.value);
});