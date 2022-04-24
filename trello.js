const getUsers = () => {
    var myHeaders = new Headers();
    var users =[]
    myHeaders.set('Accept', 'application/json');
    fetch('https://api.trello.com/1/boards/6131dc557c18d207f16fe863/members?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e', {method: 'GET', headers: myHeaders}).then(res => res.json()).then(data => {
        console.log(data);
        data.forEach(e => {
            users.push(e);
        })
    });
}

const users = {
    gza: '58480f8e35511bf7f82b961a',
    jla: '5770de0b7cc5c29c20e1c935',
    ygr: '59b02122d3bc2d40e1a1ecb8',
    sci: '615488db3da53285d95402dc',
    rle: '5c7fc4f442826f14c0a7e497',
    mdd: '571f321e3d0918a2cde3a2a8',
    jgt: '61483b5e4b18e97915fa94b9',
}
let cards = [];
let lists = [];

const getCards = async (userName) => {
    const userId = users[userName];
    if (cards.length === 0){
        var myHeaders = new Headers();
        myHeaders.set('Accept', 'application/json');
        await fetch('https://api.trello.com/1/boards/6131dc557c18d207f16fe863/cards?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e', {method: 'GET', headers: myHeaders}).then(res => res.json()).then(data => {        
            cards = data;
        });
    }
    return cards.filter(e => e.idMembers.indexOf(userId) > -1);    
}
const getLists = async () => {
    if (lists.length === 0){
        var myHeaders = new Headers();
        myHeaders.set('Accept', 'application/json');
        await fetch('https://api.trello.com/1/boards/6131dc557c18d207f16fe863/lists?key=10e69760de5166baedbbf5349ee6a617&token=0e76f01f0aa92582ad6a4a1821f44a28781fdd4f1a373390b32c4daae6fd2d8e', 
                {method: 'GET', headers: myHeaders})
                    .then(res => res.json())
                    .then(data => {        
                        lists = data;
                    });        
    }
    return lists;
}
const buildCards = async (userName) => {
    const cards = await getCards(userName);
    const container = document.getElementById('cards');
    container.innerHTML = '';
    console.log(cards);
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
    })
}