
const tabClickHandler = async (e)=> {
    e.target.closest('.tabs').querySelector('.selected').classList.remove('selected');
    e.target.closest('.tab').classList.add('selected');
    initDevList();
    resetPicker();  
    await getUsers(true);  
    getUserImages();      
}
const initTabs = () => {
    const tabs = document.querySelector('.tabs');
    teams.forEach((e, i) => {
        const tab = document.createElement('li');
        tab.setAttribute('data-team-id', e.id);
        tab.classList.add('tab');
        if (i === 0){
            tab.classList.add('selected') 
        }
        tab.setAttribute('data-trello-id', e.id);
        tab.textContent = 'Team '  + e.name;
        tabs.append(tab);        
    });
    document.querySelectorAll('.tab').forEach(e => e.addEventListener('click', tabClickHandler));
}
let users =[];
const getTeamId = () => {
    return teams.find(t => t.name === getTeam()).id;
}
async function getUsers(force = false){
    if (users.length && !force) return users;    
    const myHeaders = new Headers();
    myHeaders.set('Accept', 'application/json');    
    await fetch(`https://api.trello.com/1/boards/${getTeamId()}/members?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e`, 
        {method: 'GET', headers: myHeaders})
        .then(res => res.json())
        .then(async data => {
            promises = [];
            if (data.error) return;
            data.forEach(e => {
                promises.push(fetch(`https://api.trello.com/1/members/${e.id}?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e`, 
                {method: 'GET', headers: myHeaders}));          
            });
            await Promise.all(promises)
                .then(async r => await Promise.all(r.map(res => res.json())
                ).then(d => {
                    users = d.reduce((prev, cur) => {
                        if (!cur.error){
                            let u = users.find(u => u.id === data.id);                    
                            if (typeof u !== 'undefined') return;
                            prev.push(cur);                                  
                        }
                        return prev;                     
                    }, []);                                                  
                }));
            return users;
    });
    return users;
}
const getUserImages = async () => {
    const u = await getUsers(); 
    document.querySelectorAll(`[data-user-id]`).forEach(li => {
        const userId = li.getAttribute('data-user-id');        
        const user = u.find(u => u.id === userId);
        if (user) {
            const img = document.createElement('img');
            if (!user.avatarUrl) return;
            img.setAttribute('src', `${user.avatarUrl}/50.png`);        
            li.querySelector('.name-label').after(img);
        }                
    })
}
initTabs();
getUserImages();
let trelloCards = [];
let lists = [];


const getCards = async (userName) => {
    if (trelloCards.length === 0){
        var myHeaders = new Headers();
        myHeaders.set('Accept', 'application/json');
        await fetch(`https://api.trello.com/1/boards/${getTeamId()}/cards?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e`, 
        {method: 'GET', headers: myHeaders}).then(res => res.json()).then(data => {        
            trelloCards = data;
        });
    }
    if (!userName) return trelloCards;
    const userId = teams.find(t => t.name === getTeam()).devs.find(d => d.trigram === userName).id;
    return trelloCards.filter(e => e.idMembers.indexOf(userId) > -1);    
}
const getLists = async () => {
    if (lists.length === 0){
        var myHeaders = new Headers();
        myHeaders.set('Accept', 'application/json');
        await fetch(`https://api.trello.com/1/boards/${getTeamId()}/lists?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e`, 
                {method: 'GET', headers: myHeaders})
                    .then(res => res.json())
                    .then(data => {        
                        lists = data;
                    });        
    }
    return lists;
}
const buildCards = async (userName, inProgress) => {
    let cards = await getCards(userName);
    if (inProgress){
        const lists = await getLists();
        const inProgress = lists.find(l => l.name.toLowerCase().indexOf('in progress') > -1).id;
        cards = cards.filter(c => c.idList === inProgress);
    }
    const container = document.getElementById('cards');
    container.innerHTML = '';    
    const lists = await getLists();
    cards.forEach(c => {
        const list = lists.filter(e => e.id === c.idList)[0];
        const card = document.createElement('div');
        card.classList.add('card');
        const link = document.createElement('a');
        link.classList.add('link');
        link.setAttribute('href', c.url);
        link.setAttribute('target', 'blank');
        link.textContent = c.name;
        card.appendChild(link);   
        const status = document.createElement('span');  
        status.classList.add('status');
        status.textContent = list.name;   
        card.appendChild(status);
        container.appendChild(card);        
    });
}
buildCards(null, true);