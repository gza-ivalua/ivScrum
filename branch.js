const getBranches = () => {
    const myHeaders = new Headers();
    myHeaders.set('Accept', 'application/json'); 
    fetch('https://iv-scrum-api.herokuapp.com/Branch',
        {
            method: 'GET',
            header: myHeaders
        })
        .then(e => {
            console.log(e)
            return e.json()
        })
        .then(data => {
            data.forEach(b => {
                console.log(b.version);
            })
        })
}
getBranches();