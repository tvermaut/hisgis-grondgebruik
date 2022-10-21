$(function() {
    fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=Q101&format=json')
        .then(response => response.json())
        .then(data => verwerkWB(data.entities.Q101));
  });

  async function verwerkWB(j){
    // P33 = ongebouwd
    var ul1 = document.createElement("ul");
    for(let i of j.claims.P33){
        ul1.appendChild(await checkWBi(i.mainsnak.datavalue.value.id));
        if(i.hasOwnProperty("qualifiers") && i.qualifiers.hasOwnProperty("P36")){
            var ul2 = document.createElement("ul");
            for(let q of i.qualifiers.P36){ // P36 = tariefsoort
                var ul2li = document.createElement("li");
                ul2li.appendChild(await checkWBi(q.datavalue.value.id));
                ul2.appendChild(ul2li);
                }
            ul1.appendChild(ul2);
            }
        }
    $("#lijst").appendChild(ul1);
    // P33
}

async function checkWBi(wbid){
    await fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=' + wbid + '&format=json')
        .then((response) => response.json())
        .then((data) => {
            let q = data.enetries[Object.getOwnPropertyNames(data.entries)[0]];
            let li = document.createElement("li");
            li.html(q.labels.nl.value + ': ' + q.aliases.nl.map(getNL).join(', ') );
            return li
        });
}

function getNL(item){
    return item.value;
}
    
// P29 = OSM-tag
// P30 = tariefsoortnaam
// P36 = tariefsoort
// P43 = kleur