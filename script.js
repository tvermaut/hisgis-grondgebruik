var itemnr = 0;

$(function() {
    fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=Q101&format=json')
        .then(response => response.json())
        .then(data => verwerkWB(data.entities.Q101))
  });

  async function verwerkWB(j){
    // P33 = ongebouwd
    var ul1 = document.createElement("ul");
    ul1.setAttribute("class","list-group")
    ul1.setAttribute("id",'ul'+itemnr);
    $('#lijst').append(ul1);
    var ul1_id = itemnr;
    itemnr++;
    for(let i of j.claims.P33){
        let lii = await checkWBi(i.mainsnak.datavalue.value.id, '#ul'+ul1_id, 'ms-1');
        if(lii){$('#ul'+ul1_id).append(lii);}
        if(i.hasOwnProperty("qualifiers") && i.qualifiers.hasOwnProperty("P36")){
            var ul2 = document.createElement("ul");
            ul2.setAttribute("class","list-group")
            ul2.setAttribute("id",'ul' + itemnr);
            var ul2_id = itemnr;
            itemnr++;
            $('#ul'+ul1_id).append(ul2);
            for(let q of i.qualifiers.P36){ // P36 = tariefsoort
                let ul2li = await checkWBi(q.datavalue.value.id, '#ul'+ul2_id, 'ms-5');
                }
                
            }
        }
    // P33
}

async function checkWBi(wbid, ouder, ms){
    await fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=' + wbid + '&format=json')
        .then((response) => response.json())
        .then((data) => {
            //console.log(data);
            let q = data.entities[Object.getOwnPropertyNames(data.entities)[0]];
            //console.log(q);
            let li = document.createElement("li");
            li.setAttribute("id",'li'+itemnr);
            li.setAttribute("class", "list-group-item col " + ms);
            itemnr++;
            li.innerHTML = '<div class="d-flex justify-content-between align-items-center">' + q.labels.nl.value + (q.hasOwnProperty("aliases") && q.aliases.hasOwnProperty("nl") ? ': <span class="badge badge-primary badge-pill">' + q.aliases.nl.length + '</span></div>' + (q.aliases.nl.map(getNL)).join(', ') : '</div>');
            //console.log(li);
            if(li.innerHTML){$(ouder).append(li);}
        });
}

function getNL(item){
    return item.value;
}
    
// P29 = OSM-tag
// P30 = tariefsoortnaam
// P36 = tariefsoort
// P43 = kleur