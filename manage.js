const apiUrl = 'https://iv-scrum-api.herokuapp.com';
const trelloApiQuerystring = 'key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e';
// const apiUrl = 'https://localhost:5001'
fetch(`${apiUrl}/team`, 
{
    method: 'GET',
    headers: {
        'Accept': 'application/json'        
    }
})
.then(r => r.json())
.then(teams => {    
    promises = [];
    for(t of teams){
        t.devs = [];
        promises.push(
            new Promise((resolve, reject) => {
                fetch(`${apiUrl}/user/team/${t.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'        
                    }
                })
                .then(res => resolve(res))
                .catch(e => {
                    reject(e);
                })
            })
        );
    }
    Promise.all(promises).then((res) => {
        promises = [];
        for(r of res){
            promises.push(new Promise((resolve) => {
                resolve(r.json());
            }));
        }
        Promise.all(promises)
            .then(data => {
                for (d of data){
                    for(dev of d){
                        const team = teams.find(t => t.id === dev.team);
                        team.devs.push(dev);
                    }
                }
                init(teams);
            });        
    })
});
const plusButtonClickHandler = (e) => {
    const target = e.target,
    btn = target.closest('button'),
    container = btn.closest('.team'),
    table = container.querySelector('table'),
    row = table.querySelector('tr:last-child'),
    newRow = row.cloneNode(true);
    newRow.removeAttribute('data-dev-id');
    newRow.querySelectorAll('input').forEach(input => {
        input.value = null;        
        input.addEventListener('change', fieldChangeHandler)
    });
    table.append(newRow);
}
const fieldChangeHandler = (e) => {
    const headers = new Headers();        
    headers.append('mode', 'cors');
    headers.append('Accept', '*/*');    
    const teamContainer = e.target.closest('.team');
    const data = new FormData();  
    data.append('Team', teamContainer.getAttribute('data-team'));
    const id = e.target.closest('tr').getAttribute('data-dev-id');
    if (id){
        data.append('Id',id);
    }
    const row = e.target.closest('tr');
    const fields = row.querySelectorAll('input, select');
    fields.forEach(f => {
        let value;
        if (f.getAttribute('type') === 'checkbox'){
            value = f.checked;
        }
        else{
            value = f.value;
        }
        data.append(f.getAttribute('data-property'), value);
    })
    fetch(`${apiUrl}/user`, 
    {
        method: 'POST',
        headers: headers,
        body: data
    })
    .then(res => res.json())
    .then(data => {
        row.setAttribute('data-dev-id', data.id);
    });
}
const getTrelloMembers = async (teamId) => {
    const myHeaders = new Headers();
    myHeaders.set('Accept', 'application/json');    
    return await fetch(`https://api.trello.com/1/boards/${teamId}/members?${trelloApiQuerystring}`, 
        {method: 'GET', headers: myHeaders})
        .then(res => res.json())        
}
const buildSelect = (members) => {
    const select = document.createElement('select');
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.fullName;
        select.append(option);
    });
    return select;
}
const init = (teams) => {
    const hiddenColumns = ['id', 'team'];
    teams.forEach(async team => {
        const trelloMembers = await getTrelloMembers(team.trelloId);
        const selectInput  = buildSelect(trelloMembers);
        const container = document.querySelector('.teams');
        const teamContainer = document.createElement('div');
        teamContainer.setAttribute('data-team', team.id);
        teamContainer.classList.add('team')
        container.append(teamContainer);
        const table = document.createElement('table');
        const titleContainer = document.createElement('div');
        const title = document.createElement('span');
        const addBtn = document.createElement('button');
        addBtn.classList.add('btn', 'add')
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-user-plus');
        addBtn.setAttribute('type', 'button');        
        addBtn.append(icon)    
        addBtn.onclick = plusButtonClickHandler;
        title.classList.add('title')
        title.textContent = team.name;
        teamContainer.append(titleContainer);
        titleContainer.append(title);
        titleContainer.append(addBtn);
        teamContainer.append(table);
        let first = true;
        const header = document.createElement('tr');
            table.append(header);
            team.devs.forEach(dev => {
                const row = document.createElement('tr');
                row.setAttribute('data-dev-id', dev.id);                
                table.append(row);
                const keys = Object.keys(dev);
                keys.forEach(key => {
                    if (!hiddenColumns.includes(key)){
                        const cell = document.createElement('td');                        
                        if (first){                    
                            const headerCell = document.createElement('th');
                            header.append(headerCell)                    
                            headerCell.innerHTML = key;
                        }
                        row.append(cell);
                        let field = document.createElement('input');    
                        if (key === 'trello'){                        
                            field = selectInput.cloneNode(true)
                        }
                        else if (typeof dev[key] === 'boolean'){                                                    
                            field.setAttribute('type', 'checkbox');     
                            field.checked = dev[key];  
                        }
                        else{                            
                            field.setAttribute('type', 'text');            
                            if (key !== 'name')
                                field.setAttribute('size', field.value.length + 5);
                        }                        
                        field.setAttribute('data-property', key);
                        cell.append(field);                        
                        field.value = dev[key];                        
                        field.addEventListener('change', fieldChangeHandler)
                    }
                });               
                first = false;
                const cell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn')
                const icon = document.createElement('i');
                icon.classList.add('fa-solid', 'fa-trash-can');
                deleteButton.append(icon);                
                deleteButton.addEventListener('click', () => {
                    if (confirm('Dracarys ?')){
                        const headers = new Headers();        
                        headers.append('mode', 'cors');
                        headers.append('Accept', '*/*');    
                        fetch(`${apiUrl}/user/${dev.id}/delete`, 
                        {
                            method: 'GET',
                            headers: headers
                        }).then(() => {
                            row.remove();
                        })
                    }                    
                })
                row.append(cell);
                cell.append(deleteButton);
            })
        })
}