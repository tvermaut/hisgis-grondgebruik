var itemnr = 0;
var gg = [];
var ts = [];
var nrg = 0;
var nrts = 0;
var nrgg = 0;
var nrtot = 0;
var nrdata = 0;

$(function() {
    $('#opmerking').innerHTML = '<span id="opmgg">grondgebruik inladen (<span id="nrgg">0</span> soorten)</span>';
    fetch('https://data.hisgis.nl/w/api.php?action=wbgetentities&ids=Q101&format=json')
        .then(response => response.json())
        .then(data => {
            $('#opmerking').html('Grondgebruik inladen... (<span id="nrdata">0<span> soorten)');
            verwerkWB(data.entities.Q101);
            })
        .then(data => {
            $('.collapse').collapse();
            $('#opmerking').html($('#opmerking').html() + '<br/><span id="opmts">Tariefsoorten inladen (<span id="nrg">0</span> Gemeenten, <span id="nrts">0</span> Tariefsoorten en <span id="nrgg">0</span> grondgebruik = <span id"nrtot">0<span> totaal)</span>');
            fetch('https://oat.hisgis.nl/oat-ws/rest/tarieven')
                .then(response => response.json())
                .then(data => verwerkTarief(data.results))
                .then(data => console.log(gg))
            });
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
        nrdata += 1;
        $('#nrdata').html(nrdata);
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
            
            li.innerHTML = '<h5 class="" data-toggle="collapse" data-target="#icollapse' + itemnr + '" aria-expanded="false" aria-controls="icollapse' + itemnr + '">' + q.labels.nl.value 
                + (q.hasOwnProperty("aliases") && q.aliases.hasOwnProperty("nl") ? 
                    ' <span class="badge text-bg-primary badge-pill">' + q.aliases.nl.length + '</span></h5>' 
                        + '<div class="collapse ms-5 aliasstijl" id="icollapse' + itemnr + '">' + (q.aliases.nl.map(getNL)).sort().join('<br/>') + '</div>'
                    : '<div id="icollapse' + itemnr + '"></div>');
            //console.log(li);
            itemnr++;
            if(li.innerHTML){$(ouder).append(li);}
        });
}

function getNL(item){
    return '<span class="alias px-1 me-2 mb-1">' + item.value + '</span>';
}
    
// P29 = OSM-tag
// P30 = tariefsoortnaam
// P36 = tariefsoort
// P43 = kleur

async function verwerkTarief(){
    let gemeenten = await fetch('https://oat.hisgis.nl/oat-ws/rest/tarieven')
        .then(response => response.json())
        .then(data => {
            for(let gemeente of data.results){
                nrg += 1;
                $('#nrg').html(nrg);
                let gi = new Gemeente(gemeente);
                console.log(gi.uniekeNaam);
                }
    });
}

class Gemeente {
    uniekeNaam;
    status;
    tariefsoorten;

    constructor(json){
        console.log(json);
        this.uniekeNaam = json.uniekeNaan || '';
        this.status = json.status;
        this.tariefsoorten = [];
        for(let ts of json.tariefsoorten){
            nrts += 1;
            $('#nrts').html(nrts);
            this.tariefsoorten[ts.naam] = new Tariefsoort(ts);
        }
    }
}

class Tariefsoort {
    gebouwd;
    naam;
    polder;
    recht;
    onbelast;
    opp;
    gg;

    constructor(j){
        this.gebouwd = j.gebouwd;
        this.naam = j.naam;
        this.polder = false;
        if(j.opmerking && j.opmerking == "polder"){this.polder = true}
        this.onbelast = false;
        if(j.opmerking && j.opmerking == "onbelast"){this.onbelast = true}
        this.recht = false;
        if(j.opmerking && j.opmerking == "recht"){this.recht = true}
        this.opp = false;
        if(j.hasOwnProperty("categorie") && j.categorie.categorie == "Opperclakte der Gebouwen") {this.opp = true;}
        for(let t of j.tarieven){
            for(let og in t.oatGebruik){
                nrgg += 1;
                $('#nrgg').html(nrgg);
                nrtot += t.oatGebruik[og];
                $('#nrtot').html(nrtot);
                if(!(og in gg)){gg[og] = 0}
                gg[og] += t.oatGebruik[og];
                this.gg = t.oatGebruik[og];
            }
        }
        if(!(this.naam in ts)){ts[this.naam] = this;}
    }
}