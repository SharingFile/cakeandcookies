import axios from 'axios';

export function initAdminMenu(){
    let menuSave = document.querySelectorAll('.menu-save');
    
    function menuUpdate(item) {
        axios.post('/menu-data', item).then(res => {
            console.log(res);
        })
    }

    menuSave.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            let item = JSON.parse(btn.dataset.item)
            console.log(item);
            menuUpdate(item);
        })
    })
}