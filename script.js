var itemnr = 0;

$(function() {
    fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=Q101&format=json')
        .then(response => response.json())
        .then(data => {$("#lijst").appendChild(verwerkWB(data.entities.Q101))})
  });

  async function verwerkWB(j){
    // P33 = ongebouwd
    var ul1 = document.createElement("ul");
    ul1.attr("id",itemnr);
    document.appendChild(ul1);
    var ul1_id = itemnr;
    itemnr++;
    for(let i of j.claims.P33){
        let lii = await checkWBi(i.mainsnak.datavalue.value.id);
        if(lii){$('#'+ul1_id).appendChild(lii);}
        if(i.hasOwnProperty("qualifiers") && i.qualifiers.hasOwnProperty("P36")){
            var ul2 = document.createElement("ul");
            ul2.attr("id",itemnr);
            var ul2_id = itemnr;
            itemnr++;
            $('#'+ul1_id).appendChild(ul2);
            for(let q of i.qualifiers.P36){ // P36 = tariefsoort
                let ul2li = await checkWBi(q.datavalue.value.id);
                if(ul2li){$('#'+ul2_id).appendChild(ul2li);}
                }
                
            }
        }
        return ul1
    // P33
}

async function checkWBi(wbid){
    await fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=' + wbid + '&format=json')
        .then((response) => response.json())
        .then((data) => {
            //console.log(data);
            let q = data.entities[Object.getOwnPropertyNames(data.entities)[0]];
            //console.log(q);
            let li = document.createElement("li");
            li.attr("id",itemnr);
            itemnr++;
            li.innerHTML = q.labels.nl.value + (q.hasOwnProperty("aliases") && q.aliases.hasOwnProperty("nl") ? ': ' + (q.aliases.nl.map(getNL)).join(', ') : '');
            console.log(li);
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